#!/bin/bash
# nuke-git-history.sh

echo "This will delete all git commit history and reinitialize the repo."
read -p "Are you sure? (y/N): " confirm
if [[ "$confirm" != "y" ]]; then
  echo "Aborted."
  exit 1
fi

# Save current branch name
branch=$(git rev-parse --abbrev-ref HEAD)

# Create a new orphan branch
git checkout --orphan temp-branch

# Add all files
git add -A
git commit -m "Reset history"

# Delete old branch and replace
git branch -D "$branch"
git branch -m "$branch"

# Force push to remote (optional — uncomment at your own risk)
# git push -f origin "$branch"

echo "Git history wiped. You now have a fresh commit."
