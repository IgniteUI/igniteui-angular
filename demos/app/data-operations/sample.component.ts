import { Component, OnInit, ViewChild } from "@angular/core";
import { IDataColumn } from "../../../src/data-operations/test-util/data-generator";
import {
    DataContainer,
    DataType,
    FilteringCondition,
    IDataState,
    IgxTab,
    IgxTabBar,
    IgxToast,
    IgxToastPosition,
    ISortingState,
    SortingDirection
} from "../../../src/main";
import { DataStateConfiguratorComponent } from "./data-state-configurator.component";
// import services
import {LocalDataService} from "./local-data.service";
import {RemoteDataService} from "./remote-data.service";

@Component({
    moduleId: module.id,
    providers: [RemoteDataService, LocalDataService],
    selector: "data-util-sample",
    templateUrl: "./sample.component.html"
})
export class DataOperationsSampleComponent implements OnInit {
    // remoteData: Observable<DataContainer>;
    public remoteDataContainer: DataContainer = new DataContainer();
    public localDataContainer: DataContainer = new DataContainer();
    @ViewChild("localDataStateConfig") public localDataStateConfig: DataStateConfiguratorComponent;
    @ViewChild("remoteDataStateConfig") public remoteDataStateConfig: DataStateConfiguratorComponent;
    // paging sample vars
    @ViewChild("toast") public toast: IgxToast;

    public message: string = "";
    constructor(private remoteDataService: RemoteDataService,
                private localDataService: LocalDataService) {
    }
    public ngOnInit() {
        this.initRemoteData();
        this.initLocalData();
    }
    public initRemoteData() {
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
    public initLocalData() {
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
    public processRemoteData(dataState: IDataState) {
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
    public processLocalData(dataState: IDataState) {
        const startTime = new Date().getTime();
        this.localDataContainer.process(dataState);
        const processTime = new Date().getTime() - startTime;
        const msg = `Processing ${this.localDataContainer.data.length} records for ${processTime} ms`;
        this.localDataStateConfig.setMetadataInfo(msg);
    }
}
