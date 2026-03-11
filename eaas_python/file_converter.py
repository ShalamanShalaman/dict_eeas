import os
import io
from datetime import datetime

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
    XLSX_AVAILABLE = True
except ImportError:
    XLSX_AVAILABLE = False

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

def convert_file_to_pdf(file_path, output_dir):
    if not REPORTLAB_AVAILABLE:
        raise Exception("PDF generation library not available")
    
    filename = os.path.basename(file_path)
    name_without_ext = os.path.splitext(filename)[0]
    output_path = os.path.join(output_dir, f"{name_without_ext}.pdf")
    
    os.makedirs(output_dir, exist_ok=True)
    
    ext = filename.lower().split('.')[-1]
    
    if ext == 'docx':
        return _convert_docx_to_pdf(file_path, output_path)
    elif ext in ['xlsx', 'xls']:
        return _convert_xlsx_to_pdf(file_path, output_path)
    elif ext in ['png', 'jpg', 'jpeg']:
        return _convert_image_to_pdf(file_path, output_path)
    elif ext == 'txt':
        return _convert_txt_to_pdf(file_path, output_path)
    elif ext == 'pdf':
        import shutil
        shutil.copy2(file_path, output_path)
        return output_path
    else:
        return _convert_generic_to_pdf(file_path, output_path)

