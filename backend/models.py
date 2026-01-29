from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

# Initialize SQLAlchemy (you might do this in your app.py or extensions.py)
db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    # 1. Primary Keys and IDs
    id = db.Column(db.Integer, primary_key=True)
    # unique=True ensures no duplicates, nullable=False means it's required
    public_id = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # 2. Login Credentials
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    
    # 3. Roles and Permissions
    # Storing as string is simplest; could also be an Enum
    role = db.Column(db.String(20), nullable=False, default='Employee') 
    
    # 4. Profile Information
    first_name = db.Column(db.String(50), nullable=False)
    middle_name = db.Column(db.String(50), nullable=True) # Optional
    last_name = db.Column(db.String(50), nullable=False)
    contact_no = db.Column(db.String(20), nullable=True)

    # 5. Account State & Security (The "Missing" Fields)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    force_change_password = db.Column(db.Boolean, default=True, nullable=False)
    
    # 6. Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)

    def set_password(self, password):
        """Hashes the password and stores it."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Checks if the provided password matches the hash."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Helper to return user data to the React frontend."""
        return {
            'public_id': self.public_id,
            'email': self.email,
            'role': self.role,
            'full_name': f"{self.first_name} {self.middle_name or ''} {self.last_name}".strip(),
            'first_name': self.first_name,
            'last_name': self.last_name,
            'contact_no': self.contact_no,
            'is_active': self.is_active,
            'force_change_password': self.force_change_password,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }