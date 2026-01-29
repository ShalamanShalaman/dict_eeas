from flask import Blueprint, request, jsonify
from models import db, User
import secrets, string

account_bp = Blueprint('account', __name__)

def generate_temp_password(length=12):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for i in range(length))

# --- Create User ---
@account_bp.route('/api/admin/create-user', methods=['POST'])
def create_user():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('role') or not data.get('user_id'):
        return jsonify({'error': 'Email, Role, and User ID are required'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    if User.query.filter_by(user_id=data['user_id']).first():
        return jsonify({'error': 'User ID already exists'}), 409

    temp_password = generate_temp_password()

    new_user = User(
        user_id=data['user_id'],
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

    print(f"--> SENT EMAIL TO {new_user.email} WITH PASSWORD: {temp_password}")
    return jsonify({'message': 'User created successfully', 'user': new_user.to_dict()}), 201

# --- Get Users ---
@account_bp.route('/api/admin/users', methods=['GET'])
def get_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([user.to_dict() for user in users]), 200

# --- Edit User ---
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

    db.session.commit()
    return jsonify({'message': 'User updated successfully', 'user': user.to_dict()}), 200

# --- Delete User ---
@account_bp.route('/api/admin/delete-user/<public_id>', methods=['DELETE'])
def delete_user(public_id):
    user = User.query.filter_by(public_id=public_id).first_or_404()
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': f'{user.full_name} deleted successfully'}), 200
