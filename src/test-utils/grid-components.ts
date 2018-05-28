import { ChangeDetectorRef, Component, Input, ViewChild } from "@angular/core";
import { IgxGridComponent } from "../grid/grid.component";
import { ColumnDefinitions, TemplateStrings } from "./template-strings";
import { TestDataService } from "./test-data.service";
import { IgxColumnComponent } from "../grid/column.component";

@Component({
    template: `
        <igx-grid
            [data]="data">
        </igx-grid>
    `
})
export class BasicGridComponent {
    @Input()
    public data = [];

    @ViewChild(IgxGridComponent)
    public grid: IgxGridComponent;

    constructor(private cdr: ChangeDetectorRef) {}
}

@Component({
    template: `
        <igx-grid
            [data]="data"
            [autoGenerate]="autoGenerate">
        </igx-grid>
    `
})
export class GridAutoGenerateComponent extends BasicGridComponent {
    @Input()
    public autoGenerate = true;
}

@Component({
    template: `
        <igx-grid
            [data]="data"
            [autoGenerate]="autoGenerate"
            [height]="height" [width]="width">
        </igx-grid>
    `
})
export class GridWithSizeComponent extends GridAutoGenerateComponent {
    @Input()
    public width: string;

    @Input()
    public height: string;
}

@Component({
    template: TemplateStrings.declareBasicGridWithColumns(ColumnDefinitions.idNameJobHireDate)
})
export class SimpleGridSearchComponent extends BasicGridComponent {
    public highlightClass = "igx-highlight";
    public activeClass = "igx-highlight__active";
}

@Component({
    template: TemplateStrings.declareGrid(
        ` height="500px" width="500px" columnWidth="200" `,
        "", ColumnDefinitions.idNameJobHireDate)
})
export class ScrollableGridSearchComponent extends SimpleGridSearchComponent {
}

@Component({
    template: TemplateStrings.declareGrid("",
        ` (onColumnInit)="init($event)"`,
        ColumnDefinitions.generatedWithDataType)
})
export class SummariesNxMComponent extends BasicGridComponent {
    public columns = [];
    private testData = new TestDataService();

    constructor(rows: number, cols: number, colsType: string) {
        super(null);
        this.columns = this.testData.generateColumnsByType(cols, colsType);
        this.data = this.testData.generateData(this.columns, rows);
    }

    init(column: IgxColumnComponent) {
        column.hasSummary = true;
    }

    public isHorizonatScrollbarVisible() {
        const scrollbar = this.grid.parentVirtDir.getHorizontalScroll();
        return scrollbar.offsetWidth < scrollbar.children[0].offsetWidth;
    }
}

@Component({
    template: TemplateStrings.declareGrid(` [paging]="paging" [perPage]="perPage"`,
        "", ColumnDefinitions.idNameJobTitle)
})
export class PagingComponent extends BasicGridComponent {
    public paging = true;
    public perPage = 3;

    /* By default bind to PersonJobData. */
    data = new TestDataService().personJobData;
}
