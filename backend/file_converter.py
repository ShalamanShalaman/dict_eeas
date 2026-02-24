import os
import io
from flask import send_file
from datetime import datetime

# For Word documents
try:
    from docx import Document as DocxDocument
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

# For Word to PDF (preserves formatting, logos, images)
try:
    from docx2pdf import convert as docx2pdf_convert
    DOCX2PDF_AVAILABLE = True
except ImportError:
    DOCX2PDF_AVAILABLE = False

# For Excel files
try:
    import openpyxl
    XLSX_AVAILABLE = True
except ImportError:
    XLSX_AVAILABLE = False

# For PDF processing
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
    """
    Converts a single file to PDF.
    Supports: .docx, .xlsx, .xls, .png, .jpg, .jpeg, .txt
    Returns the path to the generated PDF.
    """
    if not REPORTLAB_AVAILABLE:
        raise Exception("PDF generation library not available")
    
    filename = os.path.basename(file_path)
    name_without_ext = os.path.splitext(filename)[0]
    output_path = os.path.join(output_dir, f"{name_without_ext}.pdf")
    
    # Ensure output directory exists
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
        # Already PDF, just copy
        import shutil
        shutil.copy2(file_path, output_path)
        return output_path
    else:
        # Try to convert using ReportLab basic conversion
        return _convert_generic_to_pdf(file_path, output_path)


def _convert_docx_to_pdf(docx_path, pdf_path):
    """Convert DOCX to PDF - tries docx2pdf first (preserves formatting), falls back to ReportLab"""
    
    # Try using docx2pdf first - it uses Microsoft Word to preserve ALL formatting, logos, images
    if DOCX2PDF_AVAILABLE:
        try:
            # docx2pdf requires the output path without extension
            temp_dir = os.path.dirname(pdf_path)
            docx2pdf_convert(docx_path, temp_dir)
            
            # The output file will have the same name as the input, but .pdf extension
            input_filename = os.path.basename(docx_path)
            name_without_ext = os.path.splitext(input_filename)[0]
            generated_pdf = os.path.join(temp_dir, f"{name_without_ext}.pdf")
            
            if os.path.exists(generated_pdf):
                # Move to the expected output path
                import shutil
                shutil.move(generated_pdf, pdf_path)
                return pdf_path
        except Exception as e:
            print(f"docx2pdf conversion failed, falling back to ReportLab: {e}")
            # Fall through to ReportLab method
    
    # Fallback: Use ReportLab (loses formatting, images, logos)
    if not DOCX_AVAILABLE:
        raise Exception("python-docx not available for DOCX conversion")
    
    doc = DocxDocument(docx_path)
    
    # Create PDF
    pdf_doc = SimpleDocTemplate(pdf_path, pagesize=letter)
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
            story.append(Paragraph(para.text, para_style))
            story.append(Spacer(1, 8))
    
    # Handle tables
    for table in doc.tables:
        table_data = []
        for row in table.rows:
            row_data = [cell.text for cell in row.cells]
            table_data.append(row_data)
        
        if table_data:
            num_cols = len(table_data[0]) if table_data else 1
            col_widths = [4.5 * inch / num_cols] * num_cols
            
            t = Table(table_data, colWidths=col_widths)
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                ('TOPPADDING', (0, 0), (-1, 0), 10),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            story.append(t)
        
        story.append(Spacer(1, 20))
    
    pdf_doc.build(story)
    return pdf_path


def _convert_xlsx_to_pdf(xlsx_path, pdf_path):
    """Convert Excel to PDF"""
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
        
        # Get all rows with data
        table_data = []
        for row in ws.iter_rows(values_only=True):
            row_data = [str(cell) if cell is not None else '' for cell in row]
            if any(row_data):
                table_data.append(row_data)
        
        if table_data:
            # Limit columns and rows for readability
            max_cols = 10
            max_rows = 50
            
            table_data = table_data[:max_rows]
            table_data = [row[:max_cols] for row in table_data]
            
            # Calculate column widths
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
    """Convert image to PDF"""
    img = Image(image_path)
    
    # Scale image to fit letter size
    img.drawWidth = 6 * inch
    img.drawHeight = 8 * inch
    
    pdf_doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    story = []
    story.append(img)
    
    pdf_doc.build(story)
    return pdf_path


def _convert_txt_to_pdf(txt_path, pdf_path):
    """Convert text file to PDF"""
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
    """Generic conversion - just copies with a note"""
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


def merge_pdfs_to_single(pdf_paths, output_path):
    """
    Merges multiple PDF files into a single PDF.
    Returns the path to the merged PDF.
    """
    try:
        from PyPDF2 import PdfMerger
        merger = PdfMerger()
        
        for pdf_path in pdf_paths:
            if os.path.exists(pdf_path):
                merger.append(pdf_path)
        
        with open(output_path, 'wb') as f:
            merger.write(f)
        
        merger.close()
        return output_path
    except ImportError:
        # If PyPDF2 not available, just return the first PDF
        if pdf_paths and os.path.exists(pdf_paths[0]):
            import shutil
            shutil.copy2(pdf_paths[0], output_path)
            return output_path
        raise Exception("PyPDF2 not available for PDF merging")
