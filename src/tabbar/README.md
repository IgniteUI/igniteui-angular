#IgxTabBar

#### Category
_Components_

## Description
_IgxTabBar represents a single content area with multiple panels, each associated with a tab._

### More Info
IgxTabBar provides two observable collections (QueryLists): one with panels and one with related tabs. 
The children components of the IgxTabBar are: 

-  *IgxTabPanel* - represents the wrapper of the content that needs to be displayed
- *IgxTab* - button that triggers displaying of the associated panel

Each tab (IgxTab) is related to particular panel (IgxTabPanel). When tab is clicked, the associated panel is selected and visualized into a single container.
There should always be a selected tab. Only one tab can be selected at a time.

## Properties
- `tabs` - Observable collection of all IgxTab view children
- `panels` - Observable collection of all IgxTabPanel content children
- `selectedIndex` - Gets the index of selected tab/panel in the respective collection. Default value: -1
- `selectedTab` - Gets the selected IgxTab in the tabbar based on `selectedIndex`

## Events
- `onTabSelected` - Fired when new tab is selected
- `onTabDeselected` - Fired when tab is deselected

----------

#IgxTabPanel

#### Category
_Child components_

## Description
_Child component of IgxTabBar, that represents the container of the content need to be displayed._

## Properties
- `isSelected` - Determines whether the panel is selected
- `isDisabled` - Determines whether the panel is disabled
- `index` - Gets the index of a panel in the panel collection
- `relatedTab` - Get the tab, associated with the panel
- `label` - Defines the label on the associated tab
- `icon` - Defines the icon on the associated tab

## Methods

- `select` - Select the panel and the associated tab

----------

#IgxTab

#### Category
_Child components_

## Description
_Child component of IgxTabBar, that represents the button that triggers displaying of the associated panel._

## Properties
- `isDisabled` - Determines whether the tab is disabled
- `isSelected` - Determines whether the tab is selected
- `index` - Gets the index of a tab in the tab collection
- `relatedPanel` - Get the panel, associated with the tab

## Methods
- `select` - Select the tab and the associated panel

----------
## Usage

    <igx-tab-bar>
		<igx-tab-panel label="Tab 1">
    		<h1>Tab 1 Content</h1>
    		<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    	</igx-tab-panel>
    	<igx-tab-panel label="Tab 2">
	    	<h1>Tab 2 Content</h1>
	    	<p>Lorem ipsum dolor sit amet...</p>
    	</igx-tab-panel>
    	<igx-tab-panel label="Tab 3">
	    	<h1>Tab 3 Content</h1>
	    	<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vitae malesuada odio.</p>
    	</igx-tab-panel>
	</igx-tab-bar>