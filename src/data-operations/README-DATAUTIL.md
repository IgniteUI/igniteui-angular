# DataUtil

## Description
**DataUtil** is a static class which provides a set of helper functoins for querying local data - array of JavaScript objects. 
It can be used for applying data operations like - filtering, sorting, paging.


# API Methods
| Name   |  Description |
|:----------|:-------------|
| `sort` | Takes as arguments array of JavaScript objects(on which sorting is applied) and object of type **SortingState**. The method returns sorted data. Object of type **SortingState** is used to configure which column(s) to sort,sorting direction, sorting algorithm.  |
| `filter` | Takes as arguments array of JavaScript objects(on which filtering should be applied) and object of type **FilteringState**. Returns filtered data(array of JavaScript objects). Object of type **FilteringState** is used to configure which column(s) to filter, search value, filtering algorithm. |
| `page` |  Takes as arguments array of JavaScript objects and object of type **PagingState**. Returns paginated data. Object of type **PagingState** is used to configure how paging should be applied - which is the current page, records per page. NOTE: This method validates input arguments(e.g. page index should be positive number) and calculates number of pages. The result is saved in property of **PagingState** - `metadata`. |
| `process` | Takes as arguments array of JavaScript objects and object of type **DataState** and applies sorting/paging/filtering. Returns transformed data. Object of type **DataState** is used to configure which data-quering operation to be applied.  |
| `getFilteringConditionsForDataType` |  Takes as argument variable of type **DataType** and returns available filtering condition for the specified data type |
| `getListOfFilteringConditionsForDataType` | Takes as an argument data type and returns list of name of the filtering conditions available for the specified data type |


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
    * `expressions` - array of objects of type  **FilteringExpression**. It defines which column(s) should be filtered, filtering conditions and (if any)search value on which filtering should be applied. 
    * `strategy` - object of type **FilteringStrategy**. It represents filtering algorithm. (optional)
    * `logic` - it defines how to apply multiple filtering expressions - "AND", "OR". It is of type **FilteringLogic**(enum) and possible values are **FilteringLogic.And**, **FilteringLogic.Or**. (optional)
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
* **FilteringExpression** - interface which defines how filterin should be applied for each column. Its properties are:
    * `fieldName` - specifies name of the column
    * `condtion` - specifies filteirng condition. It should be function which accepts as argumennts:
        * `value` - value of the record on which filtering is applied
        * `searchVal` - search value. There are filtering conditions which do not require searchVal. Example - FilteringCondition.Boolean.True.(optional)
        * `ignoreCase` - boolean variable which specifies case-sensitivity for string columns(optional) 
    * `searchVal` - specifies value to search for.(optional)
    * `ignoreCase` - boolean variable which specifies case-sensitivity for string columns(optional) 
* **SortingStrategy** - class which implements **ISortingStrategy** interface. It specifies sorting algorithm.
* **FilteringStrategy** - class which implements **IFilteringStrategy** interface. It specifies filtering algorithm.
* **DataType** - enumaration which represent basic data types. Its values are:
    * **DataType.Boolean**
    * **DataType.Date**
    * **DataType.Number**
    * **DataType.String**
    
