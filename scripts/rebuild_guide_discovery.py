#!/usr/bin/env python3
"""Render the unified guide hub and topic shelves into static HTML pages."""

from __future__ import annotations

import html
import re
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


@dataclass(frozen=True)
class Guide:
    title: str
    href: str
    topic: str
    topic_label: str
    format: str
    format_label: str
    minutes: int
    description: str
    search: str


GUIDES = [
    Guide("Dating App Reset Checklist", "/guides/dating-app-reset-checklist.html", "profile", "Profiles & Photos", "checklist", "Checklist", 4, "Reset your intent, app mix, photos, bio, messaging, invitations, and weekly habits.", "more matches dating apps reset profile photos bio casual relationship"),
    Guide("Internet Dating Guide for Men", "/ebooks/profile-and-photos/internet-dating-guide-for-men.html", "profile", "Profiles & Photos", "in-depth", "In-Depth Guide", 5, "Build the complete system: choose the right app, improve your profile, message well, and move toward a date.", "more matches profile platform photos bio messaging complete system"),
    Guide("Profile Photo Checklist for Men", "/guides/profile-photo-checklist.html", "profile", "Profiles & Photos", "checklist", "Checklist", 2, "Choose stronger photos before changing apps or paying for more visibility.", "more matches photos pictures first impression profile"),
    Guide("Bio Templates for Men", "/guides/bio-templates.html", "profile", "Profiles & Photos", "quick", "Quick Guide", 2, "Use adaptable bio structures that communicate personality, intent, and an easy conversation hook.", "bio templates profile casual relationship prompts"),
    Guide("Openers That Get Replies", "/guides/openers-that-get-replies.html", "messaging", "Messaging & Texting", "quick", "Quick Guide", 3, "Write specific, playful first messages that feel natural and are easy to answer.", "get replies opener first message match conversation flirting"),
    Guide("Conversation Skills That Build Attraction", "/ebooks/messaging-and-openers/conversation-skills-that-build-attraction.html", "messaging", "Messaging & Texting", "in-depth", "In-Depth Guide", 4, "Build attraction through attention, playful energy, honest flirting, listening, and reciprocal tension.", "conversation attraction flirting sexual tension listening get replies"),
    Guide("Texting That Keeps Momentum", "/guides/texting-that-keeps-momentum.html", "messaging", "Messaging & Texting", "quick", "Quick Guide", 4, "Keep the exchange moving without over-texting, disappearing, or turning it into an interview.", "texting momentum pacing get replies move to date"),
    Guide("DMs and Social Media Openers", "/guides/dms-and-social-media.html", "messaging", "Messaging & Texting", "quick", "Quick Guide", 3, "Start respectful conversations through stories, posts, and social media context.", "dm social media instagram opener reply"),
    Guide("Voice Notes and DM Etiquette", "/guides/voice-notes-and-dm-etiquette.html", "messaging", "Messaging & Texting", "quick", "Quick Guide", 3, "Use voice notes, reactions, and DMs without overwhelming the conversation.", "voice notes dm etiquette read receipts reactions"),
    Guide("Video Calls Before Meeting", "/guides/video-calls-before-meeting.html", "dates", "Getting Dates & Chemistry", "quick", "Quick Guide", 3, "Handle a short pre-date video call naturally and turn good energy into confirmed plans.", "video call verify before meeting get a date"),
    Guide("From Match to Date Without Pressure", "/ebooks/dates-and-escalation/from-match-to-date-without-pressure.html", "dates", "Getting Dates & Chemistry", "in-depth", "In-Depth Guide", 4, "Know when to ask, make a clear invitation, reduce planning friction, and handle vague answers well.", "get a date invitation plans rejection match chemistry"),
    Guide("First Date Playbook", "/playbooks/first-date-playbook.html", "dates", "Getting Dates & Chemistry", "playbook", "Playbook", 2, "Plan the first meeting, build momentum, read the room, and finish the date cleanly.", "first date playbook planning chemistry attraction"),
    Guide("Find Date Ideas Near You", "/guides/date-ideas-near-you/", "dates", "Getting Dates & Chemistry", "tool", "Interactive Guide", 8, "Search current local experiences, then choose a first-date plan by vibe, budget, timing, and mutual comfort.", "date ideas near me city destination first date activities viator local experiences"),
    Guide("Dating Confidence for Shy Men", "/ebooks/mindset-and-confidence/dating-confidence-for-shy-men.html", "confidence", "Confidence & Social Skills", "in-depth", "In-Depth Guide", 10, "Turn nerves into a practical training plan for conversation, flirting, dates, rejection, and physical confidence.", "confidence shy anxiety social skills charisma rejection"),
    Guide("Using Body Language to Look More Confident", "/ebooks/body-language/using-body-language-to-look-more-confident.html", "confidence", "Confidence & Social Skills", "quick", "Quick Guide", 3, "Look more grounded through posture, eye contact, movement, and calmer physical presence.", "confidence body language posture eye contact charisma"),
    Guide("Reading Body Language on Dates and App Meets", "/ebooks/body-language/reading-body-language-on-dates-and-app-meets.html", "body-language", "Body Language", "quick", "Quick Guide", 3, "Notice comfort, hesitation, and reciprocal interest without treating any cue as a guarantee.", "body language date interest comfort hesitation signals consent"),
    Guide("Body Language Clues That Show Interest", "/ebooks/body-language/body-language-clues-that-show-interest.html", "body-language", "Body Language", "quick", "Quick Guide", 3, "Read clusters of possible interest while avoiding projection and overconfidence.", "body language clues attraction interest flirting signals"),
    Guide("Signals and Subtext in Dating", "/ebooks/body-language/signals-and-subtext-in-dating.html", "body-language", "Body Language", "quick", "Quick Guide", 2, "Understand tone, subtext, and mixed signals without drifting into mind reading.", "signals subtext mixed signals tone interest"),
    Guide("Kissing With Confidence", "/ebooks/kissing-and-intimacy/kissing-with-confidence.html", "intimacy", "Kissing & Intimacy", "in-depth", "In-Depth Guide", 4, "Build the moment, ask attractively, approach slowly, kiss responsively, and handle hesitation well.", "kissing intimacy chemistry consent physical confidence sexual confidence"),
    Guide("When to Make the First Move", "/guides/when-to-make-the-first-move.html", "intimacy", "Kissing & Intimacy", "quick", "Quick Guide", 6, "Know when the energy is mutual, express attraction clearly, and handle hesitation or rejection with confidence.", "first move kiss timing attraction escalation consent date chemistry"),
    Guide("How to Pleasure a Woman", "/ebooks/kissing-and-intimacy/how-to-pleasure-a-woman.html", "intimacy", "Kissing & Intimacy", "in-depth", "In-Depth Guide", 12, "Build better intimacy through communication, arousal, responsive technique, safer sex, and aftercare.", "pleasure woman female sexual confidence intimacy clitoris oral sex manual sex penetration orgasm aftercare safer sex"),
]

