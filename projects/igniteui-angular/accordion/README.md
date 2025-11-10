
# IgxAccordion


**IgxAccordion** is a container-based component that contains a collection of collapsible **IgxExpansionPanels**.

A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/accordion)

# Usage

```html
<igx-accordion>
    <igx-expansion-panel *ngFor="let panel of panels">
        ...
    </igx-expansion-panel>
</igx-accordion>
```

# API Summary
The following tables summarize the **igx-accordion** accessors, inputs, outputs and methods.

### Accessors
The following accessors are available in the **igx-accordion** component:
| Name | Type | Description |
| :--- | :--- | :--- |
| `panels` | `IgxExpansionPanelComponent[]` | All IgxExpansionPanel children of the accordion |

### Inputs
The following inputs are available in the **igx-accordion** component:

| Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | The id of the accordion. |
| `animationSettings` | `AnimationSettings` | Animation settings that override all single animations passed to underlying panels |
| `singleBranchExpand` | `boolean` | How the accordion handles panel expansion. |

### Outputs
The following outputs are available in the **igx-accordion** component:

| Name | Cancelable | Description | Parameters
| :--- | :--- | :--- | :--- |
| `panelExpanded` | `false` | Emitted when the panel is collapsed | `IAccordionEventArgs` |
| `panelCollapsing` | `true` | Emitted when the panel begins collapsing | `IAccordionCancelableEventArgs` |
| `panelCollapsed` | `false` | Emitted when the panel is expanded | `IAccordionEventArgs` |
| `panelExpanding` | `true` | Emitted when the panel begins expanding | `IAccordionCancelableEventArgs` |


### Methods
The following methods are available in the **igx-accordion** component:

| Name | Signature | Description |
| :--- | :--- | :--- |
| `collapseAll` | `(event?: Event ): void` | Collapse all expanded expansion panels |
| `expandAll` | `(event?: Event ): void` | Expands all collapsed expansion panels when singleBranchExpand === false |

## Keyboard Navigation
|Keys          |Description|
|---------------|-----------|
| Tab | Moves the focus to the first(if the focus is before accordeon)/next panel. |
| Shift + Tab | Moves the focus to the last(if the focus is after accordeon)/previous panel. |
| Arrow Down | Move the focus to the panel below. |
| Arrow Up | Move the focus to the panel above. |
| Alt + Arrow Down | Expand the focused panel in the accordion. |
| Alt + Arrow Up | Collapse the focused panel in the accordion. |
| Shift + Alt + Arrow Down | Expand all panels when this is enabled. |
| Shift + Alt + Arrow Up | Collapse all panels whichever panel is focused. |
| Home | Navigates to the first panel in the accordion. |
| End | Navigates to the last panel in the accordion. |
