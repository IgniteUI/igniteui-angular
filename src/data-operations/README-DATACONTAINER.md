# DataContainer

## Description
**DataContainer** is a wrapper class of original data - array of JavaScript objects. It allows to apply in-memory data operations like - filtering, sorting, paging, CRUD(Create, Read, Update, Delete) operations.  Original data is saved in property `data` and result data(on which data operations are applied) is saved in property `transformedData`.

#API Summary

## Properties
| Name   | Type |  Description |
|:----------|:-------------|:-------------|
|  `data` | Array of JavaScript objects | represents original data |
| `transformedData` | Array of JavaScript objects | When functoin `process` is called data operations defined in argument data state are applied and result data is saved in property `transformedData` |
| `state`| object of type **DataState** | It defines which data operations should be applied when function `process` is called. |

## Methods
| Name   |  Description |
|:----------|:-------------|
| `process` | Takes as argument object of type **DataState**(optional). If this argument is set then assign it to property `state`. The method sets value of `transformedData` to `data` and applies data operations defined in propety `state`. Result of processed data is saved in property `transformedData`. The method returns instance of DataContainer(allows chaining). |
| `getIndexOfRecord` |  Takes as arguments: object representing data record and varible of type **DataAccess**(with default value OriginalData). It searches in collection specified by dataAccess(original or transformed data) and returns index of the found record. If record is not found returns -1.   |
| `getRecordByIndex` | Takes as arguments: index of record and varible of type **DataAccess**(with default value OriginalData). It searches in collection specified by dataAccess(original or transformed data) and returns object representing data record. If record is not found returns `undefined`.  |
| `getRecordInfoByKeyValue` |  Takes as arguments: column key, search value and varible of type **DataAccess**(with default value OriginalData). It searches in collection specified by dataAccess(original or transformed data) record with property specified in column key that has value equals to search value. It returns variable of type **RecordInfo** with properties `index` and `record`. If record is not found then `index` of result object is -1 and `record` is undefined. |
| `addRecord` | Takes as arguments: object representing data record and optional variable identifying position. If position is not set then adds it to the end of the original data otherwise at the specified position  |
| `deleteRecord`| Takes as argument object representing data record. It tries to remove data record from the original data. If data record is found and removed from the array returns true, otherwise false |
| `deleteRecordByIndex`| Takes as argument index. It tries to remove data record specified by the index from the original data. If data record is found and removed from the array returns true, otherwise false |
| `updateRecordByIndex`| Takes as argument index and object representing new record properties. It finds a data record specified by the index from the original data and updates its properties specified by the second argument. It returns updated record |


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
        let dataContainer: DataContainer = new DataContainer(items);
        dataContainer.process(state);
        let res = dataContainer.transformedData;
```
# Additional interfaces, enums and classes used in DataContainer 
 * **DataAccess** - enumaration representing which data should be taken from data container. Possible values are: 
    * **DataAccess.OriginalData** - takes orinal data
    * **DataAccess.TransformedData** - takes transformed data
* **RecordInfo** - interface which represents reference to data record and  and index of this data record in the collection. Its properties are:
    * `index` - record index in data collection
    * `record` - object representing data record