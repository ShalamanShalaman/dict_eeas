# migrate.py
from app import create_app, db, seed_basic_data
from sqlalchemy import text

app = create_app()

with app.app_context():
    print("Dropping all tables safely...")

    # Disable foreign key checks to bypass circular dependency
    db.session.execute(text("SET FOREIGN_KEY_CHECKS=0;"))
    
    # Drop tables manually in an order that avoids FK issues
    for table_name in ["documents", "office_locations", "users", "positions"]:
        print(f"Dropping table {table_name} if exists...")
        db.session.execute(text(f"DROP TABLE IF EXISTS {table_name};"))

    db.session.execute(text("SET FOREIGN_KEY_CHECKS=1;"))  # Re-enable FKs
    db.session.commit()
    print("All tables dropped.")

    # Recreate tables
    print("Creating all tables...")
    db.create_all()
    db.session.commit()
    print("All tables created.")

    # Seed basic data
    print("Seeding basic data...")
    seed_basic_data()
    print("Database migration completed successfully.")
