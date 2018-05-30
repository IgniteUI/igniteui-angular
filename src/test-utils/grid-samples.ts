import { Component, TemplateRef, ViewChild } from "@angular/core";
import { IgxGridCellComponent } from "../grid/cell.component";
import { IgxDateSummaryOperand, IgxNumberSummaryOperand } from "../grid/grid-summary";
import { IGridCellEventArgs, IGridEditEventArgs } from "../grid/grid.component";
import { BasicGridComponent, BasicGridSearchComponent, GridAutoGenerateComponent,
        GridNxMComponent, GridWithSizeComponent, PagingComponent, SummariesNxMComponent } from "./grid-components";
import { IGridSelection } from "./grid-interfaces";
import { SampleTestData } from "./sample-test-data";
import { ColumnDefinitions, TemplateStrings } from "./template-strings";

@Component({
    template: `<div style="width: 800px; height: 600px;">
            ${TemplateStrings.declareGrid(` [autoGenerate]="autoGenerate"`, "", ColumnDefinitions.indexAndValue)}</div>`
})
export class GridInDivComponent extends GridAutoGenerateComponent {
    data = SampleTestData.oneItemNumberData;
    autoGenerate = false;
}

@Component({
    template: TemplateStrings.declareGrid(` width="500px"`, "", ColumnDefinitions.pinnedTwoOfFour)
})
export class PinningAndResizingComponent extends BasicGridComponent {
    data = SampleTestData.personIDNameRegionData;
}

@Component({
    template: TemplateStrings.declareGrid(` width="600px" height="600px" [autoGenerate]="false"`, "",
                ColumnDefinitions.pinnedThreeOfEight)
})
export class LargePinnedColGridComponent extends BasicGridComponent {
    data = SampleTestData.generateProductData(75);
}

@Component({
    template: TemplateStrings.declareGrid("", ` (onColumnResized)="handleResize($event)"`,
                ColumnDefinitions.gridFeatures)
})
export class SortingAndResizingComponent extends BasicGridComponent {

    public count = 0;
    public column;
    public prevWidth;
    public newWidth;

    data = SampleTestData.productInfoData;

    handleResize(event) {
                this.count++;
                this.column = event.column;
                this.prevWidth = event.prevWidth;
                this.newWidth = event.newWidth;
    }
}

@Component({
    template: TemplateStrings.declareGrid(` [height]="'800px'"`, "",
                ColumnDefinitions.resizableColsComponent)
})
export class ResizableColumnsComponent extends BasicGridComponent {

    public columns = [
        { field: "ID", resizable: true, maxWidth: 200, minWidth: 70 },
        { field: "CompanyName", resizable: true },
        { field: "ContactName", resizable: true },
        { field: "ContactTitle", resizable: true},
        { field: "Address", resizable: true },
        { field: "City", resizable: true },
        { field: "Region", resizable: true },
        { field: "PostalCode", resizable: true },
        { field: "Phone", resizable: true },
        { field: "Fax", resizable: true }
    ];

    data = SampleTestData.contactInfoDataFull;
}

@Component({
    template: TemplateStrings.declareGrid(` [height]="'800px'"`, "",
                ColumnDefinitions.iterableComponent)
})
export class ColumnsFromIterableComponent extends BasicGridComponent {

    public columns = [ "ID", "Name"];
    data = SampleTestData.personIDNameData;
}

@Component({
    template: TemplateStrings.declareGrid("", "",
                ColumnDefinitions.columnTemplates)
})
export class TemplatedColumnsComponent extends BasicGridComponent {
    data = SampleTestData.personIDNameData;

    @ViewChild("newHeader", { read: TemplateRef })
    public newHeaderTemplate: TemplateRef<any>;

    @ViewChild("newCell", { read: TemplateRef })
    public newCellTemplate: TemplateRef<any>;
}

@Component({
    template: TemplateStrings.declareGrid("", "",
            `<igx-column field="ID" [hidden]="true"></igx-column>`)
})
export class ColumnHiddenFromMarkupComponent extends BasicGridComponent {
    data = SampleTestData.personIDNameData;
}

@Component({
    template: TemplateStrings.declareGrid("", "",
                ColumnDefinitions.idNameFormatter)
})
export class ColumnCellFormatterComponent extends BasicGridComponent {
    data = SampleTestData.personIDNameData;

