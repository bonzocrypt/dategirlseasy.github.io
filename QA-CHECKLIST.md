# QA Checklist

- [x] No broken internal links or missing assets
- [ ] External links and redirects reviewed
- [x] Unique titles and descriptions
- [x] Exactly one H1 per page
- [x] Correct self-referencing canonical and robots policy
- [x] Sitemap matches indexing policy
- [x] JSON-LD parses on all pages that include it and reflects checkpoint content
- [x] No horizontal overflow on representative pages at 320, 375, 390, 768, 1024, and 1440 pixels
- [x] Keyboard, focus, touch, and mobile menu behavior passes at the checkpoint
- [ ] No critical WCAG 2.2 AA violations
- [x] No console errors on representative pages; all local checkpoint requests use one origin
- [ ] Custom 404 retains an HTTP 404 response
- [ ] Images have approved provenance, dimensions, responsive sources, and useful alt text
- [ ] Affiliate disclosures appear near commercial recommendations
- [ ] Mobile LCP target under 2.5 seconds and CLS under 0.1
- [x] Required before/after screenshots captured and technically reviewed
- [ ] Production merge and deployment receive final owner approval

## Checkpoint gate

`python scripts/qa_site.py` passes with zero errors. `scripts/browser_qa.js` passes 30 representative page/viewport combinations with zero overflow or console errors. Search Console classification, external-link review, image approval, full accessibility tooling, Lighthouse targets, and platform-level 404 status remain release gates after owner design approval.
