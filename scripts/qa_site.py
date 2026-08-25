#!/usr/bin/env python3
"""Dependency-free structural QA for the Date Girls Easy static site."""

from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parents[1]
SITE_ORIGIN = "https://dategirlseasy.com"

REPRESENTATIVE = {
    Path("index.html"),
    Path("comparisons/index.html"),
    Path("reviews/tinder.html"),
    Path("reviews/hinge.html"),
    Path("reviews/bumble.html"),
    Path("reviews/match.html"),
    Path("reviews/eharmony.html"),
    Path("reviews/facebook-dating.html"),
    Path("reviews/feeld.html"),
    Path("reviews/okcupid.html"),
    Path("reviews/coffee-meets-bagel.html"),
    Path("reviews/plenty-of-fish.html"),
    Path("comparisons/tinder-vs-bumble.html"),
    Path("guides/openers-that-get-replies.html"),
    Path("ebooks/profile-and-photos/internet-dating-guide-for-men.html"),
    Path("ebooks/mindset-and-confidence/dating-confidence-for-shy-men.html"),
}

NAV_REVIEW_LINKS = [
    ("/reviews/bumble.html", "Bumble Review"),
    ("/reviews/coffee-meets-bagel.html", "Coffee Meets Bagel Review"),
    ("/reviews/eharmony.html", "eHarmony Review"),
    ("/reviews/facebook-dating.html", "Facebook Dating Review"),
    ("/reviews/feeld.html", "Feeld Review"),
    ("/reviews/hinge.html", "Hinge Review"),
    ("/reviews/match.html", "Match Review"),
    ("/reviews/okcupid.html", "OkCupid Review"),
    ("/reviews/plenty-of-fish.html", "Plenty of Fish Review"),
    ("/reviews/tinder.html", "Tinder Review"),
]

NAV_GUIDE_LINKS = [
    ("/guides/", "Guide Library"),
    ("/ebooks/", "In-Depth Guides"),
    ("/ebooks/profile-and-photos/", "Profiles &amp; Photos"),
    ("/ebooks/messaging-and-openers/", "Messaging &amp; Texting"),
    ("/ebooks/dates-and-escalation/", "Getting Dates &amp; Chemistry"),
    ("/ebooks/mindset-and-confidence/", "Confidence &amp; Social Skills"),
    ("/ebooks/body-language/", "Body Language"),
    ("/ebooks/kissing-and-intimacy/", "Kissing &amp; Intimacy"),
]

GUIDE_READER_PAGES = [
    Path("guides/dating-app-reset-checklist.html"),
    Path("ebooks/profile-and-photos/internet-dating-guide-for-men.html"),
    Path("guides/profile-photo-checklist.html"),
    Path("guides/bio-templates.html"),
    Path("guides/openers-that-get-replies.html"),
    Path("ebooks/messaging-and-openers/conversation-skills-that-build-attraction.html"),
    Path("guides/texting-that-keeps-momentum.html"),
    Path("guides/dms-and-social-media.html"),
    Path("guides/voice-notes-and-dm-etiquette.html"),
    Path("guides/video-calls-before-meeting.html"),
    Path("ebooks/dates-and-escalation/from-match-to-date-without-pressure.html"),
    Path("playbooks/first-date-playbook.html"),
    Path("ebooks/mindset-and-confidence/dating-confidence-for-shy-men.html"),
    Path("ebooks/body-language/using-body-language-to-look-more-confident.html"),
    Path("ebooks/body-language/reading-body-language-on-dates-and-app-meets.html"),
    Path("ebooks/body-language/body-language-clues-that-show-interest.html"),
    Path("ebooks/body-language/signals-and-subtext-in-dating.html"),
    Path("ebooks/kissing-and-intimacy/kissing-with-confidence.html"),
    Path("guides/when-to-make-the-first-move.html"),
    Path("ebooks/kissing-and-intimacy/how-to-pleasure-a-woman.html"),
]

NOINDEX_SHELVES = {
    Path("ebooks/attraction/index.html"),
}

