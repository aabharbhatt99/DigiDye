"""Auth API routes."""

from flask import Blueprint, request, jsonify
from app.dependencies import get_auth_provider
from app.domain.exceptions import UnauthorizedError, DuplicateError

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    email = data.get("email", "").strip()
    password = data.get("password", "")
    display_name = data.get("display_name", "").strip()
    org_name = data.get("org_name", "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    try:
        auth = get_auth_provider()
        user = auth.signup(email, password, display_name, org_name or "My Organization")

        # Auto-login after signup
        result = auth.login(email, password)
        return jsonify(result), 201
    except DuplicateError as e:
        return jsonify({"error": str(e)}), 409


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        auth = get_auth_provider()
        result = auth.login(email, password)
        return jsonify(result), 200
    except UnauthorizedError:
        return jsonify({"error": "Invalid email or password"}), 401


@auth_bp.route("/me", methods=["GET"])
def me():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Authorization header required"}), 401

    token = auth_header[7:]
    auth = get_auth_provider()
    user = auth.get_current_user(token)
    if not user:
        return jsonify({"error": "Invalid or expired token"}), 401

    return jsonify({
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "tenant_id": user.tenant_id,
        "role": user.role,
    }), 200
