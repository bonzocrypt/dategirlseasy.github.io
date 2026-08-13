# Deployment and Rollback

Production was authorized conditionally by the owner and completed on August 13, 2026 after all material release gates passed. The publisher rebuild content merge was `168bbc6817a567c41144a5ebd6487c42f1e82baf`; GitHub Pages workflow run `31751391763` completed successfully.

Verified August 13, 2026: GitHub Pages uses the legacy branch build from `main` at repository root. The custom domain is `dategirlseasy.com`, HTTPS is enforced, and the latest deployed pre-release commit was `36239aca6ccc3e2bc7b661648dfc4bf34f00c667`.

Pre-release backups:

- Local Git tag: `backup/pre-release-2026-08-13` at deployed commit `36239aca6ccc3e2bc7b661648dfc4bf34f00c667`
- Full repository bundle: `C:\DGE\backups\dategirlseasy-2026-08-13-pre-release\repository-before-release.bundle`
- Deployed-tree ZIP: `C:\DGE\backups\dategirlseasy-2026-08-13-pre-release\remote-main-36239ac.zip`

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
