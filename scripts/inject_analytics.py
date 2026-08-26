#!/usr/bin/env python3
"""Install DGE's consent bootstrap and remove trackers that bypass it."""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONSENT_SNIPPET = '    <script src="/assets/consent.js"></script>\n'


def remove_tracking_markup(source: str) -> str:
    updated = source

    # Normal multiline GTM and Google tag blocks.
    updated = re.sub(
        r'\s*<!-- Google Tag Manager -->.*?<!-- End Google Tag Manager -->\s*',
        "\n",
        updated,
        flags=re.IGNORECASE | re.DOTALL,
    )
    updated = re.sub(
        r'\s*<!-- Google tag \(gtag\.js\) -->.*?(?=(?:\s*<meta|\s*<link|\s*<title|\s*<script[^>]+(?:type|id)=))',
        "\n",
        updated,
        flags=re.IGNORECASE | re.DOTALL,
    )

    # Compact pages have the same trackers without comments.
    updated = re.sub(
        r'\s*<script[^>]*>[^<]*(?:googletagmanager\.com/gtm\.js|GTM-KLM9MDV3)[^<]*</script>\s*',
        "\n",
        updated,
        flags=re.IGNORECASE,
    )
    updated = re.sub(
        r'\s*<script[^>]+src=["\']https://www\.googletagmanager\.com/gtag/js\?id=[^"\']+["\'][^>]*></script>\s*',
        "\n",
        updated,
        flags=re.IGNORECASE,
    )
    updated = re.sub(
        r'\s*<script[^>]*>[^<]*gtag\(["\']config["\'],\s*["\']G-[A-Z0-9]+["\'][^<]*</script>\s*',
        "\n",
        updated,
        flags=re.IGNORECASE,
    )

    # A no-JavaScript iframe cannot receive a consent choice and must not load.
    updated = re.sub(
        r'\s*<!-- Google Tag Manager \(noscript\) -->.*?<!-- End Google Tag Manager \(noscript\) -->\s*',
        "\n",
        updated,
        flags=re.IGNORECASE | re.DOTALL,
    )
    updated = re.sub(
        r'\s*<noscript>\s*<iframe[^>]+googletagmanager\.com/ns\.html[^>]*>\s*</iframe>\s*</noscript>\s*',
        "\n",
        updated,
        flags=re.IGNORECASE | re.DOTALL,
    )

    # Re-running this script is idempotent.
    updated = re.sub(
        r'\s*<script[^>]+src=["\']/assets/consent\.js["\'][^>]*></script>\s*',
        "\n",
        updated,
        flags=re.IGNORECASE,
    )
    return updated


def transform(page: Path) -> bool:
    source = page.read_text(encoding="utf-8")
    updated = remove_tracking_markup(source)
    if "<head>" not in updated:
        raise ValueError(f"No <head> tag found in {page.relative_to(ROOT)}")
    updated = updated.replace("<head>", "<head>\n" + CONSENT_SNIPPET, 1)
    if updated == source:
        return False
    page.write_text(updated, encoding="utf-8", newline="\n")
    return True


def main() -> None:
    changed: list[str] = []
    for page in sorted(ROOT.rglob("*.html")):
        relative = page.relative_to(ROOT)
        if any(part.startswith(".") for part in relative.parts):
            continue
        if transform(page):
            changed.append(relative.as_posix())
    print(f"Installed consent-aware analytics bootstrap in {len(changed)} pages.")
    for item in changed:
        print(item)


if __name__ == "__main__":
    main()
