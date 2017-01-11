#igxFilter

#### Category
_Directives_

## Description
_Filters a datasource or items in list-based widget._

### More Info
igxFilter can be used to filter data source of list-base widgets, like list, tabbar, carousel, etc. It can be applied as a pipe or as a directive.  
igxFilter is not coupled to any specific widget and it can filters any  widget that represent list of items.  
The widgets that cannot use igxFilter are those which purpose is more visual, than data representative. _Example: avatar, checkbox, progressbas, etc._

## Options

**Filter options** collects all configurations of igxFilter:  

 * `inputValue` - Input text value that will be used as a filtering pattern (matching condition is based on it)  
 * `key` - Item property, which value should be used for filtering  
 * `items` - Represent items of the list. It should be used in scenarios where filter is directive
 * `get_value` - Function - get value to be tested from the item. Default behavior: if key is provided - returns item value, otherwise returns item text content
 * `formatter` - Function - formats the original text before matching process. Default behavior: returns text to lower case
 * `matchFn`- Function - determines whether the item met the condition. Default behavior: "contains"
 * `metConditionFn` - Function - executed after matching test for every matched item. Default behavior: shows the item
 * `overdueConditionFn` - Function - executed for every NOT matched item after matching test. Default behavior: hides the item

## Events

 * `filtering` - Triggered before the filtering process.  
The handler of this event will be executed synchronously (the filtering will be processed after the handler is executed). Gives you a chance to cancel the filtering before it is processed, by the Boolean property `cancel` of the input object.

 * `filtered` - Triggered after the filtering is done. Returns an object with property `filteredItems` - the result of the filtering.

## Usage

### As a pipe

Code in template:

	<input [(ngModel)]="search1" />
    <igx-list>
        <igx-list-item *ngFor="let item of navItems | igxFilter: fo">{{item.text}}</igx-list-item>
    </igx-list>

Code in .ts:
	
	navItems: Array<Object> = [
            { id:"1", text: "Item 1" },
            { id:"2", text: "Item 2" },
            { id:"3", text: "Item 3" },
            { id:"4", text: "Item 4" }
        ];

    get fo() {
        var _fo = new IgxFilterOptions();
        _fo.key = "text";
        _fo.inputValue = this.search1;
        return _fo;
    }

### As a directive

Code in template:

	<input [(ngModel)]="search1" />
	<igx-list [igxFilter]="fo">
        <igx-list-header>Mildly Sweet</igx-list-header>
        <igx-list-item>Golden Delicious</igx-list-item>
        <igx-list-item>Cosmic Crisp</igx-list-item>
        <igx-list-item>Pinova</igx-list-item>
    </igx-list>

Code in .ts:

    get fo() {
        var _fo = new IgxFilterOptions();
        _fo.key = "text";
        _fo.inputValue = this.search1;
        return _fo;
    }