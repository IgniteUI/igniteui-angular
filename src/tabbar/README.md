# igx-bottom-nav

#### Category
_Components_

## Description
_igx-bottom-nav represents a single content area with multiple panels, each associated with a tab. Tabs are located at the bottom of the component._  
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tabbar.html)

### More Info
igx-bottom-nav provides two observable collections (QueryLists): one with panels and one with related tabs. 
The children components of the igx-bottom-nav are: 

-  *Igx-Tab-Panel* - represents the wrapper of the content that needs to be displayed
- *Igx-Tab* - button that triggers displaying of the associated panel

Each tab (Igx-Tab) is related to particular panel (Igx-Tab-Panel). When tab is clicked, the associated panel is selected and visualized into a single container.
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

#Igx-Tab-Panel

#### Category
_Child components_

## Description
_Child component of igx-bottom-nav, that represents the container of the content need to be displayed._

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

#Igx-Tab

#### Category
_Child components_

## Description
_Child component of igx-bottom-nav, that represents the button that triggers displaying of the associated panel._

## Properties
- `id` - Unique identifier of the component. If not provided it will be automatically generated.
- `isDisabled` - Determines whether the tab is disabled
- `isSelected` - Determines whether the tab is selected
- `index` - Gets the index of a tab in the tab collection
- `relatedPanel` - Get the panel, associated with the tab

## Methods
- `select` - Select the tab and the associated panel

----------
## Usage

    <igx-bottom-nav>
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
	</igx-bottom-nav>
