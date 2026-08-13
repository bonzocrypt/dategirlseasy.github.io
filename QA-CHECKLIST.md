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
- [x] No critical issues found in the available automated structural/accessibility checks; a full axe/WCAG audit remains a release recommendation
- [x] No console errors on representative pages; all local checkpoint requests use one origin
- [ ] Custom 404 retains an HTTP 404 response
- [ ] Images have dimensions, responsive sources, and useful alt text; owner must document publication rights/provenance before deployment
- [x] No active affiliate links exist; the registry is globally disabled and commercial pages carry disclosure language
- [ ] Mobile LCP target under 2.5 seconds and CLS under 0.1
- [x] Required before/after screenshots captured and technically reviewed
- [ ] Production merge and deployment receive final owner approval

## Checkpoint gate

`python scripts/qa_site.py` passes with zero errors. `scripts/full_site_browser_qa.js` covers every HTML page at 320, 390, 768, and 1440 pixels with zero overflow, local-request, menu-state, or console errors. `scripts/browser_qa.js` also passes the representative and new-guide set at 320, 375, 390, 768, 1024, and 1440 pixels. Search Console classification, documented image provenance, Lighthouse targets, full axe/WCAG tooling, and platform-level 404 status remain release gates.
