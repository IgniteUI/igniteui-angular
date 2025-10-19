# igx-badge

The **igx-badge** component is an absolutely positioned element that can be used in tandem with other components such as avatars, navigation menus, or anywhere else in an app where some active indication is required.
With the igx-badge you can display active count or an icon in several different predefined styles.  
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/badge.html)

# Usage
```html
<igx-badge value="8"></igx-badge>
```

# API Summary
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `id` | string | Unique identifier of the component. If not provided it will be automatically generated.|
| `type` | string | Set the type of the badge to either `primary`, `info`, `success`, `warning`, or `error`. This will change the background color of the badge according to the values set in the default theme. |
| `position` | string | Set the position of the badge relative to its parent container to either `top-right`, `top-left`, `bottom-right`, or `bottom-left`. |
| `value` | string | Set the value to be displayed inside the badge. |
| `icon` | string | Set an icon for the badge from the material icons set. Will not be displayed if `value` for the badge is already set. |

# Examples

Using `igx-badge` with the `igx-avatar` component to show active status.
```html
<igx-avatar [src]="src">
    <igx-badge type="info" value="8"></igx-badge>
</igx-avatar>
```
