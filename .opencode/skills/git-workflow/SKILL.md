---
name: git-workflow
description: Use when committing, pushing, creating PRs, or managing branches for EduGarden. Covers the deploy pipeline (push to main → Vercel auto-deploys). Triggers on: git, commit, push, branch, deploy, Vercel, GitHub.
---

# Git + Deploy Workflow

## EduGarden Deploy Pipeline
```
edit files locally → git commit → git push origin main → Vercel auto-deploys in ~30s
```
No build step. Vercel serves static files as-is.

## Commit Message Format
```
feat: add chatbot widget to public site
fix: staff popover showing wrong specialization
refactor: extract image upload to helper function
docs: update CONTEXT.md with new table columns
```

## Before Every Push
1. Open https://edugarden.vercel.app in browser
2. Check for console errors (F12)
3. Test the feature you changed
4. Check admin panel if you touched admin/index.html

## Using GitHub MCP
With GitHub MCP connected, you can ask opencode to:
- "Create a new issue for the chatbot widget"
- "Show me all open issues"
- "Create a PR for the current branch"
- "Search the codebase for 'deleteImage'"

## Branch Strategy (simple, solo project)
- Work directly on main for small changes
- Create feature branches for big features: `git checkout -b feat/chatbot-widget`
