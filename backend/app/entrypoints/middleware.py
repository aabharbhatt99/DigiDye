"""Auth middleware helper."""

from functools import wraps
from flask import request, jsonify, g
from app.dependencies import get_auth_provider


def require_auth(f):
    """Decorator to require valid JWT authentication."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization header required"}), 401

        token = auth_header[7:]
        auth = get_auth_provider()
        payload = auth.verify_token(token)
        if not payload:
            return jsonify({"error": "Invalid or expired token"}), 401

        # Store user info in Flask's g object
        g.user_id = payload["user_id"]
        g.tenant_id = payload["tenant_id"]
        g.user_email = payload["email"]
        g.user_role = payload["role"]

        return f(*args, **kwargs)
    return decorated
