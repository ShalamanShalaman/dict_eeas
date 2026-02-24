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
# API: Generate DTR-only PDF
# -------------------------------------------------
@attendance_bp.route('/api/download-dtr-pdf', methods=['POST'])
def download_dtr_pdf():
    """
    Generates a PDF of the Daily Time Record (DTR)
    """
    from reportlab.lib.pagesizes import letter, landscape
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    import io

    data = request.json or {}

    employee_name = data.get("employee_name")
    employee_data = data.get("employee_data")
    approver_name = data.get("approver", "")
    period_text = data.get("period_text", "")

    if not employee_name or not employee_data:
        return jsonify({"error": "Invalid request data"}), 400

    try:
        # Create PDF in memory (landscape for better table view)
        buffer = io.BytesIO()
        pdf_doc = SimpleDocTemplate(buffer, pagesize=landscape(letter), topMargin=0.5*inch, bottomMargin=0.5*inch)
        story = []
        styles = getSampleStyleSheet()

        # Title
        story.append(Paragraph("DAILY TIME RECORD", styles['Title']))
        story.append(Spacer(1, 10))

        # Employee Info
        info_data = [
            ['Name:', employee_name],
            ['Period:', period_text],
            ['Approved By:', approver_name]
        ]
        
        info_table = Table(info_data, colWidths=[1.5*inch, 4*inch])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(info_table)
        story.append(Spacer(1, 20))

        # Daily Time Records table
        dtr_data = [['Day', 'AM In', 'AM Out', 'PM In', 'PM Out', 'UT (Hrs)', 'UT (Min)', 'Remarks']]
        
        # Get month_name and year from employee_data if available
        month_name = employee_data.get('month_name', '')
        year = employee_data.get('year', '')
        
        for day in range(1, 32):
            day_str = str(day)
            day_data = employee_data.get(day_str, {})
            am_in = day_data.get('am_in', '')
            am_out = day_data.get('am_out', '')
            pm_in = day_data.get('pm_in', '')
            pm_out = day_data.get('pm_out', '')
            ut_hrs = day_data.get('undertime_hrs', '')
            ut_min = day_data.get('undertime_min', '')
            remarks = day_data.get('remarks', '')
            
            dtr_data.append([day_str, am_in, am_out, pm_in, pm_out, ut_hrs, ut_min, remarks])

        # Create table with appropriate column widths
        dtr_table = Table(dtr_data, colWidths=[
            0.5*inch, 0.8*inch, 0.8*inch, 0.8*inch, 0.8*inch, 0.6*inch, 0.6*inch, 2*inch
        ])
        dtr_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('TOPPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')]),
        ]))
        story.append(dtr_table)

        # Build PDF
        pdf_doc.build(story)
        buffer.seek(0)

        clean_name = employee_name.replace(',', '').replace(' ', '_')
        
        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'DTR_{clean_name}.pdf'
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------------------------------
# API: Generate AR-only PDF
# -------------------------------------------------
@attendance_bp.route('/api/generate-ar-pdf', methods=['POST'])
def generate_ar_pdf():
    """
    Generates a PDF of the Accomplishment Report (AR)
    """
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    import io

    data = request.json or {}

    employee_name = data.get("employee_name")
    employee_data = data.get("employee_data")
    position = data.get("position", "")
    office = data.get("office", "")
    project = data.get("project", "")
    period_text = data.get("period_text", "")
    approver = data.get("approver", "")
    approver_title = data.get("approver_title", "")
    tasks = data.get("tasks", {})

    if not employee_name or not employee_data:
        return jsonify({"error": "Missing employee data"}), 400

    try:
        # Create PDF in memory
        buffer = io.BytesIO()
        pdf_doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
        story = []
        styles = getSampleStyleSheet()

        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Title'],
            fontSize=14,
            spaceAfter=10
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=12,
            spaceBefore=15,
            spaceAfter=10
        )

        # Title
        story.append(Paragraph("ACCOMPLISHMENT REPORT", title_style))
        story.append(Spacer(1, 15))

        # Employee Info Table
        info_data = [
            ['Name:', employee_name],
            ['Position:', position],
            ['Office:', office],
            ['Period:', period_text],
        ]
        
        if project:
            info_data.append(['Project:', project])
        
        info_table = Table(info_data, colWidths=[1.5*inch, 4.5*inch])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(info_table)
        story.append(Spacer(1, 20))

        # Tasks/Accomplishments
        story.append(Paragraph("Tasks Accomplished", heading_style))
        story.append(Spacer(1, 10))

        # Tasks table - only include days with tasks
        task_data = [['Date', 'Task Accomplished']]
        
        for day in range(1, 32):
            day_str = str(day)
            task = tasks.get(day_str, '')
            
            # Check if there's attendance for this day
            day_data = employee_data.get(day_str, {})
            has_attendance = any([
                day_data.get('am_in', ''),
                day_data.get('am_out', ''),
                day_data.get('pm_in', ''),
                day_data.get('pm_out', '')
            ])
            
            # Only add rows with tasks
            if task and task.strip():
                task_data.append([day_str, task])

        if len(task_data) > 1:
            task_table = Table(task_data, colWidths=[0.8*inch, 6*inch])
            task_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexArray([26, 70, 176])),  # #1e46b0
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (0, -1), 'CENTER'),
                ('ALIGN', (1, 0), (1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                ('TOPPADDING', (0, 0), (-1, 0), 10),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
            ]))
            story.append(task_table)
        else:
            story.append(Paragraph("<i>No tasks recorded for this period.</i>", styles['Normal']))

        story.append(Spacer(1, 40))

        # Signature section
        story.append(Spacer(1, 20))
        
        # Approver signature
        approver_data = [
            ['', ''],
            ['Certified By:', ''],
            ['', approver if approver else '_________________'],
            ['', approver_title if approver_title else 'Provincial Officer']
        ]
        
        approver_table = Table(approver_data, colWidths=[3*inch, 3*inch])
        approver_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 2), (-1, 2), 30),
        ]))
        story.append(approver_table)

        # Build PDF
        pdf_doc.build(story)
        buffer.seek(0)

        clean_name = employee_name.replace(',', '').replace(' ', '_')
        
        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'AR_{clean_name}.pdf'
        )

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


