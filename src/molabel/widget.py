from collections.abc import Callable
from enum import StrEnum
from pathlib import Path
from typing import Any, TypeAlias

import anywidget
import traitlets

Shortcuts: TypeAlias = dict[str, "Action"]


def _autocast(func: Callable[[dict], Any]) -> Callable[[dict], str]:
    """
    Helper to automatically convert the output of a render function
    to its string representation, prioritizing rich HTML/Markdown reprs.

    Parameters
    ----------
    func : Callable[[dict], Any]
        The user-provided render function.

    Returns
    -------
    Callable[[dict], str]
        A wrapped function that always returns a string.
    """

    def inner(example: dict) -> str:
        """The wrapped render function."""
        out = func(example)
        if hasattr(out, "_repr_html_"):
            return str(out._repr_html_())
        if hasattr(out, "_repr_markdown_"):
            return str(out._repr_markdown_())
        if hasattr(out, "_display_"):
            return str(out._display_())
        return str(out)

    return inner


class Action(StrEnum):
    """Enumeration for all possible actions that can be mapped to a shortcut."""

    PREV = "prev"
    YES = "yes"
    NO = "no"
    SKIP = "skip"
    FOCUS_NOTES = "focus_notes"
    SPEECH_NOTES = "speech_notes"
    SPEECH_SELECTION = "speech_selection"
    HELP_OVERLAY = "help_overlay"  # Currently not user-configurable


# Default shortcuts with Alt modifier (using event.code format)
_DEFAULT_SHORTCUTS: Shortcuts = {
    "Alt+1": Action.PREV,
    "Alt+2": Action.YES,
    "Alt+3": Action.NO,
    "Alt+4": Action.SKIP,
    "Alt+5": Action.FOCUS_NOTES,
    "Alt+6": Action.SPEECH_NOTES,
    "Alt+7": Action.SPEECH_SELECTION,
}

# Default gamepad shortcuts. The comments map buttons to common controller layouts.
_DEFAULT_GAMEPAD_SHORTCUTS: Shortcuts = {
    "button_0": Action.YES,  # A (Xbox) / X (PlayStation)
    "button_1": Action.NO,  # B (Xbox) / Circle (PlayStation)
    "button_2": Action.SKIP,  # X (Xbox) / Square (PlayStation)
    "button_3": Action.PREV,  # Y (Xbox) / Triangle (PlayStation)
    "button_4": Action.SPEECH_NOTES,  # Left Bumper
    "button_5": Action.SPEECH_SELECTION,  # Right Bumper
    "button_6": Action.FOCUS_NOTES,  # Left Trigger
}


class SimpleLabel(anywidget.AnyWidget):
    """A simple widget for labeling examples with keyboard, gamepad, and speech.

    This widget presents a series of examples one by one, allowing a user to
    assign a label ('yes', 'no', 'skip') and optionally add text notes.
    It is optimized for rapid labeling using various input methods.

    Attributes
    ----------
    annotations : list[dict]
        A list of the annotations collected from the user.
        Each entry is a dictionary containing the index, example, label,
        notes, and timestamp. Can be retrieved with `get_annotations()`.
    """

    _esm = Path(__file__).parent / "static" / "widget.js"
    _css = Path(__file__).parent / "static" / "widget.css"

    examples = traitlets.List([]).tag(sync=True)
    notes = traitlets.Bool(True).tag(sync=True)
    shortcuts = traitlets.Dict({}).tag(sync=True)
    gamepad_shortcuts = traitlets.Dict({}).tag(sync=True)
    current_index = traitlets.Int(0).tag(sync=True)
    annotations = traitlets.List([]).tag(sync=True)

    def __init__(
        self,
        examples: list[dict],
        render: Callable[[dict], Any],
        notes: bool = True,
        shortcuts: Shortcuts | dict[str, str] | None = None,
        gamepad_shortcuts: Shortcuts | dict[str, str] | None = None,
    ):
        """Initializes the SimpleLabel widget.

        Parameters
        ----------
        examples : list[dict]
            A list of examples to label. Each example should be a dictionary.
        render : Callable[[dict], Any]
            A function that takes an example dictionary and returns an object
            that can be rendered to HTML (e.g., a string, a pandas DataFrame).
        notes : bool, optional
            If True, shows a text area for adding notes to each label.
            Defaults to True.
        shortcuts : Shortcuts | dict[str, str] | None, optional
            A dictionary overriding the default keyboard shortcuts.
            Keys are shortcut strings (e.g., "Alt+1"), and values are action
            strings (e.g., "prev") or `Action` enums.
            If None, `_DEFAULT_SHORTCUTS` are used.
        gamepad_shortcuts : Shortcuts | dict[str, str] | None, optional
            A dictionary overriding the default gamepad shortcuts.
            Keys are button names (e.g., "button_0"), and values are action
            strings (e.g., "yes") or `Action` enums.
            If None, `_DEFAULT_GAMEPAD_SHORTCUTS` are used.
        """
        super().__init__()
        render_func = _autocast(render)
        self.examples = [{**ex, "_html": render_func(ex.copy())} for ex in examples]
        self.notes = notes
        self.shortcuts = self._process_shortcuts(
            shortcuts, default_shortcuts=_DEFAULT_SHORTCUTS
        )
        self.gamepad_shortcuts = self._process_shortcuts(
            gamepad_shortcuts, _DEFAULT_GAMEPAD_SHORTCUTS
        )

    @staticmethod
    def _process_shortcuts(
        user_shortcuts: dict | None, default_shortcuts: Shortcuts
    ) -> Shortcuts:
        """
        Validates and parses user-provided shortcuts, falling back to defaults.

        This method ensures that the provided shortcuts are in the correct format
        and raises descriptive errors if they are not.

        Parameters
        ----------
        user_shortcuts : dict | None
            The shortcut dictionary provided by the user.
        default_shortcuts : Shortcuts
            The default dictionary to use as a fallback.

        Returns
        -------
        Shortcuts
            A valid dictionary of shortcuts.

        Raises
        ------
        TypeError
            If `user_shortcuts` is not a dictionary or its keys/values have
            incorrect types.
        ValueError
            If a shortcut value is not a valid action string.
        """
        if user_shortcuts is None:
            return default_shortcuts

        if not isinstance(user_shortcuts, dict):
            raise TypeError("Shortcuts must be provided as a dictionary.")

        processed_shortcuts: Shortcuts = {}
        for key, value in user_shortcuts.items():
            if not isinstance(key, str):
                raise TypeError(f"Shortcut key must be a string, but got {key!r}.")

            if isinstance(value, Action):
                processed_shortcuts[key] = value
            elif isinstance(value, str):
                try:
                    processed_shortcuts[key] = Action(value)
                except ValueError:
                    valid_actions = ", ".join(f"'{a.value}'" for a in Action)
                    raise ValueError(
                        f"Invalid action '{value}' for shortcut '{key}'. "
                        f"Available actions are: {valid_actions}."
                    )
            else:
                raise TypeError(
                    f"Shortcut value for '{key}' must be a string or Action enum, "
                    f"but got {type(value).__name__}."
                )
        return processed_shortcuts

    def get_annotations(self) -> list[dict]:
        """
        Returns the collected annotations.

        Returns
        -------
        list[dict]
            A list of annotation dictionaries, where each dictionary
            corresponds to a labeled example.
        """
        return self.annotations
