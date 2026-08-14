#!/usr/bin/env python3
"""Dependency-free structural QA for the Date Girls Easy static site."""

from __future__ import annotations

import json
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
    Path("reviews/tinder.html"),
    Path("comparisons/tinder-vs-bumble.html"),
    Path("guides/openers-that-get-replies.html"),
    Path("ebooks/profile-and-photos/internet-dating-guide-for-men.html"),
    Path("ebooks/mindset-and-confidence/dating-confidence-for-shy-men.html"),
}

NOINDEX_SHELVES = {
    Path("ebooks/attraction/index.html"),
}

SITEMAP_REQUIRED = {
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
