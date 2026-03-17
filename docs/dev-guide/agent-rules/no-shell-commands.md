---
description: Never run shell or node commands directly — always ask the user to run them manually
---

# No Shell Commands Rule

**NEVER** execute `node`, `npm`, `npx`, `git`, or any other shell/terminal command directly via `run_command`.

Instead, when a command needs to be run:

1. **Describe what needs to be done** and why.
2. **Provide the exact command** in a fenced code block so the user can copy-paste it.
3. **Wait for the user to confirm** the output or result before proceeding.

## Example

Instead of running `node scripts/setup-platform.js`, say:

> Execute o seguinte comando no terminal:
>
> ```bash
> node scripts/setup-platform.js
> ```
>
> Me avise o resultado para que eu possa continuar.

## Applies To

- Any `node` or `npm` commands
- Any `git` commands
- Any system shell commands (`mkdir`, `rm`, `cp`, etc.)
- Any `npx` scaffolding or CLI tools
- Any dev server starts (`npm run dev`, etc.)
