# igx-banner

**igx-banner** supports banner component that is shown at the full width of the screen above the app content but below a Navigation Bar if available. A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/banner.html)

# Usage
```html
<igx-banner #banner>
    This is default template's message!
</igx-banner>
```

# API Summary

### Inputs

Inputs available on the **IgxBanner**:

| Name                |      Type     |  Description                                             |
|---------------------|:-------------:|----------------------------------------------------------|
| `animationSettings`           | `{ openAnimation: AnimationRefMetadata, closeAnimation: AnimationRefMetadata }`     | Sets the open / close animations for the banner.                  |


### Outputs

A list of the events emitted by the **IgxBanner**:

| Name                | Description                                                              | Cancelable |
|---------------------|--------------------------------------------------------------------------|------------|
| `onOpening`            | Fires before the banner is opened                                         | `true` |
| `onOpened`            | Fires after the banner is opened                                          | `false` |
| `onClosing`            | Fire before the banner is closed                                          | `true` |
| `onClosed`            | Fires after the banner is closed                                          | `false`|

### Getters

Getters available on the **IgxBanner**:

| Name                | Type          | Getter | Setter | Description                            |
|---------------------|:-------------:|:------:|:------:|----------------------------------------|
| `collapsed`         | boolean       | Yes    | No     |Gets whether `igx-banner` is collapsed. |

### Methods

Here is a list of all public methods exposed by **IgxBanner**:

| Signature           | Description                                                              |
|---------------------|--------------------------------------------------------------------------|
| `open()`            | Opens the banner                                                         |
| `close()`           | Closes the banner                                                        |
| `toggle()`          | Toggles the banner                                                       |