    public multiplier(value: number): string {
        return `${value * value}`;
    }
}

@Component({
    template: TemplateStrings.declareGrid(` height="500px"`, "",
                ColumnDefinitions.productFilterable)
})
export class FilteringComponent extends BasicGridComponent {
    data = SampleTestData.productInfoData;
}

@Component({
    template: `
        <igx-grid #gridSelection2 [data]="data" [primaryKey]="'ID'"
        [autoGenerate]="true" [rowSelectable]="true" [paging]="true" [perPage]="50">
        </igx-grid>
        <button class="prevPageBtn" (click)="ChangePage(-1)">Prev page</button>
        <button class="nextPageBtn" (click)="ChangePage(1)">Next page</button>
    `
})
export class SelectionAndPagingComponent extends BasicGridComponent {
    data = SampleTestData.generateBigValuesData(100);

    public ChangePage(val) {
        switch (val) {
            case -1:
                this.grid.previousPage();
                break;
            case 1:
                this.grid.nextPage();
                break;
            default:
                this.grid.paginate(val);
                break;
        }
    }
}

@Component({
    template: TemplateStrings.declareGrid(
            ` #gridSelection3 [primaryKey]="'ID'" [width]="'800px'" [height]="'600px'" [autoGenerate]="true" [rowSelectable]="true"`,
            "", "")
})
export class SelectionComponent extends BasicGridComponent {
    data = SampleTestData.generateBigValuesData(100);
}

@Component({
    template: TemplateStrings.declareGrid(
            ` [rowSelectable]="true"`,
            `(onRowSelectionChange)="cancelClick($event)"`,
            ColumnDefinitions.productBasic)
})
export class SelectionCancellableComponent extends BasicGridComponent {
    data = SampleTestData.foodProductData;

    public cancelClick(evt) {
        if (evt.row && (evt.row.index + 1) % 2 === 0) {
            evt.newSelection = evt.oldSelection || [];
        }
    }
}

@Component({
    template: TemplateStrings.declareGrid(
            ` #gridSelection3
            [primaryKey]="'ID'"
            [width]="'800px'"
            [height]="'600px'"
            [autoGenerate]="true"
            [rowSelectable]="true"`,
            `(onColumnInit)="columnCreated($event)"`, "")
})
export class ScrollsComponent extends BasicGridComponent {
    data = SampleTestData.generateBigDataRowsAndCols(100, 100);
    public columnCreated(column) {
        column.width = "50px";
    }
}

@Component({
    template: TemplateStrings.declareGrid(
            ` [rowSelectable]="true"`,
            "", ColumnDefinitions.productDefaultSummaries)
})
export class SummariesComponent extends BasicGridComponent {
    data = SampleTestData.foodProductData;
}
/* Maybe add SummaryColumnComponent? */

@Component({
    template: TemplateStrings.declareGrid(
            ` [width]="width" [height]="height"`,
            "", ColumnDefinitions.productDefaultSummaries)
})
export class VirtualSummaryColumnComponent extends BasicGridComponent {
    data = SampleTestData.foodProductDataExtended;

    public width = "800px";
    public height = "600px";

    public numberSummary = new IgxNumberSummaryOperand();
    public dateSummary = new IgxDateSummaryOperand();

    public scrollTop(newTop: number) {
        const vScrollbar = this.grid.verticalScrollContainer.getVerticalScroll();
        vScrollbar.scrollTop = newTop;
    }

    public scrollLeft(newLeft: number) {
        const hScrollbar = this.grid.parentVirtDir.getHorizontalScroll();
        hScrollbar.scrollLeft = newLeft;
    }

}

/* NoActiveSummariesComponent */
@Component({
    template: TemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.productBasic)
})
export class ProductsComponent extends BasicGridComponent {
    data = SampleTestData.foodProductData;
}

@Component({
    template: TemplateStrings.declareGrid(` style="margin-bottom: 20px;"`,
        ` (onColumnInit)="initColumns($event)"`,
        ColumnDefinitions.generatedWithSummaries)
})
export class DefaultSizeAndSummaryComponent extends BasicGridComponent {
    public columns = [];

