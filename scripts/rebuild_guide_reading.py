#!/usr/bin/env python3
"""Apply the shared guide-reading contract to every public guide page.

The script deliberately preserves each page's head metadata and editorial copy.
It only normalizes breadcrumbs, reading navigation, legacy layout wrappers, and
the consistent continuation panel at the end of each guide.
"""

from __future__ import annotations

import argparse
import html
import re
from dataclasses import dataclass
from pathlib import Path

from rebuild_guide_discovery import GUIDES, TOPICS


DEFAULT_ROOT = Path(__file__).resolve().parents[1]


@dataclass(frozen=True)
class LegacyLayout:
    section_ids: tuple[str, ...]
    toc: tuple[tuple[str, str], ...]


LEGACY_LAYOUTS = {
    "/guides/bio-templates.html": LegacyLayout(
        ("quick-answer", "templates", "what-works", "avoid", "next-step", "disclosure"),
        (("quick-answer", "Quick answer"), ("templates", "Bio templates"), ("what-works", "What works"), ("avoid", "What to avoid"), ("next-step", "Next steps")),
    ),
    "/guides/profile-photo-checklist.html": LegacyLayout(
        ("quick-answer", "photo-set", "avoid", "shooting-tips", "next-step", "disclosure"),
        (("quick-answer", "Quick answer"), ("photo-set", "Photo set"), ("avoid", "What to avoid"), ("shooting-tips", "Shooting tips"), ("next-step", "Next steps")),
    ),
    "/playbooks/first-date-playbook.html": LegacyLayout(
        ("quick-answer", "coffee-walk", "dessert", "casual-drinks", "what-works", "next-step", "disclosure"),
        (("quick-answer", "Quick answer"), ("coffee-walk", "Coffee and a walk"), ("dessert", "Dessert"), ("casual-drinks", "Casual drinks"), ("what-works", "What works"), ("next-step", "Next steps")),
    ),
    "/ebooks/body-language/body-language-clues-that-show-interest.html": LegacyLayout(
        ("quick-answer", "clusters", "weak-signals", "timing", "avoid", "disclosure"),
        (("quick-answer", "Quick answer"), ("clusters", "Interest clusters"), ("weak-signals", "Weak signals"), ("timing", "What to do next"), ("avoid", "What to avoid")),
    ),
    "/ebooks/body-language/reading-body-language-on-dates-and-app-meets.html": LegacyLayout(
        ("quick-answer", "comfort", "hesitation", "pace", "mistakes", "disclosure"),
        (("quick-answer", "Quick answer"), ("comfort", "Comfort signals"), ("hesitation", "Hesitation"), ("pace", "Adjust the pace"), ("mistakes", "Common mistakes")),
    ),
    "/ebooks/body-language/signals-and-subtext-in-dating.html": LegacyLayout(
        ("quick-answer", "what-is", "misread", "read-better", "mixed", "disclosure"),
        (("quick-answer", "Quick answer"), ("what-is", "What subtext is"), ("misread", "Common misreads"), ("read-better", "Read it better"), ("mixed", "Mixed signals")),
    ),
    "/ebooks/body-language/using-body-language-to-look-more-confident.html": LegacyLayout(
        ("quick-answer", "foundations", "habits", "not", "where", "disclosure"),
        (("quick-answer", "Quick answer"), ("foundations", "Foundations"), ("habits", "Confident habits"), ("not", "What confidence is not"), ("where", "Where to start")),
    ),
}


RESET_TOC = (
    ("intent", "Choose your goal"),
    ("photos", "Photos"),
    ("bio", "Bio"),
    ("messaging", "Messaging"),
    ("date", "Make the date"),
    ("chemistry", "Chemistry"),
    ("weekly-system", "Weekly system"),
    ("next-step", "Next step"),
)


def page_path(root: Path, href: str) -> Path:
    return root / href.lstrip("/")


def topic_config(topic: str) -> dict[str, object]:
    return TOPICS[topic]


def breadcrumb(title: str, topic: str) -> str:
    config = topic_config(topic)
    label = html.escape(str(config["label"]))
    href = "/" + str(config["path"]).replace("index.html", "")
    return (
        '<nav class="breadcrumbs" aria-label="Breadcrumb">'
        '<a href="/">Home</a><span>/</span>'
        '<a href="/guides/">Guide Library</a><span>/</span>'
        f'<a href="{href}">{label}</a><span>/</span>'
        f'<span aria-current="page">{html.escape(title)}</span></nav>'
    )


