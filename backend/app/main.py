"""Flask application factory."""

from flask import Flask
from flask_cors import CORS
from app.config import get_settings


def create_app() -> Flask:
    settings = get_settings()

    app = Flask(__name__)
    app.config["SECRET_KEY"] = settings.secret_key
    app.config["DEBUG"] = settings.debug

    # CORS
    CORS(app, origins=settings.cors_origin_list, supports_credentials=True)

    # Register blueprints
    from app.entrypoints.auth_routes import auth_bp
    from app.entrypoints.profile_routes import profile_bp
    from app.entrypoints.recipe_routes import recipe_bp
    from app.entrypoints.directory_routes import directory_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(recipe_bp)
    app.register_blueprint(directory_bp)

    # Health check
    @app.route("/api/health", methods=["GET"])
    def health():
        return {"status": "ok", "app": settings.app_name, "env": settings.app_env}

    # Seed demo data on first request if in-memory
    if settings.db_backend == "inmemory":
        with app.app_context():
            _seed_demo_data()

    return app


def _seed_demo_data():
    """Seed the in-memory store with demo data for showcase."""
    from app.adapters.inmemory.auth import InMemoryAuthProvider
    from app.adapters.inmemory.unit_of_work import get_global_store, InMemoryUnitOfWork
    from app.domain.models.entities import (
        Profile, BaseDye, Recipe, RecipeIngredient, RecipeAuxiliary,
        DirectoryEntry, new_id, now
    )
    from app.domain.models.color import hex_to_lab

    store = get_global_store()
    if store.get("users"):
        return  # Already seeded

    # Create demo user
    auth = InMemoryAuthProvider()
    auth.signup("demo@dyemix.com", "demo123", "Demo User", "APN Enterprise")

    # Get the user and tenant
    users = store["users"]
    user = list(users.values())[0]
    tenant_id = user.tenant_id

    # Create a demo profile
    uow = InMemoryUnitOfWork(store)
    with uow:
        profile = Profile(
            id=new_id(),
            tenant_id=tenant_id,
            user_id=user.id,
            name="Wool Dyeing - Acid Dyes",
            dye_form="powder",
            material="Wool",
            created_at=now(),
            updated_at=now(),
        )
        uow.profiles.create(profile)

        # Add CMYK base dyes
        base_dyes_data = [
            {"name": "Cyan", "ci_number": "CI 74160", "color_hex": "#00BFFF",
             "color_lab": {"L": 72.0, "a": -20.0, "b": -40.0}},
            {"name": "Magenta", "ci_number": "CI 73915", "color_hex": "#FF00FF",
             "color_lab": {"L": 60.0, "a": 98.0, "b": -60.0}},
            {"name": "Yellow", "ci_number": "CI 47005", "color_hex": "#FFD700",
             "color_lab": {"L": 87.0, "a": 0.0, "b": 85.0}},
            {"name": "Black", "ci_number": "CI 20470", "color_hex": "#1A1A1A",
             "color_lab": {"L": 10.0, "a": 0.0, "b": 0.0}},
        ]

        created_dyes = []
        for dye_data in base_dyes_data:
            dye = BaseDye(
                id=new_id(),
                profile_id=profile.id,
                name=dye_data["name"],
                ci_number=dye_data["ci_number"],
                color_hex=dye_data["color_hex"],
                color_lab=dye_data["color_lab"],
                form="powder",
                created_at=now(),
            )
            uow.base_dyes.create(dye)
            created_dyes.append(dye)

        # Seed some demo recipes
        demo_recipes = [
            {
                "name": "Deep Ocean Blue",
                "hex": "#003366",
                "material": "Wool",
                "batch_mg": 1000,
                "ingredients": [("Cyan", 550, 55), ("Magenta", 100, 10), ("Black", 350, 35)],
                "auxiliaries": [("Glauber Salt", 5.0, "leveling"), ("Acetic Acid", 1.5, "pH control")],
            },
            {
                "name": "Sunset Orange",
                "hex": "#FF4500",
                "material": "Wool",
                "batch_mg": 1000,
                "ingredients": [("Magenta", 450, 45), ("Yellow", 500, 50), ("Black", 50, 5)],
                "auxiliaries": [("Glauber Salt", 4.0, "leveling")],
            },
            {
                "name": "Forest Green",
                "hex": "#228B22",
                "material": "Wool",
                "batch_mg": 1000,
                "ingredients": [("Cyan", 400, 40), ("Yellow", 450, 45), ("Black", 150, 15)],
                "auxiliaries": [("Glauber Salt", 5.0, "leveling"), ("Acetic Acid", 2.0, "pH control")],
            },
            {
                "name": "Royal Purple",
                "hex": "#7B2D8B",
                "material": "Wool",
                "batch_mg": 1000,
                "ingredients": [("Magenta", 500, 50), ("Cyan", 350, 35), ("Black", 150, 15)],
                "auxiliaries": [("Glauber Salt", 4.5, "leveling")],
            },
            {
                "name": "Burgundy Red",
                "hex": "#800020",
                "material": "Wool",
                "batch_mg": 1000,
                "ingredients": [("Magenta", 600, 60), ("Yellow", 150, 15), ("Black", 250, 25)],
                "auxiliaries": [("Glauber Salt", 5.0, "leveling"), ("Acetic Acid", 2.5, "pH control")],
            },
            {
                "name": "Sky Blue",
                "hex": "#87CEEB",
                "material": "Wool",
                "batch_mg": 500,
                "ingredients": [("Cyan", 400, 80), ("Yellow", 50, 10), ("Black", 50, 10)],
                "auxiliaries": [("Glauber Salt", 3.0, "leveling")],
            },
            {
                "name": "Coral Pink",
                "hex": "#FF7F7F",
                "material": "Silk",
                "batch_mg": 500,
                "ingredients": [("Magenta", 350, 70), ("Yellow", 100, 20), ("Cyan", 50, 10)],
                "auxiliaries": [("Citric Acid", 1.0, "pH control")],
            },
            {
                "name": "Olive Drab",
                "hex": "#6B8E23",
                "material": "Wool",
                "batch_mg": 1000,
                "ingredients": [("Yellow", 500, 50), ("Cyan", 200, 20), ("Black", 300, 30)],
                "auxiliaries": [("Glauber Salt", 5.0, "leveling")],
            },
        ]

        for rd in demo_recipes:
            lab = hex_to_lab(rd["hex"])
            recipe = Recipe(
                id=new_id(),
                profile_id=profile.id,
                name=rd["name"],
                target_color_hex=rd["hex"],
                target_color_lab=lab.to_dict(),
                material=rd["material"],
                total_batch_weight_mg=rd["batch_mg"],
                thread_weight_g=10.0,
                liquor_ratio="1:20",
                water_volume_ml=200.0,
                created_at=now(),
                updated_at=now(),
            )

            for dye_name, qty_mg, pct in rd["ingredients"]:
                dye_obj = next((d for d in created_dyes if d.name == dye_name), None)
                recipe.ingredients.append(RecipeIngredient(
                    id=new_id(),
                    recipe_id=recipe.id,
                    base_dye_id=dye_obj.id if dye_obj else "",
                    base_dye_name=dye_name,
                    quantity_mg=qty_mg,
                    percentage=pct,
                ))

            for aux_name, qty_g, purpose in rd["auxiliaries"]:
                recipe.auxiliaries.append(RecipeAuxiliary(
                    id=new_id(),
                    recipe_id=recipe.id,
                    name=aux_name,
                    quantity_g=qty_g,
                    unit="grams",
                    purpose=purpose,
                ))

            uow.recipes.create(recipe)

        # Seed directory entries
        directory_colors = [
            ("Navy Blue", "Client A", "#000080"),
            ("Crimson", "Client A", "#DC143C"),
            ("Emerald", "Client B", "#50C878"),
            ("Gold", "Wedding Collection", "#FFD700"),
            ("Lavender", "Wedding Collection", "#E6E6FA"),
        ]

        for name, category, hex_color in directory_colors:
            lab = hex_to_lab(hex_color)
            entry = DirectoryEntry(
                id=new_id(),
                profile_id=profile.id,
                name=name,
                category=category,
                color_hex=hex_color,
                color_lab=lab.to_dict(),
                created_at=now(),
            )
            uow.directory.create(entry)

        uow.commit()
