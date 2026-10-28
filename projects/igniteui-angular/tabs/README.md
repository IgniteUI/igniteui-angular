# igx-tabs

## Description
_igx-tabs component allows you to add a tabs component with tab items and item content in your application. The tab headers are placed above the content or in a column beside it. The tabs in Ignite UI for Angular can be composed with the following components and directives:_

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

By default the tab headers are placed in a row above the content. Set `headerPosition` to `start` or `end` to place them in a column before or after the content:

    <igx-tabs headerPosition="start" style="height: 320px">
        <igx-tab-item>
            <igx-tab-header>
                <span igxTabHeaderLabel>Inbox</span>
            </igx-tab-header>
            <igx-tab-content>Inbox content</igx-tab-content>
        </igx-tab-item>
        ...
    </igx-tabs>

- `start` and `end` follow the text direction, so `start` is on the right in right-to-left layouts.
- When the headers do not fit in the height of the tabs, the scroll buttons above and below them scroll them up and down.
- `tabAlignment` aligns the headers along the column, and with `justify` they share its height.
- The Up and Down arrow keys move between the tabs. Home, End and `activation` work as in a row.
- Changing `headerPosition` at runtime keeps the selected tab and does not render the tabs again.

# API Summary 

## igx-tabs

### Properties

| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `items` |  QueryList<IgxTabItemDirective> | Observable collection of `IgxTabItemDirective` content children. |
| `tabAlignment` |  string | Property which determines the tab alignment. Defaults to `start`. |
| `headerPosition` | `'top'` \| `'start'` \| `'end'` | Determines on which side of the content the tab headers are placed. Defaults to `top`. |
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
