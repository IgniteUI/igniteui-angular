# Common Theming Patterns

> **Part of the [`igniteui-angular-theming`](../SKILL.md) skill hub.**

## Contents

- [Switching Between Light and Dark Themes](#switching-between-light-and-dark-themes)
- [Scoping a Theme to a Container](#scoping-a-theme-to-a-container)
- [Licensed Package Users](#licensed-package-users)

## Switching Between Light and Dark Themes

```scss
@use 'igniteui-angular/theming' as *;

$light-palette: palette($primary: #1976D2, $secondary: #FF9800, $surface: #FAFAFA);
$dark-palette: palette($primary: #90CAF9, $secondary: #FFB74D, $surface: #121212);

@include core();
@include typography($font-family: $material-typeface, $type-scale: $material-type-scale);

// Light is default
@include theme($palette: $light-palette, $schema: $light-material-schema);

// Dark via class on <body> or <html>
.dark-theme {
  @include theme($palette: $dark-palette, $schema: $dark-material-schema);
}
```

## Scoping a Theme to a Container

A scoped `theme()` call can use a different palette, a different design system, or both. Call `core()` once globally. When the scoped theme uses a different design system, also include `typography()` with that design system's typeface and type scale inside the scope.

```scss
@use 'igniteui-angular/theming' as *;

$admin-palette: palette($primary: #7C4DFF, $secondary: #FF9800, $surface: #FFFFFF);

@include core();
@include typography($font-family: $material-typeface, $type-scale: $material-type-scale);
@include theme($palette: $default-palette, $schema: $light-material-schema);

// Indigo inside a Material app
.admin-panel {
  @include typography($font-family: $indigo-typeface, $type-scale: $indigo-type-scale);
  @include theme($palette: $admin-palette, $schema: $light-indigo-schema);
}
```

## Licensed Package Users

If using the licensed `@infragistics/igniteui-angular` package, set `licensed: true` on MCP tool calls and change the Sass import:

```scss
@use '@infragistics/igniteui-angular/theming' as *;
```
