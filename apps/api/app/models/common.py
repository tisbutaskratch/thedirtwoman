from __future__ import annotations

import enum


class RequiredLevel(str, enum.Enum):
    """
    How badly a planned item is needed.

    Shared by the packing list and the prep checklist so "required" means the
    same thing, and renders the same colour, wherever it appears.
    """

    required = "required"
    optional = "optional"


class TripRole(str, enum.Enum):
    """
    What someone invited to a trip is allowed to do.

    Deliberately two levels. "Editor" covers everyone who plans the trip:
    the UI calls them collaborators and draws no line between the person who
    created it and anyone else. "Viewer" is the read-only audience: friends
    who want to follow along without being able to change anything.
    """

    editor = "editor"
    viewer = "viewer"
