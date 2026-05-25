"""Profile service - CRUD for profiles and base dyes."""

from datetime import datetime
from app.domain.models.entities import Profile, BaseDye, new_id, now
from app.domain.exceptions import NotFoundError, ValidationError
from app.ports.unit_of_work import AbstractUnitOfWork


class ProfileService:
    def __init__(self, uow: AbstractUnitOfWork):
        self.uow = uow

    def create_profile(self, user_id: str, tenant_id: str, name: str,
                       dye_form: str = "powder", material: str = "Wool") -> Profile:
        with self.uow as uow:
            profile = Profile(
                id=new_id(),
                tenant_id=tenant_id,
                user_id=user_id,
                name=name,
                dye_form=dye_form,
                material=material,
                created_at=now(),
                updated_at=now(),
            )
            uow.profiles.create(profile)
            uow.commit()
            return profile

    def get_profile(self, profile_id: str, tenant_id: str) -> Profile:
        with self.uow as uow:
            profile = uow.profiles.get_by_id(profile_id, tenant_id)
            if not profile:
                raise NotFoundError(f"Profile '{profile_id}' not found")
            return profile

    def list_profiles(self, user_id: str, tenant_id: str) -> list[Profile]:
        with self.uow as uow:
            return uow.profiles.list_by_user(user_id, tenant_id)

    def update_profile(self, profile_id: str, tenant_id: str, **kwargs) -> Profile:
        with self.uow as uow:
            profile = uow.profiles.get_by_id(profile_id, tenant_id)
            if not profile:
                raise NotFoundError(f"Profile '{profile_id}' not found")
            for key, value in kwargs.items():
                if hasattr(profile, key) and value is not None:
                    setattr(profile, key, value)
            profile.updated_at = now()
            uow.profiles.update(profile)
            uow.commit()
            return profile

    def delete_profile(self, profile_id: str, tenant_id: str) -> bool:
        with self.uow as uow:
            # Cascade: delete base dyes, recipes, directory entries
            dyes = uow.base_dyes.list_by_profile(profile_id)
            for d in dyes:
                uow.base_dyes.delete(d.id, profile_id)

            recipes, _ = uow.recipes.list_by_profile(profile_id, page=1, per_page=10000)
            for r in recipes:
                uow.recipes.delete(r.id, profile_id)

            entries = uow.directory.list_by_profile(profile_id)
            for e in entries:
                uow.directory.delete(e.id, profile_id)

            images = uow.images.list_by_profile(profile_id)
            for img in images:
                uow.images.delete(img.id, profile_id)

            result = uow.profiles.delete(profile_id, tenant_id)
            uow.commit()
            return result

    # --- Base Dye Methods ---
    def add_base_dye(self, profile_id: str, tenant_id: str, name: str,
                     color_hex: str, color_lab: dict, form: str = "powder",
                     ci_number: str = "", concentration_g_per_l: float | None = None,
                     manufacturer: str = "", sku: str = "") -> BaseDye:
        with self.uow as uow:
            # Verify profile exists and belongs to tenant
            profile = uow.profiles.get_by_id(profile_id, tenant_id)
            if not profile:
                raise NotFoundError(f"Profile '{profile_id}' not found")

            # Check limit
            existing = uow.base_dyes.list_by_profile(profile_id)
            if len(existing) >= 8:
                raise ValidationError("Maximum of 8 base dyes per profile")

            dye = BaseDye(
                id=new_id(),
                profile_id=profile_id,
                name=name,
                ci_number=ci_number,
                color_hex=color_hex,
                color_lab=color_lab,
                form=form,
                concentration_g_per_l=concentration_g_per_l,
                manufacturer=manufacturer,
                sku=sku,
                created_at=now(),
            )
            uow.base_dyes.create(dye)
            uow.commit()
            return dye

    def list_base_dyes(self, profile_id: str, tenant_id: str) -> list[BaseDye]:
        with self.uow as uow:
            profile = uow.profiles.get_by_id(profile_id, tenant_id)
            if not profile:
                raise NotFoundError(f"Profile '{profile_id}' not found")
            return uow.base_dyes.list_by_profile(profile_id)

    def update_base_dye(self, dye_id: str, profile_id: str, tenant_id: str, **kwargs) -> BaseDye:
        with self.uow as uow:
            profile = uow.profiles.get_by_id(profile_id, tenant_id)
            if not profile:
                raise NotFoundError(f"Profile '{profile_id}' not found")
            dye = uow.base_dyes.get_by_id(dye_id, profile_id)
            if not dye:
                raise NotFoundError(f"Base dye '{dye_id}' not found")
            for key, value in kwargs.items():
                if hasattr(dye, key) and value is not None:
                    setattr(dye, key, value)
            uow.base_dyes.update(dye)
            uow.commit()
            return dye

    def delete_base_dye(self, dye_id: str, profile_id: str, tenant_id: str) -> bool:
        with self.uow as uow:
            profile = uow.profiles.get_by_id(profile_id, tenant_id)
            if not profile:
                raise NotFoundError(f"Profile '{profile_id}' not found")
            result = uow.base_dyes.delete(dye_id, profile_id)
            uow.commit()
            return result
