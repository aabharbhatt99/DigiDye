"""Directory service - Color bookmarks management."""

from app.domain.models.entities import DirectoryEntry, new_id, now
from app.domain.exceptions import NotFoundError
from app.ports.unit_of_work import AbstractUnitOfWork


class DirectoryService:
    def __init__(self, uow: AbstractUnitOfWork):
        self.uow = uow

    def create_entry(self, profile_id: str, tenant_id: str, data: dict) -> DirectoryEntry:
        with self.uow as uow:
            profile = uow.profiles.get_by_id(profile_id, tenant_id)
            if not profile:
                raise NotFoundError(f"Profile '{profile_id}' not found")

            entry = DirectoryEntry(
                id=new_id(),
                profile_id=profile_id,
                name=data["name"],
                category=data.get("category", ""),
                recipe_id=data.get("recipe_id"),
                color_hex=data.get("color_hex", "#000000"),
                color_lab=data.get("color_lab", {"L": 0, "a": 0, "b": 0}),
                created_at=now(),
            )
            uow.directory.create(entry)
            uow.commit()
            return entry

    def list_entries(self, profile_id: str, tenant_id: str) -> list[DirectoryEntry]:
        with self.uow as uow:
            profile = uow.profiles.get_by_id(profile_id, tenant_id)
            if not profile:
                raise NotFoundError(f"Profile '{profile_id}' not found")
            return uow.directory.list_by_profile(profile_id)

    def search_entries(self, profile_id: str, tenant_id: str,
                       query: str = "", category: str = "") -> list[DirectoryEntry]:
        with self.uow as uow:
            profile = uow.profiles.get_by_id(profile_id, tenant_id)
            if not profile:
                raise NotFoundError(f"Profile '{profile_id}' not found")
            return uow.directory.search(profile_id, query=query, category=category)

    def update_entry(self, entry_id: str, profile_id: str, tenant_id: str, data: dict) -> DirectoryEntry:
        with self.uow as uow:
            profile = uow.profiles.get_by_id(profile_id, tenant_id)
            if not profile:
                raise NotFoundError(f"Profile '{profile_id}' not found")
            entry = uow.directory.get_by_id(entry_id, profile_id)
            if not entry:
                raise NotFoundError(f"Directory entry '{entry_id}' not found")

            for key in ["name", "category", "recipe_id", "color_hex", "color_lab"]:
                if key in data and data[key] is not None:
                    setattr(entry, key, data[key])

            uow.directory.update(entry)
            uow.commit()
            return entry

    def delete_entry(self, entry_id: str, profile_id: str, tenant_id: str) -> bool:
        with self.uow as uow:
            profile = uow.profiles.get_by_id(profile_id, tenant_id)
            if not profile:
                raise NotFoundError(f"Profile '{profile_id}' not found")
            result = uow.directory.delete(entry_id, profile_id)
            uow.commit()
            return result
