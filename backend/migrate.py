"""
Database migration script for adding profile_picture column to users table.
Runs standalone without loading the Flask app to avoid timing issues.

Usage: python migrate.py
       python migrate.py rollback
"""

import sys
import pymysql
from pymysql.cursors import DictCursor

# Database configuration (update these to match your settings)
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = 'root'
DB_NAME = 'attendance_db'

def get_connection():
    """Create a database connection"""
    try:
        return pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset='utf8mb4',
            cursorclass=DictCursor
        )
    except Exception as e:
        print(f"✗ Failed to connect to database: {str(e)}")
        print("\nDatabase configuration:")
        print(f"  Host: {DB_HOST}")
        print(f"  User: {DB_USER}")
        print(f"  Database: {DB_NAME}")
        return None

def column_exists(connection, table_name, column_name):
    """Check if a column exists in a table"""
    try:
        with connection.cursor() as cursor:
            cursor.execute(f"""
                SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = '{table_name}' AND COLUMN_NAME = '{column_name}'
                AND TABLE_SCHEMA = '{DB_NAME}'
            """)
            return cursor.fetchone() is not None
    except Exception as e:
        print(f"Error checking column: {str(e)}")
        return False

def migrate():
    """Run the migration"""
    print("=" * 60)
    print("DATABASE MIGRATION: Adding columns to users table")
    print("=" * 60)
    
    connection = get_connection()
    if not connection:
        return False
    
    try:
        print("\n→ Checking database connection...")
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✓ Database connection successful")
        
        migrations_needed = []
        
        # Check if profile_picture column exists
        if not column_exists(connection, 'users', 'profile_picture'):
            migrations_needed.append('profile_picture')
            print("\n→ profile_picture column missing - will be added")
        else:
            print("\n✓ profile_picture column already exists")
        
        # Check if profile_picture_updated column exists
        if not column_exists(connection, 'users', 'profile_picture_updated'):
            migrations_needed.append('profile_picture_updated')
            print("→ profile_picture_updated column missing - will be added")
        else:
            print("✓ profile_picture_updated column already exists")
        
        # Check if updated_at column exists
        if not column_exists(connection, 'users', 'updated_at'):
            migrations_needed.append('updated_at')
            print("→ updated_at column missing - will be added")
        else:
            print("✓ updated_at column already exists")
        
        if not migrations_needed:
            print("\n✓ All columns exist - no migration needed")
            return True
        
        # Add missing columns
        with connection.cursor() as cursor:
            if 'profile_picture' in migrations_needed:
                print("\n→ Adding profile_picture column to users table...")
                cursor.execute("""
                    ALTER TABLE users 
                    ADD COLUMN profile_picture VARCHAR(255) NULL
                """)
                print("✓ Successfully added profile_picture column")
            
            if 'profile_picture_updated' in migrations_needed:
                print("→ Adding profile_picture_updated column to users table...")
                cursor.execute("""
                    ALTER TABLE users 
                    ADD COLUMN profile_picture_updated DATETIME NULL
                """)
                print("✓ Successfully added profile_picture_updated column")
            
            if 'updated_at' in migrations_needed:
                print("→ Adding updated_at column to users table...")
                cursor.execute("""
                    ALTER TABLE users 
                    ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                """)
                print("✓ Successfully added updated_at column")
        
        connection.commit()
        
        print("\n" + "=" * 60)
        print("✓ MIGRATION COMPLETED SUCCESSFULLY")
        print("=" * 60)
        print("\nYou can now start your Flask backend with: python app.py")
        print("Profile pictures will be stored in: backend/static/profile_pictures/")
        
        return True
        
    except Exception as e:
        print(f"\n✗ MIGRATION FAILED: {str(e)}")
        print("\nPossible solutions:")
        print("1. Ensure MySQL is running")
        print("2. Check database credentials at the top of this file")
        print("3. Ensure the database 'attendance_db' exists")
        print("4. Run these SQL commands manually:")
        print("   ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) NULL;")
        print("   ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;")
        return False
        
    finally:
        connection.close()

def rollback():
    """Rollback the migration (remove the columns)"""
    print("=" * 60)
    print("DATABASE ROLLBACK: Removing columns from users table")
    print("=" * 60)
    
    connection = get_connection()
    if not connection:
        return False
    
    try:
        print("\n→ Checking database connection...")
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✓ Database connection successful")
        
        columns_to_remove = []
        
        # Check if profile_picture column exists
        if column_exists(connection, 'users', 'profile_picture'):
            columns_to_remove.append('profile_picture')
            print("\n→ profile_picture column exists - will be removed")
        else:
            print("\n✓ profile_picture column does not exist")
        
        # Check if updated_at column exists
        if column_exists(connection, 'users', 'updated_at'):
            columns_to_remove.append('updated_at')
            print("→ updated_at column exists - will be removed")
        else:
            print("✓ updated_at column does not exist")
        
        if not columns_to_remove:
            print("\n✓ No columns to rollback")
            return True
        
        # Drop the columns
        with connection.cursor() as cursor:
            if 'profile_picture' in columns_to_remove:
                print("\n→ Removing profile_picture column from users table...")
                cursor.execute("""
                    ALTER TABLE users DROP COLUMN profile_picture
                """)
                print("✓ Successfully removed profile_picture column")
            
            if 'updated_at' in columns_to_remove:
                print("→ Removing updated_at column from users table...")
                cursor.execute("""
                    ALTER TABLE users DROP COLUMN updated_at
                """)
                print("✓ Successfully removed updated_at column")
        
        connection.commit()
        
        print("\n" + "=" * 60)
        print("✓ ROLLBACK COMPLETED SUCCESSFULLY")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"\n✗ ROLLBACK FAILED: {str(e)}")
        print("\nRun these SQL commands manually:")
        print("ALTER TABLE users DROP COLUMN profile_picture;")
        print("ALTER TABLE users DROP COLUMN updated_at;")
        return False
        
    finally:
        connection.close()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1].lower() == "rollback":
        success = rollback()
    else:
        success = migrate()
    
    sys.exit(0 if success else 1)