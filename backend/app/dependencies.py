"""Dependency injection - factory functions for adapters."""

from functools import lru_cache
from app.config import get_settings
from app.ports.unit_of_work import AbstractUnitOfWork
from app.ports.auth import AbstractAuthProvider
from app.ports.storage import AbstractStorageProvider


def get_unit_of_work() -> AbstractUnitOfWork:
    settings = get_settings()
    if settings.db_backend == "inmemory":
        from app.adapters.inmemory.unit_of_work import InMemoryUnitOfWork
        return InMemoryUnitOfWork()
    raise ValueError(f"Unknown DB_BACKEND: {settings.db_backend}")


def get_auth_provider() -> AbstractAuthProvider:
    settings = get_settings()
    if settings.auth_provider == "inmemory":
        from app.adapters.inmemory.auth import InMemoryAuthProvider
        return InMemoryAuthProvider()
    raise ValueError(f"Unknown AUTH_PROVIDER: {settings.auth_provider}")


def get_storage_provider() -> AbstractStorageProvider:
    settings = get_settings()
    if settings.storage_provider == "inmemory":
        from app.adapters.inmemory.storage import InMemoryStorageProvider
        return InMemoryStorageProvider()
    raise ValueError(f"Unknown STORAGE_PROVIDER: {settings.storage_provider}")
