"""
System Logger Utility
Functions to log system transactions to the database
"""
from flask import request
from models import db, SystemLog


def log_action(user, action, details=None):
    """
    Log an action performed by a user.
    
    Args:
        user: The User object who performed the action
        action: String describing the action (e.g., 'LOGIN', 'CREATE_USER', 'UPLOAD_DOCUMENT')
        details: Optional details about the action
    """
    try:
        # Get IP address from request
        ip_address = request.remote_addr if request else None
        
        # If user is provided, get their details
        if user:
            user_id = user.id
            user_name = user.full_name
            user_role = user.role
        else:
            # For system actions (no user context)
            user_id = None
            user_name = "System"
            user_role = "system"
        
        log_entry = SystemLog(
            user_id=user_id,
            user_name=user_name,
            user_role=user_role,
            action=action,
            details=details,
            ip_address=ip_address
        )
        
        db.session.add(log_entry)
        db.session.commit()
        
    except Exception as e:
        # Don't let logging errors break the main operation
        print(f"Error logging action: {e}")
        db.session.rollback()


def get_client_ip():
    """Get the client's IP address from request"""
    if request:
        return request.remote_addr
    return None

