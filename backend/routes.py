from flask import Blueprint, request, jsonify
from models import db, User
import secrets
import string

# Define the Blueprint
account_bp = Blueprint('account', __name__)

def generate_temp_password(length=12):
    """Generates a secure random alphanumeric string."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for i in range(length))

# --- ADMIN: Create User ---
@account_bp.route('/api/admin/create-user', methods=['POST'])
def create_user():
    data = request.get_json()

    # Basic Validation
    if not data or not data.get('email') or not data.get('role'):
        return jsonify({'error': 'Email and Role are required'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409

    # Generate Logic
    temp_password = generate_temp_password()
    
    new_user = User(
        email=data['email'],
        first_name=data['first_name'],
        middle_name=data.get('middle_name'),
        last_name=data['last_name'],
        contact_no=data.get('contact_no'),
        role=data['role'],
        force_change_password=True 
    )
    
    new_user.set_password(temp_password)

    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

    # In production: Send email here
    print(f"--> SENT EMAIL TO {new_user.email} WITH PASSWORD: {temp_password}")

    return jsonify({
        'message': 'User created successfully',
        'user': new_user.to_dict()
    }), 201

# --- NEW: Get All Users ---
@account_bp.route('/api/admin/users', methods=['GET'])
def get_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([user.to_dict() for user in users]), 200

# --- SYSTEM: Login ---
@account_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing credentials'}), 400
        
    user = User.query.filter_by(email=data['email']).first()
    
    if user and user.check_password(data['password']):
        # If user is deactivated/fired, block login
        if not user.is_active:
             return jsonify({'error': 'Account is disabled.'}), 403

        # Check if they need to change password (first login)
        if user.force_change_password:
             return jsonify({
                 'message': 'Password change required',
                 'require_password_change': True,
                 'public_id': user.public_id
             }), 200

        # Success! (In a real app, you would return a JWT token here)
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict()
        }), 200
        
    return jsonify({'error': 'Invalid email or password'}), 401