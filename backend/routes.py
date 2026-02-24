from flask import Blueprint, request, jsonify, current_app, send_file
from models import db, User, Position, OfficeLocation, Document
import os
import secrets
import string
import json
import random
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

account_bp = Blueprint('account', __name__)
document_bp = Blueprint('document', __name__)

otp_store = {}

def generate_temp_password(length=12):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def save_file(file, folder='uploads'):
    os.makedirs(os.path.join(current_app.root_path, 'static', folder), exist_ok=True)
    filename = os.path.basename(file.filename)
    filepath = os.path.join(current_app.root_path, 'static', folder, filename)
    file.save(filepath)
    return filepath

@account_bp.route('/api/admin/positions', methods=['GET'])
def get_positions():
    positions = Position.query.order_by(Position.created_at.desc()).all()
    return jsonify([p.to_dict() for p in positions])

@account_bp.route('/api/admin/create-position', methods=['POST'])
def create_position():
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Position name required'}), 400
    if Position.query.filter_by(name=name).first():
        return jsonify({'error': 'Position already exists'}), 409
    pos = Position(name=name, description=data.get('description'))
    db.session.add(pos)
    db.session.commit()
    return jsonify({'message': 'Position created', 'position': pos.to_dict()}), 201

@account_bp.route('/api/admin/edit-position/<int:pos_id>', methods=['PUT'])
def edit_position(pos_id):
    data = request.get_json()
    pos = Position.query.get_or_404(pos_id)
    pos.name = data.get('name', pos.name)
    pos.description = data.get('description', pos.description)
    db.session.commit()
    return jsonify({'message': 'Position updated', 'position': pos.to_dict()})

@account_bp.route('/api/admin/delete-position/<int:pos_id>', methods=['DELETE'])
def delete_position(pos_id):
    pos = Position.query.get_or_404(pos_id)
    db.session.delete(pos)
    db.session.commit()
    return jsonify({'message': 'Position deleted'})

@account_bp.route('/api/admin/locations', methods=['GET'])
def get_locations():
    locations = OfficeLocation.query.order_by(OfficeLocation.created_at.desc()).all()
    return jsonify([l.to_dict() for l in locations])

@account_bp.route('/api/admin/create-location', methods=['POST'])
def create_location():
    data = request.get_json()
    location = data.get("location")
    reviewer_id = data.get("reviewer_id")
    if not location:
        return jsonify({'error': 'Location is required'}), 400
    loc = OfficeLocation(location=location, reviewer_id=reviewer_id)
    db.session.add(loc)
    db.session.commit()
    return jsonify({'message': 'Location created', 'location': loc.to_dict()}), 201

@account_bp.route('/api/admin/edit-location/<int:loc_id>', methods=['PUT'])
def edit_location(loc_id):
    data = request.get_json()
    loc = OfficeLocation.query.get_or_404(loc_id)
    loc.location = data.get('location', loc.location)
    loc.reviewer_id = data.get('reviewer_id', loc.reviewer_id)
    db.session.commit()
    return jsonify({'message': 'Location updated', 'location': loc.to_dict()})

@account_bp.route('/api/admin/delete-location/<int:loc_id>', methods=['DELETE'])
def delete_location(loc_id):
    loc = OfficeLocation.query.get_or_404(loc_id)
    db.session.delete(loc)
    db.session.commit()
    return jsonify({'message': 'Location deleted'})

@account_bp.route('/api/admin/create-user', methods=['POST'])
def create_user():
    data = request.get_json()
    required = ['user_id', 'email', 'first_name', 'last_name', 'role']
    if not all(data.get(k) for k in required):
        return jsonify({'error': 'Missing required fields'}), 400

    if User.query.filter_by(user_id=data['user_id']).first():
        return jsonify({'error': 'User ID already exists'}), 409
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409

    temp_password = generate_temp_password()
    user = User(
        user_id=data['user_id'],
        email=data['email'],
        first_name=data['first_name'],
        middle_name=data.get('middle_name'),
        last_name=data['last_name'],
        contact_no=data.get('contact_no'),
        role=data['role'],
        office_location_id=data.get('office_location_id'),
        position_id=data.get('position_id'),
        force_change_password=True
    )
    user.set_password(temp_password)
    db.session.add(user)
    db.session.commit()

    print(f"=== New User Created ===\nEmail: {user.email}\nTemporary Password: {temp_password}\n=======================")
    return jsonify({'message': 'User created', 'user': user.to_dict()}), 201

