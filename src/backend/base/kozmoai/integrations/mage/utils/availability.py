"""Check availability of Mage AI dependencies."""

from functools import lru_cache, wraps


@lru_cache(maxsize=1)
def check_mage_available() -> bool:
    """Check if Mage AI integration dependencies are available."""
    try:
        import pandas  # noqa: F401
        return True
    except ImportError:
        return False


def require_mage():
    """Decorator to require Mage AI dependencies."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not check_mage_available():
                raise ImportError(
                    "Mage AI integration requires additional dependencies. "
                    "Install with: pip install kozmoai-base[data-integration]"
                )
            return func(*args, **kwargs)
        return wrapper
    return decorator
