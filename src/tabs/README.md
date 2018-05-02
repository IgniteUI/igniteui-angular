# igx-tabs

The **igx-tabs** component allows you to add tabs component with tab items positioned at the top and item content in your application.
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tabs.html).

# Usage
```html
<igx-tabs>
    <igx-tabs-group label="Tab1">
        <div class="tab-content">
            <h3>Tab 1 Content</h3>
        </div>
    </igx-tabs-group>
    <igx-tabs-group label="Tab2">
        <div class="tab-content">
            <h3>Tab 2 Content</h3>
        </div>
    </igx-tabs-group>
</igx-tabs>
```

## Tabs Type
There are two tabs types that specify the sizing mechanism of the items.
 - `contentfit` (default)
 - `fixed` 


You can set the tabs type using the `tabsType` input.

### Fixed Type
All tabs items have equal size. The width of each tab is calculated by taking the width of the view and dividing it by the number of tabs. The width is in the range of min/max widths specified in Material Design.
If the avarage width is less than the min-width, min-width is set to the item.
If the avarage width is greater than the max-width, max-width is set to the item and ellipsis are added.
If the total visible items width exceeds the vew port width, scroll buttons are displayed.

### Content-fit Type
Tabs item width depends of its content. The width is in the range of min/max widths specified in Material Design.
If the total visible items width exceeds the vew port width, scroll buttons are displayed.

# API Summary

## Inputs

| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `selectedIndex` |  number | The index of the selected tab. |
| `selectedTabItem` | IgxTabItemComponent | The last selected tab. |
| `icon` | string | Set the icon to the item. Currently all icons from the material icon set are supported. |
| `label` | string | Set the tab item text. |
| `isDisabled` | boolean | 	Set if the tab is enabled/disabled.	 |
| `tabsType` | TabsType | 	Set the tab item sizing mode. By default, `contentfit` is set, the tab item width is sized to its content in the range of min/max width. When the sizing type is `fixed` - all tabs have equal size to fit the view port. |

## Events

| Name   |      Description      |
|:----------|:-------------:|:------|
| `onTabItemSelected` | Emitted when the tab item is selected. |
| `onTabItemDeselected` | Emitted when the tab item is deselected. |

