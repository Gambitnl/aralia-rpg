"""Minimal game utilities for character creation.

This module previously provided a text-based menu system. The CLI
interface has been removed; only a helper to launch the character
creator remains.
"""

from typing import Any, Optional


def run_character_creator() -> Optional[Any]:
    """Return a new character using ``main_character_creator.create_character``.

    If the creator module cannot be imported, ``None`` is returned.
    """
    try:
        import main_character_creator
    except Exception:
        return None
    return main_character_creator.create_character()


if __name__ == "__main__":  # pragma: no cover - direct execution is unused
    print("This module no longer exposes a CLI interface.")
