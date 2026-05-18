# Agent Prompt: Custom Branded Theme

You are working in an Angular 20+ project that already has `igniteui-angular` installed with Sass support.

Create a custom Ignite UI for Angular theme in `src/styles.scss` with a blue primary and orange secondary palette.

Requirements:
- Import from `igniteui-angular/theming` using `@use` syntax
- Create a palette with primary #1976D2, secondary #FF9800, and a light surface color
- Configure typography with a sans-serif font family
- Call `@include core()` BEFORE `@include theme()`
- Pass the palette to the `theme()` mixin
- Use the `palette()` function (do NOT hardcode CSS custom properties)
- Use `@use` module syntax (not deprecated `@import`)
