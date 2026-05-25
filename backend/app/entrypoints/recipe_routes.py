"""Recipe API routes."""

from flask import Blueprint, request, jsonify, g
from app.dependencies import get_unit_of_work
from app.services.recipe_service import RecipeService
from app.entrypoints.middleware import require_auth
from app.domain.exceptions import NotFoundError, ValidationError

recipe_bp = Blueprint("recipes", __name__, url_prefix="/api/profiles/<profile_id>/recipes")


def _recipe_to_dict(r):
    return {
        "id": r.id,
        "profile_id": r.profile_id,
        "name": r.name,
        "target_color_hex": r.target_color_hex,
        "target_color_lab": r.target_color_lab,
        "material": r.material,
        "total_batch_weight_mg": r.total_batch_weight_mg,
        "thread_weight_g": r.thread_weight_g,
        "liquor_ratio": r.liquor_ratio,
        "water_volume_ml": r.water_volume_ml,
        "notes": r.notes,
        "source_image_url": r.source_image_url,
        "created_at": r.created_at.isoformat(),
        "updated_at": r.updated_at.isoformat(),
        "ingredients": [
            {
                "id": ing.id,
                "base_dye_id": ing.base_dye_id,
                "base_dye_name": ing.base_dye_name,
                "quantity_mg": ing.quantity_mg,
                "quantity_ml": ing.quantity_ml,
                "percentage": ing.percentage,
            }
            for ing in r.ingredients
        ],
        "auxiliaries": [
            {
                "id": aux.id,
                "name": aux.name,
                "quantity_g": aux.quantity_g,
                "quantity_ml": aux.quantity_ml,
                "unit": aux.unit,
                "purpose": aux.purpose,
            }
            for aux in r.auxiliaries
        ],
    }


def _recipe_summary(r):
    return {
        "id": r.id,
        "name": r.name,
        "target_color_hex": r.target_color_hex,
        "material": r.material,
        "total_batch_weight_mg": r.total_batch_weight_mg,
        "created_at": r.created_at.isoformat(),
        "ingredient_count": len(r.ingredients),
    }


@recipe_bp.route("", methods=["GET"])
@require_auth
def list_recipes(profile_id):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    sort_by = request.args.get("sort_by", "created_at")
    sort_order = request.args.get("sort_order", "desc")
    search = request.args.get("search", "")

    try:
        svc = RecipeService(get_unit_of_work())
        recipes, total = svc.list_recipes(
            profile_id, g.tenant_id,
            page=page, per_page=per_page,
            sort_by=sort_by, sort_order=sort_order, search=search
        )
        return jsonify({
            "recipes": [_recipe_summary(r) for r in recipes],
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page,
        }), 200
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404


@recipe_bp.route("", methods=["POST"])
@require_auth
def create_recipe(profile_id):
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "Recipe name is required"}), 400

    try:
        svc = RecipeService(get_unit_of_work())
        recipe = svc.create_recipe(profile_id, g.tenant_id, data)
        return jsonify(_recipe_to_dict(recipe)), 201
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404


@recipe_bp.route("/<recipe_id>", methods=["GET"])
@require_auth
def get_recipe(profile_id, recipe_id):
    try:
        svc = RecipeService(get_unit_of_work())
        recipe = svc.get_recipe(recipe_id, profile_id, g.tenant_id)
        return jsonify(_recipe_to_dict(recipe)), 200
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404


@recipe_bp.route("/<recipe_id>", methods=["PUT"])
@require_auth
def update_recipe(profile_id, recipe_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    try:
        svc = RecipeService(get_unit_of_work())
        recipe = svc.update_recipe(recipe_id, profile_id, g.tenant_id, data)
        return jsonify(_recipe_to_dict(recipe)), 200
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404


@recipe_bp.route("/<recipe_id>", methods=["DELETE"])
@require_auth
def delete_recipe(profile_id, recipe_id):
    try:
        svc = RecipeService(get_unit_of_work())
        svc.delete_recipe(recipe_id, profile_id, g.tenant_id)
        return jsonify({"message": "Recipe deleted"}), 200
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404


@recipe_bp.route("/<recipe_id>/duplicate", methods=["POST"])
@require_auth
def duplicate_recipe(profile_id, recipe_id):
    data = request.get_json() or {}
    try:
        svc = RecipeService(get_unit_of_work())
        recipe = svc.duplicate_recipe(
            recipe_id, profile_id, g.tenant_id,
            new_name=data.get("name", "")
        )
        return jsonify(_recipe_to_dict(recipe)), 201
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404


@recipe_bp.route("/import", methods=["POST"])
@require_auth
def import_recipes(profile_id):
    # Accept CSV as text in request body or as file upload
    csv_content = ""

    if request.content_type and "multipart/form-data" in request.content_type:
        file = request.files.get("file")
        if not file:
            return jsonify({"error": "CSV file is required"}), 400
        csv_content = file.read().decode("utf-8")
    else:
        data = request.get_json()
        if not data or not data.get("csv_content"):
            return jsonify({"error": "csv_content is required"}), 400
        csv_content = data["csv_content"]

    try:
        svc = RecipeService(get_unit_of_work())
        result = svc.bulk_import_csv(profile_id, g.tenant_id, csv_content)
        return jsonify(result), 200
    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404


@recipe_bp.route("/export-template", methods=["GET"])
@require_auth
def export_template(profile_id):
    """Return CSV template for bulk import."""
    headers = [
        "recipe_name", "target_color_hex", "target_color_L", "target_color_a", "target_color_b",
        "material", "thread_weight_g", "water_volume_ml", "liquor_ratio", "total_batch_weight_mg",
        "dye_1_name", "dye_1_ci_number", "dye_1_quantity_mg",
        "dye_2_name", "dye_2_ci_number", "dye_2_quantity_mg",
        "dye_3_name", "dye_3_ci_number", "dye_3_quantity_mg",
        "dye_4_name", "dye_4_ci_number", "dye_4_quantity_mg",
        "aux_1_name", "aux_1_quantity_g", "aux_1_purpose",
        "aux_2_name", "aux_2_quantity_g", "aux_2_purpose",
        "notes"
    ]
    template = ",".join(headers) + "\n"
    template += "Ocean Blue,#0077BE,50.2,-15.3,-40.8,Wool,10,200,1:20,1000,Cyan,CI 74160,450,Magenta,CI 73915,50,Yellow,CI 47005,200,Black,CI 20470,300,Glauber Salt,5.0,leveling,Acetic Acid,2.0,pH control,Sample recipe\n"

    return jsonify({"template": template}), 200
