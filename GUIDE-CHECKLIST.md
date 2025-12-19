# Guide Page Checklist (Date Girls Easy)

## Required structure

- Uses `/styles.css` only
- `<main class="container guide">`
- `<article class="prose">`
- Visible breadcrumb line at top using `.meta`
- `<header class="article-hero">` with:
  - Single `<h1>`
  - `.meta` updated date line
  - `.lede` paragraph

## Navigation

- Header and footer match index.html exactly
- Guide uses `.toc` for quick navigation if applicable

## Content rules

- Text only follow ups by default
- No phone calls unless explicitly required
- Clear copy buttons where relevant

## SEO

- Canonical URL matches page path
- Single Article schema
- Single FAQ schema if applicable
- BreadcrumbList JSON LD present
- OG and Twitter metadata present

## QA before push

- No VS Code red errors
- Page renders like index typography and spacing
- Copy buttons work
- No duplicate schema blocks