# -------------------------------------------------
# API: Generate PDF Report (DTR + AR combined)
# -------------------------------------------------
@attendance_bp.route('/api/generate-pdf', methods=['POST'])
def generate_pdf():
    """
    Generates a PDF report containing both DTR and AR data
    """
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    import io

    data = request.json or {}

    employee_name = data.get("employee_name", "Employee")
    employee_data = data.get("employee_data", {})
    position = data.get("position", "")
    office = data.get("office", "")
    project = data.get("project", "")
    period_text = data.get("period_text", "")
    approver = data.get("approver", "")
    tasks = data.get("tasks", {})

    try:
        # Create PDF in memory
        buffer = io.BytesIO()
        pdf_doc = SimpleDocTemplate(buffer, pagesize=letter)
        story = []
        styles = getSampleStyleSheet()

        # Title
        story.append(Paragraph("DAILY TIME RECORD & ACCOMPLISHMENT REPORT", styles['Title']))
        story.append(Spacer(1, 20))

        # Employee Info
        info_data = [
            ['Name:', employee_name],
            ['Position:', position],
            ['Office:', office],
            ['Period:', period_text],
            ['Approved By:', approver]
        ]
        
        info_table = Table(info_data, colWidths=[1.5*inch, 4*inch])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(info_table)
        story.append(Spacer(1, 20))

        # Daily Time Records
        story.append(Paragraph("Daily Time Record", styles['Heading2']))
        story.append(Spacer(1, 10))

        # Create DTR table
        dtr_data = [['Day', 'AM In', 'AM Out', 'PM In', 'PM Out', 'UT (Hrs)', 'Remarks']]
        for day in range(1, 32):
            day_str = str(day)
            day_data = employee_data.get(day_str, {})
            am_in = day_data.get('am_in', '')
            am_out = day_data.get('am_out', '')
            pm_in = day_data.get('pm_in', '')
            pm_out = day_data.get('pm_out', '')
            ut = day_data.get('undertime_hrs', '')
            remarks = day_data.get('remarks', '')
            
            # Only add rows with data
            if am_in or am_out or pm_in or pm_out or remarks:
                dtr_data.append([day_str, am_in, am_out, pm_in, pm_out, ut, remarks])

        if len(dtr_data) > 1:
            dtr_table = Table(dtr_data, colWidths=[0.5*inch, 1*inch, 1*inch, 1*inch, 1*inch, 0.8*inch, 1.5*inch])
            dtr_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('TOPPADDING', (0, 0), (-1, 0), 8),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ]))
            story.append(dtr_table)

        story.append(Spacer(1, 20))

        # Accomplishment Report
        story.append(Paragraph("Accomplishment Report", styles['Heading2']))
        story.append(Spacer(1, 10))

        if project:
            story.append(Paragraph(f"<b>Project:</b> {project}", styles['Normal']))
            story.append(Spacer(1, 10))

        # Tasks table
        task_data = [['Date', 'Task Accomplished']]
        for day in range(1, 32):
            day_str = str(day)
            task = tasks.get(day_str, '')
            if task:
                task_data.append([day_str, task])

        if len(task_data) > 1:
            task_table = Table(task_data, colWidths=[0.8*inch, 5.5*inch])
            task_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                ('ALIGN', (0, 0), (0, -1), 'CENTER'),
                ('ALIGN', (1, 0), (1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('TOPPADDING', (0, 0), (-1, 0), 8),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            story.append(task_table)

        # Build PDF
        pdf_doc.build(story)
        buffer.seek(0)

        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"DTR_AR_{employee_name.replace(' ', '_')}.pdf"
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