@account_bp.route('/api/admin/users', methods=['GET'])
def get_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users])

@account_bp.route('/api/admin/edit-user/<public_id>', methods=['PUT'])
def edit_user(public_id):
    data = request.get_json()
    user = User.query.filter_by(public_id=public_id).first_or_404()
    user.user_id = data.get('user_id', user.user_id)
    user.first_name = data.get('first_name', user.first_name)
    user.middle_name = data.get('middle_name', user.middle_name)
    user.last_name = data.get('last_name', user.last_name)
    user.email = data.get('email', user.email)
    user.role = data.get('role', user.role)
    user.contact_no = data.get('contact_no', user.contact_no)
    user.office_location_id = data.get('office_location_id', user.office_location_id)
    user.position_id = data.get('position_id', user.position_id)
    db.session.commit()
    return jsonify({'message': 'User updated', 'user': user.to_dict()})

@account_bp.route('/api/admin/delete-user/<public_id>', methods=['DELETE'])
def delete_user(public_id):
    user = User.query.filter_by(public_id=public_id).first_or_404()
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'})

@account_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user_id = data.get('user_id')
    password = data.get('password')
    if not user_id or not password:
        return jsonify({'error': 'User ID and password required'}), 400
    user = User.query.filter_by(user_id=user_id).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401
    return jsonify({'message': 'Login successful', 'user': user.to_dict()}), 200

@account_bp.route('/api/profile/<public_id>', methods=['GET'])
def get_profile(public_id):
    user = User.query.filter_by(public_id=public_id).first_or_404()
    return jsonify(user.to_dict())

@account_bp.route('/api/profile/<public_id>', methods=['PUT'])
def edit_own_profile(public_id):
    data = request.get_json()
    user = User.query.filter_by(public_id=public_id).first_or_404()
    
    user.first_name = data.get('first_name', user.first_name)
    user.middle_name = data.get('middle_name', user.middle_name)
    user.last_name = data.get('last_name', user.last_name)
    user.contact_no = data.get('contact_no', user.contact_no)

    new_email = data.get('email')
    if new_email and new_email != user.email:
        if User.query.filter_by(email=new_email).first():
            return jsonify({'error': 'Email already in use'}), 409
        user.email = new_email
    
    new_password = data.get('password')
    if new_password:
        old_password = data.get('old_password')
        otp = data.get('otp')
        
        if otp:
            stored_otp = otp_store.get(user.user_id)
            if not stored_otp or stored_otp != otp:
                return jsonify({'error': 'Invalid or expired OTP'}), 400
            
            user.set_password(new_password)
            user.force_change_password = False
            
            if user.user_id in otp_store:
                del otp_store[user.user_id]
        
        elif old_password:
            if not user.check_password(old_password):
                return jsonify({'error': 'Incorrect old password'}), 401
                
            user.set_password(new_password)
            user.force_change_password = False
            
        else:
            return jsonify({'error': 'Old password or OTP verification is required to set a new password'}), 400

    db.session.commit()
    return jsonify({'message': 'Profile updated', 'user': user.to_dict()})

