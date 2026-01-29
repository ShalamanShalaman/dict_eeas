import re
import calendar

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
            if day in emp_data:
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
            name_pattern = r'^([A-Za-z0-9\s,]+)\((\d+)\)$'
            match = re.match(name_pattern, line)

            if match:
                process_employee_data(current_employee, employee_data, day_checkins, current_month_name, current_year)

                if current_employee and employee_data:
                    employees[current_employee] = employee_data

                current_employee = match.group(1).strip()
                employee_data = {}
                day_checkins = {}
                current_month_name = ""
                current_year = ""

            elif current_employee:
                parts = line.split()

                if len(parts) >= 3:
                    if '/' in parts[0] and parts[0].count('/') == 2:
                        date_str = parts[0]
                        time_str = parts[1]

                        # Handle both formats: with and without period
                        if len(parts) == 4:
                            # Format: date time period action (e.g., "05/01/2026 8:11:43 am C/In")
                            period = parts[2].lower()
                            action = parts[3].upper()
                        elif len(parts) == 3:
                            # Format: date time action (e.g., "05/01/2026 8:11:43 C/In")
                            action = parts[2].upper()
                            # Determine period based on time (rough heuristic)
                            hour = int(time_str.split(':')[0])
                            period = 'am' if hour < 12 else 'pm'
                        else:
                            continue  # Skip malformed lines

                        date_parts = date_str.split('/')
                        day_str = date_parts[0]
                        month_str = date_parts[1]
                        year_str = date_parts[2]

                        if not current_month_name:
                             current_month_name = calendar.month_name[int(month_str)]
                        if not current_year:
                             current_year = year_str

                        if day_str.isdigit():
                            day_num = int(day_str)
                            if 1 <= day_num <= 31:
                                str_day = str(day_num)
                                if str_day not in employee_data:
                                    employee_data[str_day] = {
                                        'am_in': '',
                                        'am_out': '',
                                        'pm_in': '',
                                        'pm_out': '',
                                        'undertime_hrs': '',
                                        'undertime_min': ''
                                    }
                                    day_checkins[str_day] = []

                                time_only = time_str.split(':')[0] + ':' + time_str.split(':')[1]
                                day_checkins[str_day].append((action, time_only))
        except Exception as e:
            # Skip malformed lines and continue processing
            continue

    process_employee_data(current_employee, employee_data, day_checkins, current_month_name, current_year)
    if current_employee and employee_data:
        employees[current_employee] = employee_data

    return employees