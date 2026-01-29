from flask import Flask
from flask_cors import CORS
import os
from models import db

# Import Blueprints
from routes import account_bp         # Your existing Account System
from attendance_routes import attendance_bp  # The new Attendance System

app = Flask(__name__)
CORS(app)

# --- 1. Configuration ---
app.config['UPLOAD_FOLDER'] = 'static/uploads'  # Added for Attendance PDF uploads
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'dev-secret-key'

# Ensure the upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# --- 2. Initialize Extensions ---
db.init_app(app)

# --- 3. Register Blueprints ---
app.register_blueprint(account_bp)
app.register_blueprint(attendance_bp)

@app.route("/api/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    with app.app_context():
        # Creates the database tables if they don't exist
        db.create_all()
    app.run(debug=True)