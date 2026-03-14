#!/bin/bash
# Reference solution for theming-palette-generation
# Proves the task is solvable and validates grader correctness

set -euo pipefail

# Write the themed styles.scss
cat > src/styles.scss << 'SCSS'
@use 'igniteui-angular/theming' as *;

$custom-palette: palette(
  $primary: #1976D2,
  $secondary: #FF9800,
  $surface: #FAFAFA,
);

$custom-typography: typography(
  $font-family: 'Roboto, "Helvetica Neue", sans-serif',
);

@include core();
@include typography($custom-typography);
@include theme(
  $palette: $custom-palette,
  $schema: $light-material-schema,
);
SCSS
