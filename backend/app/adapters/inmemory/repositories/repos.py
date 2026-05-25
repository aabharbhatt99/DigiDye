"""In-memory repository implementations for demo/testing."""

from typing import Optional
from app.domain.models.entities import (
    Tenant, User, Profile, BaseDye, Recipe, DirectoryEntry, UploadedImage
)
from app.ports.repositories.base import (
    AbstractTenantRepository, AbstractUserRepository, AbstractProfileRepository,
    AbstractBaseDyeRepository, AbstractRecipeRepository, AbstractDirectoryRepository,
    AbstractImageRepository,
)


class InMemoryTenantRepository(AbstractTenantRepository):
    def __init__(self, store: dict):
        self._store = store.setdefault("tenants", {})

    def create(self, tenant: Tenant) -> Tenant:
        self._store[tenant.id] = tenant
        return tenant

    def get_by_id(self, tenant_id: str) -> Optional[Tenant]:
        return self._store.get(tenant_id)


class InMemoryUserRepository(AbstractUserRepository):
    def __init__(self, store: dict):
        self._store = store.setdefault("users", {})

    def create(self, user: User) -> User:
        self._store[user.id] = user
        return user

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self._store.get(user_id)

    def get_by_email(self, email: str) -> Optional[User]:
        for user in self._store.values():
            if user.email == email:
                return user
        return None


class InMemoryProfileRepository(AbstractProfileRepository):
    def __init__(self, store: dict):
        self._store = store.setdefault("profiles", {})

    def create(self, profile: Profile) -> Profile:
        self._store[profile.id] = profile
        return profile

    def get_by_id(self, profile_id: str, tenant_id: str) -> Optional[Profile]:
        p = self._store.get(profile_id)
        if p and p.tenant_id == tenant_id:
            return p
        return None

    def list_by_user(self, user_id: str, tenant_id: str) -> list[Profile]:
        return [p for p in self._store.values()
                if p.user_id == user_id and p.tenant_id == tenant_id]

    def update(self, profile: Profile) -> Profile:
        self._store[profile.id] = profile
        return profile

    def delete(self, profile_id: str, tenant_id: str) -> bool:
        p = self._store.get(profile_id)
        if p and p.tenant_id == tenant_id:
            del self._store[profile_id]
            return True
        return False


class InMemoryBaseDyeRepository(AbstractBaseDyeRepository):
    def __init__(self, store: dict):
        self._store = store.setdefault("base_dyes", {})

    def create(self, dye: BaseDye) -> BaseDye:
        self._store[dye.id] = dye
        return dye

    def get_by_id(self, dye_id: str, profile_id: str) -> Optional[BaseDye]:
        d = self._store.get(dye_id)
        if d and d.profile_id == profile_id:
            return d
        return None

    def list_by_profile(self, profile_id: str) -> list[BaseDye]:
        return [d for d in self._store.values() if d.profile_id == profile_id]

    def update(self, dye: BaseDye) -> BaseDye:
        self._store[dye.id] = dye
        return dye

    def delete(self, dye_id: str, profile_id: str) -> bool:
        d = self._store.get(dye_id)
        if d and d.profile_id == profile_id:
            del self._store[dye_id]
            return True
        return False

    def get_by_ci_number(self, ci_number: str, profile_id: str) -> Optional[BaseDye]:
        for d in self._store.values():
            if d.ci_number == ci_number and d.profile_id == profile_id:
                return d
        return None


class InMemoryRecipeRepository(AbstractRecipeRepository):
    def __init__(self, store: dict):
        self._store = store.setdefault("recipes", {})

    def create(self, recipe: Recipe) -> Recipe:
        self._store[recipe.id] = recipe
        return recipe

    def get_by_id(self, recipe_id: str, profile_id: str) -> Optional[Recipe]:
        r = self._store.get(recipe_id)
        if r and r.profile_id == profile_id:
            return r
        return None

    def list_by_profile(
        self, profile_id: str, page: int = 1, per_page: int = 20,
        sort_by: str = "created_at", sort_order: str = "desc",
        search: str = ""
    ) -> tuple[list[Recipe], int]:
        recipes = [r for r in self._store.values() if r.profile_id == profile_id]

        if search:
            search_lower = search.lower()
            recipes = [r for r in recipes if search_lower in r.name.lower()]

        # Sort
        reverse = sort_order == "desc"
        recipes.sort(key=lambda r: getattr(r, sort_by, r.created_at), reverse=reverse)

        total = len(recipes)
        start = (page - 1) * per_page
        end = start + per_page
        return recipes[start:end], total

    def update(self, recipe: Recipe) -> Recipe:
        self._store[recipe.id] = recipe
        return recipe

    def delete(self, recipe_id: str, profile_id: str) -> bool:
        r = self._store.get(recipe_id)
        if r and r.profile_id == profile_id:
            del self._store[recipe_id]
            return True
        return False

    def get_by_name(self, name: str, profile_id: str) -> Optional[Recipe]:
        for r in self._store.values():
            if r.name == name and r.profile_id == profile_id:
                return r
        return None

    def bulk_create(self, recipes: list[Recipe]) -> list[Recipe]:
        for r in recipes:
            self._store[r.id] = r
        return recipes


class InMemoryDirectoryRepository(AbstractDirectoryRepository):
    def __init__(self, store: dict):
        self._store = store.setdefault("directory", {})

    def create(self, entry: DirectoryEntry) -> DirectoryEntry:
        self._store[entry.id] = entry
        return entry

    def get_by_id(self, entry_id: str, profile_id: str) -> Optional[DirectoryEntry]:
        e = self._store.get(entry_id)
        if e and e.profile_id == profile_id:
            return e
        return None

    def list_by_profile(self, profile_id: str) -> list[DirectoryEntry]:
        return [e for e in self._store.values() if e.profile_id == profile_id]

    def search(self, profile_id: str, query: str = "", category: str = "") -> list[DirectoryEntry]:
        results = [e for e in self._store.values() if e.profile_id == profile_id]
        if query:
            q = query.lower()
            results = [e for e in results if q in e.name.lower()]
        if category:
            results = [e for e in results if e.category == category]
        return results

    def update(self, entry: DirectoryEntry) -> DirectoryEntry:
        self._store[entry.id] = entry
        return entry

    def delete(self, entry_id: str, profile_id: str) -> bool:
        e = self._store.get(entry_id)
        if e and e.profile_id == profile_id:
            del self._store[entry_id]
            return True
        return False


class InMemoryImageRepository(AbstractImageRepository):
    def __init__(self, store: dict):
        self._store = store.setdefault("images", {})

    def create(self, image: UploadedImage) -> UploadedImage:
        self._store[image.id] = image
        return image

    def list_by_profile(self, profile_id: str) -> list[UploadedImage]:
        return [i for i in self._store.values() if i.profile_id == profile_id]

    def delete(self, image_id: str, profile_id: str) -> bool:
        img = self._store.get(image_id)
        if img and img.profile_id == profile_id:
            del self._store[image_id]
            return True
        return False
