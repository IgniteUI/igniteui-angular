import { Injectable } from "@angular/core";
import { IDataColumn, DataGenerator } from "../../../src/data-operations/test-util/data-generator";
@Injectable()
export class LocalDataService {
    private dataGenerator: DataGenerator = new DataGenerator(100000, 4);
    getColumns(): IDataColumn[] {
        return this.dataGenerator.columns;
    }
    getData() {
        return new Promise((resolve, rejct) => {
            resolve(this.dataGenerator.data);
        });
    }
}