TOPICS = {
    "profile": {
        "path": "ebooks/profile-and-photos/index.html",
        "label": "Profiles & Photos",
        "eyebrow": "Build a stronger first impression",
        "lede": "Choose the app, photos, and bio that make your real strengths easier to notice before you spend money on visibility.",
        "featured": "/ebooks/profile-and-photos/internet-dating-guide-for-men.html",
        "related": [("Messaging & Texting", "/ebooks/messaging-and-openers/"), ("Compare Dating Apps", "/comparisons/"), ("Dating App Reviews", "/reviews/")],
    },
    "messaging": {
        "path": "ebooks/messaging-and-openers/index.html",
        "label": "Messaging & Texting",
        "eyebrow": "Turn matches into real conversations",
        "lede": "Start cleanly, create playful momentum, flirt honestly, and move toward a date without canned lines or pressure.",
        "featured": "/guides/openers-that-get-replies.html",
        "related": [("Getting Dates & Chemistry", "/ebooks/dates-and-escalation/"), ("Confidence & Social Skills", "/ebooks/mindset-and-confidence/"), ("Profile & Photo Guides", "/ebooks/profile-and-photos/")],
    },
    "dates": {
        "path": "ebooks/dates-and-escalation/index.html",
        "label": "Getting Dates & Chemistry",
        "eyebrow": "Move from match to a real date",
        "lede": "Make the invitation, plan the meeting, build mutual chemistry, and move at a pace both adults actively choose.",
        "featured": "/ebooks/dates-and-escalation/from-match-to-date-without-pressure.html",
        "related": [("Kissing & Intimacy", "/ebooks/kissing-and-intimacy/"), ("Body Language", "/ebooks/body-language/"), ("Messaging & Texting", "/ebooks/messaging-and-openers/")],
    },
    "confidence": {
        "path": "ebooks/mindset-and-confidence/index.html",
        "label": "Confidence & Social Skills",
        "eyebrow": "Build confidence through action",
        "lede": "Become calmer, more socially decisive, and more comfortable expressing attraction without dominance theater or fake bravado.",
        "featured": "/ebooks/mindset-and-confidence/dating-confidence-for-shy-men.html",
        "related": [("Messaging & Texting", "/ebooks/messaging-and-openers/"), ("Getting Dates & Chemistry", "/ebooks/dates-and-escalation/"), ("Body Language", "/ebooks/body-language/")],
    },
    "body-language": {
        "path": "ebooks/body-language/index.html",
        "label": "Body Language",
        "eyebrow": "Read the room more accurately",
        "lede": "Notice comfort, hesitation, attraction, and subtext while remembering that signals provide context—not consent or certainty.",
        "featured": "/ebooks/body-language/reading-body-language-on-dates-and-app-meets.html",
        "related": [("Confidence & Social Skills", "/ebooks/mindset-and-confidence/"), ("Kissing & Intimacy", "/ebooks/kissing-and-intimacy/"), ("Getting Dates & Chemistry", "/ebooks/dates-and-escalation/")],
    },
    "intimacy": {
        "path": "ebooks/kissing-and-intimacy/index.html",
        "label": "Kissing & Intimacy",
        "eyebrow": "Build physical confidence and chemistry",
        "lede": "Create sensual momentum through mutual desire, clear communication, responsive pacing, and respect for changing boundaries.",
        "featured": "/ebooks/kissing-and-intimacy/kissing-with-confidence.html",
        "related": [("Getting Dates & Chemistry", "/ebooks/dates-and-escalation/"), ("Body Language", "/ebooks/body-language/"), ("Confidence & Social Skills", "/ebooks/mindset-and-confidence/")],
    },
}


