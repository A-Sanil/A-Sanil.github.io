# Release a public resume from Overleaf

**Private Overleaf project → private PDF review → PDF-only pull request → human merge → existing GitHub Pages deployment.** Nothing polls Overleaf or publishes on save. The destination is root `resume.pdf` on `main`, served at `https://a-sanil.github.io/resume.pdf`. This does not add a site link or otherwise change the UI.

## One-time setup

1. Review and merge the workflow, helper and this guide in a **setup-only** change (no PDF). The helper below uses Git and PowerShell 7 (`pwsh`). No Overleaf or GitHub Actions secrets, personal access token, or new GitHub App are needed. Use your existing GitHub maintainer login for the PR and merge.
2. In GitHub **Settings → Pages**, confirm the existing source is **Deploy from a branch → `main` → `/ (root)`**. The public repo README describes branch deployment, but confirm the actual settings. If the site is already deploying through a different source, stop and check how it includes `resume.pdf` rather than switching deployment modes blindly.
3. Keep Overleaf link sharing off. Ideally keep a separate **private, public-safe edition** of the resume without your personal phone number, home address, private email, or other details you do not want permanently public. Do not link or synchronize the private Overleaf project to this public repository.

## Each update — the privacy gate is before the first push

1. In Overleaf, recompile successfully and [download the typeset PDF](https://docs.overleaf.com/managing-projects-and-files/downloading-a-project) (not the source ZIP). Keep it outside the checkout. Review **that exact downloaded file** locally: every page, searchable/copyable text, actual hyperlink destinations (`mailto:`, `tel:`, private/shared URLs), document properties/metadata and any hidden content or attachments. If unsure, change the private project and export again. An edited or cleaned PDF needs a fresh review. A draft PR or an unmerged branch in this public repo is **already public**.
2. From a clean checkout, prepare the reviewed bytes. Use a new branch name for each release. Set `$pdf` to the same file you reviewed, and do not change it after review.

   ```powershell
   git fetch origin main
   git switch -c resume-update/2026-11 origin/main
   $pdf = 'C:\path\to\the-reviewed-export.pdf'
   $approved = (Get-FileHash -Algorithm SHA256 -LiteralPath $pdf).Hash
   ./.github/resume-sync/prepare-resume.ps1 -Pdf $pdf -ApprovedSha256 $approved
   git status --short    # expect only resume.pdf; no change means stop here
   git add -- resume.pdf
   git diff --cached --name-status    # expect only resume.pdf
   ```

   The helper only prepares the file; it does not stage, commit or publish. If you use another shell, you can copy the exact reviewed file to root `resume.pdf` yourself and verify its SHA-256 before proceeding.
3. Commit only `resume.pdf`, push the release branch, and open a PR to `main`. Include the approved SHA-256 in the description. The **Check public resume PDF / check-pdf** job runs on opened, updated or reopened PRs to `main` that touch `resume.pdf`. It checks the proposed merge changes only that file and that the PDF is regular, non-executable, at most 5 MiB, structurally valid, unencrypted, nonempty (at least one page), and has no listed attachments. It reports SHA-256 without dumping document contents. No scheduled runs, write permissions, or artifact uploads. Don't set this path-filtered check as a repo-wide required check: unrelated PRs won't run it.
4. **Manually merge only if** the check passed, the check summary SHA-256 matches the locally approved hash (case-insensitive), and the PR changes only `resume.pdf`. Keep auto-merge off for these PRs. If another commit changes the PDF, review again and compare against the latest run. The check is not a redactor or a privacy scanner; it cannot certify that text or metadata is safe.
5. The maintainer's merge (not an Actions bot push) updates `main` and leaves deployment to the existing Pages pipeline. GitHub [does not trigger a branch-based Pages build from a `GITHUB_TOKEN` push](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#troubleshooting-publishing-from-a-branch). After Pages reports a successful deployment for the merge, download the live `/resume.pdf` and compare its SHA-256 with your reviewed copy.

## Failure and rollback

- Missing export, failed compile, helper/hash mismatch, check failure, conflict, or no check: **stop; do not merge**. The workflow cannot change `main` or deploy. Fix the issue privately and re-review before another push.
- If Pages fails or serves an old file after merging, inspect the Pages deployment run, confirm `main` and `/ (root)`, and recheck the live hash once a deployment succeeds. Do not add a broad token or change Pages modes to work around it. To roll back a bad PDF, revert the resume commit as a maintainer and verify deployment again. A first-publication rollback removes the file; the update-only check deliberately rejects removals, so use a separately reviewed maintainer rollback rather than treating a failed check as a passing update.
- If private data was pushed, removing or reverting the PDF does **not** erase Git history, PR refs, copies, or caches. Stop the release and follow GitHub's [sensitive data removal guidance](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

## Why not connect Overleaf directly?

[Overleaf Git integration](https://docs.overleaf.com/integrations-and-add-ons/git-integration-and-github-synchronization/git-integration) is supported and can be used on your own workstation for source editing if the project has premium access. It syncs **source**, not the rendered PDF. Its [Git token](https://docs.overleaf.com/integrations-and-add-ons/git-integration-and-github-synchronization/git-integration/git-integration-authentication-tokens) is not scoped to a single project. Keeping it off this public repo's Actions avoids handing the runner access to your authoring projects and avoids exposing private source, compiler output, or unreviewed PDFs. Overleaf [read-only project links](https://docs.overleaf.com/collaborating/sharing-a-project) share project access; they are not a private-to-public PDF release mechanism. This flow uses the supported PDF download instead of scraping a session or relying on an undocumented PDF URL.
