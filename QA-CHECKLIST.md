# QA Checklist

## Tawkify withdrawal

- [x] `reviews/tawkify.html` is deleted and returns the branded real 404 in production
- [x] No public HTML, sitemap entry, shared template, navigation item, review-hub promotion, affiliate-registry entry, or public outbound link references Tawkify
- [x] Dating Apps navigation contains Compare Dating Apps, Browse All Reviews, and the ten alphabetical app reviews with no empty Beyond Apps section
- [x] Source propagation and regression tests preserve the withdrawal during future rebuilds
- [x] Structural, HTML/schema, responsive, keyboard, accessibility, external-link, and no-regression performance checks pass locally
- [x] GitHub Pages deploys the withdrawal and live navigation, sitemap, review hub, and retired-URL behavior pass production verification

## Sitewide light-theme reading contrast correction

- [x] Every public page is rendered and scanned for visible low-contrast text in light mode
- [x] Shared article paragraphs, lists, labels, inline emphasis, source notes, and supporting copy use a theme-aware reading color
- [x] Article eyebrow labels and source links retain their intended teal/coral hierarchy instead of inheriting body copy
- [x] Messaging examples, library-directory controls, filter labels, and the keyboard skip link meet the light-theme contrast treatment
- [x] Intentional light text on dark buttons, image overlays, ebook covers, selected navigation, and branded surfaces remains unchanged
- [x] Structural QA and valid HTML/JSON-LD pass across 55 HTML pages and 48 sitemap URLs
- [x] Full-site browser QA passes 660 dark/light combinations at 320, 375, 390, 768, 1024, and 1440 pixels; representative interaction QA passes 132 combinations
- [x] Rendered-text diagnostic reports zero remaining light-mode findings; axe/WCAG passes 220 dark/light combinations with zero violations
- [x] Representative guide/review Lighthouse scores remain 98–100 performance, 100 accessibility, 100 SEO, 1.50–2.40-second LCP, and zero CLS
- [x] All 138 external URLs pass with no material failures

## Light-default readability and guide-panel polish

- [x] The white presentation is the default for first-time visitors; an explicitly saved dark preference remains respected across pages
- [x] Standard sun/moon control appears at the far right on desktop and beside Menu on mobile
- [x] Exactly one responsive theme control is visible at every tested viewport, with a 44-pixel target and dynamic accessible action label
- [x] Mouse, touch, Enter-key activation, cross-page persistence, and cross-tab storage synchronization are implemented
- [x] Early head initialization applies light by default or restores the saved theme before page content renders and safely tolerates unavailable storage
- [x] Guide Library and In-Depth Guides hero text retains at least a 20-pixel inset from the rounded panel edge at every tested viewport
- [x] No visible legacy content link retains the pale navy-theme link color in light mode; Start Here breadcrumbs and Recommended Path links are contrast-safe
- [x] Shared modern and legacy page templates retain readable, consistent panels, tables, fields, cards, navigation, and footer styling in both themes
- [x] Structural QA and valid HTML/JSON-LD pass across 55 HTML pages and 48 sitemap URLs
- [x] Full-site browser QA passes 660 dark/light combinations at 320, 375, 390, 768, 1024, and 1440 pixels; representative interaction QA passes 132 combinations
- [x] Axe/WCAG audit passes 220 dark/light combinations with zero violations
- [x] Start Here, Guide Library, and In-Depth Guides score 99 performance, 100 accessibility, 100 SEO, 1.65–2.10-second LCP, and zero CLS
- [x] All 138 external URLs pass with no material failures

## Desktop navigation hierarchy refinement

