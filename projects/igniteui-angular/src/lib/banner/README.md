# igx-banner

**igx-banner** supports banner component that is shown at the full width of the screen above the app content but below a Navigation Bar if available. A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/banner.html)

# Usage
```html
<igx-banner #banner message="This is default template's message!" icon="star" [dismissButtonText]="'Dismiss!!'" [confirmButtonText]="'Confirm'">
</igx-banner>
```

# API Summary

### Inputs

Inputs available on the **IgxBanner**:

| Name                |      Type     |  Description                                             |
|---------------------|:-------------:|----------------------------------------------------------|
| `message`           | string        | Sets the message to show in the banner.                  |
| `confirmButtonText` | string        | Sets the description of confirming button.               |
| `dismissButtonText` | string        | Set the description of the dismissive button.            |
| `icon`              | string        | Set name of the icon from material design icons.         |

### Outputs

A list of the events emitted by the **IgxBanner**:

| Name                | Description                                                              |
|---------------------|--------------------------------------------------------------------------|
| `onOpen`            | Fires after the banner shows up                                          |
| `onClose`           | Fires after the banner hides                                             |
| `onButtonClick`     | Fires when one clicks either confirming or dismissive button             |

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
