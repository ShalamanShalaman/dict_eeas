from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class Position(db.Model):
    __tablename__ = "positions"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    users = db.relationship(
        "User",
        backref="position",
        lazy=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at.isoformat()
        }

class OfficeLocation(db.Model):
    __tablename__ = "office_locations"

    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(100), nullable=False)

    reviewer_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    employees = db.relationship(
        "User",
        foreign_keys="User.office_location_id",
        backref="office_location",
        lazy=True
    )

    reviewer = db.relationship(
        "User",
        foreign_keys=[reviewer_id],
        backref="reviewed_offices",
        lazy=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "location": self.location,
            "reviewer_id": self.reviewer_id
        }

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), unique=True, nullable=False)
    public_id = db.Column(
        db.String(36),
        unique=True,
        nullable=False,
        default=lambda: str(uuid.uuid4())
    )
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)

    role = db.Column(
        db.String(20),
        nullable=False,
        default='employee'
    )  

    first_name = db.Column(db.String(50), nullable=False)
    middle_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=False)
    contact_no = db.Column(db.String(20), nullable=True)
    profile_picture = db.Column(db.String(255), nullable=True)

    is_active = db.Column(db.Boolean, default=True, nullable=False)
    force_change_password = db.Column(db.Boolean, default=True, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    last_login = db.Column(db.DateTime, nullable=True)

    office_location_id = db.Column(
        db.Integer,
        db.ForeignKey("office_locations.id"),
        nullable=True
    )

    position_id = db.Column(
        db.Integer,
        db.ForeignKey("positions.id"),
        nullable=True
    )

    submitted_documents = db.relationship(
        "Document",
        foreign_keys="Document.employee_id",
        backref="employee",
        lazy=True,
        cascade="all, delete-orphan"
    )

    reviewed_documents = db.relationship(
        "Document",
        foreign_keys="Document.reviewer_id",
        backref="reviewer",
        lazy=True
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def full_name(self):
        return f"{self.first_name} {self.middle_name or ''} {self.last_name}".replace("  ", " ").strip()

    @property
    def adjustment_name(self):
        mi = f"{self.middle_name.strip()[0].upper()}." if self.middle_name and self.middle_name.strip() else ""
        if mi:
            return f"{self.last_name}, {self.first_name} {mi}".strip()
        return f"{self.last_name}, {self.first_name}".strip()

    def to_dict(self):
        pos_name = self.position.name if self.position else ""
        off_name = self.office_location.location if self.office_location else ""
        
        provincial_officer = ""
        if self.office_location and self.office_location.reviewer:
            provincial_officer = self.office_location.reviewer.full_name

        return {
            "id": self.id,
            "public_id": self.public_id,
            "user_id": self.user_id,
            "email": self.email,
            "role": self.role,
            "full_name": self.full_name,
            "adjustment_name": self.adjustment_name,
            "first_name": self.first_name,
            "middle_name": self.middle_name,
            "last_name": self.last_name,
            "contact_no": self.contact_no,
            "profile_picture": self.profile_picture,
            "is_active": self.is_active,
            "office_location_id": self.office_location_id,
            "position_id": pos_name,
            "office_name": off_name,
            "provincial_officer": provincial_officer,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.Integer, primary_key=True)

    employee_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    reviewer_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    file_path = db.Column(db.String(255), nullable=False)
    review_file_path = db.Column(db.String(255), nullable=True)

    status = db.Column(
        db.String(20),
        default='draft'
    )  

    reviewer_note = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    submitted_at = db.Column(db.DateTime, nullable=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)

    is_draft = db.Column(db.Boolean, default=True)

    def to_dict(self):
        # Get employee full name
        employee_name = ""
        if self.employee:
            employee_name = self.employee.full_name
            
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "employee_name": employee_name,
            "reviewer_id": self.reviewer_id,
            "file_path": self.file_path,
            "review_file_path": self.review_file_path,
            "status": self.status,
            "reviewer_note": self.reviewer_note,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
            "is_draft": self.is_draft
        }