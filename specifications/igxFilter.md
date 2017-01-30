#igxFilter Specification

## Overview
igxFilter should represent filter functionality for data source of list-base widgets, like list, tabbar, carousel, etc or their items.

igxFilter as a pipe:

    <igx-list>
        <igx-list-item *ngFor="let item of navItems | igxFilter"></igx-list-item>
    </igx-list>

igxFilter as a directive:

	<igx-list [igxFilter]="filterOptions">
        <igx-list-item>Item 1</igx-list-item>
        <igx-list-item>Item 2</igx-list-item>
        <igx-list-item>Item 3</igx-list-item>
    </igx-list>

## Objectives
igxFilter should be able to filter data source of widget as a pipe or to be set as a directive on a widget and to filter its items. It should be highly customizable and should support multiple user scenarios. E.g: filter by "contains", "starts with", "ends with" etc.
The igxFilter should not be coupled to any widget, just to operates with its items or datasource.

## User Stories

### Developer
As developer, I want:

* igxFilter to support many scenarios of filtering: "contains", "starts with", "ends with" etc.
* to manipulate the input and output data: such as input value, items, result
* manage how the filter affect the matched and the dissociable items
* to be able to cancel the filtering

### End user
As a end user, I want to:

* type into an input field and the widget should filter its items on every change

## API

### Options
You should be able to configure the igxFilter by passing an Options object to it. It should be able to override methods of Options object.
Also the default behaviors of method should be implemented. The defined options, set as filterOptions should override the default options of igxFilter.

* Properties

 * `inputValue` - should set the input value (filter value).
	Type: string
 * `key` - define a key for datasource.
    Type: string
 * `items` - should represent items of widget for scenarios where filter is directive.
 	Type: Array of objects

* Methods

 * `get_value` - should get value (from datasource or from items, depends on whether igxFilter is pipe or directive) that will be tested with the input value.
 	Type: Function
 _Default behavior: if key is provided - should return value from datasource, otherwise should return item element text content._
 * `formatter` - should be able to manipulate the original text before matching process.
 	Type: Function
  _Default behavior: should return text to lower case._
 * `matchFn`- should determine whether the item met the condition.
 	Type: Function
   _Default behavior: "contains" should be implemented._
 * `metConditionFn` - should be able to manipulate every matched item after the matching test.
    Type: Function
 	_Default behavior: the matched item should be shown_
 * `overdueConditionFn` - should be able to manipulate every dissociable item after the matching test.
    Type: Function
 	_Default behavior: dissociable item should be hidden_

### Events

 * `filtering` - it should be triggered before the filtering process.
It should be cancelable by the Boolean property `cancel` of the input object.

 * `filtered` - it should triggered after the filtering is done.

## Implementation

Use Angular 2 pipe to implement igxFilter - [https://angular.io/docs/ts/latest/guide/pipes.html](https://angular.io/docs/ts/latest/guide/pipes.html). Filtering the datasource comes as a native purpose of Angular 2 pipes:
> A pipe takes in data as input and transforms it to a desired output.

For the part where igxFilter should be set as a directive, some additional implementation will be needed.

1. Because the items of the widget will be rendered already, the DOM elements of items should be pass to the igxFilter instead of datasource. Use the options object and it property `items` to pass them.
2. `OnChanges` hook should be used to filter which change is significant for the igxFilter - [https://angular.io/docs/ts/latest/api/core/index/OnChanges-class.html](https://angular.io/docs/ts/latest/api/core/index/OnChanges-class.html). We are looking only for the changes of the input value of igxFilter.
3. The pipe should implement PipeTransform interface - [https://angular.io/docs/ts/latest/api/core/index/PipeTransform-interface.html](https://angular.io/docs/ts/latest/api/core/index/PipeTransform-interface.html). It demands implementation of `transform` method, where all the filtering logic should be embedded.
