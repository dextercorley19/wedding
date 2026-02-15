# GitHub Settings — Branch Protection

To enable these rules on `main`, go to:
**Settings → Branches → Add rule (main branch)**

## Recommended Configuration

- ✅ Require pull request reviews before merging (1 approval)
- ✅ Require status checks to pass:
  - `lint`
  - `type-check`
  - `build`
- ✅ Require branches to be up to date before merging
- ✅ Require code reviews from code owners
- ✅ Allow auto-merge (squash or rebase)

This ensures all PRs are tested before landing on main.
