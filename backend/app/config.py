"""Application configuration via Pydantic BaseSettings."""

from pydantic_settings import BaseSettings


LOCALHOST_ORIGIN = "http://localhost:"
LOOPBACK_ORIGIN = "http://127.0.0.1:"


class Settings(BaseSettings):
    """All app configuration, read from .env file."""

    app_name: str = "DyeMix"
    app_env: str = "development"
    secret_key: str = "change-me"
    debug: bool = True

    # Adapter selection
    db_backend: str = "inmemory"
    auth_provider: str = "inmemory"
    storage_provider: str = "inmemory"
    color_engine: str = "interpolation"

    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    # CORS
    cors_origins: str = "http://localhost:4200,http://localhost:3000"

    # JWT
    jwt_secret: str = "change-me-jwt-secret"
    jwt_expiry_hours: int = 24

    @property
    def cors_origin_list(self) -> list[str]:
        origins = [o.strip().rstrip("/") for o in self.cors_origins.split(",") if o.strip()]
        expanded: set[str] = set(origins)

        # Keep strict allow-list behavior while supporting localhost/127.0.0.1 dev variants.
        for origin in origins:
            if origin.startswith(LOCALHOST_ORIGIN):
                expanded.add(origin.replace(LOCALHOST_ORIGIN, LOOPBACK_ORIGIN, 1))
            elif origin.startswith(LOOPBACK_ORIGIN):
                expanded.add(origin.replace(LOOPBACK_ORIGIN, LOCALHOST_ORIGIN, 1))

        return sorted(expanded)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
