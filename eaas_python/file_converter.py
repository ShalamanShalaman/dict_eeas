import os
import io
import subprocess
import shutil
import platform
import tempfile
import time
from datetime import datetime

CONVERSION_TIMEOUT = 30 

try:
    from docx import Document as DocxDocument
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

try:
    from docx2pdf import convert as docx2pdf_convert
    DOCX2PDF_AVAILABLE = True
except ImportError:
    DOCX2PDF_AVAILABLE = False

try:
    import openpyxl
    XSLX_AVAILABLE = True
except ImportError:
    XSLX_AVAILABLE = False

try:
    import win32com.client
    import pythoncom
    WIN32_AVAILABLE = True
except ImportError:
    WIN32_AVAILABLE = False

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

def get_libreoffice_executable():
    if platform.system() == 'Darwin':
        return '/Applications/LibreOffice.app/Contents/MacOS/soffice'

    if shutil.which('libreoffice'):
        return shutil.which('libreoffice')
    if shutil.which('soffice'):
        return shutil.which('soffice')

    if platform.system() == 'Linux':
        for p in ['/usr/bin/libreoffice', '/usr/bin/soffice', '/usr/local/bin/soffice']:
            if os.path.exists(p):
                return p

    if platform.system() == 'Windows':
        common_paths = [
            r"C:\Program Files\LibreOffice\program\soffice.exe",
            r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
            os.path.join(os.environ.get('PROGRAMFILES', 'C:\\Program Files'), 'LibreOffice', 'program', 'soffice.exe')
        ]
        for p in common_paths:
            if os.path.exists(p):
                return p
    return None

def _convert_with_libreoffice(input_path, expected_pdf_path):
    lo_exec = get_libreoffice_executable()
    if not lo_exec:
        return False

    out_dir = os.path.dirname(expected_pdf_path)
    profile_dir = tempfile.mkdtemp(prefix="lo_profile_")

    try:
        env = os.environ.copy()
        if platform.system() == 'Linux':
            env['HOME'] = '/tmp'
        
        formatted_profile_path = profile_dir.replace("\\", "/")
        
        cmd = [
            lo_exec,
            f'-env:UserInstallation=file:///{formatted_profile_path}',
            '--headless',
            '--invisible',
            '--nologo',
            '--nodefault',
            '--nofirststartwizard',
            '--norestore',
            '--convert-to', 'pdf',
            input_path,
            '--outdir', out_dir
        ]

        result = subprocess.run(
            cmd,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env,
            timeout=CONVERSION_TIMEOUT
        )

        input_basename = os.path.basename(input_path)
        name_without_ext = os.path.splitext(input_basename)[0]
        generated_pdf = os.path.join(out_dir, f"{name_without_ext}.pdf")

        if os.path.exists(generated_pdf):
            if os.path.abspath(generated_pdf) != os.path.abspath(expected_pdf_path):
                if os.path.exists(expected_pdf_path):
                    os.remove(expected_pdf_path)
                shutil.move(generated_pdf, expected_pdf_path)
            return True
        return False
    except (subprocess.TimeoutExpired, subprocess.CalledProcessError, Exception) as e:
        print(f"LibreOffice conversion failed: {str(e)}")
        return False
    finally:
        for i in range(3): 
            try:
                shutil.rmtree(profile_dir)
                break
            except Exception:
                time.sleep(0.5)

def convert_file_to_pdf(file_path, output_dir):
    if not REPORTLAB_AVAILABLE:
        raise Exception("PDF generation library (ReportLab) not available")

    filename = os.path.basename(file_path)
    name_without_ext = os.path.splitext(filename)[0]
    output_path = os.path.join(output_dir, f"{name_without_ext}.pdf")

    os.makedirs(output_dir, exist_ok=True)
    ext = filename.lower().split('.')[-1]

    if ext == 'pdf':
        shutil.copy2(file_path, output_path)
        return output_path

    success_path = None
    if ext in ['docx', 'doc']:
        success_path = _convert_docx_to_pdf(file_path, output_path)
    elif ext in ['xlsx', 'xls']:
        success_path = _convert_xlsx_to_pdf(file_path, output_path)
    elif ext in ['png', 'jpg', 'jpeg']:
        success_path = _convert_image_to_pdf(file_path, output_path)
    elif ext == 'txt':
        success_path = _convert_txt_to_pdf(file_path, output_path)
    
    if not success_path:
        return _convert_generic_to_pdf(file_path, output_path)
    
    return success_path

