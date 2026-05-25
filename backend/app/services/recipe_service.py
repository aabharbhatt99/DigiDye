"""Recipe service - CRUD, search, bulk import."""

import csv
import io
from typing import Optional
from app.domain.models.entities import (
    Recipe, RecipeIngredient, RecipeAuxiliary, BaseDye, new_id, now
)
from app.domain.models.color import LabColor
from app.domain.exceptions import NotFoundError, ValidationError
from app.ports.unit_of_work import AbstractUnitOfWork


class RecipeService:
    def __init__(self, uow: AbstractUnitOfWork):
        self.uow = uow

    def create_recipe(self, profile_id: str, tenant_id: str, data: dict) -> Recipe:
        with self.uow as uow:
            profile = uow.profiles.get_by_id(profile_id, tenant_id)
            if not profile:
                raise NotFoundError(f"Profile '{profile_id}' not found")

            recipe = Recipe(
                id=new_id(),
                profile_id=profile_id,
                name=data["name"],
                target_color_hex=data.get("target_color_hex", "#000000"),
                target_color_lab=data.get("target_color_lab", {"L": 0, "a": 0, "b": 0}),
                material=data.get("material", profile.material),
                total_batch_weight_mg=float(data.get("total_batch_weight_mg", 1000)),
                thread_weight_g=data.get("thread_weight_g"),
                liquor_ratio=data.get("liquor_ratio"),
                water_volume_ml=data.get("water_volume_ml"),
                notes=data.get("notes", ""),
                source_image_url=data.get("source_image_url"),
                created_at=now(),
                updated_at=now(),
            )

            # Process ingredients
            for ing_data in data.get("ingredients", []):
                ingredient = RecipeIngredient(
                    id=new_id(),
                    recipe_id=recipe.id,
                    base_dye_id=ing_data.get("base_dye_id", ""),
                    base_dye_name=ing_data.get("base_dye_name", ""),
                    quantity_mg=float(ing_data.get("quantity_mg", 0)),
                    quantity_ml=ing_data.get("quantity_ml"),
                    percentage=float(ing_data.get("percentage", 0)),
                )
                recipe.ingredients.append(ingredient)

            # Process auxiliaries
            for aux_data in data.get("auxiliaries", []):
                auxiliary = RecipeAuxiliary(
                    id=new_id(),
                    recipe_id=recipe.id,
                    name=aux_data.get("name", ""),
                    quantity_g=float(aux_data.get("quantity_g", 0)),
                    quantity_ml=aux_data.get("quantity_ml"),
                    unit=aux_data.get("unit", "grams"),
                    purpose=aux_data.get("purpose", ""),
                )
                recipe.auxiliaries.append(auxiliary)

            uow.recipes.create(recipe)
            uow.commit()
            return recipe

    def get_recipe(self, recipe_id: str, profile_id: str, tenant_id: str) -> Recipe:
        with self.uow as uow:
            profile = uow.profiles.get_by_id(profile_id, tenant_id)
            if not profile:
                raise NotFoundError(f"Profile '{profile_id}' not found")
            recipe = uow.recipes.get_by_id(recipe_id, profile_id)
            if not recipe:
                raise NotFoundError(f"Recipe '{recipe_id}' not found")
            return recipe

    def list_recipes(self, profile_id: str, tenant_id: str, page: int = 1,
                     per_page: int = 20, sort_by: str = "created_at",
                     sort_order: str = "desc", search: str = "") -> tuple[list[Recipe], int]:
        with self.uow as uow:
            profile = uow.profiles.get_by_id(profile_id, tenant_id)
            if not profile:
                raise NotFoundError(f"Profile '{profile_id}' not found")
            return uow.recipes.list_by_profile(
                profile_id, page=page, per_page=per_page,
                sort_by=sort_by, sort_order=sort_order, search=search
            )

    def update_recipe(self, recipe_id: str, profile_id: str, tenant_id: str, data: dict) -> Recipe:
        with self.uow as uow:
            profile = uow.profiles.get_by_id(profile_id, tenant_id)
            if not profile:
                raise NotFoundError(f"Profile '{profile_id}' not found")
            recipe = uow.recipes.get_by_id(recipe_id, profile_id)
            if not recipe:
                raise NotFoundError(f"Recipe '{recipe_id}' not found")

            # Update scalar fields
            for field in ["name", "target_color_hex", "target_color_lab", "material",
                          "total_batch_weight_mg", "thread_weight_g", "liquor_ratio",
                          "water_volume_ml", "notes", "source_image_url"]:
                if field in data and data[field] is not None:
                    setattr(recipe, field, data[field])

            # Update ingredients if provided
            if "ingredients" in data:
                recipe.ingredients = []
                for ing_data in data["ingredients"]:
                    ingredient = RecipeIngredient(
                        id=new_id(),
                        recipe_id=recipe.id,
                        base_dye_id=ing_data.get("base_dye_id", ""),
                        base_dye_name=ing_data.get("base_dye_name", ""),
                        quantity_mg=float(ing_data.get("quantity_mg", 0)),
                        quantity_ml=ing_data.get("quantity_ml"),
                        percentage=float(ing_data.get("percentage", 0)),
                    )
                    recipe.ingredients.append(ingredient)

            # Update auxiliaries if provided
            if "auxiliaries" in data:
                recipe.auxiliaries = []
                for aux_data in data["auxiliaries"]:
                    auxiliary = RecipeAuxiliary(
                        id=new_id(),
                        recipe_id=recipe.id,
                        name=aux_data.get("name", ""),
                        quantity_g=float(aux_data.get("quantity_g", 0)),
                        quantity_ml=aux_data.get("quantity_ml"),
                        unit=aux_data.get("unit", "grams"),
                        purpose=aux_data.get("purpose", ""),
                    )
                    recipe.auxiliaries.append(auxiliary)

            recipe.updated_at = now()
            uow.recipes.update(recipe)
            uow.commit()
            return recipe

    def delete_recipe(self, recipe_id: str, profile_id: str, tenant_id: str) -> bool:
        with self.uow as uow:
            profile = uow.profiles.get_by_id(profile_id, tenant_id)
            if not profile:
                raise NotFoundError(f"Profile '{profile_id}' not found")
            result = uow.recipes.delete(recipe_id, profile_id)
            uow.commit()
            return result

    def duplicate_recipe(self, recipe_id: str, profile_id: str, tenant_id: str,
                         new_name: str = "") -> Recipe:
        with self.uow as uow:
            profile = uow.profiles.get_by_id(profile_id, tenant_id)
            if not profile:
                raise NotFoundError(f"Profile '{profile_id}' not found")
            original = uow.recipes.get_by_id(recipe_id, profile_id)
            if not original:
                raise NotFoundError(f"Recipe '{recipe_id}' not found")

            copy = Recipe(
                id=new_id(),
                profile_id=profile_id,
                name=new_name or f"{original.name} (Copy)",
                target_color_hex=original.target_color_hex,
                target_color_lab=original.target_color_lab.copy(),
                material=original.material,
                total_batch_weight_mg=original.total_batch_weight_mg,
                thread_weight_g=original.thread_weight_g,
                liquor_ratio=original.liquor_ratio,
                water_volume_ml=original.water_volume_ml,
                notes=original.notes,
                created_at=now(),
                updated_at=now(),
            )

            for ing in original.ingredients:
                copy.ingredients.append(RecipeIngredient(
                    id=new_id(),
                    recipe_id=copy.id,
                    base_dye_id=ing.base_dye_id,
                    base_dye_name=ing.base_dye_name,
                    quantity_mg=ing.quantity_mg,
                    quantity_ml=ing.quantity_ml,
                    percentage=ing.percentage,
                ))

            for aux in original.auxiliaries:
                copy.auxiliaries.append(RecipeAuxiliary(
                    id=new_id(),
                    recipe_id=copy.id,
                    name=aux.name,
                    quantity_g=aux.quantity_g,
                    quantity_ml=aux.quantity_ml,
                    unit=aux.unit,
                    purpose=aux.purpose,
                ))

            uow.recipes.create(copy)
            uow.commit()
            return copy

    def bulk_import_csv(self, profile_id: str, tenant_id: str,
                        csv_content: str) -> dict:
        """Import recipes from CSV. Returns import summary."""
        with self.uow as uow:
            profile = uow.profiles.get_by_id(profile_id, tenant_id)
            if not profile:
                raise NotFoundError(f"Profile '{profile_id}' not found")

            reader = csv.DictReader(io.StringIO(csv_content))
            imported = 0
            skipped = 0
            errors = []
            recipes_to_create = []

            for row_num, row in enumerate(reader, start=2):
                try:
                    name = row.get("recipe_name", "").strip()
                    if not name:
                        errors.append({"row": row_num, "error": "recipe_name is required"})
                        skipped += 1
                        continue

                    hex_color = row.get("target_color_hex", "#000000").strip()
                    if not hex_color.startswith("#") or len(hex_color) != 7:
                        errors.append({"row": row_num, "error": f"Invalid hex color: {hex_color}"})
                        skipped += 1
                        continue

                    # Parse LAB values
                    lab = {
                        "L": float(row.get("target_color_L", 0)),
                        "a": float(row.get("target_color_a", 0)),
                        "b": float(row.get("target_color_b", 0)),
                    }

                    batch_weight = float(row.get("total_batch_weight_mg", 1000))
                    material = row.get("material", profile.material).strip()
                    thread_weight = row.get("thread_weight_g")
                    water_volume = row.get("water_volume_ml")
                    liquor_ratio = row.get("liquor_ratio", "")
                    notes = row.get("notes", "")

                    recipe = Recipe(
                        id=new_id(),
                        profile_id=profile_id,
                        name=name,
                        target_color_hex=hex_color,
                        target_color_lab=lab,
                        material=material,
                        total_batch_weight_mg=batch_weight,
                        thread_weight_g=float(thread_weight) if thread_weight else None,
                        liquor_ratio=liquor_ratio if liquor_ratio else None,
                        water_volume_ml=float(water_volume) if water_volume else None,
                        notes=notes,
                        created_at=now(),
                        updated_at=now(),
                    )

                    # Parse dye ingredients (up to 8)
                    for i in range(1, 9):
                        dye_name = row.get(f"dye_{i}_name", "").strip()
                        if not dye_name:
                            break
                        qty_mg = float(row.get(f"dye_{i}_quantity_mg", 0))
                        ci_number = row.get(f"dye_{i}_ci_number", "").strip()

                        ingredient = RecipeIngredient(
                            id=new_id(),
                            recipe_id=recipe.id,
                            base_dye_id="",
                            base_dye_name=dye_name,
                            quantity_mg=qty_mg,
                            percentage=(qty_mg / batch_weight * 100) if batch_weight > 0 else 0,
                        )
                        recipe.ingredients.append(ingredient)

                    # Parse auxiliaries (up to 5)
                    for i in range(1, 6):
                        aux_name = row.get(f"aux_{i}_name", "").strip()
                        if not aux_name:
                            break
                        aux_qty = float(row.get(f"aux_{i}_quantity_g", 0))
                        aux_purpose = row.get(f"aux_{i}_purpose", "").strip()

                        auxiliary = RecipeAuxiliary(
                            id=new_id(),
                            recipe_id=recipe.id,
                            name=aux_name,
                            quantity_g=aux_qty,
                            unit="grams",
                            purpose=aux_purpose,
                        )
                        recipe.auxiliaries.append(auxiliary)

                    recipes_to_create.append(recipe)
                    imported += 1

                except (ValueError, KeyError) as e:
                    errors.append({"row": row_num, "error": str(e)})
                    skipped += 1

            if recipes_to_create:
                uow.recipes.bulk_create(recipes_to_create)
                uow.commit()

            return {
                "total_rows": imported + skipped,
                "imported": imported,
                "skipped": skipped,
                "errors": errors,
            }
