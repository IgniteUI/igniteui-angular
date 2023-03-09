# igx-avatar

The **igx-avatar** component allows you to add images or initials as avatars in your application.  
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/avatar.html)

# Usage
```html
<igx-avatar shape="rounded" icon="person" bgColor="#0375be" data-init="SS">
</igx-avatar>
```

# API Summary
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `id` | string | Unique identifier of the component. If not provided it will be automatically generated.|
| `src` |  string | Set the image source of the avatar. |
| `initials` | string | Set the initials of the avatar. |
| `icon` | string | Set the icon of the avatar. Currently all icons from the material icon set are supported. Not applicable for initials and image avatars. |
| `bgColor` | string | Set the background color of initials or icon avatars. |
| `color` | string | Set the color of initials or icon avatars. (optional) |
| `shape` | boolean | Set the shape of the avatar to rounded. The default shape is square. |
| `size` | string | Set the size of the avatar to either small, medium, or large. |

*You can also set all igx-avatar properties programmatically.

# Examples

Using `igx-avatar` tag to include it into your app.
```html
<igx-avatar icon="person" bgColor="#0375be" data-init="SS">
</igx-avatar>
```

Using `TypeScript` to modify and existing igx-avatar instance.
```typescript
avatarInstance.srcImage('https://unsplash.it/60/60?image=55');
avatarInstance.size('small');
```
