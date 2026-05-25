"""Abstract repository interfaces (ports)."""

from abc import ABC, abstractmethod
from typing import Optional
from app.domain.models.entities import (
    Tenant, User, Profile, BaseDye, Recipe, DirectoryEntry, UploadedImage
)


class AbstractTenantRepository(ABC):
    @abstractmethod
    def create(self, tenant: Tenant) -> Tenant: ...

    @abstractmethod
    def get_by_id(self, tenant_id: str) -> Optional[Tenant]: ...


class AbstractUserRepository(ABC):
    @abstractmethod
    def create(self, user: User) -> User: ...

    @abstractmethod
    def get_by_id(self, user_id: str) -> Optional[User]: ...

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]: ...


class AbstractProfileRepository(ABC):
    @abstractmethod
    def create(self, profile: Profile) -> Profile: ...

    @abstractmethod
    def get_by_id(self, profile_id: str, tenant_id: str) -> Optional[Profile]: ...

    @abstractmethod
    def list_by_user(self, user_id: str, tenant_id: str) -> list[Profile]: ...

    @abstractmethod
    def update(self, profile: Profile) -> Profile: ...

    @abstractmethod
    def delete(self, profile_id: str, tenant_id: str) -> bool: ...


class AbstractBaseDyeRepository(ABC):
    @abstractmethod
    def create(self, dye: BaseDye) -> BaseDye: ...

    @abstractmethod
    def get_by_id(self, dye_id: str, profile_id: str) -> Optional[BaseDye]: ...

    @abstractmethod
    def list_by_profile(self, profile_id: str) -> list[BaseDye]: ...

    @abstractmethod
    def update(self, dye: BaseDye) -> BaseDye: ...

    @abstractmethod
    def delete(self, dye_id: str, profile_id: str) -> bool: ...

    @abstractmethod
    def get_by_ci_number(self, ci_number: str, profile_id: str) -> Optional[BaseDye]: ...


class AbstractRecipeRepository(ABC):
    @abstractmethod
    def create(self, recipe: Recipe) -> Recipe: ...

    @abstractmethod
    def get_by_id(self, recipe_id: str, profile_id: str) -> Optional[Recipe]: ...

    @abstractmethod
    def list_by_profile(
        self, profile_id: str, page: int = 1, per_page: int = 20,
        sort_by: str = "created_at", sort_order: str = "desc",
        search: str = ""
    ) -> tuple[list[Recipe], int]: ...

    @abstractmethod
    def update(self, recipe: Recipe) -> Recipe: ...

    @abstractmethod
    def delete(self, recipe_id: str, profile_id: str) -> bool: ...

    @abstractmethod
    def get_by_name(self, name: str, profile_id: str) -> Optional[Recipe]: ...

    @abstractmethod
    def bulk_create(self, recipes: list[Recipe]) -> list[Recipe]: ...


class AbstractDirectoryRepository(ABC):
    @abstractmethod
    def create(self, entry: DirectoryEntry) -> DirectoryEntry: ...

    @abstractmethod
    def get_by_id(self, entry_id: str, profile_id: str) -> Optional[DirectoryEntry]: ...

    @abstractmethod
    def list_by_profile(self, profile_id: str) -> list[DirectoryEntry]: ...

    @abstractmethod
    def search(self, profile_id: str, query: str = "", category: str = "") -> list[DirectoryEntry]: ...

    @abstractmethod
    def update(self, entry: DirectoryEntry) -> DirectoryEntry: ...

    @abstractmethod
    def delete(self, entry_id: str, profile_id: str) -> bool: ...


class AbstractImageRepository(ABC):
    @abstractmethod
    def create(self, image: UploadedImage) -> UploadedImage: ...

    @abstractmethod
    def list_by_profile(self, profile_id: str) -> list[UploadedImage]: ...

    @abstractmethod
    def delete(self, image_id: str, profile_id: str) -> bool: ...
