# CLAUDE.md

**Be extremely concise. Sacrifice grammar for concision. Terse responses preferred. No fluff.**

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Hyperlane v4 Documentation is a Mintlify-powered documentation site for the Hyperlane interchain communication protocol. It contains developer guides, API references, and tutorials for building with Hyperlane.

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.

## Common Commands

```bash
# Local development
mintlify dev

# Check for broken links
mintlify broken-links
```

## Architecture

### Directory Structure
- `docs/` - Main documentation pages (MDX files)
- `api-reference/` - API documentation
- `images/` - Static images
- `mint.json` or `docs.json` - Mintlify configuration

### Mintlify Syntax
- Uses MDX (Markdown + JSX components)
- Supports Mintlify-specific components (Cards, Tabs, CodeGroups, etc.)
- Internal links use relative paths without `.mdx` extension

## Writing Philosophy

### Keep It Simple
Documentation should be clear and direct. Don't add sections unless they help users accomplish tasks.

### Focus on the User
- What is the user trying to do?
- What do they need to know to succeed?
- What mistakes do they commonly make?

## Tips for Claude Code Sessions

1. **Check existing terminology** - Use consistent Hyperlane terms (ISM, Warp Route, Mailbox)
2. **Verify code examples** - Test snippets against actual SDK/CLI
3. **Internal links** - Relative paths without `.mdx` extension
4. **Keep changes minimal** - Only modify what's necessary; avoid scope creep
5. **More detail is better** - For docs, err on the side of more explanation
6. **Link magic numbers** - Add links to confirm constants and thresholds
7. **Explain why** - Comments should explain rationale, not repeat code
8. **Mintlify syntax** - Use Mintlify-flavored MDX features

## Verify Before Acting

**Always search the codebase before assuming.** Don't hallucinate file paths, function names, or patterns.

- `grep` or search before claiming "X doesn't exist"
- Read the actual file before suggesting changes to it
- Check `git log` or blame before assuming why code exists
- Verify the Mintlify component syntax is correct

## When Claude Gets It Wrong

If output seems wrong, check:

1. **Did I read the actual file?** Or did I assume its contents?
2. **Did I search for existing patterns?** The codebase likely has examples
3. **Am I using stale context?** Re-read files that may have changed
4. **Did I verify the error message?** Run the command and read actual output
