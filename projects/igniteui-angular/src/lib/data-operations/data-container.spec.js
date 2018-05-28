"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_generator_1 = require("./test-util/data-generator");
var data_container_1 = require("./data-container");
var filtering_condition_1 = require("./filtering-condition");
var paging_state_interface_1 = require("./paging-state.interface");
var sorting_expression_interface_1 = require("./sorting-expression.interface");
describe("DataContainer", function () {
    var dataGenerator;
    var data;
    var dc;
    beforeEach(function () {
        dataGenerator = new data_generator_1.DataGenerator();
        data = dataGenerator.data;
        dc = new data_container_1.DataContainer(data);
    });
    it("tests process", function () {
        // test filtering
        dc.state = {
            filtering: {
                expressions: [
                    {
                        condition: filtering_condition_1.FilteringCondition.number.greaterThanOrEqualTo,
                        fieldName: "number",
                        searchVal: 1
                    }
                ]
            }
        };
        dc.process();
        expect(dataGenerator.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([1, 2, 3, 4]);
        expect(dataGenerator.getValuesForColumn(dc.data, "number"))
            .toEqual([0, 1, 2, 3, 4]);
        // apply sorting without removing filtering
        dc.state.sorting = {
            expressions: [
                {
                    dir: sorting_expression_interface_1.SortingDirection.Desc,
                    fieldName: "number"
                }
            ]
        };
        dc.process();
        expect(dataGenerator.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([4, 3, 2, 1]);
        expect(dataGenerator.getValuesForColumn(dc.data, "number"))
            .toEqual([0, 1, 2, 3, 4]);
        // apply paging(+filtering and sorting)
        dc.state.paging = {
            index: 1,
            recordsPerPage: 3
        };
        dc.process();
        expect(dataGenerator.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([1]);
        expect(dc.state.paging.metadata.countPages)
            .toEqual(2);
    });
    it("tests sort", function () {
        // apply sorting without removing filtering
        var res;
        var sortingState = {
            expressions: [
                {
                    dir: sorting_expression_interface_1.SortingDirection.Desc,
                    fieldName: "number"
                }
            ]
        };
        res = dc.process({ sorting: sortingState });
        expect(dataGenerator.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([4, 3, 2, 1, 0]);
        expect(dc.state.sorting)
            .toEqual(sortingState);
    });
    it("tests filter", function () {
        // apply sorting without removing filtering
        var res;
        var filteringState = {
            expressions: [
                {
                    condition: filtering_condition_1.FilteringCondition.number.doesNotEqual,
                    fieldName: "number",
                    searchVal: 4
                }
            ]
        };
        res = dc.process({ filtering: filteringState });
        expect(dataGenerator.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([0, 1, 2, 3]);
        expect(dc.state.filtering)
            .toEqual(filteringState);
    });
    it("tests page", function () {
        // apply sorting without removing filtering
        var pagingState = {
            index: 0,
            recordsPerPage: 4
        };
        dc.process({ paging: pagingState });
        expect(dataGenerator.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([0, 1, 2, 3]);
        expect(dc.state.paging.metadata.countPages)
            .toEqual(2);
        expect(dc.state.paging.metadata.error)
            .toEqual(paging_state_interface_1.PagingError.None);
        pagingState.index = 1;
        dc.process({ paging: pagingState });
        expect(dataGenerator.getValuesForColumn(dc.transformedData, "number"))
            .toEqual([4]);
        expect(dc.state.paging.metadata.countPages)
            .toEqual(2);
        expect(dc.state.paging.metadata.error)
            .toEqual(paging_state_interface_1.PagingError.None);
    });
    // test CRUD operations
    it("tests `addRecord`", function () {
        var record = {
            number: -1
        };
        dc.addRecord(record);
        expect(dc.data).toBeTruthy();
        expect(dc.data.length).toBe(6);
        expect(dc.data[5]).toEqual(record);
        // add at specific position
        record = { number: -2 };
        dc.addRecord(record, 0);
        expect(dc.data.length).toBe(7);
        expect(dc.data[0]).toEqual(record);
    });
    it("tests `deleteRecord`", function () {
        var record = data[0];
        // remove first element
        var res = dc.deleteRecord(record);
        expect(res).toBeTruthy();
        expect(dc.data.length).toBe(4);
        expect(dataGenerator.getValuesForColumn(dc.data, "number"))
            .toEqual([1, 2, 3, 4]);
    });
    it("tests `deleteRecordByIndex`", function () {
        // remove first element
        var res = dc.deleteRecordByIndex(0);
        expect(res).toBeTruthy();
        expect(dc.data.length).toBe(4);
        expect(dataGenerator.getValuesForColumn(dc.data, "number"))
            .toEqual([1, 2, 3, 4]);
    });
    it("tests `updateRecordByIndex`", function () {
        var recordCopy = Object.assign({}, data[0]);
        var res = dc.updateRecordByIndex(0, { number: -1 });
        recordCopy.number = -1;
        expect(dc.data[0]).toEqual(recordCopy);
    });
    it("tests `getRecordInfoByKeyValue`", function () {
        var recordInfo = dc.getRecordInfoByKeyValue("number", 0);
        expect(recordInfo.index === 0 && recordInfo.record === dc.data[0])
            .toBeTruthy("tests getRecordInfoByKeyValue('number', 0)");
        recordInfo = dc.getRecordInfoByKeyValue("number", -1);
        expect(recordInfo.index === -1 && recordInfo.record === undefined)
            .toBeTruthy("tests getRecordInfoByKeyValue('number', -1)");
    });
    it("tests `getIndexOfRecord`", function () {
        var index = dc.getIndexOfRecord(data[1]);
        expect(index).toBe(1, "original data");
        index = dc.getIndexOfRecord(data[0], data_container_1.DataAccess.TransformedData);
        expect(index).toBe(0, "transformed data");
    });
    it("tests `getRecordByIndex`", function () {
        var rec = dc.getRecordByIndex(0);
        expect(rec).toBe(data[0], "original data");
        rec = dc.getRecordByIndex(0, data_container_1.DataAccess.TransformedData);
        expect(rec).toBe(dc.transformedData[0], "transformed data");
    });
});

//# sourceMappingURL=data-container.spec.js.map
