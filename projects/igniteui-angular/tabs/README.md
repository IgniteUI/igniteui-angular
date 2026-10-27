# igx-tabs

## Description
_igx-tabs component allows you to add a tabs component with tab items, positioned at the top or on the left or right side of the content, and item content in your application. The tabs in Ignite UI for Angular can be composed with the following components and directives:_

-  *igx-tab-item* - single content area that holds header and content components
-  *igx-tab-header* - holds the title and/or icon of the item and you can add them with `igxTabHeaderIcon` and `igxTabHeaderLabel`
-  *igx-tab-content* - represents the wrapper of the content that needs to be displayed

Each item (`igx-tab-item`) contains header (`igx-tab-header`) and content (`igx-tab-content`). When a tab is clicked, the associated content is selected and visualized into a single container. There should always be a selected tab. Only one tab can be selected at a time.
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tabs).

----------
## Usage

    <igx-tabs>
        <igx-tab-item>
            <igx-tab-header igxRipple>
                <igx-icon igxTabHeaderIcon>folder</igx-icon>
                <span igxTabHeaderLabel>Tab 1</span>
            </igx-tab-header>
            <igx-tab-content>
                Content 1
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius sapien ligula.
            </igx-tab-content>
        </igx-tab-item>
    
        <igx-tab-item>
            <igx-tab-header igxRipple>
                <igx-icon igxTabHeaderIcon>folder</igx-icon>
                <span igxTabHeaderLabel>Tab 2</span>
            </igx-tab-header>
            <igx-tab-content>
                Content 2
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius sapien ligula.
            </igx-tab-content>
        </igx-tab-item>
    
        <igx-tab-item>
            <igx-tab-header igxRipple>
                <igx-icon igxTabHeaderIcon>folder</igx-icon>
                <span igxTabHeaderLabel>Tab 3</span>
            </igx-tab-header>
            <igx-tab-content>
                Content 3
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius sapien ligula.
            </igx-tab-content>
        </igx-tab-item>
    
        <igx-tab-item>
            <igx-tab-header>
                <igx-icon igxTabHeaderIcon>folder</igx-icon>
                <span igxTabHeaderLabel>Tab 4</span>
            </igx-tab-header>
            <igx-tab-content>
                Content 4
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius sapien ligula.
            </igx-tab-content>
        </igx-tab-item>
    </igx-tabs>

### Header position

By default the tab headers are placed in a row above the content. Set `headerPosition` to `left` or `right` to place them in a column on that side of the content:

    <igx-tabs headerPosition="left" style="height: 320px">
        <igx-tab-item>
            <igx-tab-header>
                <igx-icon igxTabHeaderIcon>inbox</igx-icon>
                <span igxTabHeaderLabel>Inbox</span>
            </igx-tab-header>
            <igx-tab-content>Inbox content</igx-tab-content>
        </igx-tab-item>
        <igx-tab-item>
            <igx-tab-header>
                <igx-icon igxTabHeaderIcon>send</igx-icon>
                <span igxTabHeaderLabel>Sent</span>
            </igx-tab-header>
            <igx-tab-content>Sent content</igx-tab-content>
        </igx-tab-item>
    </igx-tabs>

    <igx-tabs [headerPosition]="position">
        ...
    </igx-tabs>

- `left` and `right` are physical sides: the headers stay on the same side of the content in right-to-left layouts. The text direction of the headers and the content is not changed.
- The column of headers is as wide as its widest header, within the minimum and maximum width of a header, and the content takes the rest of the width. The content of the headers is not rotated.
- When the tabs have a height, the column is as tall as the tabs. When the headers do not fit in it, scroll buttons above and below the headers scroll them up and down. Without a height, the tabs are as tall as the headers or the selected content, whichever is taller.
- `tabAlignment` aligns the headers along the column: `start` at the top, `center` in the middle and `end` at the bottom. With `justify`, the headers share the free height of the column and keep the height of their content. Headers that do not fit start at the top of the column.
- The active indicator, or the active border in the Bootstrap theme, is on the side of the headers next to the content.
- The headers are navigated with the Up and Down arrow keys, which move to the next and previous enabled tab and wrap at the ends, also in right-to-left layouts. Home and End move to the first and last enabled tab. The Left and Right arrow keys are not handled. The `activation` setting applies as in the default position: with `auto` the focused tab is selected, with `manual` it is selected with Enter or Space.
- The content of the tabs keeps its horizontal slide animation, which `disableAnimation` turns off.
- `headerPosition` can be changed at runtime. This does not change the selected tab, emit selection events or render the headers and the content again. The header that contains the focus, or else the selected header, is scrolled into view.

# API Summary 

## igx-tabs

### Properties

| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `items` |  QueryList<IgxTabItemDirective> | Observable collection of `IgxTabItemDirective` content children. |
| `tabAlignment` |  string | Property which determines the tab alignment. Defaults to `start`. |
| `headerPosition` | `'top'` \| `'left'` \| `'right'` | Determines on which side of the content the tab headers are placed. `left` and `right` place them in a column on that physical side of the content, also in right-to-left layouts. Defaults to `top`. |
| `selectedIndex` | number | Gets/Sets the index of selected tab in the respective collection. Default value is 0 if content is defined, otherwise defaults to -1. |
| `disableAnimation` | boolean | Enables/disables the transition animation of the content. |
| `selectedItem` | IgxTabItemDirective | Gets the selected `IgxTabItemDirective` in the igx-tabs based on selectedIndex. |


### Events

| Name       |               Description                |
|:---------- |:-----------------------------------------|
| `selectedIndexChange` | Emitted when the new tab item is selected. |
| `selectedIndexChanging` | Emitted when the selected index is about to change. This event is cancelable. |
| `selectedItemChange` | Emitted when the new tab is selected. |

## igx-tab-item

### Properties

| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `selected` | boolean |  Determines whether the item is selected. |
| `disabled` | boolean | Determines whether the item is disabled. |
