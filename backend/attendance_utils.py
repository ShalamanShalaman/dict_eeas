import re
import calendar
from io import BytesIO
from flask import current_app
from openpyxl import load_workbook
from openpyxl.styles import Alignment, Font


# ---------- PDF Parsing ----------
def parse_employees_data(text):
    employees = {}
    lines = text.split('\n')

    current_employee = None
    employee_data = {}
    day_checkins = {}

    current_month_name = ""
    current_year = ""

    def process_employee_data(emp_name, emp_data, day_checks, month_name, year):
        if not emp_name or not day_checks:
            return

        if month_name:
            emp_data['month_name'] = month_name
        if year:
            emp_data['year'] = year

        for day, checkins in day_checks.items():
            if day not in emp_data:
                continue

            for idx, (action, time) in enumerate(checkins):
                if action == 'C/IN':
                    if idx == 0:
                        emp_data[day]['am_in'] = time
                    else:
                        emp_data[day]['pm_in'] = time
                elif action == 'C/OUT':
                    if idx == 1 or (idx > 0 and not emp_data[day]['am_out']):
                        emp_data[day]['am_out'] = time
                    else:
                        emp_data[day]['pm_out'] = time

    for line in lines:
        line = line.strip()
        if not line:
            continue

        try:
            # Match "LASTNAME, FIRSTNAME (ID)"
            match = re.match(r'^([A-Za-z0-9\s,]+)\((\d+)\)$', line)
            if match:
                process_employee_data(
                    current_employee,
                    employee_data,
                    day_checkins,
                    current_month_name,
                    current_year
                )

                if current_employee and employee_data:
                    employees[current_employee] = employee_data

                current_employee = match.group(1).strip()
                employee_data = {}
                day_checkins = {}
                current_month_name = ""
                current_year = ""
                continue

            if not current_employee:
                continue

            parts = line.split()
            if len(parts) < 3:
                continue

            # Date format: DD/MM/YYYY
            if '/' in parts[0] and parts[0].count('/') == 2:
                date_str = parts[0]
                time_str = parts[1]

                if len(parts) == 4:
                    action = parts[3].upper()
                elif len(parts) == 3:
                    action = parts[2].upper()
                else:
                    continue

                day_str, month_str, year_str = date_str.split('/')

                if not current_month_name:
                    current_month_name = calendar.month_name[int(month_str)]
                if not current_year:
                    current_year = year_str

                if day_str.isdigit():
                    day_num = int(day_str)
                    if 1 <= day_num <= 31:
                        day_key = str(day_num)

                        if day_key not in employee_data:
                            employee_data[day_key] = {
                                'am_in': '',
                                'am_out': '',
                                'pm_in': '',
                                'pm_out': '',
                                'undertime_hrs': '',
                                'undertime_min': ''
                            }
                            day_checkins[day_key] = []

                        time_only = ':'.join(time_str.split(':')[:2])
                        day_checkins[day_key].append((action, time_only))

        except Exception:
            continue

    process_employee_data(
        current_employee,
        employee_data,
        day_checkins,
        current_month_name,
        current_year
    )

    if current_employee and employee_data:
        employees[current_employee] = employee_data

    return employees


# ---------- DTR Generation ----------
def generate_dtr(employee_name, employee_data, template_path=None):
    """
    Generates an Excel DTR using the official template and returns a BytesIO file.
    """

    # ---------- Resolve template path ----------
    if template_path is None:
        template_path = current_app.config.get('DTR_TEMPLATE')

    if not template_path:
        raise FileNotFoundError("DTR template path is not configured")

    # ---------- Extract meta ----------
    try:
        raw_data = dict(employee_data)
        month_name = raw_data.pop('month_name', '')
        year = raw_data.pop('year', '')
        employee_data = {
            int(k): v for k, v in raw_data.items() if k.isdigit()
        }
    except Exception:
        employee_data = {}
        month_name = ""
        year = ""

    # ---------- Load Excel template ----------
    try:
        wb = load_workbook(template_path)
    except FileNotFoundError:
        raise FileNotFoundError(
            f"DTR template not found at {template_path}"
        )

    ws = wb.active

    # ---------- Fill employee name ----------
    for cell in ['C6', 'K6', 'C55', 'K55']:
        ws[cell] = employee_name

    # ---------- Fill month & year ----------
    if month_name:
        for cell in ['E8', 'M8']:
            ws[cell] = f"{month_name} {year}"
            ws[cell].alignment = Alignment(horizontal='center', vertical='center')

    center = Alignment(horizontal='center', vertical='center')
    bold = Font(bold=True)

    # ---------- Fill attendance ----------
    for day, day_data in employee_data.items():
        row = 13 + day

        if row > 44:
            continue

        updates = {
            'B': day,
            'C': day_data.get('am_in', ''),
            'D': day_data.get('am_out', ''),
            'E': day_data.get('pm_in', ''),
            'F': day_data.get('pm_out', ''),
            'G': day_data.get('undertime_hrs', ''),
            'H': day_data.get('undertime_min', ''),
            'J': day,
            'K': day_data.get('am_in', ''),
            'L': day_data.get('am_out', ''),
            'M': day_data.get('pm_in', ''),
            'N': day_data.get('pm_out', ''),
            'O': day_data.get('undertime_hrs', ''),
            'P': day_data.get('undertime_min', '')
        }

        for col, value in updates.items():
            cell = ws[f'{col}{row}']
            cell.value = value
            cell.alignment = center
            if col not in ('B', 'J'):
                cell.font = bold

    # ---------- Export ----------
    output = BytesIO()
    wb.save(output)
    output.seek(0)
    return output