SITEMAP_REQUIRED = {
    "/reviews/hinge.html",
    "/reviews/bumble.html",
    "/reviews/match.html",
    "/reviews/eharmony.html",
    "/reviews/facebook-dating.html",
    "/reviews/feeld.html",
    "/reviews/okcupid.html",
    "/reviews/coffee-meets-bagel.html",
    "/reviews/plenty-of-fish.html",
    "/guides/dating-app-reset-checklist.html",
    "/ebooks/body-language/",
    "/ebooks/body-language/body-language-clues-that-show-interest.html",
    "/ebooks/body-language/reading-body-language-on-dates-and-app-meets.html",
    "/ebooks/body-language/signals-and-subtext-in-dating.html",
    "/ebooks/body-language/using-body-language-to-look-more-confident.html",
    "/ebooks/profile-and-photos/",
    "/ebooks/profile-and-photos/internet-dating-guide-for-men.html",
    "/ebooks/messaging-and-openers/",
    "/ebooks/messaging-and-openers/conversation-skills-that-build-attraction.html",
    "/ebooks/dates-and-escalation/",
    "/ebooks/dates-and-escalation/from-match-to-date-without-pressure.html",
    "/ebooks/kissing-and-intimacy/",
    "/ebooks/kissing-and-intimacy/kissing-with-confidence.html",
    "/guides/when-to-make-the-first-move.html",
    "/ebooks/kissing-and-intimacy/how-to-pleasure-a-woman.html",
    "/ebooks/mindset-and-confidence/",
    "/ebooks/mindset-and-confidence/dating-confidence-for-shy-men.html",
}

SITEMAP_FORBIDDEN = {
    "/ebooks/attraction/",
}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title_parts: list[str] = []
        self.in_title = False
        self.h1_count = 0
        self.ids: set[str] = set()
        self.refs: list[tuple[str, str]] = []
        self.images: list[dict[str, str | None]] = []
        self.metas: list[dict[str, str]] = []
        self.links: list[dict[str, str]] = []
        self.scripts: list[dict[str, str]] = []
        self.json_ld_blocks: list[str] = []
        self.in_json_ld = False
        self.json_ld_parts: list[str] = []
        self.body_classes: set[str] = set()
        self.comparison_table_wraps: list[dict[str, str]] = []

    def handle_starttag(self, tag: str, attrs_raw: list[tuple[str, str | None]]) -> None:
        attrs = dict(attrs_raw)
        if tag == "title":
            self.in_title = True
        if tag == "h1":
            self.h1_count += 1
        if attrs.get("id"):
            self.ids.add(attrs["id"] or "")
        if tag == "body":
            self.body_classes.update((attrs.get("class") or "").split())
        if tag == "div" and "comparison-table-wrap" in (attrs.get("class") or "").split():
            self.comparison_table_wraps.append({k: v or "" for k, v in attrs.items()})
        if tag == "meta":
            self.metas.append({k: v or "" for k, v in attrs.items()})
        if tag == "link":
            clean = {k: v or "" for k, v in attrs.items()}
            self.links.append(clean)
            if attrs.get("href"):
                self.refs.append(("link", attrs["href"] or ""))
        if tag == "a" and attrs.get("href"):
            self.refs.append(("a", attrs["href"] or ""))
        if tag == "script":
            clean = {k: v or "" for k, v in attrs.items()}
            self.scripts.append(clean)
            if attrs.get("src"):
                self.refs.append(("script", attrs["src"] or ""))
            if (attrs.get("type") or "").lower() == "application/ld+json":
                self.in_json_ld = True
                self.json_ld_parts = []
        if tag == "img":
            clean_img = {k: v for k, v in attrs.items()}
            self.images.append(clean_img)
            if attrs.get("src"):
                self.refs.append(("img", attrs["src"] or ""))
        if tag in {"img", "source"} and attrs.get("srcset"):
            for candidate in (attrs["srcset"] or "").split(","):
                reference = candidate.strip().split()[0] if candidate.strip() else ""
                if reference:
                    self.refs.append(("responsive image", reference))

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.in_title = False
        if tag == "script" and self.in_json_ld:
            self.json_ld_blocks.append("".join(self.json_ld_parts).strip())
            self.in_json_ld = False
            self.json_ld_parts = []

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_parts.append(data)
        if self.in_json_ld:
            self.json_ld_parts.append(data)

    @property
    def title(self) -> str:
        return " ".join("".join(self.title_parts).split())

    def meta_content(self, key: str, value: str) -> str:
        for meta in self.metas:
            if meta.get(key, "").lower() == value.lower():
                return meta.get("content", "").strip()
        return ""

    def canonical(self) -> str:
        for link in self.links:
            if "canonical" in link.get("rel", "").lower().split():
                return link.get("href", "").strip()
        return ""


