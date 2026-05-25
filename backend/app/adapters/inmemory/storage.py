"""In-memory storage provider for demo/testing."""

import base64
from app.ports.storage import AbstractStorageProvider


# In-memory file store
_file_store: dict[str, bytes] = {}


class InMemoryStorageProvider(AbstractStorageProvider):
    def upload_file(self, file_data: bytes, path: str, content_type: str) -> str:
        _file_store[path] = file_data
        return f"/storage/{path}"

    def get_url(self, path: str) -> str:
        return f"/storage/{path}"

    def delete_file(self, path: str) -> bool:
        if path in _file_store:
            del _file_store[path]
            return True
        return False