- [x] Dating Apps prioritizes Compare Dating Apps and Browse All Reviews before the individual directory
- [x] All ten app reviews remain alphabetized with unchanged URLs and concise app-name labels
- [x] Tawkify appears only in a separately labeled Beyond apps matchmaking route and remains outside the app comparison tool
- [x] Guides prioritizes the unified library and in-depth view before six goal-oriented topic routes
- [x] Both expanded desktop menus remain inside the viewport at 1024 and 1440 pixels
- [x] Mobile menus remain single-column, scrollable within the header panel, keyboard accessible, and fully reachable
- [x] Structural QA and valid HTML/JSON-LD pass across 55 HTML pages and 48 sitemap URLs
- [x] Responsive/browser QA passes 330 full-site and 132 representative combinations at 320, 375, 390, 768, 1024, and 1440 pixels
- [x] Axe/WCAG audit passes 110 combinations with zero violations
- [x] Homepage, review hub, and Tawkify Lighthouse scores remain 98–99 performance, 100 accessibility, 100 SEO, 2.10–2.40-second LCP, and zero CLS
- [x] All 138 external URLs pass with no material failures

## Tawkify matchmaking alternative and Impact verification

- [x] Tawkify is presented as a matchmaking-service alternative and is not mixed into the app-only comparison table or dropdown
- [x] Review covers fit, process, client versus member access, pricing context, company-reported claims, pros and cons, privacy, screening limits, contract questions, and who should avoid it
- [x] Sole commercial-style CTA follows the final verdict and official sources; the exact owner-supplied disclosure appears immediately above it
- [x] Affiliate registry keeps the Tawkify tracking identifier pending and records Impact activation requirements
- [x] Homepage contains the Impact verification UUID exactly once without removing or changing existing analytics or metadata
- [x] Structural QA and HTML/JSON-LD validation pass across 55 HTML pages and 48 sitemap URLs
- [x] Responsive/browser QA passes 330 full-site and 132 representative combinations at 320, 375, 390, 768, 1024, and 1440 pixels
- [x] Axe/WCAG audit passes 110 combinations with zero violations
- [x] Tawkify Lighthouse scores 98 performance, 100 accessibility, 100 SEO, 2.40-second LCP, and zero CLS; homepage and review hub remain 99/100/100

## Legal publisher identity correction

- [x] Every one of the 54 public HTML pages contains the exact approved footer once
- [x] No public HTML or public structured data identifies the former legal entity
- [x] Date Girls Easy remains the publication and brand; named JSON-LD publishers identify Vaulted Holdings LLC
- [x] Shared footer and schema-generation sources persist the correction through future builds
- [x] Footer remains within the viewport at 320, 375, 390, 768, 1024, and 1440 pixels and wraps cleanly at 320 pixels
- [x] Structural QA, valid HTML/JSON-LD, 324 full-site responsive, 126 representative, and 108 axe/WCAG combinations pass with no material errors
- [x] Homepage, privacy, first-move, and pleasure-guide Lighthouse checks score 98–99 performance, 100 accessibility, 100 SEO, 2.10–2.25-second LCP, and zero CLS
- [x] All 131 public HTTP references pass external review with no material failures

## CJ privacy and affiliate-compliance readiness

- [x] Privacy policy names CJ and discloses cookies, identifiers, click/referrer/device/browser/IP data, order and transaction attribution, later-visit attribution, and cross-device reporting
- [x] Official CJ Services Privacy Notice, data-subject-request/privacy-choices, and UK/EU privacy links are present without campaign parameters
- [x] UK/EEA/EU section requires operational consent handling before non-essential CJ tracking is enabled where prior consent applies
- [x] Affiliate registry remains globally disabled with no tracking identifier and website/editorial content as the only approved promotional method
- [x] Registry records W-9 identity verification, unmodified links, proximate disclosure, no directly identifying data, no self-clicking or spam, account monitoring, and reversals
- [x] Structural QA, valid HTML/JSON-LD, 324 full-site responsive, 126 representative, and 108 axe/WCAG combinations pass with no material errors
- [x] Privacy Lighthouse scores 98 performance, 100 accessibility, 100 SEO, 2.25-second LCP, and zero CLS; independent unchanged-homepage recheck remains under the 2.5-second gate
- [x] All 131 public HTTP references pass external review with no material failures

