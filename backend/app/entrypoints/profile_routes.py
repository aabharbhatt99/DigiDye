"""Profile API routes."""

from flask import Blueprint, request, jsonify, g
from app.dependencies import get_unit_of_work
from app.services.profile_service import ProfileService
from app.entrypoints.middleware import require_auth
from app.domain.exceptions import NotFoundError, ValidationError

profile_bp = Blueprint("profiles", __name__, url_prefix="/api/profiles")


def _profile_to_dict(p):
    return {
        "id": p.id,
        "tenant_id": p.tenant_id,
        "user_id": p.user_id,
        "name": p.name,
        "dye_form": p.dye_form,
        "material": p.material,
        "created_at": p.created_at.isoformat(),
        "updated_at": p.updated_at.isoformat(),
    }


def _dye_to_dict(d):
    return {
        "id": d.id,
        "profile_id": d.profile_id,
        "name": d.name,
        "ci_number": d.ci_number,
        "color_hex": d.color_hex,
        "color_lab": d.color_lab,
        "form": d.form,
        "concentration_g_per_l": d.concentration_g_per_l,
        "manufacturer": d.manufacturer,
        "sku": d.sku,
        "created_at": d.created_at.isoformat(),
    }


@profile_bp.route("", methods=["GET"])
@require_auth
def list_profiles():
    svc = ProfileService(get_unit_of_work())
    profiles = svc.list_profiles(g.user_id, g.tenant_id)
    return jsonify([_profile_to_dict(p) for p in profiles]), 200


@profile_bp.route("", methods=["POST"])
@require_auth
def create_profile():
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "Profile name is required"}), 400

    svc = ProfileService(get_unit_of_work())
    profile = svc.create_profile(
        user_id=g.user_id,
        tenant_id=g.tenant_id,
        name=data["name"],
        dye_form=data.get("dye_form", "powder"),
        material=data.get("material", "Wool"),
    )
    return jsonify(_profile_to_dict(profile)), 201


@profile_bp.route("/<profile_id>", methods=["GET"])
@require_auth
def get_profile(profile_id):
    try:
        svc = ProfileService(get_unit_of_work())
        profile = svc.get_profile(profile_id, g.tenant_id)
        return jsonify(_profile_to_dict(profile)), 200
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404


@profile_bp.route("/<profile_id>", methods=["PUT"])
@require_auth
def update_profile(profile_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    try:
        svc = ProfileService(get_unit_of_work())
        profile = svc.update_profile(
            profile_id, g.tenant_id,
            name=data.get("name"),
            dye_form=data.get("dye_form"),
            material=data.get("material"),
        )
        return jsonify(_profile_to_dict(profile)), 200
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404


@profile_bp.route("/<profile_id>", methods=["DELETE"])
@require_auth
def delete_profile(profile_id):
    try:
        svc = ProfileService(get_unit_of_work())
        svc.delete_profile(profile_id, g.tenant_id)
        return jsonify({"message": "Profile deleted"}), 200
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404


# --- Base Dyes ---

@profile_bp.route("/<profile_id>/base-dyes", methods=["GET"])
@require_auth
def list_base_dyes(profile_id):
    try:
        svc = ProfileService(get_unit_of_work())
        dyes = svc.list_base_dyes(profile_id, g.tenant_id)
        return jsonify([_dye_to_dict(d) for d in dyes]), 200
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404


@profile_bp.route("/<profile_id>/base-dyes", methods=["POST"])
@require_auth
def add_base_dye(profile_id):
    data = request.get_json()
    if not data or not data.get("name") or not data.get("color_hex"):
        return jsonify({"error": "name and color_hex are required"}), 400

    try:
        svc = ProfileService(get_unit_of_work())
        dye = svc.add_base_dye(
            profile_id=profile_id,
            tenant_id=g.tenant_id,
            name=data["name"],
            color_hex=data["color_hex"],
            color_lab=data.get("color_lab", {"L": 0, "a": 0, "b": 0}),
            form=data.get("form", "powder"),
            ci_number=data.get("ci_number", ""),
            concentration_g_per_l=data.get("concentration_g_per_l"),
            manufacturer=data.get("manufacturer", ""),
            sku=data.get("sku", ""),
        )
        return jsonify(_dye_to_dict(dye)), 201
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400


@profile_bp.route("/<profile_id>/base-dyes/<dye_id>", methods=["PUT"])
@require_auth
def update_base_dye(profile_id, dye_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    try:
        svc = ProfileService(get_unit_of_work())
        dye = svc.update_base_dye(
            dye_id=dye_id,
            profile_id=profile_id,
            tenant_id=g.tenant_id,
            name=data.get("name"),
            color_hex=data.get("color_hex"),
            color_lab=data.get("color_lab"),
            form=data.get("form"),
            ci_number=data.get("ci_number"),
            concentration_g_per_l=data.get("concentration_g_per_l"),
            manufacturer=data.get("manufacturer"),
            sku=data.get("sku"),
        )
        return jsonify(_dye_to_dict(dye)), 200
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404


@profile_bp.route("/<profile_id>/base-dyes/<dye_id>", methods=["DELETE"])
@require_auth
def delete_base_dye(profile_id, dye_id):
    try:
        svc = ProfileService(get_unit_of_work())
        svc.delete_base_dye(dye_id, profile_id, g.tenant_id)
        return jsonify({"message": "Base dye deleted"}), 200
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404