    initColumns(column) {
        switch (this.grid.columnList.length) {
            case 5:
                if (column.index === 0 || column.index === 4) {
                    column.width = "200px";
                }
                break;
            case 30:
                if (column.index === 0 || column.index === 5 || column.index === 3 || column.index === 10 || column.index === 25) {
                    column.width = "200px";
                }
                break;
            case 150:
                if (column.index === 0 || column.index === 5 || column.index === 3 || column.index === 10 || column.index === 50) {
                    column.width = "500px";
                }
                break;
        }
    }

    public isHorizonatScrollbarVisible() {
        const scrollbar = this.grid.parentVirtDir.getHorizontalScroll();
        return scrollbar.offsetWidth < scrollbar.children[0].offsetWidth;
    }
}

@Component({
    template: TemplateStrings.declareGrid(` [autoGenerate]="autoGenerate"`,
        ` (onColumnInit)="init($event)"`, "")
})
export class NxMWithSummaryComponent extends GridNxMComponent {
    init(column) {
        column.hasSummary = true;
    }
}

@Component({
    template: TemplateStrings.declareGrid(` [autoGenerate]="autoGenerate"`,
        ` (onColumnInit)="init($event)"`, "")
})
export class NxMWithSummaryEditableComponent extends NxMWithSummaryComponent {
    hasEditableColumns = true;
    startFromOne = true;
}

@Component({
    template: TemplateStrings.declareGrid(` [autoGenerate]="autoGenerate"`,
                ` (onColumnInit)="init($event)"`, "")
})
export class NxMColumnWidthAndSummaryComponent extends NxMWithSummaryComponent {
    init(column) {
        switch (this.grid.columnList.length) {
            case 5:
                if (column.index === 0 || column.index === 4) {
                    column.width = "200px";
                }
                break;
            case 30:
                if (column.index === 0 || column.index === 5 || column.index === 3 || column.index === 10 || column.index === 25) {
                    column.width = "200px";
                }
                break;
            case 150:
                if (column.index === 0 || column.index === 5 || column.index === 3 || column.index === 10 || column.index === 50) {
                    column.width = "500px";
                }
                break;
        }
    }
}

@Component({
    template: TemplateStrings.declareGrid("",
        ` (onColumnInit)="init($event)"`,
        ColumnDefinitions.generatedEditable)
})
export class Summaries5x5Component extends BasicGridComponent {
    public columns = [];

    constructor() {
        super(null);
        this.columns = SampleTestData.generateEditableColumns(5, "number");
        this.data = SampleTestData.generateDataForColumns(this.columns, 5, true);
    }

    init(column) {
        column.hasSummary = true;
    }
}

@Component({
    template: TemplateStrings.declareGrid("",
        ` (onColumnInit)="init($event)"`,
        ColumnDefinitions.generatedWithDataType)
})
export class Summaries10x30Component extends SummariesNxMComponent {
    constructor() {
        super(30, 10, "number");
    }
}

@Component({
    template: TemplateStrings.declareGrid(` [width]="'1500px'"`,
        ` (onColumnInit)="init($event)"`,
        ColumnDefinitions.generatedWithDataType)
})
export class Summaries30x1000Component extends SummariesNxMComponent {
    constructor() {
        super(1000, 30, "number");
    }
}

@Component({
    template: TemplateStrings.declareGrid(` [width]="'1500px'"`,
        ` (onColumnInit)="init($event)"`,
        ColumnDefinitions.generatedWithDataType)
})
export class Summaries150x200Component extends SummariesNxMComponent {
    constructor() {
        super(200, 150, "number");
    }
}

@Component({
    template: `
    <div style="width: 800px; height: 600px;">
        <igx-grid #grid [data]="data" [autoGenerate]="true" [height]="width" [width]="height">
        </igx-grid>
    </div>`
})
export class WidthAndHeightComponent extends BasicGridComponent {
    public width: string;
    public height: string;

    data = SampleTestData.generateData(30, 3);
}

@Component({
    template: `
    <div style="height: 200px; overflow: auto;">
        <igx-grid #grid [data]="data" [autoGenerate]="true" [height]="null">
        </igx-grid>
    </div>`
})
export class NullHeightComponent extends BasicGridComponent {
    data = SampleTestData.generateData(20, 5);
}

