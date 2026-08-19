"""Length caps for text the user supplies.

Postgres Text has no length of its own, so without a cap here the largest
journal entry the API accepts is whatever fits in a request. That is a cheap
way to fill a 1 GB database or spend an instance's memory, and it is not a
tradeoff worth leaving open for a field that holds a paragraph.

Two sizes, matching the two column types the models use. Numbers are chosen to
be far beyond any honest use so nobody meets them by accident: LONG_TEXT is
roughly ten pages of prose.

Applied to Create and Update schemas only. Read schemas describe what we send
back, where a cap would silently truncate data already stored.
"""

from typing import Annotated

from pydantic import Field

#: Matches String(255) columns: titles, names, references, short labels.
SHORT_TEXT_MAX = 255
#: Matches Text columns: notes, journal bodies, plans.
LONG_TEXT_MAX = 20_000

ShortText = Annotated[str, Field(max_length=SHORT_TEXT_MAX)]
LongText = Annotated[str, Field(max_length=LONG_TEXT_MAX)]

#: Non-empty variants, for fields where a blank string is not a real value.
RequiredShortText = Annotated[str, Field(min_length=1, max_length=SHORT_TEXT_MAX)]
RequiredLongText = Annotated[str, Field(min_length=1, max_length=LONG_TEXT_MAX)]