def guide_item(guide: Guide, *, heading: str = "h3", filterable: bool = False) -> str:
    data = ""
    if filterable:
        search = " ".join((guide.title, guide.topic_label, guide.format_label, guide.description, guide.search)).lower()
        data = (
            f' data-guide-item data-guide-topic="{html.escape(guide.topic)}"'
            f' data-guide-format="{html.escape(guide.format)}"'
            f' data-guide-search="{html.escape(search, quote=True)}"'
        )
    return f'''<li class="guide-list-item"{data}>
              <div class="guide-item-taxonomy"><span class="guide-format">{html.escape(guide.format_label)}</span><span class="guide-topic">{html.escape(guide.topic_label)}</span></div>
              <div class="guide-item-copy"><{heading}><a href="{guide.href}">{html.escape(guide.title)}</a></{heading}><p>{html.escape(guide.description)}</p></div>
              <div class="guide-item-meta"><span>{guide.minutes} min read</span><span>Read guide →</span></div>
            </li>'''


def guide_hub() -> str:
    items = "\n            ".join(guide_item(guide, filterable=True) for guide in GUIDES)
    return f'''<main id="main-content" class="guide-library-main" data-guide-library>
      <section class="guide-library-hero">
        <div class="site-shell"><div class="hero-panel"><p class="eyebrow">Guide Library</p><h1>Find the dating guide that solves what is holding you back.</h1><p class="lede">Every quick guide, checklist, playbook, and in-depth guide now lives in one searchable library. Filter by the result you want, then choose the depth that fits your time.</p><div class="cta-row"><a class="button" href="#browse-guides">Browse all guides</a><a class="button secondary" href="/join.html">Help me choose where to start</a></div></div></div>
      </section>
      <section class="site-shell" id="browse-guides" aria-labelledby="browse-guides-title">
        <div class="section-head"><p class="eyebrow page-kicker">Find your next move</p><h2 id="browse-guides-title">Search by problem, topic, or format</h2><p class="lede">Try “get replies,” “first date,” “confidence,” “kissing,” or any phrase that describes what you need.</p></div>
        <div class="guide-discovery">
          <label class="guide-search-label"><span>What do you need help with?</span><input class="guide-search-input" id="guide-search" type="search" placeholder="Search all dating guides" autocomplete="off" data-guide-search /></label>
          <div class="guide-filter-row"><strong>Topic</strong><div class="guide-filter-buttons" role="group" aria-label="Filter guides by topic">
            <button class="guide-filter-button" type="button" aria-pressed="true" data-guide-filter="topic" data-guide-value="all">All topics</button>
            <button class="guide-filter-button" type="button" aria-pressed="false" data-guide-filter="topic" data-guide-value="profile">Profiles &amp; Photos</button>
            <button class="guide-filter-button" type="button" aria-pressed="false" data-guide-filter="topic" data-guide-value="messaging">Messaging</button>
            <button class="guide-filter-button" type="button" aria-pressed="false" data-guide-filter="topic" data-guide-value="dates">Dates &amp; Chemistry</button>
            <button class="guide-filter-button" type="button" aria-pressed="false" data-guide-filter="topic" data-guide-value="confidence">Confidence</button>
            <button class="guide-filter-button" type="button" aria-pressed="false" data-guide-filter="topic" data-guide-value="body-language">Body Language</button>
            <button class="guide-filter-button" type="button" aria-pressed="false" data-guide-filter="topic" data-guide-value="intimacy">Kissing &amp; Intimacy</button>
          </div></div>
          <div class="guide-filter-row"><strong>Format</strong><div class="guide-filter-buttons" role="group" aria-label="Filter guides by format">
            <button class="guide-filter-button" type="button" aria-pressed="true" data-guide-filter="format" data-guide-value="all">All formats</button>
            <button class="guide-filter-button" type="button" aria-pressed="false" data-guide-filter="format" data-guide-value="quick">Quick Guides</button>
            <button class="guide-filter-button" type="button" aria-pressed="false" data-guide-filter="format" data-guide-value="checklist">Checklists</button>
            <button class="guide-filter-button" type="button" aria-pressed="false" data-guide-filter="format" data-guide-value="playbook">Playbooks</button>
            <button class="guide-filter-button" type="button" aria-pressed="false" data-guide-filter="format" data-guide-value="tool">Interactive Guides</button>
            <button class="guide-filter-button" type="button" aria-pressed="false" data-guide-filter="format" data-guide-value="in-depth">In-Depth Guides</button>
          </div></div>
        </div>
        <div class="guide-results-bar"><p aria-live="polite" data-guide-count>{len(GUIDES)} guides shown</p><button class="guide-clear-button" type="button" data-guide-clear>Clear search and filters</button></div>
        <ul class="guide-catalog-list">
            {items}
        </ul>
        <p class="guide-empty-state" data-guide-empty hidden>No guides match those filters yet. Clear the filters or try a broader search.</p>
      </section>
    </main>'''


