# Update to 21.0.0

## Migration to Multiple Entry Points

This migration automatically updates your imports from the main `igniteui-angular` package to the new entry point structure.

### What Changed

Ignite UI for Angular v21.0.0 introduces multiple entry points for better tree-shaking and code splitting. Instead of importing everything from `igniteui-angular`, you now import from specific entry points like `igniteui-angular/core`, `igniteui-angular/grids`, etc.

### Breaking Changes

The following directives have been moved to new entry points:

1. **Input Directives** → `igniteui-angular/input-group`
   - `IgxInputDirective`
   - `IgxLabelDirective`
   - `IgxHintDirective`
   - `IgxPrefixDirective`
   - `IgxSuffixDirective`

2. **Autocomplete** → `igniteui-angular/drop-down`
   - `IgxAutocompleteDirective`

3. **Radio Group** → `igniteui-angular/radio`
   - `IgxRadioGroupDirective`

### Example

**Before:**
```typescript
import { 
    IgxGridComponent, 
    IgxInputDirective, 
    DisplayDensity 
} from 'igniteui-angular';
```

**After:**
```typescript
import { DisplayDensity } from 'igniteui-angular/core';
import { IgxGridComponent } from 'igniteui-angular/grids';
import { IgxInputDirective } from 'igniteui-angular/input-group';
```

### Note

The migration script will automatically update your imports. No manual changes are required.

The main `igniteui-angular` package still exports everything for backwards compatibility, but using specific entry points is recommended for optimal bundle sizes.
