#!/usr/bin/env python3
"""Render shared static chrome and metadata into legacy Date Girls Easy pages."""

from __future__ import annotations

import html
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def current_section(relative: Path) -> str | None:
    parts = relative.as_posix().split("/")
    if parts[0] == "reviews":
        return "reviews"
    if parts[0] == "comparisons":
        return "comparisons"
    if parts[0] in {"guides", "playbooks"}:
        return "guides"
    if parts[0] == "ebooks":
        return "ebooks"
    if relative.name in {"join.html", "how-it-works.html"}:
        return "start"
    return None


def header_markup(active: str | None) -> str:
    def nav_link(key: str, href: str, label: str) -> str:
        current = ' aria-current="page"' if key == active else ""
        return f'<a href="{href}"{current}>{label}</a>'

    return f'''<header class="publisher-header">
      <div class="site-shell header-bar">
        <a class="publisher-brand" href="/" aria-label="Date Girls Easy home"><span class="brand-seal" aria-hidden="true">DGE</span><span class="brand-words"><strong>Date Girls Easy</strong><small>Adult dating intelligence for men</small></span></a>
        <button class="menu-toggle" type="button" aria-controls="primary-nav" aria-expanded="false" data-menu-toggle><span class="menu-icon" aria-hidden="true"></span>Menu</button>
        <nav class="primary-nav" id="primary-nav" aria-label="Primary" data-primary-nav data-open="false">{nav_link("start", "/join.html", "Start Here")}{nav_link("reviews", "/reviews/", "Reviews")}{nav_link("comparisons", "/comparisons/", "Comparisons")}{nav_link("guides", "/guides/", "Guides")}{nav_link("ebooks", "/ebooks/", "Library")}</nav>
      </div>
    </header>'''


FOOTER = '''<footer class="publisher-footer"><div class="site-shell footer-grid-v2"><div><a class="publisher-brand" href="/"><span class="brand-seal" aria-hidden="true">DGE</span><span class="brand-words"><strong>Date Girls Easy</strong><small>Adult dating intelligence for men</small></span></a><p class="footer-copy">Direct advice for adult men, grounded in honesty, consent, respect, and independent editorial judgment.</p><p class="footer-meta-v2">&copy; <span data-current-year></span> DGE Inc.</p></div><nav class="footer-nav-v2" aria-label="Footer"><a href="/reviews/">Reviews</a><a href="/comparisons/">Comparisons</a><a href="/guides/">Guides</a><a href="/ebooks/">Library</a><a href="/about.html">About</a><a href="/disclosure.html">Disclosure</a><a href="/contact.html">Contact</a><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a></nav></div></footer>'''


def first_match(pattern: str, source: str) -> str:
    match = re.search(pattern, source, flags=re.IGNORECASE | re.DOTALL)
    return html.unescape(match.group(1).strip()) if match else ""


def metadata_markup(source: str, relative: Path) -> str:
    title = first_match(r"<title>(.*?)</title>", source)
    description = first_match(r'<meta\s+name="description"\s+content="(.*?)"\s*/?>', source)
    canonical = first_match(r'<link\s+rel="canonical"\s+href="(.*?)"\s*/?>', source)
    if not title or not description or not canonical:
        raise ValueError(f"Cannot derive metadata for {relative}")
    page_type = "website" if relative.name == "index.html" or relative.parent == Path(".") else "article"
    return f'''    <meta property="og:site_name" content="Date Girls Easy" />
    <meta property="og:title" content="{html.escape(title, quote=True)}" />
    <meta property="og:description" content="{html.escape(description, quote=True)}" />
    <meta property="og:type" content="{page_type}" />
    <meta property="og:url" content="{html.escape(canonical, quote=True)}" />
    <meta property="og:image" content="https://dategirlseasy.com/assets/og/default.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{html.escape(title, quote=True)}" />
    <meta name="twitter:description" content="{html.escape(description, quote=True)}" />
    <meta name="twitter:image" content="https://dategirlseasy.com/assets/og/default.png" />
'''


def schema_markup(source: str, relative: Path) -> str:
    title = first_match(r"<title>(.*?)</title>", source)
    description = first_match(r'<meta\s+name="description"\s+content="(.*?)"\s*/?>', source)
    canonical = first_match(r'<link\s+rel="canonical"\s+href="(.*?)"\s*/?>', source)
    schema_type = "CollectionPage" if relative.name == "index.html" else "WebPage"
    data = {
        "@context": "https://schema.org",
        "@type": schema_type,
        "name": title.removesuffix(" | Date Girls Easy"),
        "description": description,
        "url": canonical,
        "isPartOf": {
            "@type": "WebSite",
            "name": "Date Girls Easy",
            "url": "https://dategirlseasy.com/",
        },
        "publisher": {"@type": "Organization", "name": "DGE Inc."},
    }
    return f'    <script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script>\n'


def transform(page: Path) -> bool:
    source = page.read_text(encoding="utf-8")
    if "/design-v2.css" in source:
        return False

    relative = page.relative_to(ROOT)
    updated = source
    updated = re.sub(r'<html lang="en">', '<html lang="en" class="no-js">', updated, count=1)
    updated = re.sub(r'<body([^>]*)>', r'<body\1 class="legacy-layout">' if "class=" not in first_match(r"(<body[^>]*>)", updated) else r'<body\1>', updated, count=1)
    if 'class="legacy-layout"' not in updated:
        updated = re.sub(r'<body class="([^"]*)">', r'<body class="\1 legacy-layout">', updated, count=1)

    if 'property="og:title"' not in updated:
        updated = updated.replace('    <link rel="stylesheet" href="/styles.css" />', metadata_markup(updated, relative) + '    <link rel="stylesheet" href="/styles.css" />', 1)
    if 'type="application/ld+json"' not in updated:
        updated = updated.replace("  </head>", schema_markup(updated, relative) + "  </head>", 1)

    updated = updated.replace('    <link rel="stylesheet" href="/styles.css" />', '    <link rel="stylesheet" href="/styles.css" />\n    <link rel="stylesheet" href="/design-v2.css" />\n    <script>document.documentElement.className = "js";</script>', 1)
    updated = re.sub(r'<header class="site-header">.*?</header>', header_markup(current_section(relative)), updated, count=1, flags=re.DOTALL)
    updated = re.sub(r'<footer class="site-footer">.*?</footer>', FOOTER, updated, count=1, flags=re.DOTALL)
    updated = re.sub(r'\s*<script>\s*document\.getElementById\(["\']yr["\']\)\.textContent\s*=\s*new Date\(\)\.getFullYear\(\);\s*</script>', "", updated, flags=re.DOTALL)

    if "skip-link" not in updated:
        updated = re.sub(r'(<body[^>]*>)', r'\1\n    <a class="skip-link" href="#main-content">Skip to content</a>', updated, count=1)
    if 'id="main-content"' not in updated:
        updated = re.sub(r'<main(\s|>)', r'<main id="main-content"\1', updated, count=1)
    if "/assets/site.js" not in updated:
        updated = updated.replace("  </body>", '    <script src="/assets/site.js" defer></script>\n  </body>', 1)

    if updated == source:
        return False
    page.write_text(updated, encoding="utf-8", newline="\n")
    return True


def main() -> None:
    changed: list[str] = []
    for page in sorted(ROOT.rglob("*.html")):
        if any(part.startswith(".") for part in page.relative_to(ROOT).parts):
            continue
        if transform(page):
            changed.append(page.relative_to(ROOT).as_posix())
    print(f"Rendered shared system into {len(changed)} pages.")
    for item in changed:
        print(item)


if __name__ == "__main__":
    main()
