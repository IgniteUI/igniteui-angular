# igx-avatar

The **igx-avatar** component allows you to add images or initials as avatars in your application.

# Usage
```html
<igx-avatar roundShape="true" icon="person" bgColor="#0375be" data-init="SS">
</igx-avatar>
```

# API Summary
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `src` |  string | Set the image source of the avatar. |
| `initials` | string | Set the initials of the avatar. |
| `icon` | string | Set the icon of the avatar. Currently all icons from the material icon set are supported. Not applicable for initals and image avatars. |
| `bgColor` | string | Set the background color of initials or icon avatars. |
| `color` | string | Set the color of initilas or icon avatars. (optional) |
| `roundShape` | boolean | Set the shape of the avatar to circle. The default shape is square. |
| `size` | string | Set the size of the avatar to either small, medium, or large. |

*You can also set all igx-avatar properties programatically.

# Examples

Using `igx-avatar` tag to include it into your app.
```html
<igx-avatar roundShape="true" icon="person" bgColor="#0375be" data-init="SS">
</igx-avatar>
```

Using `TypeScript` to modify and existing igx-avatar instance.
```typescript
avatarInstance.srcImage('https://unsplash.it/60/60?image=55');
avatarInstance.size('small');
```
