from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class OfficeLocation(db.Model):
    __tablename__ = "office_locations"

    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(100), nullable=False)
    manager = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    users = db.relationship("User", backref="office_location", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "location": self.location,
            "manager": self.manager
        }


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), unique=True, nullable=False)
    public_id = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='employee')
    first_name = db.Column(db.String(50), nullable=False)
    middle_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=False)
    contact_no = db.Column(db.String(20), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    force_change_password = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)

    # Foreign key to office location
    office_location_id = db.Column(db.Integer, db.ForeignKey("office_locations.id"), nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'public_id': self.public_id,
            'user_id': self.user_id,
            'email': self.email,
            'role': self.role,
            'full_name': f"{self.first_name} {self.middle_name or ''} {self.last_name}".strip(),
            'first_name': self.first_name,
            'middle_name': self.middle_name,
            'last_name': self.last_name,
            'contact_no': self.contact_no,
            'is_active': self.is_active,
            'office_location_id': self.office_location_id,
            'created_at': self.created_at.isoformat()
        }