def topic_page(topic: str) -> str:
    config = TOPICS[topic]
    topic_guides = [guide for guide in GUIDES if guide.topic == topic]
    featured = next(guide for guide in GUIDES if guide.href == config["featured"])
    more = [guide for guide in topic_guides if guide != featured]
    more_section = ""
    if more:
        items = "\n          ".join(guide_item(guide) for guide in more)
        more_section = f'''<section aria-labelledby="topic-guide-list-title"><div class="topic-section-heading"><p class="eyebrow page-kicker">Keep going</p><h2 id="topic-guide-list-title">More guides in this topic</h2></div><ul class="topic-guide-list">{items}</ul></section>'''
    more_markup = f"\n      {more_section}" if more_section else ""
    related = "".join(f'<a href="{href}">{html.escape(label)}</a>' for label, href in config["related"])
    label = html.escape(config["label"])
    eyebrow = html.escape(config["eyebrow"])
    lede = html.escape(config["lede"])
    return f'''<main id="main-content" class="topic-library-main"><div class="site-shell">
      <header class="topic-library-header"><p class="breadcrumbs"><a href="/">Home</a> / <a href="/guides/">Guide Library</a> / {label}</p><p class="eyebrow">{eyebrow}</p><h1>{label}</h1><p class="lede">{lede}</p></header>
      <section class="topic-start-card" aria-labelledby="topic-start-title"><div><p class="eyebrow page-kicker">Start here · {html.escape(featured.format_label)} · {featured.minutes} min</p><h2 id="topic-start-title">{html.escape(featured.title)}</h2><p>{html.escape(featured.description)}</p></div><a class="button" href="{featured.href}">Read the guide</a></section>{more_markup}
      <aside class="topic-related" aria-labelledby="related-topic-title"><h2 id="related-topic-title">Related topics</h2><p>Use these when the next bottleneck sits just outside this category.</p><div class="cluster-links">{related}<a href="/guides/">Browse the complete Guide Library</a></div></aside>
    </div></main>'''


