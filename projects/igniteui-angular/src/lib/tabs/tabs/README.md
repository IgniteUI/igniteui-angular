# igx-tabs

## Description
_igx-tabs component allows you to add tabs component with tab items positioned at the top and item content in your application. The tabs in Ignite UI for Angular can be composed with the following components and directives:_

-  *igx-tab-item* - single content area that holds header and content components
-  *igx-tab-header* - holds the title and/or icon of the item and you can add them with `igxTabHeaderIcon` and `igxTabHeaderLabel`
-  *igx-tab-content* - represents the wrapper of the content that needs to be displayed

Each item (`igx-tab-item`) contains header (`igx-tab-header`) and content (`igx-tab-content`).When tab is clicked, the associated content is selected and visualized into single container. There should always be a selected tab. Only one tab can be selected at a time.
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


# API Summary 

## igx-tabs

### Properties

| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `items` |  QueryList<IgxTabItemDirective> | Observable collection of `IgxTabItemDirective` content children. |
| `tabAlignment` |  string | Property which determines the tab alignment. Defaults to `start`. |
| `selectedIndex` | number | Gets/Sets the index of selected tab in the respective collection. Default value is 0 if content is defined otherwise defaults to -1. |
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
