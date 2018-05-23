import { ChangeDetectorRef, Component, Input, ViewChild } from "@angular/core";
import { IgxGridComponent } from "../grid/grid.component";
import { ColumnDefinitions, TemplateStrings } from "./template-strings";

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
export class ScrollableGridComponent extends SimpleGridSearchComponent {
}