@Component({
    template: `
        <igx-grid
            [data]="data"
            (onRowAdded)="rowAdded($event)"
            (onRowDeleted)="rowDeleted($event)"
            (onEditDone)="editDone($event)"
            [autoGenerate]="true">
        </igx-grid>
    `
})
export class DefaultCRUDGridComponent extends BasicGridComponent {

    public rowsAdded = 0;
    public rowsDeleted = 0;

    public rowAdded(event) {
        this.rowsAdded++;
    }

    public rowDeleted(event) {
        this.rowsDeleted++;
    }

    public editDone(event: IGridEditEventArgs) {
        if (event.newValue === "change") {
            event.newValue = event.cell ? 200 : { index: 200, value: 200 };
        }
    }
}

@Component({
    template: TemplateStrings.declareGrid(` [paging]="paging" [perPage]="perPage"`,
        "", ColumnDefinitions.idNameJobTitleEditable) + `
        <button id="prevPageBtn" igxButton (click)="GoToPage(-2)">Prev page</button>
        <button id="nextPageBtn" igxButton (click)="GoToPage(-1)">Next page</button>
        <button id="idxPageBtn" igxButton (click)="GoToPage(2)">Go to 3rd page</button>
        `
})
export class PagingAndEditingComponent extends PagingComponent {
    perPage = 4;

    public GoToPage(val) {
        switch (val) {
            case -2:
                this.grid.previousPage();
                break;
            case -1:
                this.grid.nextPage();
                break;
            default:
                this.grid.paginate(val);
                break;
        }
    }
}

@Component({
    template: TemplateStrings.declareGrid("", "",
                ColumnDefinitions.idNameHiddenJobHirePinned)
})
export class GridSearchHiddenColumnsComponent extends BasicGridSearchComponent {
    data = SampleTestData.personJobData;
}

@Component({
    template: TemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.idFirstLastNameSortable)
})
export class GridDeclaredColumnsComponent extends BasicGridComponent {
    data = SampleTestData.personIDNameRegionData;

    @ViewChild("nameColumn") public nameColumn;
}

@Component({
    template: TemplateStrings.declareGrid(` [autoGenerate]="autoGenerate" [height]="height" [width]="width"`,
                `(onColumnInit)="initColumns($event)"
                (onSelection)="cellSelected($event)"`, "")
})
export class PinOnInitAndSelectionComponent extends GridWithSizeComponent {
    data = SampleTestData.contactInfoDataFull;
    width = "800px";
    height = "300px";

    public selectedCell;
    public initColumns(column) {
        if (column.field === "CompanyName" || column.field === "ContactName") {
            column.pinned = true;
        }
        column.width = "200px";
    }

    public cellSelected(event) {
        this.selectedCell = event.cell;
    }
}

@Component({
    template: TemplateStrings.declareGrid(` [height]="height" [width]="width"`,
                ` (onSelection)="cellSelected($event)"
                (onColumnPinning)="columnPinningHandler($event)"`,
                ColumnDefinitions.generatedWithWidth)
})
export class PinningComponent extends GridWithSizeComponent
                                implements IGridSelection {

    public columns = [
        { field: "ID", width: 100 },
        { field: "CompanyName", width: 300 },
        { field: "ContactName", width: 200 },
        { field: "ContactTitle", width: 200 },
        { field: "Address", width: 300 },
        { field: "City", width: 100 },
        { field: "Region", width: 100 },
        { field: "PostalCode", width: 100 },
        { field: "Phone", width: 150 },
        { field: "Fax", width: 150 }
    ];

    data = SampleTestData.contactMariaAndersData;
    width = "800px";
    height = "300px";

    selectedCell: IgxGridCellComponent;
    cellSelected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }

    public columnPinningHandler($event) {
        $event.insertAtIndex = 0;
    }
}

@Component({
    template: TemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.productFilterSortPin)
})
export class GridFeaturesComponent extends BasicGridComponent {
    data = SampleTestData.productInfoData;
}

@Component({
    template: TemplateStrings.declareGrid(
        ` height="500px" width="500px" columnWidth="200" `,
        "", ColumnDefinitions.idNameJobHireDate)
})
export class ScrollableGridSearchComponent extends BasicGridSearchComponent {
}
