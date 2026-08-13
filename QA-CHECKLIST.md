# QA Checklist

- [x] No broken internal links or missing assets
- [x] External links reviewed; the only public external HTTP links are four current official Tinder sources on the Tinder review
- [x] Unique titles and descriptions
- [x] Exactly one H1 per page
- [x] Correct self-referencing canonical and robots policy
- [x] Sitemap matches indexing policy
- [x] JSON-LD parses on all pages that include it and reflects checkpoint content
- [x] No horizontal overflow on representative pages at 320, 375, 390, 768, 1024, and 1440 pixels
- [x] Keyboard, focus, touch, and mobile menu behavior passes at the checkpoint
- [x] Full axe/WCAG audit passes all 38 pages at 390 and 1440 pixels with zero violations
- [x] No console errors on representative pages; all local checkpoint requests use one origin
- [x] Custom branded 404 retains a real HTTP 404 response on GitHub Pages
- [x] Images have dimensions, responsive sources, useful alt text, and owner-confirmed commercial publication rights
- [x] No active affiliate links exist; the registry is globally disabled and commercial pages carry disclosure language
- [x] Mobile Lighthouse on six representative page types: LCP 1.50–2.25 seconds, CLS 0–0.0002, accessibility 100, SEO 100
- [x] Required before/after screenshots captured and technically reviewed
- [x] Production deployment is owner-authorized only after all material release checks pass

## Checkpoint gate

`python scripts/qa_site.py` passes with zero errors. `scripts/full_site_browser_qa.js` covers every HTML page at 320, 390, 768, and 1440 pixels with zero overflow, local-request, menu-state, console, or comparison-table accessibility errors. `scripts/browser_qa.js` also passes the representative and new-guide set at 320, 375, 390, 768, 1024, and 1440 pixels. Search Console classification, documented image provenance, Lighthouse targets, and the full axe/WCAG audit pass. Platform-level 404 status remains the post-deployment release check.
