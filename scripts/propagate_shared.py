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
    if parts[0] in {"reviews", "comparisons"}:
        return "apps"
    if parts[0] in {"guides", "playbooks", "ebooks"}:
        return "guides"
    if relative.name in {"join.html", "how-it-works.html"}:
        return "start"
    return None


def header_markup(relative: Path) -> str:
    active = current_section(relative)
    current_path = relative.as_posix()
    if current_path == "index.html":
        current_path = ""

    exact_paths = {
        "/join.html": "join.html",
        "/reviews/": "reviews/index.html",
        "/comparisons/": "comparisons/index.html",
        "/reviews/bumble.html": "reviews/bumble.html",
        "/reviews/coffee-meets-bagel.html": "reviews/coffee-meets-bagel.html",
        "/reviews/eharmony.html": "reviews/eharmony.html",
        "/reviews/facebook-dating.html": "reviews/facebook-dating.html",
        "/reviews/feeld.html": "reviews/feeld.html",
        "/reviews/hinge.html": "reviews/hinge.html",
        "/reviews/match.html": "reviews/match.html",
        "/reviews/okcupid.html": "reviews/okcupid.html",
        "/reviews/plenty-of-fish.html": "reviews/plenty-of-fish.html",
        "/reviews/tawkify.html": "reviews/tawkify.html",
        "/reviews/tinder.html": "reviews/tinder.html",
        "/guides/": "guides/index.html",
        "/ebooks/": "ebooks/index.html",
        "/ebooks/profile-and-photos/": "ebooks/profile-and-photos/index.html",
        "/ebooks/messaging-and-openers/": "ebooks/messaging-and-openers/index.html",
        "/ebooks/dates-and-escalation/": "ebooks/dates-and-escalation/index.html",
        "/ebooks/mindset-and-confidence/": "ebooks/mindset-and-confidence/index.html",
        "/ebooks/body-language/": "ebooks/body-language/index.html",
        "/ebooks/kissing-and-intimacy/": "ebooks/kissing-and-intimacy/index.html",
    }

    def current_for(href: str) -> str:
        return ' aria-current="page"' if exact_paths.get(href) == current_path else ""

    start_current = ' aria-current="page"' if active == "start" else ""
    apps_active = " is-active" if active == "apps" else ""
    guides_active = " is-active" if active == "guides" else ""
    return f'''<header class="publisher-header">
      <div class="site-shell header-bar">
        <a class="publisher-brand" href="/" aria-label="Date Girls Easy home"><span class="brand-seal" aria-hidden="true">DGE</span><span class="brand-words"><strong>Date Girls Easy</strong><small>Adult dating intelligence for men</small></span></a>
        <button class="menu-toggle" type="button" aria-controls="primary-nav" aria-expanded="false" data-menu-toggle><span class="menu-icon" aria-hidden="true"></span>Menu</button>
        <nav class="primary-nav" id="primary-nav" aria-label="Primary" data-primary-nav data-open="false">
          <a class="nav-direct" href="/join.html"{start_current}>Start Here</a>
          <div class="nav-group" data-nav-group>
            <button class="nav-trigger{apps_active}" type="button" aria-expanded="false" aria-controls="nav-dating-apps" data-nav-trigger>Dating Apps<span class="nav-chevron" aria-hidden="true"></span></button>
            <div class="nav-submenu nav-submenu-apps" id="nav-dating-apps" data-nav-submenu data-open="false">
              <div class="nav-menu-primary">
                <span class="nav-submenu-label">Start here</span>
                <div class="nav-menu-paths">
                  <a class="nav-menu-path nav-menu-path-primary" href="/comparisons/"{current_for("/comparisons/")}><strong>Compare Dating Apps</strong><span>Narrow two or three options side by side</span></a>
                  <a class="nav-menu-path" href="/reviews/"{current_for("/reviews/")}><strong>Browse All Reviews</strong><span>Research each platform in depth</span></a>
                </div>
                <div class="nav-menu-beyond">
                  <span class="nav-submenu-label">Beyond apps</span>
                  <a class="nav-menu-path nav-menu-matchmaking" href="/reviews/tawkify.html"{current_for("/reviews/tawkify.html")}><strong>Consider Matchmaking</strong><span>Explore a more personalized alternative</span></a>
                </div>
              </div>
              <div class="nav-submenu-section nav-menu-directory">
                <span class="nav-submenu-label">Individual app reviews</span>
                <div class="nav-app-links">
                  <a href="/reviews/bumble.html"{current_for("/reviews/bumble.html")}>Bumble</a>
                  <a href="/reviews/coffee-meets-bagel.html"{current_for("/reviews/coffee-meets-bagel.html")}>Coffee Meets Bagel</a>
                  <a href="/reviews/eharmony.html"{current_for("/reviews/eharmony.html")}>eHarmony</a>
                  <a href="/reviews/facebook-dating.html"{current_for("/reviews/facebook-dating.html")}>Facebook Dating</a>
                  <a href="/reviews/feeld.html"{current_for("/reviews/feeld.html")}>Feeld</a>
                  <a href="/reviews/hinge.html"{current_for("/reviews/hinge.html")}>Hinge</a>
                  <a href="/reviews/match.html"{current_for("/reviews/match.html")}>Match</a>
                  <a href="/reviews/okcupid.html"{current_for("/reviews/okcupid.html")}>OkCupid</a>
                  <a href="/reviews/plenty-of-fish.html"{current_for("/reviews/plenty-of-fish.html")}>Plenty of Fish</a>
                  <a href="/reviews/tinder.html"{current_for("/reviews/tinder.html")}>Tinder</a>
                </div>
              </div>
            </div>
          </div>
          <div class="nav-group" data-nav-group>
            <button class="nav-trigger{guides_active}" type="button" aria-expanded="false" aria-controls="nav-guides" data-nav-trigger>Guides<span class="nav-chevron" aria-hidden="true"></span></button>
            <div class="nav-submenu nav-submenu-guides" id="nav-guides" data-nav-submenu data-open="false">
              <div class="nav-menu-primary">
                <span class="nav-submenu-label">Start here</span>
                <div class="nav-menu-paths">
                  <a class="nav-menu-path nav-menu-path-primary" href="/guides/"{current_for("/guides/")}><strong>Guide Library</strong><span>Find advice by goal, topic, or format</span></a>
                  <a class="nav-menu-path" href="/ebooks/"{current_for("/ebooks/")}><strong>In-Depth Guides</strong><span>Read longer, chapter-based guides</span></a>
                </div>
              </div>
              <div class="nav-submenu-section nav-menu-directory">
                <span class="nav-submenu-label">Browse by goal</span>
                <div class="nav-guide-links">
                  <a href="/ebooks/profile-and-photos/"{current_for("/ebooks/profile-and-photos/")}>Build a Better Profile</a>
                  <a href="/ebooks/messaging-and-openers/"{current_for("/ebooks/messaging-and-openers/")}>Start Better Conversations</a>
                  <a href="/ebooks/dates-and-escalation/"{current_for("/ebooks/dates-and-escalation/")}>Get More Dates</a>
                  <a href="/ebooks/mindset-and-confidence/"{current_for("/ebooks/mindset-and-confidence/")}>Build Confidence</a>
                  <a href="/ebooks/body-language/"{current_for("/ebooks/body-language/")}>Read Interest &amp; Body Language</a>
                  <a href="/ebooks/kissing-and-intimacy/"{current_for("/ebooks/kissing-and-intimacy/")}>Kissing &amp; Intimacy</a>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>'''


