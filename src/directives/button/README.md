# igxButton

The **igxButton** directive is intended to be used on any button, span, div, or anchor element to turn it into a fully functional button.

# Usage
```html
<target-element igxButton [..options]>Click me</target-element>
```

# API Summary
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `igxButton` |  string | Set the type of igxButton to be used. Default is set to flat. |
| `igxButtonColor` |    string   |   Set the button text color. You can pass any CSS valid color value. |
| `igxButtonBackground` | string | Set the button background color. You can pass any CSS valid color value. |

# Button types
| Name   | Description |
|:----------|:-------------:|
| `flat` | The default button type. Transparent background and primary theme color for text. |
| `raised` | As the name implies, this button type uses subtle box-shadow. Primary theme color for background and white for text color. |
| `gradient` | Same as the raised button type. Additionally you can specify a gradient value for background color. |
| `fab` | Floating action button type. Circular with primary theme color for background and white text. |
| `icon` | This is the simplest of button types. Use it whenever you need to use an icon as button. |
| `navbar` | Same as the icon button type, albeit optimized for use with the igx-navbar component. |

# Examples

Using `igxButton` to turn a span element into an js blocks styled button.
```html
<span igxButton="raised" igxButtonColor="yellow" igxButtonBackground="#000">Click me<span>
```
