- update .gitignore so that it reflects everything that needs to be gitignored
- NEVER commit to main branch. if currently in main branch, create a new branch and switch to that branch
- Create a new commit for all of our uncommitted changes
- run git status && git diff HEAD && git status --porcelain to see what files are uncommitted
- add the untracked and changed files
- Add an atomic commit message with an appropriate message
- add a tag such as "feat", "fix", "docs", etc. that reflects our work

**COMMIT RULES:**

- Do NOT add "Co-authored-by" lines to commits
- Do NOT add "Generated with Claude Code" or similar attributions
- Keep commits clean and professional
