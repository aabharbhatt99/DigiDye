"""In-memory auth provider for demo/testing."""

import hashlib
import jwt
from datetime import datetime, timedelta
from typing import Optional

from app.domain.models.entities import Tenant, User, new_id, now
from app.domain.exceptions import UnauthorizedError, ValidationError, DuplicateError
from app.ports.auth import AbstractAuthProvider
from app.adapters.inmemory.unit_of_work import get_global_store
from app.config import get_settings


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


class InMemoryAuthProvider(AbstractAuthProvider):
    def signup(self, email: str, password: str, display_name: str, org_name: str) -> User:
        store = get_global_store()
        users = store.setdefault("users", {})

        # Check duplicate email
        for u in users.values():
            if u.email == email:
                raise DuplicateError(f"User with email '{email}' already exists")

        # Create tenant
        tenant = Tenant(id=new_id(), name=org_name)
        store.setdefault("tenants", {})[tenant.id] = tenant

        # Create user
        user = User(
            id=new_id(),
            tenant_id=tenant.id,
            email=email,
            display_name=display_name,
            password_hash=_hash_password(password),
            role="owner",
            created_at=now(),
        )
        users[user.id] = user
        return user

    def login(self, email: str, password: str) -> dict:
        store = get_global_store()
        users = store.get("users", {})

        user = None
        for u in users.values():
            if u.email == email:
                user = u
                break

        if not user or user.password_hash != _hash_password(password):
            raise UnauthorizedError("Invalid email or password")

        settings = get_settings()
        token = jwt.encode(
            {
                "user_id": user.id,
                "tenant_id": user.tenant_id,
                "email": user.email,
                "role": user.role,
                "exp": datetime.utcnow() + timedelta(hours=settings.jwt_expiry_hours),
            },
            settings.jwt_secret,
            algorithm="HS256",
        )

        return {
            "access_token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "display_name": user.display_name,
                "tenant_id": user.tenant_id,
                "role": user.role,
            }
        }

    def verify_token(self, token: str) -> Optional[dict]:
        settings = get_settings()
        try:
            payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    def get_current_user(self, token: str) -> Optional[User]:
        payload = self.verify_token(token)
        if not payload:
            return None
        store = get_global_store()
        users = store.get("users", {})
        return users.get(payload.get("user_id"))
