# igxButton

The **igxButton** directive is intended to be used on any button, span, div, input, or anchor element to turn it into a fully functional button.  
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/button.html)

# Usage
```html
<target-element igxButton [...options]>Click me</target-element>
```

# API Summary
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `igxButton` |  string | Set the type of igxButton to be used. Default is set to flat. |
| `buttonSelected` | EventEmitter<IButtonEventArgs> | Emitted only when a button gets selected, or deselected, and not on initialization. |
| `selected` | boolean | Gets or sets whether the button is selected. Mainly used in the IgxButtonGroup component and it will have no effect if set separately. |
| `focusVisible` | boolean | Gets or sets whether the button shows its focused state while the focus is on another element, for example a list that marks the button as its active entry with `aria-activedescendant`. The button also shows the focused state when it has keyboard focus. Available on `igxIconButton` as well. |

# Button types
| Name   | Description |
|:----------|:-------------:|
| `flat` | The default button type. Uses transparent background and the secondary theme color from the palette color for the text. |
| `outlined` |  Very similar to the flat button type but with a thin outline around the edges of the button. |
| `contained` | As the name implies, this button type features a subtle shadow. Uses the secondary theme color from the palette for background. |
| `fab` | Floating action button type. Circular with secondary theme color for background. |
| `icon` | This is the simplest of button types. Use it whenever you need to use an icon as button. |

# Examples
Using `igxButton` to turn a span element into an for Angular styled button.
```html
<span igxButton="outlined">Click me<span>
```
