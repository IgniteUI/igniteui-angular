# igx-splitter

Responsive layout component for Ignite UI for Angular.

This entry point exposes the splitter component and supporting panes used to divide content horizontally or vertically with live resizing and optional collapse behavior.

## Getting Started

```ts
import { Component } from '@angular/core';
import { IGX_SPLITTER_DIRECTIVES, SplitterType } from 'igniteui-angular/splitter';

@Component({
		selector: 'app-split-layout',
		standalone: true,
		imports: [IGX_SPLITTER_DIRECTIVES],
		template: `
			<igx-splitter [type]="orientation">
				<igx-splitter-pane [size]="'30%'">Navigation</igx-splitter-pane>
				<igx-splitter-pane>Content</igx-splitter-pane>
			</igx-splitter>
		`
})
export class SplitLayoutComponent {
		public orientation = SplitterType.Horizontal;
}
```

> Prefer `IGX_SPLITTER_DIRECTIVES` for standalone components. For NgModule-based apps import `IgxSplitterModule` from the same package.

## Basic Configuration

```html
<igx-splitter
	[type]="SplitterType.Vertical"
	[nonCollapsible]="true"
	(resizeStart)="log('start', $event)"
	(resizing)="log('resize', $event)"
	(resizeEnd)="log('end', $event)">

	<igx-splitter-pane [minSize]="'200px'" [size]="'40%'">
		Filters
	</igx-splitter-pane>

	<igx-splitter-pane [collapsed]="detailsHidden" (collapsedChange)="detailsHidden = $event">
		Details
	</igx-splitter-pane>

</igx-splitter>
```

1. Bind `type` to `SplitterType.Horizontal` or `SplitterType.Vertical` to control orientation.
2. Provide optional `minSize`, `maxSize`, or `size` values (px or %), giving the layout deterministic behavior.
3. Use the resize events to update persisted layout settings or trigger data refreshes.
4. Toggle panes by binding to `collapsed` or calling the `toggle()` helper on the pane instance.

## Customization

- **Non-collapsible bars** – set `nonCollapsible` on the splitter to hide the expanders and disable collapsing with `Ctrl` + arrow keys when panes must stay visible.
- **Keyboard support** – users can resize with the arrow keys (by 10px per key press, emitting the same resize events as a drag); combine with `Ctrl` to collapse or expand panes. A splitter bar stays in the tab order unless it can neither resize nor collapse its panes.
- **Drag constraints** – `minSize` and `maxSize` (px or % of the splitter size) enforce boundaries while resizing, ensuring important content stays visible.
- **Sizing** – the splitter has no size input. It follows `--ig-size`, set on the splitter or on an ancestor, and defaults to small.

    ```html
    <igx-splitter style="--ig-size: var(--ig-size-large)">...</igx-splitter>
    ```

    | Size | Bar thickness | Drag handle thickness | Drag handle radius | Expander height |
    | --- | --- | --- | --- | --- |
    | small | 6px | 4px | 2px | 4px |
    | medium | 12px | 6px | 8px | 5px |
    | large | 18px | 8px | 8px | 6px |

    The steps add to the `size` theme token (4px), so `--ig-splitter-size: 10px` makes the bar 12px, 18px and 24px and the drag handle 10px, 12px and 14px.

    The drag handle is 48px from the icon box of each expander: the 18px, 20px and 24px icon of the design, 14px, 16px and 24px in the Indigo theme. That box, centered on the arrow, is also the area of the expander that takes the pointer. In the Indigo theme the idle bar is 1px, 4px and 8px thick by size.

## API Reference

### IgxSplitterComponent inputs

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `SplitterType` | `SplitterType.Horizontal` | Orientation of the splitter (`Horizontal` renders a row layout, `Vertical` renders a column layout). |
| `nonCollapsible` | `boolean` | `false` | Hides collapse/expand affordances on splitter bars and turns off collapsing and expanding with `ctrl` + arrow keys. |

### IgxSplitterComponent outputs

| Event | Payload | Description |
| --- | --- | --- |
| `resizeStart` | `ISplitterBarResizeEventArgs` | Fires when a drag gesture or a keyboard resize begins; exposes the active pane and its sibling. |
| `resizing` | `ISplitterBarResizeEventArgs` | Emits while resizing to allow live layout updates. |
| `resizeEnd` | `ISplitterBarResizeEventArgs` | Emits after the resize completes and the pane sizes are updated. |

### IgxSplitterComponent properties

- `panes: QueryList<IgxSplitterPaneComponent>` – runtime access to the pane collection for advanced scenarios (saving layout, programmatic collapse).

### IgxSplitterPaneComponent inputs

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `string` | `'auto'` | Desired pane size (`px` or `%`). Updated when a resize ends, keeping the pane units. Nullish values fall back to `'auto'`. |
| `minSize` | `string` | `undefined` | Minimum allowed size for the pane (`px` or `%`). |
| `maxSize` | `string` | `undefined` | Maximum allowed size for the pane (`px` or `%`). |
| `resizable` | `boolean` | `true` | Prevents drag interactions when set to `false`. |
| `collapsed` | `boolean` | `false` | Controls pane visibility. Collapsed panes free space for siblings. |

### IgxSplitterPaneComponent outputs

| Event | Payload | Description |
| --- | --- | --- |
| `collapsedChange` | `boolean` | Fires whenever the pane collapses or expands. |

### IgxSplitterPaneComponent methods

- `toggle()` – switches between collapsed and expanded states programmatically.

## Related Packages

- [Directives](../directives/README.md) – the splitter relies on the drag-and-drop directives documented here.
- [Core](../core/README.md) – shared utilities and overlay services used across layout components.

See the [Splitter documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/splitter) for comprehensive guides and live examples.