def _convert_docx_to_pdf(docx_path, pdf_path):
    if DOCX2PDF_AVAILABLE:
        try:
            import pythoncom
            pythoncom.CoInitialize()
            try:
                temp_dir = os.path.dirname(pdf_path)
                docx2pdf_convert(docx_path, temp_dir)
                
                input_filename = os.path.basename(docx_path)
                name_without_ext = os.path.splitext(input_filename)[0]
                generated_pdf = os.path.join(temp_dir, f"{name_without_ext}.pdf")
                
                if os.path.exists(generated_pdf):
                    import shutil
                    shutil.move(generated_pdf, pdf_path)
                    return pdf_path
            finally:
                pythoncom.CoUninitialize()
        except Exception as e:
            error_msg = str(e).lower()
            if "word" in error_msg or "com" in error_msg or "co_create_instance" in error_msg:
                raise Exception("Microsoft Word is required to convert Word documents with full formatting. Please install Microsoft Word and try again.")
    
    if not DOCX_AVAILABLE:
        raise Exception("python-docx not available for DOCX conversion")
    
    doc = DocxDocument(docx_path)
    
    pdf_doc = SimpleDocTemplate(pdf_path, pagesize=letter, leftMargin=0.5*inch, rightMargin=0.5*inch)
    story = []
    styles = getSampleStyleSheet()
    
    for para in doc.paragraphs:
        if para.text.strip():
            style_name = para.style.name if para.style else 'Normal'
            
            if 'Heading' in style_name:
                level = 1 if '1' in style_name else 2 if '2' in style_name else 3
                para_style = styles[f'Heading{level}']
            else:
                para_style = styles['Normal']
            
            p = Paragraph(para.text, para_style)
            story.append(p)
            story.append(Spacer(1, 6))
    
    for table in doc.tables:
        table_data = []
        for row in table.rows:
            row_data = [cell.text for cell in row.cells]
            table_data.append(row_data)
        
        if table_data:
            num_cols = len(table_data[0]) if table_data else 1
            col_width = 7 * inch / num_cols if num_cols > 0 else 1
            col_widths = [col_width] * num_cols
            
            t = Table(table_data, colWidths=col_widths)
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('TOPPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(t)
        
        story.append(Spacer(1, 15))
    
    pdf_doc.build(story)
    return pdf_path

def _convert_xlsx_to_pdf(xlsx_path, pdf_path):
    if WIN32_AVAILABLE:
        try:
            import pythoncom
            pythoncom.CoInitialize()
            
            excel = win32com.client.Dispatch("Excel.Application")
            excel.Visible = False
            excel.DisplayAlerts = False
            
            try:
                wb = excel.Workbooks.Open(xlsx_path)
                wb.ExportAsFixedFormat(0, pdf_path)
                wb.Close(SaveChanges=False)
                
                if os.path.exists(pdf_path):
                    return pdf_path
            finally:
                excel.Quit()
                pythoncom.CoUninitialize()
        except Exception as e:
            pass
    
    if not XLSX_AVAILABLE:
        raise Exception("openpyxl not available for Excel conversion")
    
    wb = openpyxl.load_workbook(xlsx_path)
    
    pdf_doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    
    for sheet in wb.sheetnames:
        ws = wb[sheet]
        
        story.append(Paragraph(f"Sheet: {sheet}", styles['Heading2']))
        story.append(Spacer(1, 10))
        
        table_data = []
        for row in ws.iter_rows(values_only=True):
            row_data = [str(cell) if cell is not None else '' for cell in row]
            if any(row_data):
                table_data.append(row_data)
        
        if table_data:
            max_cols = 10
            max_rows = 50
            
            table_data = table_data[:max_rows]
            table_data = [row[:max_cols] for row in table_data]
            
            col_width = 7.5 * inch / min(len(table_data[0]) if table_data else 1, max_cols)
            
            t = Table(table_data, colWidths=[col_width] * min(len(table_data[0]) if table_data else 1, max_cols))
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('TOPPADDING', (0, 0), (-1, 0), 8),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            story.append(t)
        
        story.append(Spacer(1, 20))
    
    pdf_doc.build(story)
    return pdf_path

def _convert_image_to_pdf(image_path, pdf_path):
    img = Image(image_path)
    
    img.drawWidth = 6 * inch
    img.drawHeight = 8 * inch
    
    pdf_doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    story = []
    story.append(img)
    
    pdf_doc.build(story)
    return pdf_path

def _convert_txt_to_pdf(txt_path, pdf_path):
    with open(txt_path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    pdf_doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    
    for line in text.split('\n'):
        if line.strip():
            story.append(Paragraph(line, styles['Normal']))
            story.append(Spacer(1, 6))
    
    pdf_doc.build(story)
    return pdf_path

def _convert_generic_to_pdf(file_path, pdf_path):
    pdf_doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    
    filename = os.path.basename(file_path)
    story.append(Paragraph(f"Attached File: {filename}", styles['Heading1']))
    story.append(Spacer(1, 20))
    story.append(Paragraph("This file was attached but could not be converted to PDF directly.", styles['Normal']))
    story.append(Paragraph(f"Original format: {os.path.splitext(filename)[1]}", styles['Normal']))
    
    pdf_doc.build(story)
    return pdf_path

def merge_pdfs_to_single(file_paths, output_path):
    try:
        from PyPDF2 import PdfMerger
        merger = PdfMerger()
        
        # Create a temporary directory for pre-conversion
        temp_dir = os.path.join(os.path.dirname(output_path), 'temp_conversions')
        os.makedirs(temp_dir, exist_ok=True)
        
        temp_files_to_cleanup = []
        
        for file_path in file_paths:
            if os.path.exists(file_path):
                ext = file_path.lower().split('.')[-1]
                
                if ext == 'pdf':
                    # Already a PDF, merge directly
                    merger.append(file_path)
                else:
                    # Convert to PDF first
                    converted_pdf = convert_file_to_pdf(file_path, temp_dir)
                    if converted_pdf and os.path.exists(converted_pdf):
                        merger.append(converted_pdf)
                        temp_files_to_cleanup.append(converted_pdf)
        
        with open(output_path, 'wb') as f:
            merger.write(f)
        
        merger.close()
        
        # Cleanup temporary converted files
        for temp_file in temp_files_to_cleanup:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
            except Exception:
                pass
                
        try:
            os.rmdir(temp_dir)
        except Exception:
            pass
            
        return output_path
    except ImportError:
        if file_paths and os.path.exists(file_paths[0]):
            import shutil
            shutil.copy2(file_paths[0], output_path)
            return output_path
        raise Exception("PyPDF2 not available for PDF merging")