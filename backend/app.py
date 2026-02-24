import os
from flask import Flask, jsonify
from flask_cors import CORS
from models import db, User, Position, OfficeLocation
from routes import account_bp, document_bp 
from attendance_routes import attendance_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    BASE_DIR = os.path.abspath(os.path.dirname(__file__))

    app.config["SECRET_KEY"] = "dev-secret-key"
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  
    app.config["MAX_FORM_MEMORY_SIZE"] = 50 * 1024 * 1024  

    app.config["UPLOAD_FOLDER"] = os.path.join(BASE_DIR, "uploads")
    app.config["GENERATED_FOLDER"] = os.path.join(BASE_DIR, "generated_files")
    app.config["TEMPLATE_FILES_DIR"] = os.path.join(BASE_DIR, "template_files")

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    os.makedirs(app.config["GENERATED_FOLDER"], exist_ok=True)
    os.makedirs(app.config["TEMPLATE_FILES_DIR"], exist_ok=True)

    app.config["DTR_TEMPLATE"] = os.path.join(
        app.config["TEMPLATE_FILES_DIR"],
        "DTR_template.xlsx"
    )

    app.config["AR_TEMPLATE"] = os.path.join(
        app.config["TEMPLATE_FILES_DIR"],
        "AR_template.docx"
    )

    db.init_app(app)

    with app.app_context():
        db.create_all()
        seed_basic_data()

    app.register_blueprint(account_bp)
    app.register_blueprint(document_bp)
    app.register_blueprint(attendance_bp)

    @app.route("/health")
    def health():
        return jsonify({"status": "ok"})

    return app

def seed_basic_data():
    if Position.query.count() == 0:
        positions = [
            Position(name="Employee"),
            Position(name="Provincial Officer"),
            Position(name="Reviewer"),
            Position(name="Admin")
        ]
        db.session.add_all(positions)
        db.session.commit()

    if OfficeLocation.query.count() == 0:
        loc = OfficeLocation(
            location="Cauayan Office, Isabela"
        )
        db.session.add(loc)
        db.session.commit()

    existing_admin = User.query.filter(
        (User.email == "admin@system.local") | (User.user_id == "ADMIN001")
    ).first()
    
    if not existing_admin:
        admin_position = Position.query.filter_by(name="Admin").first()

        admin = User(
            email="admin@system.local",
            user_id="ADMIN001",
            first_name="System",
            last_name="Admin",
            role="admin",
            position_id=admin_position.id if admin_position else None
        )
        admin.set_password("admin123")
        db.session.add(admin)
        try:
            db.session.commit()
        except Exception as ex:
            db.session.rollback()
            print(ex)

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)