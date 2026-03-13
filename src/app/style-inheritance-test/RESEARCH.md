# Research: Avoiding Style Duplication with Adopted StyleSheets

## The Problem
When Component A and Component C extend Component B, and only A and C are used on the page:
- Using `styleUrls` array duplicates base styles in each child's CSS bundle
- Angular doesn't natively inherit styles through class extension

## Solution: Constructable StyleSheets (Adopted StyleSheets API)

### What Are Adopted StyleSheets?
The `adoptedStyleSheets` API allows you to create a `CSSStyleSheet` object in JavaScript and share it across multiple Shadow DOMs or the document. **The same stylesheet instance is shared, not duplicated.**

```javascript
// Create a stylesheet once
const sheet = new CSSStyleSheet();
sheet.replaceSync('.base-container { padding: 20px; }');

// Share it across multiple shadow roots
element1.shadowRoot.adoptedStyleSheets = [sheet];
element2.shadowRoot.adoptedStyleSheets = [sheet];
// Same sheet object, no duplication!
```

### Browser Support (as of 2026)
- ✅ Chrome 73+
- ✅ Edge 79+
- ✅ Firefox 101+
- ✅ Safari 16.4+

---

## Implementation Approaches

### Approach 1: Shared StyleSheet Service
Create a service that provides shared CSSStyleSheet instances:

```typescript
@Injectable({ providedIn: 'root' })
export class SharedStylesService {
    private baseStyles: CSSStyleSheet;

    constructor() {
        this.baseStyles = new CSSStyleSheet();
        this.baseStyles.replaceSync(`
            .base-container { padding: 20px; border: 2px solid #3f51b5; }
            .base-button { padding: 10px 20px; background: #3f51b5; }
        `);
    }

    getBaseStyles(): CSSStyleSheet {
        return this.baseStyles;
    }
}
```

### Approach 2: Component with Shadow DOM + Adopted StyleSheets
```typescript
@Component({
    selector: 'app-child-a',
    template: `...`,
    encapsulation: ViewEncapsulation.ShadowDom
})
export class ChildAComponent implements OnInit {
    private sharedStyles = inject(SharedStylesService);
    private elementRef = inject(ElementRef);

    ngOnInit() {
        const shadowRoot = this.elementRef.nativeElement.shadowRoot;
        shadowRoot.adoptedStyleSheets = [
            this.sharedStyles.getBaseStyles(),
            this.childStyles  // child-specific styles
        ];
    }
}
```

### Approach 3: Base Class with Style Injection (Directive Pattern)
```typescript
@Directive()
export abstract class StyledBaseDirective implements OnInit {
    protected elementRef = inject(ElementRef);
    protected sharedStyles = inject(SharedStylesService);

    ngOnInit() {
        this.applySharedStyles();
    }

    protected applySharedStyles() {
        const shadowRoot = this.elementRef.nativeElement.shadowRoot;
        if (shadowRoot) {
            const existingStyles = [...shadowRoot.adoptedStyleSheets];
            shadowRoot.adoptedStyleSheets = [
                this.sharedStyles.getBaseStyles(),
                ...existingStyles
            ];
        }
    }
}
```

---

## What Other Libraries/Frameworks Do

### 1. Lit (Google's Web Components Library)
Lit uses `adoptedStyleSheets` by default for style sharing:
```javascript
class MyElement extends LitElement {
    static styles = css`.base { padding: 20px; }`;
}
// Styles are automatically shared via adoptedStyleSheets
```

### 2. Stencil.js
Uses constructable stylesheets when available, falls back to `<style>` tags.

### 3. Angular Material / CDK
- Uses global styles for shared theming
- Component-specific styles are scoped via emulated encapsulation
- Uses CSS custom properties extensively for theming

### 4. Vaadin Components
- Uses a shared stylesheet registry
- Components register their styles in a central location
- Styles are deduplicated at runtime

### 5. Shoelace (Web Components Library)
Uses a shared stylesheet approach with `adoptedStyleSheets`:
```javascript
// All components share the same base styles
const baseStyles = new CSSStyleSheet();
baseStyles.replaceSync(baseCSS);
// Applied to each component's shadow root
```

---

## Angular-Specific Solutions

### Solution 1: CSS Custom Properties (No Duplication)
Define variables globally, use in components:
```scss
// styles.scss (global)
:root {
    --base-padding: 20px;
    --base-border-color: #3f51b5;
}

// child.component.css
.container {
    padding: var(--base-padding);
    border: 2px solid var(--base-border-color);
}
```

### Solution 2: Global Utility Classes
```scss
// styles.scss
.base-container { padding: 20px; border: 2px solid #3f51b5; }
.base-button { padding: 10px 20px; background: #3f51b5; }
```

### Solution 3: ViewEncapsulation.None (Careful!)
```typescript
@Component({
    encapsulation: ViewEncapsulation.None,
    styles: [`.base-container { padding: 20px; }`]
})
export class BaseComponent {}
```
Children will inherit because styles are global.

### Solution 4: Custom Adopted StyleSheets Implementation
Create a service + directive that manages shared styles via `adoptedStyleSheets`.

---

## Recommended Approach for Your Case

### Best Solution: Shared Styles Service + Shadow DOM

1. **Create a SharedStylesService** that creates `CSSStyleSheet` objects once
2. **Use `ViewEncapsulation.ShadowDom`** in your components
3. **Apply shared stylesheets** via `adoptedStyleSheets` in base class
4. **Each child adds its own styles** on top

This ensures:
- ✅ Base styles are defined once in memory
- ✅ No style duplication in bundles
- ✅ True encapsulation via Shadow DOM
- ✅ Children can extend/override base styles

---

## Trade-offs

| Approach | Duplication | Encapsulation | Complexity | Browser Support |
|----------|-------------|---------------|------------|-----------------|
| `styleUrls` array | ❌ Yes | ✅ Emulated | ⭐ Easy | ✅ All |
| Global styles | ✅ None | ❌ None | ⭐ Easy | ✅ All |
| CSS Variables | ✅ None | ✅ Yes | ⭐⭐ Medium | ✅ All |
| Adopted StyleSheets | ✅ None | ✅ Shadow DOM | ⭐⭐⭐ Complex | ✅ Modern |
| ViewEncapsulation.None | ✅ None | ❌ None | ⭐ Easy | ✅ All |

