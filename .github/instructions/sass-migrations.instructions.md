---
applyTo: "projects/igniteui-angular/migrations/**"
---

# Sass migrations

The `ng update` migrations change Sass stylesheets through a text scanner in `migrations/common/sass/`, not a Sass parser. The scanner tells code from non-code the way Sass does, and the changes in `changes.ts` work on the code it finds. Both files open with a comment that states what they handle, and `changes.ts` lists its known limits.

## Reviewing

- Treat the known limits in `changes.ts` as intentional. Don't report a case they already cover, such as a call through another module's namespace, a dynamic reference through `meta.get-function()`, a name written with escapes, or a nested call to the same member in `updateArgument`.
- Report a scanning or matching problem only when it can happen in a stylesheet an Angular application would contain, and say what that stylesheet looks like. Input that the Sass compiler rejects isn't a finding: check that the example compiles.
- Give the most weight to output that is wrong without anyone noticing: code that a change removes or rewrites by mistake, or a change that leaves a stylesheet that no longer compiles. A change that skips an unusual call and leaves it as it was is less severe, and a call it reports for manual review is working as intended.
- Don't suggest replacing the scanner with ad hoc regular expressions over the raw text. Regular expressions run on the code the scanner masks, so that strings and comments stay out of reach.

## Tests

- The context matrix in `common/sass/changes.spec.ts` runs every change against the places a statement can appear: inert ones, such as comments and strings, and non-code that comes before code, such as `url()` tokens and escaped strings. The Sass compiler validates every context first.
- A new scanning case belongs in that matrix as a context, so that it covers every change at once, rather than in a test for one change.
- A migration for a release has its own spec, next to its `index.ts`, that runs it end to end.
