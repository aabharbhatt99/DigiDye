"""Abstract storage provider port."""

from abc import ABC, abstractmethod


class AbstractStorageProvider(ABC):
    @abstractmethod
    def upload_file(self, file_data: bytes, path: str, content_type: str) -> str: ...

    @abstractmethod
    def get_url(self, path: str) -> str: ...

    @abstractmethod
    def delete_file(self, path: str) -> bool: ...
