"""Abstract auth provider port."""

from abc import ABC, abstractmethod
from typing import Optional
from app.domain.models.entities import User


class AbstractAuthProvider(ABC):
    @abstractmethod
    def signup(self, email: str, password: str, display_name: str, org_name: str) -> User: ...

    @abstractmethod
    def login(self, email: str, password: str) -> dict: ...

    @abstractmethod
    def verify_token(self, token: str) -> Optional[dict]: ...

    @abstractmethod
    def get_current_user(self, token: str) -> Optional[User]: ...