def toc_markup(items: tuple[tuple[str, str], ...], *, extra_class: str = "") -> str:
    links = "".join(f'<a href="#{anchor}">{html.escape(label)}</a>' for anchor, label in items)
    classes = f"toc reader-toc {extra_class}".strip()
    return f'<aside class="{classes}" aria-label="In this guide"><strong>In this guide</strong>{links}</aside>'


def continuation_markup(guide_index: int) -> str:
    guide = GUIDES[guide_index]
    same_topic = [item for item in GUIDES if item.topic == guide.topic]
    current_topic_index = same_topic.index(guide)
    next_guide = same_topic[(current_topic_index + 1) % len(same_topic)]
    config = topic_config(guide.topic)
    topic_label = html.escape(str(config["label"]))
    topic_href = "/" + str(config["path"]).replace("index.html", "")
    return f'''<section class="reader-next" aria-labelledby="reader-next-title">
          <p class="eyebrow page-kicker">Keep moving</p>
          <h2 id="reader-next-title">Choose your next guide</h2>
          <div class="reader-next-grid">
            <a href="{topic_href}"><span>Explore this topic</span><strong>{topic_label}</strong></a>
            <a href="{next_guide.href}"><span>Recommended next</span><strong>{html.escape(next_guide.title)}</strong></a>
            <a href="/guides/"><span>Search all topics</span><strong>Complete Guide Library</strong></a>
          </div>
        </section>'''


def set_section_ids(content: str, ids: tuple[str, ...]) -> str:
    position = 0
    output: list[str] = []
    found = 0
    for match in re.finditer(r"<section\b([^>]*)>", content, flags=re.IGNORECASE):
        output.append(content[position:match.start()])
        attributes = re.sub(r'\s+id="[^"]*"', "", match.group(1), count=1)
        if found >= len(ids):
            raise RuntimeError("More sections found than configured")
        output.append(f'<section id="{ids[found]}"{attributes}>')
        position = match.end()
        found += 1
    output.append(content[position:])
    if found != len(ids):
        raise RuntimeError(f"Expected {len(ids)} sections but found {found}")
    return "".join(output)


