# Grid Interaction Directive

To allow the user to subscribe to DOM events on cells and rows (e.g. `pointerover`, `click`, `focus`, etc.) but receive component-related context for the element triggering the event instead of just DOM-related one.

There are two separate attribute directives that are available to the user - `IgxCellInteractionDirective` that provides events for cell interactions and `IgxRowInteractionDirective` that provides events for row interactions.

Both require the same type of input:

```typescript
export interface IInteractionConfig = {
    start: Array<string>,
    end: Array<string>
}
```

Both `start` and `end` expect an array of events that correspond to what the user considers the beginning and the end of an interaction with the element type of his choice (cells or rows). For example, if the user requires the `pointerenter` event for the beginning of an interaction on rows and `pointerleave` as the end, he should use the following code to initialize the directive:

```html
<igx-grid [igxRowInteraction]="{ start: ['pointerenter'], end: ['pointerleave'] }">
</igx-grid>
```

`start` and `end` have an additional purpose - to separate the outputs logically so that it is easier to handle them declaratively in the template. To finalize the example above, the user has two events to subscribe to:

```html
<igx-grid
    [igxRowInteraction]="{ start: ['pointerenter'], end: ['pointerleave'] }"
    (onRowInteractionStart)="menu.show($event)"
    (onRowInteractionEnd)="menu.hide($event)">
</igx-grid>
```

Corresponding events are available for `IgxCellInteractionDirective` - `onCellInteractionStart` and `onCellInteractionEnd`.

The event argument context is different for the events provided by the two directives:

- `IgxCellInteractionDirective`'s arguments implement the `CellType` interface
- `IgxRowInteractionDirective`'s arguments implement the `RowType` interface
