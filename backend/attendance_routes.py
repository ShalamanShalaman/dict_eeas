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

from attendance_utils import (
    parse_employees_data,
    generate_dtr
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
# API: Generate DTR Excel
# -------------------------------------------------
@attendance_bp.route('/api/download-dtr', methods=['POST'])
def download_dtr():
    data = request.json or {}

    employee_name = data.get("employee_name")
    employee_data = data.get("employee_data")

    if not employee_name or not employee_data:
        return jsonify({"error": "Invalid request data"}), 400

    try:
        output = generate_dtr(employee_name, employee_data)
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