def _convert_docx_to_pdf(docx_path, pdf_path):
    if platform.system() == 'Windows' and WIN32_AVAILABLE:
        try:
            pythoncom.CoInitialize()
            word = win32com.client.DispatchEx("Word.Application")
            word.Visible = False
            word.DisplayAlerts = 0
            
            try:
                abs_docx = os.path.abspath(docx_path)
                abs_pdf = os.path.abspath(pdf_path)
                
                doc = word.Documents.Open(abs_docx, ReadOnly=True)
                doc.SaveAs(abs_pdf, FileFormat=17)
                doc.Close(0)
                
                if os.path.exists(pdf_path):
                    return pdf_path
            finally:
                word.Quit()
                pythoncom.CoUninitialize()
        except Exception as e:
            print(f"MS Word COM conversion failed: {str(e)}. Falling back.")

    if _convert_with_libreoffice(docx_path, pdf_path):
        return pdf_path

    if DOCX_AVAILABLE and docx_path.lower().endswith('.docx'):
        try:
            doc = DocxDocument(docx_path)
            pdf_doc = SimpleDocTemplate(pdf_path, pagesize=letter)
            story = []
            styles = getSampleStyleSheet()
            for para in doc.paragraphs:
                if para.text.strip():
                    story.append(Paragraph(para.text, styles['Normal']))
                    story.append(Spacer(1, 6))
            pdf_doc.build(story)
            return pdf_path
        except Exception:
            pass
            
    return None

def _convert_xlsx_to_pdf(xlsx_path, pdf_path):
    if platform.system() == 'Windows' and WIN32_AVAILABLE:
        try:
            pythoncom.CoInitialize()
            excel = win32com.client.DispatchEx("Excel.Application")
            excel.Visible = False
            excel.DisplayAlerts = False
            
            try:
                abs_xlsx = os.path.abspath(xlsx_path)
                abs_pdf = os.path.abspath(pdf_path)
                
                wb = excel.Workbooks.Open(abs_xlsx, ReadOnly=True)
                wb.ExportAsFixedFormat(0, abs_pdf)
                wb.Close(False)
                
                if os.path.exists(pdf_path):
                    return pdf_path
            finally:
                excel.Quit()
                pythoncom.CoUninitialize()
        except Exception as e:
            print(f"MS Excel COM conversion failed: {str(e)}. Falling back.")

    if _convert_with_libreoffice(xlsx_path, pdf_path):
        return pdf_path

    return None

def _convert_image_to_pdf(image_path, pdf_path):
    try:
        pdf_doc = SimpleDocTemplate(pdf_path, pagesize=letter)
        story = []
        img = Image(image_path)
        img.drawWidth = 6.5 * inch
        img.drawHeight = 9 * inch
        story.append(img)
        pdf_doc.build(story)
        return pdf_path
    except Exception:
        return None

def _convert_txt_to_pdf(txt_path, pdf_path):
    try:
        with open(txt_path, 'r', encoding='utf-8', errors='replace') as f:
            text = f.read()
        pdf_doc = SimpleDocTemplate(pdf_path, pagesize=letter)
        story = []
        styles = getSampleStyleSheet()
        for line in text.split('\n'):
            story.append(Paragraph(line or " ", styles['Normal']))
        pdf_doc.build(story)
        return pdf_path
    except Exception:
        return None

def _convert_generic_to_pdf(file_path, pdf_path):
    pdf_doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    filename = os.path.basename(file_path)
    story.append(Paragraph(f"Attached File: {filename}", styles['Heading1']))
    story.append(Spacer(1, 20))
    story.append(Paragraph("This file format could not be converted to PDF natively on this machine.", styles['Normal']))
    pdf_doc.build(story)
    return pdf_path

def merge_pdfs_to_single(file_paths, output_path):
    try:
        from PyPDF2 import PdfMerger
        merger = PdfMerger()

        temp_dir = os.path.join(os.path.dirname(output_path), 'temp_conversions')
        os.makedirs(temp_dir, exist_ok=True)
        temp_files_to_cleanup = []

        for file_path in file_paths:
            if os.path.exists(file_path):
                ext = file_path.lower().split('.')[-1]
                if ext == 'pdf':
                    merger.append(file_path)
                else:
                    converted_pdf = convert_file_to_pdf(file_path, temp_dir)
                    if converted_pdf and os.path.exists(converted_pdf):
                        merger.append(converted_pdf)
                        temp_files_to_cleanup.append(converted_pdf)

        with open(output_path, 'wb') as f:
            merger.write(f)
        merger.close()

        for temp_file in temp_files_to_cleanup:
            try: os.remove(temp_file)
            except: pass
        try: os.rmdir(temp_dir)
        except: pass

        return output_path
    except Exception as e:
        if file_paths and file_paths[0].lower().endswith('.pdf'):
            shutil.copy2(file_paths[0], output_path)
            return output_path
        raise Exception(f"Merge failed: {str(e)}")