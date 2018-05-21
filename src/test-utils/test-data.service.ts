export class TestData {

    /* Fields: index: number, value: number; 2 items. */
    public numberDataTwoFields = [
        { index: 1, value: 1},
        { index: 2, value: 2}
    ];

    /* Fields: index: number, value: number, other: number, another: number; 2 items. */
    public numberDataFourFields = [
        { index: 1, value: 1, other: 1, another: 1},
        { index: 2, value: 2, other: 2, another: 2}
    ];

    /* Data fields: FirstName: string, LastName: string, age:number; 3 items. */
    public personNameAgeData = [
        { FirstName: "John", LastName: "Brown", age: 20 },
        { FirstName: "Ben", LastName: "Affleck", age: 30 },
        { FirstName: "Tom", LastName: "Riddle", age: 50 }
    ];

    public generateNumberData(rowsCount: number) {
        const data = [];
        for (let i = 0; i < rowsCount; i++) {
            data.push({ index: i, value: i, other: i, another: i });
        }
        return data;
    }

    public generateNumberDataSpecial(numRows, numCols, defaultColWidth = null) {
        const cols = [];
        for (let j = 0; j < numCols; j++) {
            cols.push({
                field: j.toString(),
                width: defaultColWidth !== null ? defaultColWidth : j % 8 < 2 ? 100 : (j % 6) * 125
            });
        }

        const data = [];
        for (let i = 0; i < numRows; i++) {
            const obj = {};
            for (let j = 0; j <  cols.length; j++) {
                const col = cols[j].field;
                obj[col] = 10 * i * j;
            }
            data.push(obj);
        }
        return data;
    }

}
