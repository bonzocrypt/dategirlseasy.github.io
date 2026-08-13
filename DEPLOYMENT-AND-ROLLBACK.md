# Deployment and Rollback

Production deployment is not authorized until final owner approval.

## Release

1. Confirm the working tree is clean and QA passes.
2. Review the branch diff against `19ae1d6`.
3. Confirm the GitHub Pages source branch and owner approval.
4. Merge through the normal non-force workflow.
5. Verify live status, sitemap, robots, representative pages, and 404 behavior.

## Rollback

- Pre-project reference: `checkpoint/pre-dge-roadmap-2026-08-12` at `19ae1d6`.
- Revert release commits through normal Git history and redeploy the prior known-good state.
- Never reset hard, rewrite history, or force-push.