def in_depth_page() -> str:
    in_depth = [guide for guide in GUIDES if guide.format == "in-depth"]
    items = "\n          ".join(guide_item(guide) for guide in in_depth)
    return f'''<main id="main-content" class="guide-library-main"><section class="guide-library-hero"><div class="site-shell"><div class="hero-panel"><p class="eyebrow">Part of the Guide Library</p><h1>In-depth guides for when you want the full system.</h1><p class="lede">This is not a separate library. It is the long-form collection inside the main Guide Library: deeper explanations, connected chapters, examples, and practical action plans.</p><div class="cta-row"><a class="button" href="/guides/">Browse the complete Guide Library</a><a class="button secondary" href="#in-depth-guides">View in-depth guides</a></div></div></div></section>
      <section class="site-shell" id="in-depth-guides" aria-labelledby="in-depth-title"><div class="section-head"><p class="eyebrow page-kicker">Long-form collection</p><h2 id="in-depth-title">Go deeper on the skill that matters now</h2><p class="lede">Reading times are based on the current web editions. Every guide remains free while the library builds its audience.</p></div><ul class="topic-guide-list">{items}</ul><aside class="topic-related"><h2>Need a faster answer?</h2><p>The complete library also includes quick guides, checklists, and playbooks.</p><div class="cluster-links"><a href="/guides/?format=quick">Quick Guides</a><a href="/guides/?format=checklist">Checklists</a><a href="/guides/?format=playbook">Playbooks</a></div></aside></section>
    </main>'''


def replace_main(relative: str, markup: str) -> None:
    path = ROOT / relative
    source = path.read_text(encoding="utf-8")
    updated, count = re.subn(r"<main\b.*?</main>", markup, source, count=1, flags=re.IGNORECASE | re.DOTALL)
    if count != 1:
        raise RuntimeError(f"Could not replace one main element in {relative}")
    path.write_text(updated, encoding="utf-8", newline="\n")


def main() -> None:
    replace_main("guides/index.html", guide_hub())
    replace_main("ebooks/index.html", in_depth_page())
    for topic, config in TOPICS.items():
        replace_main(config["path"], topic_page(topic))
    print(f"Rendered unified guide discovery into {2 + len(TOPICS)} pages with {len(GUIDES)} public guide entries.")


if __name__ == "__main__":
    main()
