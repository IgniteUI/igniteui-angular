Avatar is an image defining identity for an app element.

## Objectives
It is providing API for the most common use cases, leaving maximum flexibility in developer hands. It follows the mobile-first approach and should be suitable for hybrid applications.

## User Stories
### Developer

As a developer I want to be able to provide a way to display certain image, initials or icon as avatar. Using [ ] binding.

```html
<igx-avatar initials="ZK" width="100" roundShape="true" bgColor="#ff6978">
</igx-avatar>
```

### End user
As an end user, I want to be given a visual representation of certain image, initials or icon.

##Acceptance criteria
1. Have avatar that shows image.
2. Have avatar that shows initials as image.
3. Have avatar that shows *icon as image*.
4. The avatar must have a size (*small*, *medium*, *large*) changing the *width*/*height* of the component.
5. The avatar must accept image *href path* for image representation.
6. The avatar should have the ability to set *initials* color.
7. The avatar should have the ability to set *initials* background color.
8. The avatar should have the ability to set *rounded shape*.

## Functionality
### End User Experience
The avatar should always display image, initials or icon.
### Developer Experience
`initials`: Set the initials that should be shown by the avatar.

`roundShape`: Change the type of the Avatar, by using roundShape the avatar will look like circle or square.

`bgColor`: Set the background corner of the initials or icon avatars.

`color`: Set the color of the initials or icon avatars.

`icon`: Set the icon of the avatar. Currently all icons from the material icon set are supported.

`src`: Set the image source of the avatar.

`size`: Set the size of the avatar to either *small*, *medium* or *large*.
### Globalization/Localization
No localization options are envisaged.
### User Interface
The end user interface consists of:

1. Image, initials or icon representation of the avatar

2. In a circle or square shape.

3. With 3 different sizes (*small*, *medium* or *large*).


### API
You should be able to configure the `igx-avatar` by passing an Options object to it.
* `Properties`
 * `src` - Set the image source of the avatar.
 * `initials` - Set the initials of the avatar.
 * `icon` - Set the icon of the avatar. Currently all icons from the material icon set are supported. Not applicable for initals and image avatars.
 * `bgColor` - Set the background color of initials or icon avatars.
 * `color` - Set the color of initilas or icon avatars. (*optional*)
 * `roundShape` - Set the shape of the avatar to circle. The default shape is square.
 * `size` - Set the size of the avatar to either *small*, *medium* or *large*.
* Methods Internal
 * `generateInitials()` - Create canvas element
 * `isRounded()` - Check the rounded property and return Boolean

### ARIA support
* `Roles`:
 * role="initials"
 * role="image"
 * role="icon"
* `Attributes`:
 * aria-label="avatar"