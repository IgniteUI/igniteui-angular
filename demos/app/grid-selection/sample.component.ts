import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs/Rx";
import { IgxColumnComponent } from "../../lib/grid/column.component";
import { IgxGridComponent } from "../../lib/grid/grid.component";
import {
    DataContainer,
    IDataState
} from "../../lib/main";
import { LocalService, RemoteService } from "./sample.service";

@Component({
    providers: [LocalService, RemoteService],
    selector: "sample-grid",
    templateUrl: "sample.component.html",
    styleUrls: ["../app.samples.css", "sample.component.css"]
})
export class GridSelectionComponent implements OnInit, AfterViewInit {
    @ViewChild("grid1") public grid1: IgxGridComponent;
    public data: Observable<any[]>;
    public remote: Observable<any[]>;
    public localData: any[];
    public selectedCell;
    public selectedRow;
    public newRecord = "";
    public editCell;
    public selectionConfig = {
        enabled: true, // Kendo ???
        checkboxOnly: false, // Kendo , suppressRowClickSelection - agGrid
        mode: "multiple", // Kendo , rowSelection - agGrid
        rowMultiSelectWithClick: true // agGrid; Clicking a selected row in this mode will deselect the row
    };
    constructor(private localService: LocalService,
                private remoteService: RemoteService) { }
    public ngOnInit(): void {
        this.data = this.localService.records;
        this.remote = this.remoteService.remoteData;

        this.localService.getData();

        this.localData = [
            { ID: 1, Name: "A" },
            { ID: 2, Name: "B" },
            { ID: 3, Name: "C" },
            { ID: 4, Name: "D" },
            { ID: 5, Name: "E" }
        ];
    }

    public ngAfterViewInit() {
        this.remoteService.getData(this.grid1.data);
    }

    private onRowSelection(event) {

    }

    private onSelection(event) {

    }
}
