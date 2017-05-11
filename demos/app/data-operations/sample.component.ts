import { Component, OnInit, ViewChild } from "@angular/core";
import { IDataColumn } from "../../../src/data-operations/test-util/data-generator";
import { DataContainer,  DataType, FilteringCondition,
        IDataState,
        ISortingState, SortingDirection
      } from "../../../src/main";
import {IgxToast, IgxToastPosition} from "../../../src/main";
import {IgxTab, IgxTabBar} from "../../../src/main";
import { DataStateConfiguratorComponent } from "./data-state-configurator.component";
// import services
import {LocalDataService} from "./local-data.service";
import {RemoteDataService} from "./remote-data.service";

@Component({
    providers: [RemoteDataService, LocalDataService],
    selector: "data-util-sample",
    moduleId: module.id,
    templateUrl: "./sample.component.html"
})
export class DataOperationsSampleComponent implements OnInit {
    //remoteData: Observable<DataContainer>;
    remoteDataContainer: DataContainer = new DataContainer();
    localDataContainer: DataContainer = new DataContainer();
    @ViewChild("localDataStateConfig") localDataStateConfig: DataStateConfiguratorComponent;
    @ViewChild("remoteDataStateConfig") remoteDataStateConfig: DataStateConfiguratorComponent;
    // paging sample vars
    @ViewChild("toast") toast: IgxToast;

    message: string = "";
    constructor(private remoteDataService: RemoteDataService,
                private localDataService: LocalDataService) {
    }
    ngOnInit() {
        this.initRemoteData();
        this.initLocalData();
    }
    initRemoteData() {
        const columns: IDataColumn[] = [
            {
                fieldName: "ProductID",
                type: DataType.Number
            },
            {
                fieldName: "ProductName",
                type: DataType.String
            },
            {
                fieldName: "QuantityPerUnit",
                type: DataType.String
            },
            {
                fieldName: "UnitsInStock",
                type: DataType.Number
            }
        ];
        const initialDataState: IDataState = {};
        this.remoteDataStateConfig.columns = columns;
        this.remoteDataStateConfig.dataState = initialDataState;
        this.processRemoteData(initialDataState);
    }
    initLocalData() {
        const initialDataState: IDataState = {
            paging: {
                index: 0,
                recordsPerPage: 5
            }
        };
        const cols = this.localDataService.getColumns();
        this.localDataStateConfig.dataState = initialDataState;
        this.localDataStateConfig.columns = cols;
        this.localDataService
            .getData()
            .then((data) => {
                this.localDataContainer.data = data as any[];
                this.processLocalData(initialDataState);
            });
    }
    processRemoteData(dataState: IDataState) {
        this.remoteDataStateConfig.stateLoading = true;
        this.toast.message = "Loading remote data";
        this.remoteDataStateConfig.setMetadataInfo("Requesting data");
        this.toast.show();
        this.remoteDataService
            .getData(dataState)
            .then((response) => {
                this.toast.hide();
                this.remoteDataStateConfig.stateLoading = false;
                this.remoteDataContainer.data = response.value;
                this.remoteDataContainer.transformedData = response.value;
                this.remoteDataContainer.state = dataState;
                const msg: string = `Data container with ${this.remoteDataContainer.data.length} records.`;
                this.remoteDataStateConfig.setMetadataInfo(msg);
            });
    }
    processLocalData(dataState: IDataState) {
        const startTime = new Date().getTime();
        this.localDataContainer.process(dataState);
        const processTime = new Date().getTime() - startTime;
        const msg = `Processing ${this.localDataContainer.data.length} records for ${processTime} ms`;
        this.localDataStateConfig.setMetadataInfo(msg);
    }
}
