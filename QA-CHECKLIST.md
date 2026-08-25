# QA Checklist

- [x] No broken internal links or missing assets
- [x] External links reviewed; all 71 unique external references return HTTP 200 or ordinary automated-client HTTP 403 protection, with no 404, 5xx, DNS, or unreachable failures
- [x] Unique titles and descriptions
- [x] Exactly one H1 per page
- [x] Correct self-referencing canonical and robots policy
- [x] Sitemap matches indexing policy
- [x] JSON-LD parses on all pages that include it and reflects checkpoint content
- [x] No horizontal overflow on representative pages at 320, 375, 390, 768, 1024, and 1440 pixels
- [x] Keyboard, focus, touch, and mobile menu behavior passes at the checkpoint
- [x] Full axe/WCAG audit passes all 52 pages at 390 and 1440 pixels with zero violations
- [x] No console errors on representative pages; all local checkpoint requests use one origin
- [x] Custom branded 404 retains a real HTTP 404 response on GitHub Pages
- [x] Images have dimensions, responsive sources, useful alt text, and owner-confirmed commercial publication rights
- [x] No active affiliate links exist; the registry is globally disabled and commercial pages carry disclosure language
- [x] Mobile Lighthouse on 21 representative page types, including the all-app comparison hub: performance 98–100, LCP 1.50–2.41 seconds, CLS 0, accessibility 100, SEO 100
- [x] Required before/after screenshots captured and technically reviewed
- [x] Production deployment is owner-authorized only after all material release checks pass

## Checkpoint gate

`python scripts/qa_site.py` passes across 52 HTML pages and 45 sitemap URLs with zero errors. `scripts/full_site_browser_qa.js` covers all pages at 320, 375, 390, 768, 1024, and 1440 pixels: 312 combinations pass with zero overflow, local-request, menu-state, console, or comparison-table accessibility errors. `scripts/browser_qa.js` captures desktop and mobile evidence for the review directory, expanded navigation, and comparison tool and passes 84 representative width combinations. The 10-app menu order, two-to-three-app comparison limit, focused columns, bookmarkable query state, clear behavior, Search Console safeguards, HTML and JSON-LD validation, 71-link external review, 21-page Lighthouse targets, and the 104-combination axe/WCAG audit pass. Platform-level 404 status is included in immediate live verification after GitHub Pages finishes building.

## Mobile comparison correction

- [x] Comparison dashboard descendants remain within the viewport at 320, 375, 390, 768, 1024, and 1440 pixels
- [x] Physical-phone regression verifies the mobile overview wrapper has no horizontal scrolling and all ten app cards fit the viewport
- [x] Mobile focused results render as stacked cards for two or three selected apps
- [x] Compare Dating Apps precedes Dating App Reviews in every shared desktop/mobile menu
- [x] All ten overview rows include best-matched goal tags, simplified free access, simplified paid access, and accessible relative cost labels
- [x] Updated comparison screenshots include full mobile page, mobile overview, focused mobile results, and desktop overview
- [x] Targeted mobile Lighthouse: 99 performance, 100 accessibility, 100 SEO, 2.10-second LCP, zero CLS

## Unified Guide Library

- [x] `/guides/` exposes all 18 public guides in one searchable, filterable catalog
- [x] Topic and format filters work independently and together at 390 and 1440 pixels
- [x] Search/filter state is bookmarkable; clearing restores all 18 guides and removes the query string
- [x] `/ebooks/` identifies itself as the in-depth collection inside the main Guide Library
- [x] Six topic shelves use one Start Here guide, one-guide-per-item rows, and separately labeled related topics
- [x] Shared Guides navigation exposes the library, in-depth view, and six topic shelves on desktop and mobile
- [x] All existing guide URLs, titles, descriptions, canonicals, robots directives, and sitemap policy remain intact
- [x] Final HTML validation, 312 full-site responsive combinations, 90 representative combinations, and 104 axe combinations pass with zero violations
- [x] Guide Library Lighthouse: 99 performance, 100 accessibility, 100 SEO, 2.10-second local LCP, zero CLS
- [x] In-Depth Guides Lighthouse: 99 performance, 100 accessibility, 100 SEO, 1.95-second local LCP, zero CLS
- [x] Repeated real-production baseline check: 1.23–1.38-second median LCP and 100 performance/accessibility/SEO on the five locally borderline unchanged pages
