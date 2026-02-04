from flask import Blueprint, request, jsonify, current_app, send_file
from models import db, User, Position, OfficeLocation, Document
import os
import secrets
import string
import json
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

account_bp = Blueprint('account', __name__)
document_bp = Blueprint('document', __name__)

# ---------------- HELPER FUNCTIONS ----------------
def generate_temp_password(length=12):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def save_file(file, folder='uploads'):
    # Ensure the directory exists
    os.makedirs(os.path.join(current_app.root_path, 'static', folder), exist_ok=True)
    filepath = os.path.join(current_app.root_path, 'static', folder, file.filename)
    file.save(filepath)
    return filepath


# ---------------- POSITIONS ----------------
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


# ---------------- OFFICE LOCATIONS ----------------
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


# ---------------- USER MANAGEMENT ----------------
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

# ---------------- PROFILE EDIT (Own Account) ----------------
@account_bp.route('/api/profile/<public_id>', methods=['PUT'])
def edit_own_profile(public_id):
    data = request.get_json()
    user = User.query.filter_by(public_id=public_id).first_or_404()
    user.first_name = data.get('first_name', user.first_name)
    user.middle_name = data.get('middle_name', user.middle_name)
    user.last_name = data.get('last_name', user.last_name)
    user.contact_no = data.get('contact_no', user.contact_no)
    if data.get('password'):
        user.set_password(data['password'])
        user.force_change_password = False
    db.session.commit()
    return jsonify({'message': 'Profile updated', 'user': user.to_dict()})


# ---------------- DOCUMENT WORKFLOW ----------------

# Upload or create draft
@document_bp.route('/api/document/upload', methods=['POST'])
def upload_document():
    user_id = request.form.get('user_id')
    user = User.query.filter_by(user_id=user_id).first_or_404()

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

# Autosave / update draft
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

# Submit document to reviewer
@document_bp.route('/api/document/submit/<int:doc_id>', methods=['POST'])
def submit_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    user_id = request.form.get('user_id')
    user = User.query.filter_by(user_id=user_id).first_or_404()
    if doc.employee_id != user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    office = user.office_location
    if not office or not office.reviewer_id:
        return jsonify({'error': 'No reviewer assigned for your office'}), 400

    reviewer = User.query.get(office.reviewer_id)
    doc.reviewer_id = reviewer.id
    doc.status = 'submitted'
    doc.is_draft = False
    doc.submitted_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Document submitted', 'document': doc.to_dict()})

# Reviewer approves or declines
@document_bp.route('/api/document/review/<int:doc_id>', methods=['POST'])
def review_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    reviewer_id = request.form.get('reviewer_id')
    reviewer = User.query.get_or_404(reviewer_id)

    if doc.reviewer_id != reviewer.id:
        return jsonify({'error': 'Unauthorized'}), 403

    status = request.form.get('status')
    note = request.form.get('note', '')
    if status not in ['approved', 'declined']:
        return jsonify({'error': 'Invalid status'}), 400

    if 'file' in request.files:
        file = request.files['file']
        filepath = save_file(file, folder='documents')
        doc.review_file_path = filepath

    doc.status = status
    doc.reviewer_note = note
    doc.reviewed_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': f'Document {status}', 'document': doc.to_dict()})

# Load/Get Content of a Document (JSON) directly
@document_bp.route('/api/document/content/<int:doc_id>', methods=['GET'])
def get_document_content(doc_id):
    """
    Reads the content of the file from the server disk and returns it as JSON.
    This allows the frontend to 'Load' state without the user downloading a file.
    """
    doc = Document.query.get_or_404(doc_id)
    
    # Security: Ensure only the owner (or potentially the reviewer) can read the raw content
    # Note: For strict security, you should pass user_id as a query param or use session
    requesting_user_id = request.args.get('user_id')
    if requesting_user_id:
        user = User.query.filter_by(user_id=requesting_user_id).first()
        if not user or (doc.employee_id != user.id and doc.reviewer_id != user.id):
             return jsonify({'error': 'Unauthorized'}), 403

    if not os.path.exists(doc.file_path):
        return jsonify({'error': 'File not found on server'}), 404

    # We only want to return JSON content this way. PDFs should still be downloaded.
    if doc.file_path.endswith('.json'):
        try:
            with open(doc.file_path, 'r') as f:
                data = json.load(f)
            return jsonify(data)
        except Exception as e:
            return jsonify({'error': f'Failed to parse file: {str(e)}'}), 500
    
    return jsonify({'error': 'File is not a JSON state file'}), 400

# Download document (as attachment)
@document_bp.route('/api/document/download/<int:doc_id>', methods=['GET'])
def download_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    path = doc.review_file_path if doc.review_file_path else doc.file_path
    if not os.path.exists(path):
        return jsonify({'error': 'File not found'}), 404
    return send_file(path, as_attachment=True, download_name=os.path.basename(path))

# Get all documents for a user
@document_bp.route('/api/document/user/<int:user_id>', methods=['GET'])
def get_user_documents(user_id):
    user = User.query.get_or_404(user_id)
    docs = Document.query.filter_by(employee_id=user.id).order_by(Document.updated_at.desc()).all()
    return jsonify([d.to_dict() for d in docs])

# Get all documents pending review for a reviewer
@document_bp.route('/api/document/reviewer/<int:reviewer_id>', methods=['GET'])
def get_reviewer_documents(reviewer_id):
    reviewer = User.query.get_or_404(reviewer_id)
    docs = Document.query.filter_by(reviewer_id=reviewer.id, status='submitted').order_by(Document.submitted_at.desc()).all()
    return jsonify([d.to_dict() for d in docs])