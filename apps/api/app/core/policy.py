"""The privacy policy's version.

Kept as a date rather than a number so that a stored value says when someone
agreed to what, without needing a changelog to interpret it.

Bump this whenever the policy changes in a way that affects what is
collected, who sees it, or where it goes. Wording and typo fixes do not
count: re-asking everyone for a comma is how people learn to click through
consent without reading it.

The frontend has the matching constant. They have to agree, and there is a
test that fails if they drift.
"""

PRIVACY_POLICY_VERSION = "2026-08-19"
