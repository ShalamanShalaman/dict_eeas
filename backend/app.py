from flask import Flask
from flask_cors import CORS
from models import db
from routes import account_bp  # Import the blueprint

app = Flask(__name__)
CORS(app)

# --- 1. Database Configuration ---
# Reverted to SQLite for development
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'dev-secret-key'  # Change this in production!

# --- 2. Initialize Extensions ---
db.init_app(app)

# --- 3. Register Blueprints (The separate "Account System" file) ---
app.register_blueprint(account_bp)

@app.route("/api/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    with app.app_context():
        # Creates the database tables if they don't exist
        db.create_all()
    app.run(debug=True)