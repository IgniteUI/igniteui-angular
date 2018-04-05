import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs/Rx";
import { IgxGridCellComponent } from "../../lib/grid/cell.component";
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
    public selection;
    public newRecord = "";
    public editCell;
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

    public handleRowSelection(args) {
        const targetCell = args.cell as IgxGridCellComponent;
        if  (!this.selection) {
            this.grid1.deselectAllRows();
            this.grid1.selectRows([targetCell.row.rowID]);
        }
    }

    public toggle() {
        if (this.grid1.selectedRows().length === 0) {
            this.grid1.selectRows([1, 2, 5]);
        } else {
            this.grid1.selectRows([]);
        }
    }

    public toggleSingle() {
        this.grid1.rowList.toArray()[6].isSelected = !this.grid1.rowList.first.isSelected;
    }

    public toggleAll() {
        if (this.grid1.selectedRows().length === 0) {
            this.grid1.selectAllRows();
        } else {
            this.grid1.selectRows([]);
        }
    }

    public isThirdSelected() {
        return this.grid1.getRowByKey(3).isSelected;
    }
}
