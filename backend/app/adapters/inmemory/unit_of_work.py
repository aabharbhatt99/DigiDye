"""In-memory Unit of Work implementation."""

from app.ports.unit_of_work import AbstractUnitOfWork
from app.adapters.inmemory.repositories.repos import (
    InMemoryTenantRepository,
    InMemoryUserRepository,
    InMemoryProfileRepository,
    InMemoryBaseDyeRepository,
    InMemoryRecipeRepository,
    InMemoryDirectoryRepository,
    InMemoryImageRepository,
)

# Global in-memory store (persists for app lifetime)
_global_store: dict = {}


def get_global_store() -> dict:
    return _global_store


def reset_global_store():
    global _global_store
    _global_store.clear()


class InMemoryUnitOfWork(AbstractUnitOfWork):
    def __init__(self, store: dict | None = None):
        self._store = store if store is not None else _global_store

    def __enter__(self):
        self.tenants = InMemoryTenantRepository(self._store)
        self.users = InMemoryUserRepository(self._store)
        self.profiles = InMemoryProfileRepository(self._store)
        self.base_dyes = InMemoryBaseDyeRepository(self._store)
        self.recipes = InMemoryRecipeRepository(self._store)
        self.directory = InMemoryDirectoryRepository(self._store)
        self.images = InMemoryImageRepository(self._store)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass  # In-memory: no cleanup needed

    def commit(self):
        pass  # In-memory: data is already persisted in the dict

    def rollback(self):
        pass  # In-memory: no transaction support
