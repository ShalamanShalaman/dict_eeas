from flask import Flask
from flask_cors import CORS
import os

from models import db, User
from routes import account_bp, document_bp
from attendance_routes import attendance_bp

# -------------------------------------------------
# APP SETUP
# -------------------------------------------------
app = Flask(__name__)
CORS(app)


# -------------------------------------------------
# BASE DIRECTORY
# -------------------------------------------------
BASE_DIR = os.path.abspath(os.path.dirname(__file__))


# -------------------------------------------------
# CONFIGURATION
# -------------------------------------------------
app.config['SECRET_KEY'] = 'dev-secret-key'

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Upload folders
app.config['UPLOAD_FOLDER'] = os.path.join(BASE_DIR, 'static', 'uploads')
app.config['DOCUMENT_UPLOAD_FOLDER'] = os.path.join(BASE_DIR, 'static', 'documents')

# Template files (same level as .py files)
app.config['TEMPLATE_FILES_DIR'] = os.path.join(BASE_DIR, 'template_files')
app.config['DTR_TEMPLATE_PATH'] = os.path.join(
    app.config['TEMPLATE_FILES_DIR'],
    'DTR_template.xlsx'
)
app.config['AR_TEMPLATE_PATH'] = os.path.join(
    app.config['TEMPLATE_FILES_DIR'],
    'AR_template.docx'
)


# -------------------------------------------------
# ENSURE DIRECTORIES EXIST
# -------------------------------------------------
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['DOCUMENT_UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['TEMPLATE_FILES_DIR'], exist_ok=True)


# -------------------------------------------------
# INITIALIZE EXTENSIONS
# -------------------------------------------------
db.init_app(app)


# -------------------------------------------------
# REGISTER BLUEPRINTS
# -------------------------------------------------
app.register_blueprint(account_bp)
app.register_blueprint(document_bp)
app.register_blueprint(attendance_bp)


# -------------------------------------------------
# HEALTH CHECK
# -------------------------------------------------
@app.route("/api/health")
def health():
    return {"status": "ok"}


# -------------------------------------------------
# AUTO SEED USERS (DEV ONLY)
# -------------------------------------------------
def seed_users():
    users = [
        {
            "user_id": "admin",
            "email": "admin@test.com",
            "first_name": "System",
            "last_name": "Admin",
            "role": "admin",
            "password": "admin123"
        },
        {
            "user_id": "reviewer",
            "email": "reviewer@test.com",
            "first_name": "Attendance",
            "last_name": "Reviewer",
            "role": "reviewer",
            "password": "review123"
        },
        {
            "user_id": "employee",
            "email": "employee@test.com",
            "first_name": "Juan",
            "last_name": "Dela Cruz",
            "role": "employee",
            "password": "employee123"
        }
    ]

    for u in users:
        if not User.query.filter_by(user_id=u["user_id"]).first():
            user = User(
                user_id=u["user_id"],
                email=u["email"],
                first_name=u["first_name"],
                last_name=u["last_name"],
                role=u["role"],
                force_change_password=False,
                is_active=True
            )
            user.set_password(u["password"])
            db.session.add(user)

    db.session.commit()
    print("✅ Default users seeded")


# -------------------------------------------------
# RUN APPLICATION
# -------------------------------------------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        seed_users()

    app.run(debug=True)
