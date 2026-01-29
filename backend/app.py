from flask import Flask
from flask_cors import CORS
import os
from models import db

from routes import account_bp
from attendance_routes import attendance_bp

app = Flask(__name__)
CORS(app)

# ---------- CONFIG ----------
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'dev-secret-key'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# ---------- INIT ----------
db.init_app(app)

# ---------- ROUTES ----------
app.register_blueprint(account_bp)
app.register_blueprint(attendance_bp)

@app.route("/api/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # this will create users + office_locations tables
    app.run(debug=True)