def replace_breadcrumb(main: str, title: str, topic: str) -> str:
    replacement = breadcrumb(title, topic)
    updated, count = re.subn(
        r'<(?:nav|p) class="breadcrumbs"[^>]*>.*?</(?:nav|p)>',
        replacement,
        main,
        count=1,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if count != 1:
        raise RuntimeError(f"Could not replace breadcrumb for {title}")
    return updated


def transform_legacy(main: str, guide_index: int, config: LegacyLayout) -> str:
    guide = GUIDES[guide_index]
    main = replace_breadcrumb(main, guide.title, guide.topic)
    main = re.sub(
        r'<main\s+id="main-content"\s+class="guide">\s*<article class="prose">',
        '<main class="article-main legacy-reader" id="main-content"><article class="site-shell" data-guide-reader>',
        main,
        count=1,
    )
    article_start = main.index('<article class="site-shell" data-guide-reader>') + len('<article class="site-shell" data-guide-reader>')
    first_section = main.index("<section", article_start)
    intro = main[article_start:first_section]
    crumbs = re.search(r'<nav class="breadcrumbs".*?</nav>', intro, flags=re.DOTALL)
    if not crumbs:
        raise RuntimeError(f"Breadcrumb missing after conversion for {guide.href}")
    breadcrumb_html = crumbs.group(0)
    intro = intro.replace(breadcrumb_html, "", 1)
    intro = re.sub(r'<nav class="guide toc".*?</nav>', "", intro, count=1, flags=re.DOTALL)
    meta = (
        f'<div class="meta-row"><span>Adults 18+</span><span>{html.escape(guide.format_label)}</span>'
        f'<span>{guide.minutes} min read</span><span>Reviewed August 2026</span></div>'
    )
    header = f'\n        {breadcrumb_html}\n        <header class="article-hero single"><div>{intro.strip()}{meta}</div></header>\n        <div class="article-layout"><div class="article-content">\n        '
    main = main[:article_start] + header + main[first_section:]

    outer_close = main.rfind("</article>")
    if outer_close < 0:
        raise RuntimeError(f"Outer article close missing for {guide.href}")
    content = main[main.index("<section", article_start):outer_close]
    content = set_section_ids(content, config.section_ids)
    main = main[:main.index("<section", article_start)] + content + main[outer_close:]
    outer_close = main.rfind("</article>")
    closing = (
        "\n          </div>"
        + toc_markup(config.toc)
        + "</div>\n        "
        + continuation_markup(guide_index)
        + "\n"
    )
    main = main[:outer_close] + closing + main[outer_close:]
    return main


def transform_reset(main: str, guide_index: int) -> str:
    guide = GUIDES[guide_index]
    main = replace_breadcrumb(main, guide.title, guide.topic)
    main = main.replace('<article class="site-shell">', '<article class="site-shell" data-guide-reader>', 1)
    ids = tuple(anchor for anchor, _ in RESET_TOC)
    grid_start = main.index('<div class="checklist-grid">')
    grid_end = main.index("</div>", grid_start)
    # The checklist grid contains nested divs, so assign only its eight section openings.
    section_cursor = grid_start
    for anchor in ids:
        section_match = re.search(r"<section\b([^>]*)>", main[section_cursor:], flags=re.IGNORECASE)
        if not section_match:
            raise RuntimeError("Checklist section missing")
        start = section_cursor + section_match.start()
        end = section_cursor + section_match.end()
        attrs = re.sub(r'\s+id="[^"]*"', "", section_match.group(1), count=1)
        replacement = f'<section id="{anchor}"{attrs}>'
        main = main[:start] + replacement + main[end:]
        section_cursor = start + len(replacement)
    jump_links = "".join(f'<a href="#{anchor}">{html.escape(label)}</a>' for anchor, label in RESET_TOC)
    jump = f'<nav class="reader-jump-nav no-print" aria-label="In this guide"><strong>In this guide</strong><div>{jump_links}</div></nav>\n\n      '
    progress = '<div class="checklist-progress no-print"'
    main = main.replace(progress, jump + progress, 1)
    outer_close = main.rfind("</article>")
    main = main[:outer_close] + "\n      " + continuation_markup(guide_index) + "\n" + main[outer_close:]
    return main


def transform_modern(main: str, guide_index: int) -> str:
    guide = GUIDES[guide_index]
    main = replace_breadcrumb(main, guide.title, guide.topic)
    main = main.replace('<article class="site-shell">', '<article class="site-shell" data-guide-reader>', 1)
    main = re.sub(r'<aside class="toc(?:\s+([^"<>]+))?"', lambda m: f'<aside class="toc reader-toc{(" " + m.group(1)) if m.group(1) else ""}"', main, count=1)
    main = re.sub(r'(<aside class="toc reader-toc[^>]*>\s*)<strong>[^<]+</strong>', r'\1<strong>In this guide</strong>', main, count=1)
    if "reader-toc" not in main:
        raise RuntimeError(f"Modern guide has no table of contents: {guide.href}")
    outer_close = main.rfind("</article>")
    main = main[:outer_close] + "\n        " + continuation_markup(guide_index) + "\n" + main[outer_close:]
    return main


def transform_main(source: str, guide_index: int) -> str:
    guide = GUIDES[guide_index]
    match = re.search(r"<main\b.*?</main>", source, flags=re.IGNORECASE | re.DOTALL)
    if not match:
        raise RuntimeError(f"Main element missing in {guide.href}")
    main = match.group(0)
    if guide.href in LEGACY_LAYOUTS:
        updated_main = transform_legacy(main, guide_index, LEGACY_LAYOUTS[guide.href])
    elif guide.href == "/guides/dating-app-reset-checklist.html":
        updated_main = transform_reset(main, guide_index)
    else:
        updated_main = transform_modern(main, guide_index)
    return source[:match.start()] + updated_main + source[match.end():]


def validate_rendered(source: str, href: str) -> None:
    required = (
        "data-guide-reader",
        'aria-label="Breadcrumb"',
        "Guide Library",
        "In this guide",
        "reader-next",
        "Complete Guide Library",
    )
    missing = [token for token in required if token not in source]
    if missing:
        raise RuntimeError(f"Reading contract missing from {href}: {', '.join(missing)}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=DEFAULT_ROOT)
    parser.add_argument("--write", action="store_true", help="Write rendered HTML; otherwise validate a dry run")
    args = parser.parse_args()
    changed = 0
    for index, guide in enumerate(GUIDES):
        path = page_path(args.root, guide.href)
        source = path.read_text(encoding="utf-8")
        if "data-guide-reader" in source:
            validate_rendered(source, guide.href)
            continue
        updated = transform_main(source, index)
        validate_rendered(updated, guide.href)
        changed += 1
        if args.write:
            path.write_text(updated, encoding="utf-8", newline="\n")
    action = "Rendered" if args.write else "Dry-run validated"
    print(f"{action} the shared reading system for {changed} guide pages.")


if __name__ == "__main__":
    main()
