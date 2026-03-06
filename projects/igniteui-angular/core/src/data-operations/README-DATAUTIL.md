# DataUtil

## Description
**DataUtil** is a static class which provides a set of helper functions for querying local data - array of JavaScript objects. 
It can be used for applying data operations like - filtering, sorting, paging.


# API Methods
| Name   |  Description |
|:----------|:-------------|
| `sort` | Takes as arguments array of JavaScript objects(on which sorting is applied) and object of type **SortingState**. The method returns sorted data. Object of type **SortingState** is used to configure which column(s) to sort,sorting direction, sorting algorithm.  |
| `filter` | Takes as arguments array of JavaScript objects(on which filtering should be applied) and object of type **FilteringState**. Returns filtered data(array of JavaScript objects). Object of type **FilteringState** is used to configure which column(s) to filter, search value, filtering algorithm. |
| `page` |  Takes as arguments array of JavaScript objects and object of type **PagingState**. Returns paginated data. Object of type **PagingState** is used to configure how paging should be applied - which is the current page, records per page. NOTE: This method validates input arguments(e.g. page index should be positive number) and calculates number of pages. The result is saved in property of **PagingState** - `metadata`. |
| `process` | Takes as arguments array of JavaScript objects and object of type **DataState** and applies sorting/paging/filtering. Returns transformed data. Object of type **DataState** is used to configure which data-querying operation to be applied.  |


# Usage
Code in .ts demonstrating how to use function `process`:
```typescript
items: Array<Object> = [
            { id: 1, text: "Item 1" },
            { id: 2, text: "Item 2" },
            { id: 3, text: "Item 3" },
            { id: 4, text: "Item 4" },
            { id: 5, text: "Item 5" },
            { id: 6, text: "Item 6" }
        ];
// apply filtering, sorting and paging
        state:DataState = {
                    filtering: {
                        expressions: [{
                            fieldName: "id", 
                            condition: FilteringCondition.number.greaterThan, 
                            searchVal: 1}]
                    },
                    sorting: {
                            expressions: [
                                {
                                    fieldName: "text",
                                    dir: SortingDirection.Desc
                                }
                            ]
                        },
                    paging: {
                        index: 0,
                        recordsPerPage: 2
                    }
                };
        let res = DataUtil.process(items, state);
```
# Additional interfaces, enums and classes used in DataUtil 
* **SortingState** - interface, which defines how sorting should be applied. Its properties are:

    * `expressions` - array of objects of type **SortingExpression**. It defines which column(s) should be sorted, order of sorted columns and sorting direction.
    * `strategy` - object of type **SortingStrategy**. It represents sorting algorithm. (optional)
* **FilteringState** - interface, which defines how filtering should be applied. Its properties are:
    * `expressionsTree` - object of type  **IFilteringExpressionsTree**. It defines which column(s) should be filtered, filtering conditions, filtering logic and (if any)search value on which filtering should be applied. 
    * `strategy` - object of type **FilteringStrategy**. It represents filtering algorithm. (optional)
* **PagingState** - interface, which defines how paging should be applied. Its properties are:
    * `index` - identifies current page index(0 based positive number)
    * `recordsPerPage` - identifies count of records per page.
    * `metadata` - object which holds metadata information about paging(optional). Its properties are:
        * `countPages`
        * `error` - enum of type **PagingError**. Possible values are - **PagingError.None**,
    **PagingError.IncorrectPageIndex**,
    **PagingError.IncorrectRecordsPerPage**
        * `countRecords` - total count of records
* **SortingExpression** - interface which defines how sorting should be applied per column. Its properties are:
    * `fieldName` - specifies name of the column
    * `dir` - identifies sorting direction. It is of type enum **SortingDirection**. Possible options are **SortingDirection.Asc** and **SortingDirection.Desc**
    * `ignoreCase` - boolean property which identifies whether sorting is case-sensitive for string columns(optional)
* **FilteringExpression** - interface which defines how filtering should be applied for each column. Its properties are:
    * `fieldName` - specifies name of the column
    * `condtion` - specifies filtering condition. It should be function which accepts as arguments:
        * `value` - value of the record on which filtering is applied
        * `searchVal` - search value. There are filtering conditions which do not require searchVal. Example - FilteringCondition.Boolean.True.(optional)
        * `ignoreCase` - boolean variable which specifies case-sensitivity for string columns(optional) 
    * `searchVal` - specifies value to search for.(optional)
    * `ignoreCase` - boolean variable which specifies case-sensitivity for string columns(optional)
* **FilteringExpressionsTree** - class which implements **IFilteringExpressionsTree** interface. Describes the filtering state of a grid/column. Its properties and methods are:
    * `filteringOperands` - an array of **IFilteringExpressionsTree** or **IFilteringExpression** objects which has the same filtering logic. If applied to a grid each object describes the filtering state of a grid's column. If applied to a column each object describes one filtering expression or a branch with filtering expressions with complex filtering logic.
    * `operator` - object of type **FilteringLogic**. Defines the filtering logic for all objects in `filteringOperands` property.
    * `fieldName` - (optional). Should not be set on a grid's level. It should be set for each **FilteringExpressionsTree** in the grid's `filterOperands`. That's how the filtering state for each column is defined.
    * `find(fieldName: string)` - Returns the filtering state for a given column. Return type could be **IFilteringExpressionsTree** or **IFilteringExpression**.
    * `findIndex(fieldName: string)` - Returns the index of the filtering state for a given column.
* **SortingStrategy** - class which implements **ISortingStrategy** interface. It specifies sorting algorithm.
* **FilteringStrategy** - class which implements **IFilteringStrategy** interface. It specifies filtering algorithm.
* **FilteringLogic** - class which describes the filtering logic between the different filtering expressions. Its values are **FilteringLogic.And**, **FilteringLogic.Or**.
* **GridColumnDataType** - enumeration which represent basic data types. Its values are:
    * **GridColumnDataType.Boolean**
    * **GridColumnDataType.Date**
    * **GridColumnDataType.Number**
    * **GridColumnDataType.String**
    