def local_target(page: Path, reference: str) -> Path | None:
    parsed = urlparse(reference)
    if parsed.scheme in {"mailto", "tel", "data", "javascript"}:
        return None
    if parsed.netloc and parsed.netloc not in {"dategirlseasy.com", "www.dategirlseasy.com"}:
        return None
    path = unquote(parsed.path)
    if not path:
        return None
    candidate = ROOT / path.lstrip("/") if path.startswith("/") else page.parent / path
    if path.endswith("/"):
        candidate = candidate / "index.html"
    elif not candidate.suffix and candidate.is_dir():
        candidate = candidate / "index.html"
    return candidate.resolve()


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []
    pages: dict[Path, PageParser] = {}

    for page in sorted(ROOT.rglob("*.html")):
        if any(part.startswith(".") for part in page.relative_to(ROOT).parts):
            continue
        parser = PageParser()
        try:
            parser.feed(page.read_text(encoding="utf-8"))
        except Exception as exc:  # noqa: BLE001 - surface malformed files as QA errors
            errors.append(f"{page.relative_to(ROOT)}: HTML parse failed: {exc}")
            continue
        rel = page.relative_to(ROOT)
        pages[rel] = parser

        if not parser.title:
            errors.append(f"{rel}: missing title")
        if not parser.meta_content("name", "description"):
            errors.append(f"{rel}: missing meta description")
        if parser.h1_count != 1:
            errors.append(f"{rel}: expected one H1, found {parser.h1_count}")
        if rel != Path("404.html") and not parser.canonical():
            errors.append(f"{rel}: missing canonical")

        for block_number, block in enumerate(parser.json_ld_blocks, 1):
            try:
                json.loads(block)
            except json.JSONDecodeError as exc:
                errors.append(f"{rel}: JSON-LD block {block_number} is invalid: {exc.msg}")

        for kind, reference in parser.refs:
            if reference.startswith("#"):
                anchor = unquote(reference[1:])
                if anchor and anchor not in parser.ids:
                    errors.append(f"{rel}: broken same-page anchor #{anchor}")
                continue
            target = local_target(page, reference)
            if target is not None and not target.exists():
                errors.append(f"{rel}: missing local {kind} target {reference}")

        for image in parser.images:
            if image.get("alt") is None:
                errors.append(f"{rel}: image is missing alt attribute ({image.get('src', 'unknown')})")
            if rel in REPRESENTATIVE and (not image.get("width") or not image.get("height")):
                warnings.append(f"{rel}: representative image lacks explicit dimensions ({image.get('src', 'unknown')})")

        if "assets/og/default.jpg" in page.read_text(encoding="utf-8"):
            errors.append(f"{rel}: references nonexistent assets/og/default.jpg")

        raw = page.read_text(encoding="utf-8")
        if re.search(r'href=["\']\s*#["\']', raw, flags=re.IGNORECASE):
            errors.append(f"{rel}: contains a placeholder href")
        if raw.count("data-nav-trigger") != 2:
            errors.append(f"{rel}: expected two shared navigation dropdown triggers")
        for control_id in ("nav-dating-apps", "nav-guides"):
            if f'aria-controls="{control_id}"' not in raw or f'id="{control_id}"' not in raw:
                errors.append(f"{rel}: navigation control contract is incomplete for #{control_id}")
        header_match = re.search(r'<header class="publisher-header".*?</header>', raw, flags=re.DOTALL)
        if not header_match:
            errors.append(f"{rel}: shared publisher header is missing")
        else:
            header = header_match.group(0)
            app_menu_match = re.search(r'<div class="nav-submenu nav-submenu-apps".*?</div>\s*</div>', header, flags=re.DOTALL)
            if not app_menu_match:
                errors.append(f"{rel}: expanded Dating Apps menu is missing")
            else:
                app_menu = app_menu_match.group(0)
                expected_links = [
                    ("/comparisons/", "Compare Dating Apps"),
                    ("/reviews/", "Dating App Reviews"),
                    *NAV_REVIEW_LINKS,
                ]
                actual_hrefs = re.findall(r'<a href="([^"]+)"', app_menu)
                expected_hrefs = [href for href, _label in expected_links]
                if actual_hrefs != expected_hrefs:
                    errors.append(f"{rel}: Dating Apps links are missing, duplicated, or out of order")
                for href, label in expected_links:
                    if f'<a href="{href}"' not in app_menu or label not in app_menu:
                        errors.append(f"{rel}: Dating Apps menu lacks {label} ({href})")
                if "Tinder vs Bumble" in app_menu:
                    errors.append(f"{rel}: contextual Tinder vs Bumble link remains in global navigation")
            guide_start = header.find('<div class="nav-submenu nav-submenu-guides"')
            if guide_start < 0:
                errors.append(f"{rel}: unified Guides menu is missing")
            else:
                guide_menu = header[guide_start:]
                actual_guide_hrefs = re.findall(r'<a href="([^"]+)"', guide_menu)
                expected_guide_hrefs = [href for href, _label in NAV_GUIDE_LINKS]
                if actual_guide_hrefs != expected_guide_hrefs:
                    errors.append(f"{rel}: Guide links are missing, duplicated, or out of order")
                for href, label in NAV_GUIDE_LINKS:
                    if f'<a href="{href}"' not in guide_menu or label not in guide_menu:
                        errors.append(f"{rel}: Guides menu lacks {label} ({href})")
                if "All Dating Guides" in guide_menu:
                    errors.append(f"{rel}: retired All Dating Guides label remains in navigation")
        if "fonts.googleapis.com" in raw or "fonts.gstatic.com" in raw or "Bricolage" in raw:
            errors.append(f"{rel}: external or retired typography dependency remains")
        if re.search(r'<(?:article|div|li)[^>]*class="[^"]*goal-card', raw, flags=re.IGNORECASE):
            errors.append(f"{rel}: goal-card must be the anchor, not a non-link wrapper")

        for region_number, region in enumerate(parser.comparison_table_wraps, 1):
            if region.get("tabindex") != "0":
                errors.append(f"{rel}: comparison table region {region_number} must use tabindex=0")
            label_id = region.get("aria-labelledby", "")
            if not label_id:
                errors.append(f"{rel}: comparison table region {region_number} lacks aria-labelledby")
            elif label_id not in parser.ids:
                errors.append(f"{rel}: comparison table region {region_number} references missing label #{label_id}")

    title_counts = Counter(p.title for p in pages.values() if p.title)
    description_counts = Counter(
        p.meta_content("name", "description") for p in pages.values() if p.meta_content("name", "description")
    )
    for title, count in title_counts.items():
        if count > 1:
            errors.append(f"duplicate title ({count} pages): {title}")
    for description, count in description_counts.items():
        if count > 1:
            errors.append(f"duplicate description ({count} pages): {description}")

    for rel in REPRESENTATIVE:
        parser = pages.get(rel)
        if parser is None:
            errors.append(f"missing representative page: {rel}")
            continue
        if "design-v2" not in parser.body_classes:
            errors.append(f"{rel}: representative page is not using design-v2")
        if not any(s.get("src") == "/assets/site.js" for s in parser.scripts):
            errors.append(f"{rel}: missing shared menu script")
        raw = (ROOT / rel).read_text(encoding="utf-8")
        if "data-menu-toggle" not in raw or "data-primary-nav" not in raw:
            errors.append(f"{rel}: missing accessible mobile-menu contract")

    entry_page_contracts = {
        Path("index.html"): ("Help me choose where to start", 6),
        Path("join.html"): ("What do you want help with?", 6),
    }
    for rel, (required_text, goal_count) in entry_page_contracts.items():
        raw = (ROOT / rel).read_text(encoding="utf-8")
        if required_text not in raw:
            errors.append(f"{rel}: missing required visitor-routing copy")
        if raw.count('class="goal-card"') != goal_count:
            errors.append(f"{rel}: expected {goal_count} whole-link goal cards")

    guide_hub_raw = (ROOT / "guides" / "index.html").read_text(encoding="utf-8")
    for contract in ("data-guide-library", "data-guide-search", "data-guide-filter", "data-guide-count", "data-guide-clear"):
        if contract not in guide_hub_raw:
            errors.append(f"guides/index.html: missing unified library contract {contract}")
    if guide_hub_raw.count("data-guide-item") != 20:
        errors.append("guides/index.html: expected exactly 20 searchable public guide entries")
    if "All Dating Guides" in guide_hub_raw:
        errors.append("guides/index.html: retired split-library wording remains")

    in_depth_raw = (ROOT / "ebooks" / "index.html").read_text(encoding="utf-8")
    if "This is not a separate library" not in in_depth_raw or 'href="/guides/"' not in in_depth_raw:
        errors.append("ebooks/index.html: in-depth collection does not explain its place in the unified library")
    if in_depth_raw.count('class="guide-list-item"') != 6:
        errors.append("ebooks/index.html: expected six current in-depth guide entries")

    topic_shelves = {
        Path("ebooks/profile-and-photos/index.html"): 3,
        Path("ebooks/messaging-and-openers/index.html"): 4,
        Path("ebooks/dates-and-escalation/index.html"): 2,
        Path("ebooks/mindset-and-confidence/index.html"): 1,
        Path("ebooks/body-language/index.html"): 2,
        Path("ebooks/kissing-and-intimacy/index.html"): 2,
    }
    for rel, expected_more in topic_shelves.items():
        raw = (ROOT / rel).read_text(encoding="utf-8")
        if raw.count('class="topic-start-card"') != 1:
            errors.append(f"{rel}: expected one clear Start Here guide")
        if raw.count('class="guide-list-item"') != expected_more:
            errors.append(f"{rel}: expected {expected_more} one-guide-per-item rows")
        if 'class="panel"' in raw:
            errors.append(f"{rel}: retired multi-destination panel layout remains")
        if "Browse the complete Guide Library" not in raw:
            errors.append(f"{rel}: missing path back to the unified Guide Library")

    for rel in GUIDE_READER_PAGES:
        raw = (ROOT / rel).read_text(encoding="utf-8")
        if raw.count("data-guide-reader") != 1:
            errors.append(f"{rel}: expected one shared guide-reader contract")
        if 'aria-label="Breadcrumb"' not in raw or "Guide Library" not in raw:
            errors.append(f"{rel}: missing standardized Guide Library breadcrumb")
        if "In this guide" not in raw or not re.search(r'class="[^"]*(?:reader-toc|reader-jump-nav)', raw):
            errors.append(f"{rel}: missing guide contents navigation")
        if raw.count('class="reader-next-grid"') != 1 or raw.count("Complete Guide Library") != 1:
            errors.append(f"{rel}: missing one shared continuation panel")

    review_hub_raw = (ROOT / "reviews" / "index.html").read_text(encoding="utf-8")
    review_grid_match = re.search(r'<ul class="card-grid review-card-grid">(.*?)</ul>', review_hub_raw, flags=re.DOTALL)
    if not review_grid_match:
        errors.append("reviews/index.html: missing focused review directory")
    else:
        review_hrefs = re.findall(r'<a href="([^"]+)">', review_grid_match.group(1))
        expected_review_hrefs = [href for href, _label in NAV_REVIEW_LINKS]
        if review_hrefs != expected_review_hrefs:
            errors.append("reviews/index.html: review cards must contain all ten apps in alphabetical order")
    for retired_text in ("Read the Tinder review", "Best use of this page", "Best next click"):
        if retired_text in review_hub_raw:
            errors.append(f"reviews/index.html: retired review-hub priority copy remains: {retired_text}")
    if review_hub_raw.count('href="/comparisons/"') < 2 or 'id="review-directory"' not in review_hub_raw:
        errors.append("reviews/index.html: missing comparison-first and browse-all review routes")
    if "Start with intent, age range, and budget" not in review_hub_raw:
        errors.append("reviews/index.html: missing approved directory decision heading")

    comparison_raw = (ROOT / "comparisons" / "index.html").read_text(encoding="utf-8")
    if comparison_raw.count("data-compare-app") != 10:
        errors.append("comparisons/index.html: expected exactly 10 selectable apps")
    if comparison_raw.count("data-compare-row") != 10:
        errors.append("comparisons/index.html: expected exactly 10 overview app rows")
    if comparison_raw.count('class="cost-band"') != 10:
        errors.append("comparisons/index.html: expected exactly 10 relative paid-cost labels")
    for retired_label in ("Casual or FWB fit", "Long-term fit", "pricing varies"):
        if retired_label in comparison_raw:
            errors.append(f"comparisons/index.html: retired comparison wording remains: {retired_label}")
    for current_label in ("Best-matched goals", "Free access", "Paid access", "Relative paid cost"):
        if current_label not in comparison_raw:
            errors.append(f"comparisons/index.html: missing decision-table label: {current_label}")
    for contract in ("data-compare-run", "data-compare-clear", "data-compare-results", 'id="build-comparison"'):
        if contract not in comparison_raw:
            errors.append(f"comparisons/index.html: missing comparison tool contract {contract}")
    for app_id in (
        "bumble", "coffee-meets-bagel", "eharmony", "facebook-dating", "feeld",
        "hinge", "match", "okcupid", "plenty-of-fish", "tinder",
    ):
        if f'data-compare-column="{app_id}"' not in comparison_raw:
            errors.append(f"comparisons/index.html: missing comparison column for {app_id}")
    for href, label in NAV_REVIEW_LINKS:
        if f'href="{href}"' not in comparison_raw or label not in comparison_raw:
            errors.append(f"comparisons/index.html: overview lacks {label}")

    template = pages.get(Path("template-page.html"))
    if not template or "noindex" not in template.meta_content("name", "robots").lower():
        errors.append("template-page.html: must remain noindex,follow")

    for rel in NOINDEX_SHELVES:
        parser = pages.get(rel)
        robots = parser.meta_content("name", "robots").lower() if parser else ""
        if "noindex" not in robots or "follow" not in robots:
            errors.append(f"{rel}: empty shelf must be noindex,follow")

    sitemap_root = ET.parse(ROOT / "sitemap.xml").getroot()
    sitemap_urls = {
        node.text.removeprefix(SITE_ORIGIN)
        for node in sitemap_root.findall("{http://www.sitemaps.org/schemas/sitemap/0.9}url/{http://www.sitemaps.org/schemas/sitemap/0.9}loc")
        if node.text and node.text.startswith(SITE_ORIGIN)
    }
    for url in sorted(SITEMAP_REQUIRED - sitemap_urls):
        errors.append(f"sitemap is missing required URL: {url}")
    for url in sorted(SITEMAP_FORBIDDEN & sitemap_urls):
        errors.append(f"sitemap includes empty noindex shelf: {url}")
    for url in sorted(sitemap_urls):
        target = local_target(ROOT / "index.html", url)
        if target is not None and not target.exists():
            errors.append(f"sitemap URL has no local file: {url}")

    search_console_root = ROOT.parent / "private" / "search-console"
    if not search_console_root.exists():
        warnings.append("Search Console exports are absent; broad protected-page propagation remains gated.")
    elif not any(search_console_root.glob("*.zip")):
        warnings.append("Search Console directory exists but contains no source ZIP export.")

    print(f"Checked {len(pages)} HTML files and {len(sitemap_urls)} sitemap URLs.")
    for warning in warnings:
        print(f"WARNING: {warning}")
    for error in errors:
        print(f"ERROR: {error}")
    if errors:
        print(f"FAIL: {len(errors)} error(s), {len(warnings)} warning(s).")
        return 1
    print(f"PASS: 0 errors, {len(warnings)} warning(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
