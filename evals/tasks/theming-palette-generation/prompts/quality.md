# Theming Palette Generation — LLM Rubric

Evaluate the agent's approach to creating a custom branded Ignite UI theme.

## Correct Theming Approach (0–0.3)
- Did the agent use the Ignite UI Sass theming API (`palette()`, `theme()`) instead of hardcoding CSS custom properties?
- Did the agent use `@use 'igniteui-angular/theming'` (modern Sass module syntax) rather than deprecated `@import`?
- Did the agent include `core()` mixin before `theme()` mixin as required by the theming system?

## Skill Routing & Reference Usage (0–0.3)
- Did the agent read the theming skill SKILL.md for theming guidance?
- Did the agent follow the correct theming sequence: palette → typography → theme?
- Did the agent check for MCP server availability before writing SCSS manually?
- If MCP tools were available, did the agent prefer using them over manual SCSS?

## Idiomatic API Usage (0–0.25)
- Did the agent pass `$primary` and `$secondary` parameters to `palette()`?
- Did the agent pass a `$surface` color appropriate for a light theme?
- Did the agent configure typography with a font family?
- Did the agent pass the `$palette` variable to the `theme()` mixin?
- Did the agent use the `$schema` parameter or rely on the correct default schema?

## Code Quality (0–0.15)
- Is the SCSS well-structured and readable?
- Did the agent use `@use` with a namespace (e.g., `as *` or a custom namespace)?
- Did the agent avoid hallucinated function names or non-existent parameters?
- Did the agent avoid mixing Sass theming with manual CSS overrides unnecessarily?
