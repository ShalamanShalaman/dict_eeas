from flask import Blueprint, request, jsonify
from models import db, User, OfficeLocation
import secrets, string

account_bp = Blueprint('account', __name__)

def generate_temp_password(length=12):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


# ---------------- USERS ----------------
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
        force_change_password=True
    )
    user.set_password(temp_password)

    db.session.add(user)
    db.session.commit()
    print("TEMP PASSWORD:", temp_password)
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

    db.session.commit()
    return jsonify({'message': 'User updated'})


@account_bp.route('/api/admin/delete-user/<public_id>', methods=['DELETE'])
def delete_user(public_id):
    user = User.query.filter_by(public_id=public_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'})


# ---------------- OFFICE LOCATIONS ----------------
@account_bp.route('/api/admin/locations', methods=['GET'])
def get_locations():
    locations = OfficeLocation.query.order_by(OfficeLocation.created_at.desc()).all()
    return jsonify([l.to_dict() for l in locations])


@account_bp.route('/api/admin/create-location', methods=['POST'])
def create_location():
    data = request.get_json()
    if not data.get("location") or not data.get("manager"):
        return jsonify({'error': 'Location and manager are required'}), 400

    loc = OfficeLocation(location=data['location'], manager=data['manager'])
    db.session.add(loc)
    db.session.commit()
    return jsonify({'message': 'Location created', 'location': loc.to_dict()}), 201


@account_bp.route('/api/admin/edit-location/<int:loc_id>', methods=['PUT'])
def edit_location(loc_id):
    data = request.get_json()
    loc = OfficeLocation.query.get_or_404(loc_id)
    loc.location = data.get('location', loc.location)
    loc.manager = data.get('manager', loc.manager)
    db.session.commit()
    return jsonify({'message': 'Location updated'})


@account_bp.route('/api/admin/delete-location/<int:loc_id>', methods=['DELETE'])
def delete_location(loc_id):
    loc = OfficeLocation.query.get_or_404(loc_id)
    db.session.delete(loc)
    db.session.commit()
    return jsonify({'message': 'Location deleted'})
