# igx-action-strip

The **igx-action-strip** provides a template area for one or more actions.
In its simplest form the Action Strip is an overlay of any container and shows additional content over that container.
A walk-through of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/action_strip.html)

# Usage
The Action Strip can be initialized in any HTML element that can contain elements. This parent element should be with a relative position as the action strip is trying to overlay it. Interactions with the parent and its content are available while the action strip is shown.
```html
<igx-action-strip #actionstrip>
    <igx-icon (click)="doSomeAction()"></igx-icon>
</igx-action-strip>
```

# Grid Action Components
Action strip provides functionality and UI for IgxGrid. All that can be utilized with grid action components. These components inherit `IgxGridActionsBaseDirective` and when creating a custom grid action component, this component should also inherit `IgxGridActionsBaseDirective`.

```html
<igx-action-strip #actionstrip>
    <igx-grid-editing-actions [grid]="grid1"></igx-grid-editing-actions>
    <igx-grid-pinning-actions [grid]="grid1"></igx-grid-pinning-actions>
</igx-action-strip>
```

# IgxActionStripMenuItem 

The Action Strip can show items as menu. This is achieved with `igxActionStripMenuItem` directive applied to its content. Action strip will render three-dot button that toggles a drop down. And the content will be those items that are marked with `igxActionStripMenuItem` directive.

```html
<igx-action-strip #actionStrip1>
    <span *IgxActionStripMenuItem>Copy</span>
    <span *IgxActionStripMenuItem>Paste</span>
    <span *IgxActionStripMenuItem>Edit</span>
</igx-action-strip>
```
# API Summary

## Inputs
`IgxActionStripComponent`

   | Name            | Description                                       | Type                        | Default value |
   |-----------------|---------------------------------------------------|-----------------------------|---------------|
   | hidden | An @Input property that sets the visibility of the Action Strip. | boolean | `false` |
   | context | Sets the context of an action strip. The context should be an instance of a @Component, that has element property. This element will be the placeholder of the action strip. | any | |

`IgxGridActionsBaseDirective` ( `IgxGridPinningActionsComponent`, `IgxGridEditingActionsComponent`)

   | Name            | Description                                       | Type                        | Default value |
   |-----------------|---------------------------------------------------|-----------------------------|---------------|
   | grid | Set an instance of the grid for which to display the actions. | any | |
   | context | Sets the context of an action strip. The context is expected to be grid cell or grid row | any | |

## Outputs
|Name|Description|Cancelable|Parameters|
|--|--|--|--|
| onMenuOpening | Emitted before the menu is opened | true | |
| onMenuOpened | Emitted after the menu is opened | false | |

## Methods

`IgxActionStripComponent`

   | Name     | Description                | Return type                                       | Parameters           |
   |----------|----------------------------|---------------------------------------------------|----------------------|
   | show | Showing the Action Strip and appending it the specified context element. | void | context |
   | hide | Hiding the Action Strip and removing it from its current context element. | void | |

`IgxGridPinningActionsComponent`
   | Name     | Description                | Return type                                       | Parameters           |
   |----------|----------------------------|---------------------------------------------------|----------------------|
   | pin | Pin the row according to the context. | void | |
   | unpin | Unpin the row according to the context. | void | |

`IgxGridPinningActionsComponent`
   | Name     | Description                | Return type                                       | Parameters           |
   |----------|----------------------------|---------------------------------------------------|----------------------|
   | startEdit | Enter row or cell edit mode depending the grid `rowEdibable` option | void | |
   | deleteRow | Delete a row according to the context | void | |