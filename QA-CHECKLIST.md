# QA Checklist

- [x] No broken internal links or missing assets
- [x] External links reviewed; all 45 source links added by the seven-review expansion point to current official product, support, privacy, or corporate pages, with no 5xx or unreachable response outside ordinary automated-client 403 protection
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
- [x] Mobile Lighthouse on 20 representative page types: performance 98–100, LCP 1.50–2.40 seconds, CLS 0, accessibility 100, SEO 100
- [x] Required before/after screenshots captured and technically reviewed
- [x] Production deployment is owner-authorized only after all material release checks pass

## Checkpoint gate

`python scripts/qa_site.py` passes across 52 HTML pages and 45 sitemap URLs with zero errors. `scripts/full_site_browser_qa.js` covers all pages at 320, 375, 390, 768, 1024, and 1440 pixels: 312 combinations pass with zero overflow, local-request, menu-state, console, or comparison-table accessibility errors. `scripts/browser_qa.js` captures desktop and mobile evidence for all nine new reviews and passes 78 representative review and hub width combinations. Search Console safeguards, documented image provenance, HTML and JSON-LD validation, the external-link review, Lighthouse targets, and the full axe/WCAG audit pass. Platform-level 404 status is included in immediate live verification after GitHub Pages finishes building.
