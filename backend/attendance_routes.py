from flask import (
    Blueprint,
    request,
    jsonify,
    render_template,
    send_file,
    current_app
)
import os
import PyPDF2
from datetime import datetime

from attendance_utils import (
    parse_employees_data,
    generate_dtr,
    generate_ar_from_employee_data
)

attendance_bp = Blueprint('attendance', __name__)


# -------------------------------------------------
# Web UI (optional / legacy)
# -------------------------------------------------
@attendance_bp.route('/', methods=['GET', 'POST'])
def index():
    extracted_text = ""
    employees = {}
    counts = {}
    error_message = ""

    if request.method == 'POST':
        if 'pdf_file' not in request.files:
            error_message = "No file uploaded"
        else:
            file = request.files['pdf_file']
            if file.filename == '':
                error_message = "No selected file"
            else:
                filepath = os.path.join(
                    current_app.config['UPLOAD_FOLDER'],
                    file.filename
                )
                file.save(filepath)

                try:
                    with open(filepath, 'rb') as pdf_file:
                        reader = PyPDF2.PdfReader(pdf_file)
                        for page in reader.pages:
                            extracted_text += page.extract_text() + "\n"

                    employees = parse_employees_data(extracted_text)

                    if not employees:
                        error_message = "No valid attendance data found"
                    else:
                        for name, data in employees.items():
                            counts[name] = sum(
                                1 for k in data.keys() if k.isdigit()
                            )

                except Exception as e:
                    error_message = f"PDF processing error: {str(e)}"

    return render_template(
        'index.html',
        extracted_text=extracted_text,
        employees=employees,
        counts=counts,
        error_message=error_message
    )


# -------------------------------------------------
# API: Upload attendance PDF
# -------------------------------------------------
@attendance_bp.route('/api/upload-attendance', methods=['POST'])
def api_upload_attendance():
    if 'attendanceFile' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['attendanceFile']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        upload_dir = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_dir, exist_ok=True)

        filepath = os.path.join(upload_dir, file.filename)
        file.save(filepath)

        extracted_text = ""
        with open(filepath, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                extracted_text += page.extract_text() + "\n"

        employees_data = parse_employees_data(extracted_text)

        if not employees_data:
            return jsonify({"error": "No valid attendance data found"}), 422

        return jsonify({
            "message": "Attendance uploaded successfully",
            "data": employees_data
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------------------------------
# API: Generate DTR Excel (editable data supported)
# -------------------------------------------------
@attendance_bp.route('/api/download-dtr', methods=['POST'])
def download_dtr():
    data = request.json or {}

    employee_name = data.get("employee_name")
    employee_data = data.get("employee_data")
    approver_name = data.get("approver", "") 
    period_text = data.get("period_text", "") # Re-added

    if not employee_name or not employee_data:
        return jsonify({"error": "Invalid request data"}), 400

    try:
        # Pass approver_name and period_text to generator
        # Ensure your attendance_utils.py generate_dtr accepts period_text!
        output = generate_dtr(
            employee_name, 
            employee_data, 
            approver_name=approver_name,
            period_text=period_text
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    clean_name = employee_name.replace(',', '').replace(' ', '_')

    return send_file(
        output,
        mimetype=(
            'application/vnd.openxmlformats-officedocument.'
            'spreadsheetml.sheet'
        ),
        as_attachment=True,
        download_name=f'DTR_{clean_name}.xlsx'
    )


# -------------------------------------------------
# API: Generate AR DOCX
# -------------------------------------------------
@attendance_bp.route('/api/generate-ar', methods=['POST'])
def generate_ar():
    """
    Generates AR from parsed PDF data + frontend overrides
    """

    data = request.json or {}

    employee_name = data.get("employee_name")
    employee_data = data.get("employee_data")

    # frontend editable fields
    position = data.get("position", "")
    office = data.get("office", "")
    project = data.get("project", "")
    period_text = data.get("period_text", "") # Re-added

    # optional task overrides from frontend
    overrides = data.get("overrides", {})
    
    # Inject period_text into overrides for ar_utils
    if period_text:
        overrides["period_text"] = period_text

    if not employee_name or not employee_data:
        return jsonify({"error": "Missing employee data"}), 400

    try:
        output_dir = current_app.config['UPLOAD_FOLDER']
        os.makedirs(output_dir, exist_ok=True)

        filename = f"AR_{employee_name.replace(' ', '_')}_{datetime.now().timestamp()}.docx"
        output_path = os.path.join(output_dir, filename)

        generate_ar_from_employee_data(
            employee_name=employee_name,
            employee_data=employee_data,
            employee_position=position,
            employee_office=office,
            project=project,
            output_path=output_path,
            overrides=overrides
        )

        return send_file(
            output_path,
            as_attachment=True,
            download_name=f"AR_{employee_name}.docx"
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500