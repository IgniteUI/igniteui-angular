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

```scss
.admin-panel {
  @include theme($palette: $admin-palette, $schema: $light-indigo-schema);
}
```

## Licensed Package Users

If using the licensed `@infragistics/igniteui-angular` package, set `licensed: true` on MCP tool calls and change the Sass import:

```scss
@use '@infragistics/igniteui-angular/theming' as *;
```
