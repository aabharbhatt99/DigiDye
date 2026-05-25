"""Domain-specific exceptions."""


class DyeMixError(Exception):
    """Base exception for DyeMix domain."""
    pass


class NotFoundError(DyeMixError):
    """Entity not found."""
    pass


class UnauthorizedError(DyeMixError):
    """Authentication/authorization failure."""
    pass


class ValidationError(DyeMixError):
    """Input validation failure."""
    pass


class DuplicateError(DyeMixError):
    """Duplicate entity detected."""
    pass
