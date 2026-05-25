"""Color Directory API routes."""

from flask import Blueprint, request, jsonify, g
from app.dependencies import get_unit_of_work
from app.services.directory_service import DirectoryService
from app.entrypoints.middleware import require_auth
from app.domain.exceptions import NotFoundError

directory_bp = Blueprint("directory", __name__, url_prefix="/api/profiles/<profile_id>/directory")


def _entry_to_dict(e):
    return {
        "id": e.id,
        "profile_id": e.profile_id,
        "name": e.name,
        "category": e.category,
        "recipe_id": e.recipe_id,
        "color_hex": e.color_hex,
        "color_lab": e.color_lab,
        "created_at": e.created_at.isoformat(),
    }


@directory_bp.route("", methods=["GET"])
@require_auth
def list_entries(profile_id):
    try:
        svc = DirectoryService(get_unit_of_work())
        entries = svc.list_entries(profile_id, g.tenant_id)
        return jsonify([_entry_to_dict(e) for e in entries]), 200
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404


@directory_bp.route("", methods=["POST"])
@require_auth
def create_entry(profile_id):
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "Entry name is required"}), 400

    try:
        svc = DirectoryService(get_unit_of_work())
        entry = svc.create_entry(profile_id, g.tenant_id, data)
        return jsonify(_entry_to_dict(entry)), 201
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404


@directory_bp.route("/search", methods=["GET"])
@require_auth
def search_entries(profile_id):
    query = request.args.get("q", "")
    category = request.args.get("category", "")

    try:
        svc = DirectoryService(get_unit_of_work())
        entries = svc.search_entries(profile_id, g.tenant_id, query=query, category=category)
        return jsonify([_entry_to_dict(e) for e in entries]), 200
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404


@directory_bp.route("/<entry_id>", methods=["PUT"])
@require_auth
def update_entry(profile_id, entry_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    try:
        svc = DirectoryService(get_unit_of_work())
        entry = svc.update_entry(entry_id, profile_id, g.tenant_id, data)
        return jsonify(_entry_to_dict(entry)), 200
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404


@directory_bp.route("/<entry_id>", methods=["DELETE"])
@require_auth
def delete_entry(profile_id, entry_id):
    try:
        svc = DirectoryService(get_unit_of_work())
        svc.delete_entry(entry_id, profile_id, g.tenant_id)
        return jsonify({"message": "Entry deleted"}), 200
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404
