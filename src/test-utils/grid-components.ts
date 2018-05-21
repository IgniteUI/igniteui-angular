    @Component({
        template: `
            <igx-grid
                (onSelection)="cellSelected($event)"
                (onCellClick)="cellClick($event)"
                (onContextMenu)="cellRightClick($event)"
                (onDoubleClick)="doubleClick($event)"
                [data]="data"
                [autoGenerate]="true">
            </igx-grid>
        `
    })
    export class DefaultGridComponent {

        public data = [
            { index: 1, value: 1},
            { index: 2, value: 2}
        ];

        public selectedCell: IgxGridCellComponent;
        public clickedCell: IgxGridCellComponent;

        @ViewChild(IgxGridComponent, { read: IgxGridComponent })
        public instance: IgxGridComponent;

        public cellSelected(event: IGridCellEventArgs) {
            this.selectedCell = event.cell;
        }

        public cellClick(evt) {
            this.clickedCell = evt.cell;
        }

        public cellRightClick(evt) {
            this.clickedCell = evt.cell;
        }

        public doubleClick(evt) {
            this.clickedCell = evt.cell;
        }
    }


@Component({
    template: `
        <igx-grid (onSelection)="cellSelected($event)" [data]="data" [autoGenerate]="true"></igx-grid>
    `
})
export class CtrlKeyKeyboardNagivationComponent {

    public data = [
        { index: 1, value: 1, other: 1, another: 1},
        { index: 2, value: 2, other: 2, another: 2}
    ];

    public selectedCell: IgxGridCellComponent;

    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;

    public cellSelected(event: IGridCellEventArgs) {
        this.selectedCell = event.cell;
    }
}

@Component({
    template: `
        <igx-grid [height]="'300px'" [width]="'800px'" [data]="data" [autoGenerate]="true"></igx-grid>
    `
})
export class NoColumnWidthGridComponent {
    public data = [];
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    public instance: IgxGridComponent;
    constructor() {
        this.data = this.generateData();
    }
    public generateData() {
        const data = [];
        for (let i = 0; i < 1000; i++) {
            data.push({ index: i, value: i, other: i, another: i });
        }
        return data;
    }
}

@Component({
    template: `
        <igx-grid [data]="data">
            <igx-column [editable]="true" field="FirstName"></igx-column>
            <igx-column field="LastName"></igx-column>
            <igx-column field="age"></igx-column>
        </igx-grid>
        <input type="text" value="text" id="input-test" />
    `
})
export class GridWithEditableColumnComponent {

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    public data = [
        { FirstName: "John", LastName: "Brown", age: 20 },
        { FirstName: "Ben", LastName: "Affleck", age: 30 },
        { FirstName: "Tom", LastName: "Riddle", age: 50 }
    ];
}


