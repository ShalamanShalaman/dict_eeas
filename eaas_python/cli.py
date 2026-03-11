import sys
import json
import os
import PyPDF2
from attendance_utils import parse_employees_data, generate_dtr, generate_ar_from_employee_data, generate_dtr_adjustment_slip
from pdf_generators import generate_dtr_pdf_file, generate_ar_pdf_file, generate_combined_pdf_file
from file_converter import merge_pdfs_to_single

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Insufficient arguments"}))
        sys.exit(1)

    action = sys.argv[1]
    payload_path = sys.argv[2]

    try:
        with open(payload_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(json.dumps({"error": f"Failed to read payload: {str(e)}"}))
        sys.exit(1)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    template_dir = os.path.join(base_dir, 'template_files')

    try:
        if action == 'parse_attendance':
            file_path = data.get('file_path')
            extracted_text = ""
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    extracted_text += page.extract_text() + "\n"
            employees_data = parse_employees_data(extracted_text)
            print(json.dumps({"data": employees_data}))

        elif action == 'generate_dtr':
            template_path = os.path.join(template_dir, 'DTR_template.xlsx')
            output_path = data.get('output_path')
            wb_io = generate_dtr(
                data.get('employee_name'),
                data.get('employee_data'),
                template_path=template_path,
                approver_name=data.get('approver', ''),
                period_text=data.get('period_text', ''),
                period_format=data.get('period_format', 'full')
            )
            with open(output_path, 'wb') as f:
                f.write(wb_io.getvalue())
            print(json.dumps({"success": True, "output": output_path}))

        elif action == 'generate_ar':
            template_path = os.path.join(template_dir, 'AR_template.docx')
            output_path = data.get('output_path')
            generate_ar_from_employee_data(
                employee_name=data.get('employee_name'),
                employee_data=data.get('employee_data'),
                employee_position=data.get('position', ''),
                employee_office=data.get('office', ''),
                project=data.get('project', ''),
                output_path=output_path,
                template_path=template_path,
                overrides=data.get('overrides', {}),
                period_text=data.get('period_text', '')
            )
            print(json.dumps({"success": True, "output": output_path}))

        elif action == 'generate_dtr_adjustment':
            template_path = os.path.join(template_dir, 'DTR_AS_template.docx')
            output_path = data.get('output_path')
            generate_dtr_adjustment_slip(
                employee_data={},
                output_path=output_path,
                template_path=template_path,
                overrides=data.get('overrides', {})
            )
            print(json.dumps({"success": True, "output": output_path}))

        elif action == 'generate_dtr_pdf':
            output_path = data.get('output_path')
            generate_dtr_pdf_file(data, output_path)
            print(json.dumps({"success": True, "output": output_path}))

        elif action == 'generate_ar_pdf':
            output_path = data.get('output_path')
            generate_ar_pdf_file(data, output_path)
            print(json.dumps({"success": True, "output": output_path}))

        elif action == 'generate_combined_pdf':
            output_path = data.get('output_path')
            generate_combined_pdf_file(data, output_path)
            print(json.dumps({"success": True, "output": output_path}))

        elif action == 'merge_pdfs':
            output_path = data.get('output_path')
            input_files = data.get('input_files', [])
            merge_pdfs_to_single(input_files, output_path)
            print(json.dumps({"success": True, "output": output_path}))

        else:
            print(json.dumps({"error": f"Unknown action: {action}"}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == '__main__':
    main()