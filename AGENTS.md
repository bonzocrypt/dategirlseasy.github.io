# Date Girls Easy repository instructions

Date Girls Easy is a fast static publisher for adult men. It is not a dating platform and must not gain a join flow, matchmaking feature, member area, or large runtime framework.

## Permanent safety and release rules

- Preserve every existing public URL unless the owner explicitly approves different treatment after Search Console review.
- Do not merge to `main`, push to production, change GitHub Pages settings, deploy, force-push, or rewrite history without final owner approval.
- The pre-project production checkpoint is `checkpoint/pre-dge-roadmap-2026-08-12` at `19ae1d6`.
- Search Console data belongs only in `private/search-console/`; keep all of `private/` uncommitted.
- Treat pages as search-protected until Search Console exports are available. Avoid broad metadata, heading, or intent changes without a data-backed rationale.
- Keep production plain HTML/CSS/JavaScript. Build helpers are allowed only when they commit fully rendered HTML and add no production runtime.

## Editorial contract

- Serve adults 18+ seeking casual dating, one-night stands, FWB arrangements, sexual confidence, more dates, or long-term relationships.
- Keep the voice direct, masculine, exciting, and aspirational. Attraction, flirting, sexual tension, kissing, physical escalation, intimacy, and casual encounters may be discussed when useful.


## Page and SEO contracts

- Primary navigation: Start Here, Dating Apps, and Guides. The Guides menu exposes one unified Guide Library, an In-Depth Guides view, and topic shelves; do not present Guides and Library as competing destinations.
- Each indexable page needs a unique title and description, one H1, self-referencing canonical, appropriate robots directive, useful internal links, and accurate Open Graph metadata.
- Use Article, CollectionPage, BreadcrumbList, Organization, and WebSite structured data conservatively. Do not invent ratings, testing, credentials, expertise, or personal experience.
- Date and cite time-sensitive claims. Prefer current official product sources for platform features, prices, policies, and safety tools.
- Review pages must state who the app fits and who should avoid it. Comparison pages need a quick verdict. Guide pages must be practical and example-driven.
- Empty library shelves stay `noindex,follow` and out of the sitemap until they provide substantive value.
- Images require useful alt text when informative, empty alt text when decorative, explicit dimensions where applicable, responsive delivery, and approved provenance.
- Affiliate links remain inactive until the owner supplies approved accounts and identifiers. Editorial recommendations must remain independent and correctly disclosed.
- Keep `/assets/consent.js` as the only analytics and affiliate-script gate. New embedded partner scripts must use the `affiliate` category through `window.DGEConsent`; ordinary disclosed links may remain usable without embedded tracking. Run `python scripts/inject_analytics.py` after adding or regenerating HTML so no page bypasses the consent bootstrap.

## UX and quality gates

- Design mobile first with large touch targets, visible keyboard focus, a compact accessible mobile menu, strong readability, and no horizontal overflow.
- Preserve the dark navy DGE identity with restrained purple, teal, and warm accent colors.
- Before handoff, run `python scripts/qa_site.py` and inspect representative pages at 320, 375, 390, 768, 1024, and 1440 pixels.
- Required release checks: no broken internal links or assets; parseable structured data; valid sitemap/indexing policy; no critical automated accessibility violations; no console errors; correct custom 404 behavior; and no material performance regression.
- Keep before/after evidence in `project-evidence/screenshots/`. Do not replace the permanent before set.

## Project workflow

1. Finish the representative design checkpoint only: homepage, Tinder review, Tinder vs Bumble, openers guide, internet dating guide, and mobile navigation.
2. Pause for owner design approval.
3. After approval and Search Console classification, propagate the shared system and improve protected content in priority order.
4. Keep documentation, the SEO manifest, image-request batches, affiliate registry, QA results, and rollback notes current.

Raw archive material stays private research. Only `content/ebooks-live` may be surfaced directly, and only after rights and editorial approval.
