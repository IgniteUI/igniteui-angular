# igxRipple

**igxRipple** defines an area in which the ripple animates in response to a
user action.

By default a ripple is activated when the host element of the `igxRipple` directive
receives a mouse or touch event. On `mousedown`/`touchstart` the ripple animation
starts.  
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/ripple.html)

# Usage
```html
<target-element igxRipple [...options]>Click me</target-element>
```

# API Summary
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `igxRipple` |  string | The color of the ripple animation |
| `igxRippleTarget` |    string   |   Set the ripple to activate on a child element inside the parent of the `igxRipple`. Accepts a CSS selector. Defaults to the parent of the `igxRipple`.  |
| `igxRippleCentered` | boolean | If true, the ripple animation originates from the center of the element rather than the location of the click event. |
| `igxRippleDuration` | number | The duration of the ripple animation. Defaults to 600 milliseconds. |
| `igxRippleDisabled` | boolean | Specify whether the ripple instance should be disabled. |

# Examples

Using `igxRippleTarget` to attach a ripple effect to a specific element inside a
more complex component.
```html
<igx-list>
    <igx-list-item igxRipple igxRipplTarget=".igx-list__item" *ngFor="let item of navItems">
        {{ item.text }}
    </igx-list-item>
</igx-list>
```

Setting a centered ripple effect with custom color.
```html
<span igxButton="raised" igxRipple="#e41c77" [igxRippleCentered]="true">
    <i class="material-icons">edit</i>
</span>
```

The `igxRipple` uses the Web Animation API and runs natively on
[browsers that support it.](http://caniuse.com/#feat=web-animation)
The `web-animations.min.js` polyfill is [available](https://github.com/web-animations/web-animations-js)
for other browsers.
