# Date Girls Easy repo instructions

This project is a mobile first review and education website for men focused on dating site reviews, comparisons, educational guides, and ebooks.

Business goals:

1. Maximize affiliate monetization from review and comparison pages
2. Support ebook sales and email capture
3. Improve AI answer visibility and organic search visibility
4. Keep the site fast, clean, and mobile first
5. Prepare the site for PWA style installability and future app wrapping

Critical rules:

1. Do not build any join flow, signup flow, member area, or matchmaking feature
2. This is a publisher, not a dating platform
3. Every page should support trust, clarity, and monetization
4. Prefer reusable components and templates
5. Keep navigation simple and mobile friendly
6. Add strong internal linking between reviews, comparisons, guides, and ebooks
7. Add disclosure and trust language where relevant
8. Keep copy direct and high intent
9. Prioritize conversion pages first
10. Do not remove existing working SEO metadata unless replacing it with something better

UX rules:

1. Mobile first layout
2. Large tap targets
3. Fast first paint
4. Strong readability
5. Avoid clutter
6. Keep sections scannable
7. Use cards and clear hierarchy

Editorial rules:

1. Review pages must include who the app is for and who should avoid it
2. Comparison pages must include a quick verdict near the top
3. Guide pages must be practical and example driven
4. Ebook pages must connect to related guides and reviews
5. Homepage must clearly position the site as a review and education publisher

Build priority:

1. Homepage
2. Global nav and footer
3. Reviews hub
4. Comparisons hub
5. Ebooks hub
6. Core legal pages
7. Reusable templates
8. PWA preparation

Content handling rules:

1. content/ebooks is a raw private source library for research, summaries, categorization, metadata extraction, and planning
2. content/ebooks-live contains ebooks approved to be surfaced on the public site
3. Do not automatically publish, link, or create public listing pages from every file in content/ebooks
4. Only build public ebook listings, ebook detail pages, download links, or storefront sections from content/ebooks-live
5. It is allowed to use content/ebooks as source material for summaries, categorization, metadata, and internal planning
