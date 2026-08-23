#!/usr/bin/env python3
"""Insert or update Google Tag Manager and the GA4 Google tag (gtag.js) on every page."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MEASUREMENT_ID = "G-T2TQHDFBZP"
GTM_ID = "GTM-KLM9MDV3"

GTM_HEAD_SNIPPET = f'''    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){{w[l]=w[l]||[];w[l].push({{'gtm.start':
    new Date().getTime(),event:'gtm.js'}});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    }})(window,document,'script','dataLayer','{GTM_ID}');</script>
    <!-- End Google Tag Manager -->
'''

GTM_BODY_SNIPPET = f'''    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={GTM_ID}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
'''

GA_SNIPPET = f'''    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id={MEASUREMENT_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());

      gtag('config', '{MEASUREMENT_ID}');
    </script>
'''

HEAD_SNIPPET = GTM_HEAD_SNIPPET + GA_SNIPPET

EXISTING_HEAD_BLOCK_RE = re.compile(
    r'[ \t]*<!-- Google Tag Manager -->\n'
    r'.*?'
    r'<!-- End Google Tag Manager -->\n'
    r'([ \t]*<!-- Google tag \(gtag\.js\) -->\n'
    r'[ \t]*<script async src="https://www\.googletagmanager\.com/gtag/js\?id=[^"]*"></script>\n'
    r'[ \t]*<script>\n'
    r'.*?'
    r'</script>\n)?',
    re.DOTALL,
)

EXISTING_GA_ONLY_BLOCK_RE = re.compile(
    r'[ \t]*<!-- Google tag \(gtag\.js\) -->\n'
    r'[ \t]*<script async src="https://www\.googletagmanager\.com/gtag/js\?id=[^"]*"></script>\n'
    r'[ \t]*<script>\n'
    r'.*?'
    r'</script>\n',
    re.DOTALL,
)

EXISTING_GTM_BODY_RE = re.compile(
    r'[ \t]*<!-- Google Tag Manager \(noscript\) -->\n'
    r'.*?'
    r'<!-- End Google Tag Manager \(noscript\) -->\n',
    re.DOTALL,
)


def inject_head(source: str) -> str:
    if EXISTING_HEAD_BLOCK_RE.search(source):
        return EXISTING_HEAD_BLOCK_RE.sub(HEAD_SNIPPET, source, count=1)
    if EXISTING_GA_ONLY_BLOCK_RE.search(source):
        return EXISTING_GA_ONLY_BLOCK_RE.sub(HEAD_SNIPPET, source, count=1)
    if "<head>" in source:
        return source.replace("<head>", "<head>\n" + HEAD_SNIPPET, 1)
    raise ValueError("No <head> tag found")


def inject_body(source: str) -> str:
    if EXISTING_GTM_BODY_RE.search(source):
        return EXISTING_GTM_BODY_RE.sub(GTM_BODY_SNIPPET, source, count=1)
    match = re.search(r'<body[^>]*>', source)
    if not match:
        raise ValueError("No <body> tag found")
    insert_at = match.end()
    return source[:insert_at] + "\n" + GTM_BODY_SNIPPET.rstrip("\n") + source[insert_at:]


def transform(page: Path) -> bool:
    source = page.read_text(encoding="utf-8")
    updated = inject_head(source)
    updated = inject_body(updated)
    if updated == source:
        return False
    page.write_text(updated, encoding="utf-8", newline="\n")
    return True


def main() -> None:
    changed: list[str] = []
    for page in sorted(ROOT.rglob("*.html")):
        relative = page.relative_to(ROOT)
        if any(part.startswith(".") for part in relative.parts):
            continue
        if transform(page):
            changed.append(relative.as_posix())
    print(f"Injected/updated GTM + Google tag in {len(changed)} pages.")
    for item in changed:
        print(item)


if __name__ == "__main__":
    main()
