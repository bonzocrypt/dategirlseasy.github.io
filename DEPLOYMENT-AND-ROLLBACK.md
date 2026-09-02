# Deployment and Rollback

Production was authorized conditionally by the owner and completed on August 13, 2026 after all material release gates passed. The publisher rebuild content merge was `168bbc6817a567c41144a5ebd6487c42f1e82baf`; GitHub Pages workflow run `31751391763` completed successfully.

Verified August 13, 2026: GitHub Pages uses the legacy branch build from `main` at repository root. The custom domain is `dategirlseasy.com`, HTTPS is enforced, and the latest deployed pre-release commit was `36239aca6ccc3e2bc7b661648dfc4bf34f00c667`.

Pre-release backups:

- Local Git tag: `backup/pre-release-2026-08-13` at deployed commit `36239aca6ccc3e2bc7b661648dfc4bf34f00c667`
- Full repository bundle: `C:\DGE\backups\dategirlseasy-2026-08-13-pre-release\repository-before-release.bundle`
- Deployed-tree ZIP: `C:\DGE\backups\dategirlseasy-2026-08-13-pre-release\remote-main-36239ac.zip`

Incremental enhancement rollback points:

- Impact affiliate-platform withdrawal: rollback point `455b22a52bad68a1240f3ba6e3c842493007cad0`; implementation commit `651bfe0c33259e03b6b28571a2c388923ee056b6`; Pages workflow run `33647003820`.
- Tawkify withdrawal: rollback point `73d4262bf6de71d388857c424281fcd9a99ad0f6`; implementation commit `39e8b595c97b540e656e96150547e78d748d1252`; Pages workflow run `33574721904`.
- Homepage hero balance and overlay correction: rollback point `4544875c9d0318d244c41b28425b46f518921cd3`.
- First free ebook and confidence-shelf release: rollback point `9a8a0e1da1fb9af11b871f3060209038015510e5`.
- Navigation and guide-discovery enhancement: rollback point `abbeb051380c2a1374f5306824683e6e131c8235`, preserved as `backup/pre-navigation-2026-08-24`; implementation commit `ad6c6c153b047fc3cf1619419bcab29c6c7ca096`.
- Unified Guide Library enhancement: rollback point `a248850b52120578da219a452ccf897d8813cb46`, preserved as `backup/pre-unified-guide-library-2026-08-25`; implementation commit `5864b47f8f1cb0682f37c2a1d44afb8849f1260a`.
- Shared guide reading-system enhancement: rollback point `5864b47f8f1cb0682f37c2a1d44afb8849f1260a`, preserved as `backup/pre-guide-reading-system-2026-08-25`.
- Focused Dating App Reviews hub: rollback point `1ac7e28773f2390bf746cc87845de31503565fc2`, preserved as `backup/pre-focused-review-hub-2026-08-25`.
- Adult-only intimacy guide cluster: rollback point `c759cf28a9e60e75853a1ef5dc0745d392e2dde7`, preserved as `backup/pre-intimacy-guide-cluster-2026-08-25`.
- Homepage discovery and featured-content polish: rollback point `ade7ae7fb12481bd5676965ecfe74b7356b4d548`, preserved as `backup/pre-homepage-discovery-2026-08-25`.
- CJ privacy and affiliate-compliance readiness: rollback point `a90decce0a3485db82fb56ab8aa60cca3b47cd5b`, preserved as `backup/pre-cj-privacy-2026-08-25`.
- Legal publisher identity correction: rollback point `cad930faac5b35ec2ca5f49a1cdd9c466d36cc51`, preserved as `backup/pre-vaulted-publisher-2026-08-25`.
- Tawkify matchmaking alternative and Impact verification: rollback point `409dd0e2a08c5e823106872a6ffd754dc60d3165`, preserved as `backup/pre-tawkify-impact-2026-08-25`.
- Desktop navigation hierarchy refinement: rollback point `a3c48f9dacf54ff2d2fef2e5272cd6d5511600a4`, preserved as `backup/pre-desktop-navigation-refinement-2026-08-26`.
- Persistent light and dark themes: rollback point `ff30d15b757d1bdedbbe559c4ebd3dc12925b083`, preserved as `backup/pre-light-theme-2026-08-26`.
- Light-default readability and guide-panel polish: rollback point `afb28c57b26353c0c36dcc3f9925acd2ac1dea0e`, preserved as `backup/pre-light-default-polish-2026-08-26`.
- Sitewide light-theme reading contrast correction: rollback point `3a68433c6da5c22c820526d234c1e55381a17101`, preserved as `backup/pre-light-text-contrast-2026-08-26`.
- Sitewide privacy consent controls: rollback point `aafa64e62e3c006ba93a30a643e5dfe0062ff06c`; implementation commit `e707c02c1b56625d22fd421b2f877bfdc97f9e6a`.
- Local date ideas guide and consent-gated Viator finder: rollback point `e0923ea08d99819192c8ee8e9e3c5cd360e88f30`; implementation commit `b3dfb77952869a12abfc73b3fcc133369415c3e0`.
- Guide placement and desktop preview navigation: rollback point `dc013cc723dfca18b353c2b9b11e16e6619c4bee`; implementation commit `716b90a60cc505d0eb6d0a8d49fa27cc6dba4ea7`.
- Fotor profile-photo recommendations: rollback point `8a940f3c1a25fa0324b25671dcd2009cfc493488`; implementation commit `2adffcfbd28b4970f4f59140cc81ee320caa5946`.

## Release

1. Confirm the working tree is clean and QA passes.
2. Review the branch diff against `19ae1d6`.
3. Confirm the GitHub Pages source branch and owner approval.
4. Merge through the normal non-force workflow.
5. Verify live status, sitemap, robots, representative pages, and 404 behavior.

## Rollback

- Pre-project reference: `checkpoint/pre-dge-roadmap-2026-08-12` at `19ae1d6`.
- Immediate pre-release production reference: `backup/pre-release-2026-08-13` at `36239ac`.
- Revert release commits through normal Git history and redeploy the prior known-good state.
- Never reset hard, rewrite history, or force-push.
