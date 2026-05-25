"""Abstract Unit of Work port."""

from abc import ABC, abstractmethod
from app.ports.repositories.base import (
    AbstractTenantRepository,
    AbstractUserRepository,
    AbstractProfileRepository,
    AbstractBaseDyeRepository,
    AbstractRecipeRepository,
    AbstractDirectoryRepository,
    AbstractImageRepository,
)


class AbstractUnitOfWork(ABC):
    tenants: AbstractTenantRepository
    users: AbstractUserRepository
    profiles: AbstractProfileRepository
    base_dyes: AbstractBaseDyeRepository
    recipes: AbstractRecipeRepository
    directory: AbstractDirectoryRepository
    images: AbstractImageRepository

    @abstractmethod
    def __enter__(self): ...

    @abstractmethod
    def __exit__(self, exc_type, exc_val, exc_tb): ...

    @abstractmethod
    def commit(self): ...

    @abstractmethod
    def rollback(self): ...
