# igxFilter

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
 * `key` - Item property, which value should be used for filtering. Can also be an array of properties - an item matches when the value of any of them matches
 * `items` - Represent items of the list. It should be used in scenarios where filter is directive. When set, these items are filtered instead of the ones passed to the pipe
 * `get_value` - Function - get value to be tested from the item. Default behavior: if key is provided and the item value for it is not `null` or `undefined` (falsy values like `0` or `false` are included) - returns the item value as string, otherwise returns the item element text content
 * `formatter` - Function - formats the original text before matching process. Default behavior: returns text to lower case. The formatter is applied only to the item value, not to the `inputValue`
 * `matchFn`- Function - determines whether the item met the condition. Default behavior: "contains", with the `inputValue` in lower case. When `inputValue` is `null` or `undefined`, an empty string is passed to the function
 * `metConditionFn` - Function - executed after matching test for every matched item. Default behavior: shows the item
 * `overdueConditionFn` - Function - executed for every NOT matched item after matching test. Default behavior: hides the item

`metConditionFn` and `overdueConditionFn` are called once per item, also when filtering by multiple keys.

## Events

 * `filtering` - Triggered before the filtering process.  
The handler of this event will be executed synchronously (the filtering will be processed after the handler is executed). Gives you a chance to cancel the filtering before it is processed, by the Boolean property `cancel` of the input object.

 * `filtered` - Triggered after the filtering is done. Returns an object with property `filteredItems` - the result of the filtering.

The directive filters the items only when the `inputValue` of the bound options changes, so a new options instance should be provided for each change (for example with a getter, as in the samples below).

## Usage

### As a pipe

When the items to filter are empty, `null` or `undefined`, or no options are provided, the pipe returns the items as they are.

Code in template:

    <input [(ngModel)]="search1" />
    <igx-list>
        @for (item of navItems | igxFilter: fo; track item.id) {
            <igx-list-item>{{item.text}}</igx-list-item>
        }
    </igx-list>

Code in .ts:

    navItems: Array<Object> = [
        { id:"1", text: "Item 1" },
        { id:"2", text: "Item 2" },
        { id:"3", text: "Item 3" },
        { id:"4", text: "Item 4" }
    ];

    get fo() {
        const _fo = new IgxFilterOptions();
        _fo.key = "text";
        _fo.inputValue = this.search1;
        return _fo;
    }

To filter by multiple properties, set `key` to an array:

    _fo.key = ["id", "text"];

### As a directive

Code in template:

    <input [(ngModel)]="search1" />
    <igx-list [igxFilter]="fo">
        <igx-list-item [isHeader]="true">Mildly Sweet</igx-list-item>
        <igx-list-item>Golden Delicious</igx-list-item>
        <igx-list-item>Cosmic Crisp</igx-list-item>
        <igx-list-item>Pinova</igx-list-item>
    </igx-list>

Code in .ts:

    @ViewChild(IgxListComponent, { static: true })
    list: IgxListComponent;

    get fo() {
        const _fo = new IgxFilterOptions();
        _fo.items = this.list.items;
        _fo.inputValue = this.search1;
        return _fo;
    }
