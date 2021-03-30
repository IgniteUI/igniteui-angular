# igx-bottom-nav

## Description
_igx-bottom-nav represents a single content area with multiple nav items. The bottom navigation in Ignite UI for Angular can be composed with the following components and directives:_

-  *igx-bottom-nav-item* - single content area that holds header and content components
-  *igx-bottom-nav-header* - holds the title and/or icon of the item and you can add them with `igxBottomNavHeaderIcon` and `igxBottomNavHeaderLabel`
-  *igx-bottom-nav-content* - represents the wrapper of the content that needs to be displayed

Each item (`igx-bottom-nav-item`) contains header (`igx-bottom-nav-header`) and content (`igx-bottom-nav-content`). Header is related to particular content.
When tab is clicked, the associated content is selected and visualized into single container. There should always be a selected tab. Only one tab can be selected at a time.

----------
## Usage

    <igx-bottom-nav>
        <igx-bottom-nav-item>
            <igx-bottom-nav-header>
                <igx-icon igxBottomNavHeaderIcon>folder</igx-icon>
                <span igxBottomNavHeaderLabel>Tab 1</span>
            </igx-bottom-nav-header>
            <igx-bottom-nav-content>
                Content 1
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius sapien ligula.
            </igx-bottom-nav-content>
        </igx-bottom-nav-item>

        <igx-bottom-nav-item>
            <igx-bottom-nav-header>
                <igx-icon igxBottomNavHeaderIcon>folder</igx-icon>
                <span igxBottomNavHeaderLabel>Tab 2</span>
            </igx-bottom-nav-header>
            <igx-bottom-nav-content>
                Content 2
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius sapien ligula.
            </igx-bottom-nav-content>
        </igx-bottom-nav-item>

        <igx-bottom-nav-item>
            <igx-bottom-nav-header>
                Tab 3
            </igx-bottom-nav-header>
            <igx-bottom-nav-content>
                Content 3
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius sapien ligula.
            </igx-bottom-nav-content>
        </igx-bottom-nav-item>
    </igx-bottom-nav>


# API Summary 

## igx-bottom-nav

### Properties

| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `items` |  QueryList<IgxTabItemDirective> | Observable collection of `IgxTabItemDirective` content children. |
| `selectedIndex` | number | Gets the index of selected tab/item in the respective collection. Default value: -1. |
| `selectedItem` | IgxTabItemDirective | Gets the selected `IgxTabItemDirective` in the bottom-nav based on selectedIndex. |


### Events

| Name       |               Description                |
|:---------- |:-----------------------------------------|
| `selectedIndexChange` | Emitted when the new tab item is selected. |
| `selectedIndexChanging` | Emitted before new tab item is selected. This event is cancelable|
| `selectedItemChange` | Emitted when the new tab item is selected. |

## igx-bottom-nav-item

### Properties

| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `selected` | boolean |  Determines whether the item is selected. |
| `disabled` | boolean | Determines whether the item is disabled. |
