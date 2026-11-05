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
- **Keyboard support** – users can resize with the arrow keys (by 10px per key press, emitting the same resize events as a drag); combine with `Ctrl` to collapse or expand panes.
- **Drag constraints** – `minSize` and `maxSize` (px or % of the splitter size) enforce boundaries while resizing, ensuring important content stays visible.

## API Reference

### IgxSplitterComponent inputs

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `SplitterType` | `SplitterType.Horizontal` | Orientation of the splitter (`Horizontal` renders a row layout, `Vertical` renders a column layout). |
| `nonCollapsible` | `boolean` | `false` | Hides collapse/expand affordances on splitter bars. |

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