## Homepage discovery and featured content

- [x] Noninteractive hero boxes removed; hero retains its protected H1, metadata, image, and primary routes
- [x] Adult-only section contains exactly three whole-card guide links with no placeholder destinations
- [x] Featured this month contains exactly three curated destinations and no unsupported Tinder or Tinder-vs-Bumble priority
- [x] Featured-link click event records title, internal destination, and display position in the existing data layer
- [x] Structural, valid-HTML, 324 full-site responsive, 120 representative, and 108 axe/WCAG combinations pass with no material errors
- [x] Homepage Lighthouse scores 99 performance, 100 accessibility, 100 SEO, 2.10-second LCP, and zero CLS

## Adult-only intimacy guide cluster

- [x] Both new pages are original Date Girls Easy content for adults and use the shared guide-reader contract
- [x] Clear consent, safer-sex, pain, feedback, and no-guarantee framing is present where relevant
- [x] Guide Library exposes 20 entries; Kissing & Intimacy exposes three; In-Depth Guides exposes six
- [x] Structural QA passes across 54 HTML pages and 47 sitemap URLs with valid metadata, canonicals, JSON-LD, internal links, and anchors
- [x] Responsive/browser QA passes 324 full-site and 120 representative combinations at 320, 375, 390, 768, 1024, and 1440 pixels
- [x] Axe/WCAG 2.2 AA audit passes 108 combinations with zero violations; HTML validation passes
- [x] New-guide Lighthouse scores are 99–100 performance, 100 accessibility, 100 SEO, 1.50–2.10-second LCP, and zero CLS
- [x] All 126 already-live external references pass or use ordinary automated-client protection; only the two unpublished canonical URLs return the expected pre-deployment 404

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

## Shared guide reading system

- [x] All 18 public guides expose one standardized breadcrumb, contents navigation, and continuation panel
- [x] Every contents link points to a real section target and has a visible keyboard focus state
- [x] Seven legacy guides use the polished article-plus-sticky-contents layout; the interactive reset checklist keeps its specialized layout with a compact contents navigator
- [x] Mobile contents navigation uses large tap targets and does not require horizontal scrolling
- [x] Protected guide titles, descriptions, H1s, canonicals, robots directives, URLs, and approved advice remain unchanged
- [x] Structural QA, valid HTML/JSON-LD, 312 full-site responsive combinations, 102 representative combinations, 36 guide-reader contract combinations, and 104 axe combinations pass with zero material errors
- [x] All 122 detected public HTTP references pass external-link review; three use ordinary automated-client protection and none returns a material 404, 5xx, DNS, or connection failure
- [x] Changed legacy guide Lighthouse: 99–100 performance, 100 accessibility, 100 SEO, 1.50–2.10-second LCP, zero CLS
- [x] Broader Lighthouse results match the prior release baseline; the two unchanged pages above the local preview threshold reproduce their known uncompressed-server readings rather than a new regression

## Focused Dating App Reviews hub

- [x] The hero gives no individual app unexplained priority and leads with Compare Dating Apps
- [x] Browse All Reviews lands on the visible review directory
- [x] The directory begins with “Start with intent, age range, and budget” and repeats the comparison route beside it on desktop and below it on mobile
- [x] Exactly ten review cards appear in alphabetical order with equal visual treatment
- [x] Retired mixed-purpose cards and repetitive instructional panels are absent
- [x] Protected review-hub metadata, H1, URL, canonical, and robots directives remain unchanged
- [x] Valid HTML/JSON-LD, 312 responsive combinations, 108 representative combinations, and 104 axe combinations pass with zero material errors
- [x] Review hub Lighthouse: 100 performance, 100 accessibility, 100 SEO, 1.50-second LCP, zero CLS