FOOTER = '''<footer class="publisher-footer"><div class="site-shell footer-grid-v2"><div><a class="publisher-brand" href="/"><span class="brand-seal" aria-hidden="true">DGE</span><span class="brand-words"><strong>Date Girls Easy</strong><small>Adult dating intelligence for men</small></span></a><p class="footer-copy">Direct advice for adult men, grounded in honesty, consent, respect, and independent editorial judgment.</p><p class="footer-meta-v2">&copy; 2026 Date Girls Easy. A Vaulted Holdings LLC publication.</p></div><nav class="footer-nav-v2" aria-label="Footer"><a href="/join.html">Start Here</a><a href="/reviews/">Dating App Reviews</a><a href="/comparisons/">Comparisons</a><a href="/guides/">Guide Library</a><a href="/ebooks/">In-Depth Guides</a><a href="/about.html">About</a><a href="/disclosure.html">Disclosure</a><a href="/contact.html">Contact</a><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a></nav></div></footer>'''


def remove_external_fonts(source: str) -> str:
    updated = re.sub(
        r'\s*<link\b(?=[^>]*href="https://fonts\.(?:googleapis|gstatic)\.com)[^>]*>\s*',
        "\n",
        source,
        flags=re.IGNORECASE | re.DOTALL,
    )
    updated = re.sub(
        r'(<iframe\s+)(?=src="https://www\.googletagmanager\.com/ns\.html)(?![^>]*\btitle=)',
        r'\1title="Google Tag Manager" ',
        updated,
        flags=re.IGNORECASE,
    )
    return re.sub(r'\s*<noscript>\s*</noscript>\s*', "\n", updated, flags=re.IGNORECASE)


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
        "publisher": {"@type": "Organization", "name": "Vaulted Holdings LLC"},
    }
    return f'    <script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script>\n'


def transform(page: Path) -> bool:
    source = page.read_text(encoding="utf-8")
    relative = page.relative_to(ROOT)
    updated = remove_external_fonts(source)
    updated = re.sub(
        r'<header class="publisher-header">.*?</header>',
        header_markup(relative),
        updated,
        count=1,
        flags=re.DOTALL,
    )
    updated = re.sub(
        r'<footer class="publisher-footer">.*?</footer>',
        FOOTER,
        updated,
        count=1,
        flags=re.DOTALL,
    )

    if "/design-v2.css" in source:
        if updated == source:
            return False
        page.write_text(updated, encoding="utf-8", newline="\n")
        return True

    source = updated
    updated = re.sub(r'<html lang="en">', '<html lang="en" class="no-js">', updated, count=1)
    updated = re.sub(r'<body([^>]*)>', r'<body\1 class="legacy-layout">' if "class=" not in first_match(r"(<body[^>]*>)", updated) else r'<body\1>', updated, count=1)
    if 'class="legacy-layout"' not in updated:
        updated = re.sub(r'<body class="([^"]*)">', r'<body class="\1 legacy-layout">', updated, count=1)

    if 'property="og:title"' not in updated:
        updated = updated.replace('    <link rel="stylesheet" href="/styles.css" />', metadata_markup(updated, relative) + '    <link rel="stylesheet" href="/styles.css" />', 1)
    if 'type="application/ld+json"' not in updated:
        updated = updated.replace("  </head>", schema_markup(updated, relative) + "  </head>", 1)

    updated = updated.replace('    <link rel="stylesheet" href="/styles.css" />', '    <link rel="stylesheet" href="/styles.css" />\n    <link rel="stylesheet" href="/design-v2.css" />\n    <script>document.documentElement.className = "js";</script>', 1)
    updated = re.sub(r'<header class="site-header">.*?</header>', header_markup(relative), updated, count=1, flags=re.DOTALL)
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