@account_bp.route('/api/profile/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    user_id = data.get('user_id')
    contact_no = data.get('contact_no')
    
    if not user_id or not contact_no:
        return jsonify({'error': 'Missing user_id or contact_no'}), 400
        
    code = ''.join(random.choices(string.digits, k=6))
    
    otp_store[user_id] = code
    
    print(f"\n[MOCK SMS GATEWAY] Sending OTP to {contact_no}: {code}\n")
    
    return jsonify({
        'message': 'OTP sent successfully',
        'debug_otp': code 
    })

@account_bp.route('/api/profile/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    user_id = data.get('user_id')
    otp = data.get('otp')
    
    if not user_id or not otp:
        return jsonify({'error': 'Missing data'}), 400
        
    stored_otp = otp_store.get(user_id)
    
    if stored_otp and stored_otp == otp:
        del otp_store[user_id] 
        
        return jsonify({'message': 'Phone verified successfully'})
    else:
        return jsonify({'error': 'Invalid or expired OTP'}), 400

@document_bp.route('/api/document/upload', methods=['POST'])
def upload_document():
    user_id = request.form.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    user = User.query.filter_by(user_id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    filepath = save_file(file, folder='documents')

    doc = Document(
        employee_id=user.id,
        file_path=filepath,
        status='draft',
        is_draft=True
    )
    db.session.add(doc)
    db.session.commit()
    return jsonify({'message': 'Document uploaded as draft', 'document': doc.to_dict()}), 201

@document_bp.route('/api/document/autosave/<int:doc_id>', methods=['POST'])
def autosave_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    user_id = request.form.get('user_id')
    user = User.query.filter_by(user_id=user_id).first_or_404()
    if doc.employee_id != user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    if 'file' in request.files:
        file = request.files['file']
        filepath = save_file(file, folder='documents')
        doc.file_path = filepath

    doc.updated_at = datetime.utcnow()
    doc.is_draft = True
    db.session.commit()
    return jsonify({'message': 'Draft autosaved', 'document': doc.to_dict()})

@document_bp.route('/api/document/submit/<int:doc_id>', methods=['POST'])
def submit_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    user_id = request.form.get('user_id')
    user = User.query.filter_by(user_id=user_id).first_or_404()
    if doc.employee_id != user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    reviewer_id = request.form.get('reviewer_id')
    
    if reviewer_id:
        reviewer = User.query.filter_by(id=int(reviewer_id), role='reviewer', is_active=True).first()
        if not reviewer:
            return jsonify({'error': 'Invalid or inactive reviewer selected'}), 400
    else:
        office = user.office_location
        if not office or not office.reviewer_id:
            return jsonify({'error': 'No reviewer assigned for your office. Please select a reviewer.'}), 400
        reviewer = User.query.get(office.reviewer_id)
        if not reviewer:
            return jsonify({'error': 'Assigned reviewer not found'}), 400

    doc.reviewer_id = reviewer.id
    doc.status = 'submitted'
    doc.is_draft = False
    doc.submitted_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Document submitted', 'document': doc.to_dict()})

@document_bp.route('/api/document/review/<int:doc_id>', methods=['POST'])
def review_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    
    reviewer_id = request.form.get('reviewer_id') or request.form.get('user_id')
    reviewer = User.query.filter_by(user_id=reviewer_id).first_or_404()

    if doc.reviewer_id != reviewer.id:
        return jsonify({'error': 'Unauthorized - you are not assigned to review this document'}), 403

    action = request.form.get('action') or request.form.get('status')

    if action == 'approve' or action == 'approved':
        doc.status = 'approved'
        doc.reviewed_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': 'Document approved', 'document': doc.to_dict()})

    elif action == 'decline' or action == 'declined':
        reason = request.form.get('reason') or request.form.get('note', '')
        doc.status = 'declined'
        doc.reviewer_note = reason
        doc.reviewed_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': 'Document declined', 'document': doc.to_dict()})

    return jsonify({'error': 'Invalid action. Use action=approve or action=decline'}), 400

@document_bp.route('/api/document/content/<int:doc_id>', methods=['GET'])
def get_document_content(doc_id):
    doc = Document.query.get_or_404(doc_id)
     
    requesting_user_id = request.args.get('user_id')
    if requesting_user_id:
        user = User.query.filter_by(user_id=requesting_user_id).first()
        if not user or (doc.employee_id != user.id and doc.reviewer_id != user.id):
             return jsonify({'error': 'Unauthorized'}), 403

    if not os.path.exists(doc.file_path):
        return jsonify({'error': 'File not found on server'}), 404

    if doc.file_path.endswith('.json'):
        try:
            with open(doc.file_path, 'r') as f:
                data = json.load(f)
            return jsonify(data)
        except Exception as e:
            return jsonify({'error': f'Failed to parse file: {str(e)}'}), 500
     
    return jsonify({'error': 'File is not a JSON state file'}), 400

@document_bp.route('/api/document/download/<int:doc_id>', methods=['GET'])
def download_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    path = doc.review_file_path if doc.review_file_path else doc.file_path
    if not os.path.exists(path):
        return jsonify({'error': 'File not found'}), 404
    return send_file(path, as_attachment=True, download_name=os.path.basename(path))

@document_bp.route('/api/document/<int:doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
     
    user_id = request.args.get('user_id')
    if user_id:
        user = User.query.filter_by(user_id=user_id).first()
        if user and doc.employee_id != user.id:
             return jsonify({'error': 'Unauthorized'}), 403

    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except OSError:
            pass 
             
    if hasattr(doc, 'review_file_path') and doc.review_file_path and os.path.exists(doc.review_file_path):
        try:
            os.remove(doc.review_file_path)
        except OSError:
            pass

    db.session.delete(doc)
    db.session.commit()
    return jsonify({'message': 'Document deleted'})

@document_bp.route('/api/document/user/<string:user_id>', methods=['GET'])
def get_user_documents(user_id):
    user = User.query.filter_by(user_id=user_id).first_or_404()
    docs = Document.query.filter_by(employee_id=user.id).order_by(Document.updated_at.desc()).all()
    return jsonify([d.to_dict() for d in docs])

@document_bp.route('/api/document/reviewer/<int:reviewer_id>', methods=['GET'])
def get_reviewer_documents(reviewer_id):
    reviewer = User.query.get_or_404(reviewer_id)
    docs = Document.query.filter_by(reviewer_id=reviewer.id, status='submitted').order_by(Document.submitted_at.desc()).all()
    return jsonify([d.to_dict() for d in docs])

@document_bp.route('/api/document/reviewers', methods=['GET'])
def get_reviewers():
    reviewers = User.query.filter_by(role='reviewer', is_active=True).all()
    return jsonify([{
        "id": r.id,
        "user_id": r.user_id,
        "full_name": r.full_name,
        "email": r.email,
        "office_location": r.office_location.location if r.office_location else None
    } for r in reviewers])

@document_bp.route('/api/document/upload-review/<int:doc_id>', methods=['POST'])
def upload_review_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    
    user_id = request.form.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    reviewer = User.query.filter_by(user_id=user_id).first_or_404()
    
    if doc.reviewer_id != reviewer.id:
        return jsonify({'error': 'Unauthorized - you are not assigned to review this document'}), 403
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400
    
    filepath = save_file(file, folder='uploads')
    doc.review_file_path = filepath
    doc.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'message': 'Signed document uploaded', 'document': doc.to_dict()}), 200

@document_bp.route('/api/document/upload-attachments', methods=['POST'])
def upload_attachments():
    try:
        user_id = request.form.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        user = User.query.filter_by(user_id=user_id).first_or_404()
        
        if 'files' not in request.files:
            return jsonify({'error': 'No files uploaded'}), 400
        
        files = request.files.getlist('files')
        if not files or len(files) == 0:
            return jsonify({'error': 'No files uploaded'}), 400
        
        try:
            from file_converter import convert_file_to_pdf, merge_pdfs_to_single
        except ImportError as e:
            print(f"Import error: {e}")
            return jsonify({'error': 'File conversion service not available. Please install required packages: pip install python-docx openpyxl reportlab PyPDF2'}), 500
        
        import tempfile
        import shutil
        
        temp_dir = tempfile.mkdtemp()
        converted_pdfs = []
        conversion_errors = []
        
        try:
            for file in files:
                if file.filename == '':
                    continue
                
                filename = file.filename
                temp_input_path = os.path.join(temp_dir, filename)
                file.save(temp_input_path)
                
                output_dir = os.path.join(temp_dir, 'pdfs')
                os.makedirs(output_dir, exist_ok=True)
                try:
                    pdf_path = convert_file_to_pdf(temp_input_path, output_dir)
                    if pdf_path and os.path.exists(pdf_path):
                        converted_pdfs.append(pdf_path)
                        print(f"Successfully converted {filename} to {pdf_path}")
                except Exception as e:
                    error_msg = f"Error converting {filename}: {str(e)}"
                    print(error_msg)
                    conversion_errors.append(error_msg)
            
            print(f"Conversion results: {len(converted_pdfs)} files converted, {len(conversion_errors)} errors")
            print(f"Conversion errors: {conversion_errors}")
            
            if not converted_pdfs:
                error_detail = "; ".join(conversion_errors) if conversion_errors else "No files could be converted to PDF. Please ensure you have .xlsx, .xls, .docx, .doc, .png, .jpg, .jpeg, or .txt files."
                return jsonify({'error': error_detail}), 400
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_filename = f"attachments_{timestamp}.pdf"
            output_dir = os.path.join(current_app.root_path, 'static', 'documents')
            os.makedirs(output_dir, exist_ok=True)
            output_path = os.path.join(output_dir, output_filename)
            
            if len(converted_pdfs) == 1:
                shutil.move(converted_pdfs[0], output_path)
            else:
                merge_pdfs_to_single(converted_pdfs, output_path)
            
            relative_path = os.path.join('documents', output_filename)
            
            return jsonify({
                'message': 'Files converted to PDF successfully',
                'file_path': relative_path,
                'original_files': [f.filename for f in files]
            }), 200
            
        except Exception as e:
            print(f"Conversion error: {str(e)}")
            return jsonify({'error': f'Conversion failed: {str(e)}'}), 500
        finally:
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
    except Exception as e:
        print(f"Unexpected error in upload_attachments: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500