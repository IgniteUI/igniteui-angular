# IgxExpansionPanel


**IgxExpansionPanel** is a light and highly templateable component that allows you to dynamically display content.

A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/expansion_panel.html)

# Usage

```html
<igx-expansion-panel>
    <igx-expansion-panel-header>
        <igx-expansion-panel-title>
            Title
        </igx-expansion-panel-title>
        <igx-expansion-panel-description>
            Description
        </igx-expansion-panel-description>
    </igx-expansion-panel-header>
    <igx-expansion-panel-body>
        <p>Lengthier and more detailed description. Only visible when the panel is expanded</p>
    </igx-expansion-panel-body>
</igx-expansion-panel>
```

## igx-expansion-panel-header
The header of the `igx-expansion-panel` is **always** visible - this is the part of the component which handles user interaction.

### igx-expansion-panel-title
The `title` part of the header is **always** visible and will always be placed in the beginning of the header (after the icon, depending on settings) 
The title should be used to describe the content of the panel's body.

### igx-expansion-panel-description
The `description` part of the header is **always** visible and will always be placed in the middle of the header (after the title).
The description can be used to provide a very short and concise explanation, further expanding upon the title, on the content of the panel's body.

## igx-panel-body
The `igx-expansion-panel-body` contains all of the content in the `igx-expansion-panel` which should not be initially visible. The `body` is **sometimes** visible - only when the expansion panel is **not** `collapsed`

# API Summary
The following tables summarize the **igx-expansion-panel**, **igx-expansion-panel-header** and **igx-expansion-panel-body** inputs, outputs and methods.

## IgxExpansionPanelComponent

### Inputs
The following inputs are available in the **igx-expansion-panel** component:

| Name | Type | Description |
| :--- | :--- | :--- |
| `animationSettings` | `AnimationSettings` | Specifies the settings for the open and close animations of the panel |
| `id` | `string` | The id of the panel's host component |
| `collapsed` | `boolean` | Whether the component is collapsed (body is hidden) or not |

### Outputs
The following outputs are available in the **igx-expansion-panel** component:

| Name | Cancelable | Description | Parameters
| :--- | :--- | :--- | :--- |
| `onCollapsed` | `false` | Emitted when the panel is collapsed | `{ event: Event, panel: IgxExpansionPanelComponent }` |
| `onExpanded` | `false` | Emitted when the panel is expanded | `{ event: Event, panel: IgxExpansionPanelComponent }` |


### Methods
The following methods are available in the **igx-expansion-panel** component:

| Name | Signature | Description |
| :--- | :--- | :--- |
| `collapse` | `(event?: Event ): void` | Collapses the panel |
| `expand` | `(event?: Event ): void` | Expands the panel |
| `toggle` | `(event?: Event ): void` | Toggles the panel (calls `collapse(event)` or `expand(event)` depending on `collapsed`) |


## IgxExpansionPanelHeaderComponent
### Inputs
The following inputs are available in the **igx-expansion-panel-header** component:

| Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | The id of the panel header |
| `lv` | `string` | The `aria-level` attribute of the header |
| `role` | `string` | The `role` attribute of the header |
| `iconPosition` | `string` | The position of the expand/collapse icon of the header |
| `disabled` | `boolean` | Gets/sets whether the panel header is disabled (blocking user interaction) or not |


### Outputs
The following outputs are available in the **igx-expansion-panel-header** component:

| Name | Cancelable | Description | Parameters
| :--- | :--- | :--- | :--- |
| `onInteraction` | `false` | Emitted when a user interacts with the header host | `{ event: Event, panel: IgxExpansionPanelComponent }` |

## IgxExpansionPanelBodyComponent
### Inputs
The following inputs are available in the **igx-expansion-panel-body** component:

| Name | Type | Description |
| :--- | :--- | :--- |
| `labelledBy` | `string` | The `aria-labelledby` attribute of the panel body |
| `label` | `string` | The `aria-label` attribute of the panel body |
| `role` | `string` | The `role` attribute of the panel body |
