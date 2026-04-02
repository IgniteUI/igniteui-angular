# Update to 21.0.0

## Migration to Multiple Entry Points

This migration automatically updates your imports from the main `igniteui-angular` package to the new entry point structure.

### What Changed

Ignite UI for Angular v21.0.0 introduces multiple entry points for better tree-shaking and code splitting. Instead of importing everything from `igniteui-angular`, you now import from specific entry points like `igniteui-angular/core`, `igniteui-angular/grids`, etc.

### Breaking Changes

#### 1. Entry Point Changes

The following directives have been moved to new entry points:

**Input Directives** → `igniteui-angular/input-group`
   - `IgxInputDirective`
   - `IgxLabelDirective`
   - `IgxHintDirective`
   - `IgxPrefixDirective`
   - `IgxSuffixDirective`

**Autocomplete** → `igniteui-angular/drop-down`
   - `IgxAutocompleteDirective`

**Radio Group** → `igniteui-angular/radio`
   - `IgxRadioGroupDirective`

#### 2. Type Renames

The following types have been renamed to avoid conflicts:

- `Direction` → `CarouselAnimationDirection` (carousel)

### Example

**Before:**
```typescript
import { 
    IgxGridComponent, 
    IgxInputDirective, 
    DisplayDensity,
    Direction 
} from 'igniteui-angular';
```

**After:**
```typescript
import { DisplayDensity } from 'igniteui-angular/core';
import { IgxGridComponent } from 'igniteui-angular/grids/grid';
import { IgxInputDirective } from 'igniteui-angular/input-group';
```

### Note

The migration script will automatically update your imports and rename types. No manual changes are required.

The main `igniteui-angular` package still exports everything for backwards compatibility, but using specific entry points is recommended for optimal bundle sizes.
