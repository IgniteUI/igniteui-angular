import { Component, DebugElement, OnInit, ViewChild } from "@angular/core";
import { async, discardPeriodicTasks, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { IgxAvatarModule } from "../avatar/avatar.component";
import { Calendar } from "../calendar";
import { IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

describe("IgxGrid - Deferred Column Resizing", () => {
    const COLUMN_HEADER_CLASS = ".igx-grid__th";

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ResizableColumnsComponent,
                PinnedColumnsComponent,
                GridFeaturesComponent,
                LargePinnedColGridComponent
            ],
            imports: [
                FormsModule,
                IgxAvatarModule,
                IgxGridModule.forRoot()
            ]
        })
        .compileComponents();
    }));

    it("Define grid with resizable columns.", fakeAsync(() => {
        const fixture = TestBed.createComponent(ResizableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[0].width).toEqual("100px");
        expect(grid.columns[0].resizable).toBeTruthy();
        expect(grid.columns[2].resizable).toBeFalsy();

        const headerResArea = headers[0].nativeElement.children[1];
        simulateMouseEvent("mouseover", headerResArea, 100, 0);
        simulateMouseEvent("mousedown", headerResArea, 100, 0);
        tick();
        fixture.detectChanges();

        expect(window.getComputedStyle(headerResArea).cursor).toBe("col-resize");

        let resizer = headers[0].nativeElement.children[1].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent("mousemove", resizer, 250, 5);
        tick();

        simulateMouseEvent("mouseup", resizer, 250, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual("250px");

        simulateMouseEvent("mousedown", headerResArea, 250, 0);
        tick();
        fixture.detectChanges();

        resizer = headers[0].nativeElement.children[1].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent("mousemove", resizer, 40, 5);
        tick();

        simulateMouseEvent("mouseup", resizer, 40, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual("48px");

        expect(grid.columns[2].cells[0].value).toEqual("Brown");

        headers[2].nativeElement.dispatchEvent(new Event("click"));
        headers[2].nativeElement.dispatchEvent(new Event("click"));
        tick();
        fixture.detectChanges();

        expect(grid.columns[2].cells[0].value).toEqual("Wilson");

        discardPeriodicTasks();
    }));

    it("Resize column outside grid view.", fakeAsync(() => {
        const fixture = TestBed.createComponent(ResizableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[0].width).toEqual("100px");

        const headerResArea = headers[0].nativeElement.children[1];
        simulateMouseEvent("mousedown", headerResArea, 100, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[0].nativeElement.children[1].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent("mousemove", resizer, 700, 5);
        tick();

        simulateMouseEvent("mouseup", resizer, 700, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual("700px");

        discardPeriodicTasks();
    }));

    it("Resize column with preset min and max widths.", fakeAsync(() => {
        const fixture = TestBed.createComponent(ResizableColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[1].width).toEqual("100px");
        expect(grid.columns[1].minWidth).toEqual("70px");
        expect(grid.columns[1].maxWidth).toEqual("250px");
        expect(grid.columns[1].resizable).toBeTruthy();

        const headerResArea = headers[1].nativeElement.children[1];
        simulateMouseEvent("mousedown", headerResArea, 200, 0);
        tick();
        fixture.detectChanges();

        let resizer = headers[1].nativeElement.children[1].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent("mousemove", resizer, 370, 5);
        tick();

        simulateMouseEvent("mouseup", resizer, 370, 5);
        tick(100);
        fixture.detectChanges();

        expect(grid.columns[1].width).toEqual("250px");

        simulateMouseEvent("mousedown", headerResArea, 350, 0);
        tick();
        fixture.detectChanges();

        resizer = headers[1].nativeElement.children[1].children[0];
        simulateMouseEvent("mousemove", resizer, 100, 5);
        tick();

        simulateMouseEvent("mouseup", resizer, 100, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[1].width).toEqual("70px");

        discardPeriodicTasks();
    }));

    it("Resize sortable columns.", fakeAsync(() => {
        const fixture = TestBed.createComponent(GridFeaturesComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[2].width).toEqual("150px");
        expect(grid.columns[2].sortable).toBeTruthy();
        expect(grid.columns[2].cells[0].value).toEqual(254);

        const headerResArea = headers[2].nativeElement.children[1];
        simulateMouseEvent("mousedown", headerResArea, 450, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[2].nativeElement.children[1].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent("mousemove", resizer, 550, 5);
        tick();

        simulateMouseEvent("mouseup", resizer, 550, 5);
        tick(100);
        fixture.detectChanges();

        expect(grid.columns[2].width).toEqual("250px");
        expect(grid.columns[2].cells[0].value).toEqual(254);

        headers[2].nativeElement.dispatchEvent(new Event("click"));
        headers[2].nativeElement.dispatchEvent(new Event("click"));
        tick();
        fixture.detectChanges();

        expect(grid.columns[2].cells[0].value).toEqual(1000);

        headers[2].componentInstance.resizeArea.nativeElement.dispatchEvent(new Event("dblclick"));
        tick();
        fixture.detectChanges();

        expect(grid.columns[2].width).toEqual("77px");
        expect(grid.columns[2].cells[0].value).toEqual(1000);

        discardPeriodicTasks();
    }));

    it("Resize pinned columns.", fakeAsync(() => {
        const fixture = TestBed.createComponent(PinnedColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[0].width).toEqual("100px");
        expect(grid.columns[1].width).toEqual("100px");

        const headerResArea = headers[0].nativeElement.children[1];
        simulateMouseEvent("mousedown", headerResArea, 100, 0);
        tick();
        fixture.detectChanges();

        let resizer = headers[0].nativeElement.children[1].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent("mousemove", resizer, 450, 5);
        tick();

        simulateMouseEvent("mouseup", resizer, 450, 5);
        tick(100);
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual("300px");
        expect(grid.columns[1].width).toEqual("100px");

        simulateMouseEvent("mousedown", headerResArea, 300, 0);
        tick();
        fixture.detectChanges();

        resizer = headers[0].nativeElement.children[1].children[0];
        simulateMouseEvent("mousemove", resizer, 100, 5);
        tick();

        simulateMouseEvent("mouseup", resizer, 100, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual("100px");

        discardPeriodicTasks();
    }));

    it("Resize pinned column with preset max width.", fakeAsync(() => {
        const fixture = TestBed.createComponent(PinnedColumnsComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        grid.pinColumn("LastName");
        tick();
        fixture.detectChanges();

        expect(grid.columns[1].width).toEqual("100px");

        const headerResArea = headers[1].nativeElement.children[1];
        simulateMouseEvent("mousedown", headerResArea, 200, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[1].nativeElement.children[1].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent("mousemove", resizer, 350, 5);
        tick();

        simulateMouseEvent("mouseup", resizer, 350, 5);
        tick(100);
        fixture.detectChanges();

        expect(grid.columns[1].width).toEqual("150px");

        discardPeriodicTasks();
    }));

    it("Autoresize column on double click.", fakeAsync(() => {
        const fixture = TestBed.createComponent(GridFeaturesComponent);
        fixture.detectChanges();

        const dblclick = new Event("dblclick");
        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[0].width).toEqual("150px");
        expect(grid.columns[1].width).toEqual("150px");
        expect(grid.columns[2].width).toEqual("150px");

        headers[0].componentInstance.resizeArea.nativeElement.dispatchEvent(dblclick);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual("61px");

        headers[1].componentInstance.resizeArea.nativeElement.dispatchEvent(dblclick);
        tick();
        fixture.detectChanges();

        expect(grid.columns[1].width).toEqual("207px");

        headers[2].componentInstance.resizeArea.nativeElement.dispatchEvent(dblclick);
        tick();
        fixture.detectChanges();

        expect(grid.columns[2].width).toEqual("77px");

        headers[3].componentInstance.resizeArea.nativeElement.dispatchEvent(dblclick);
        tick();
        fixture.detectChanges();

        expect(grid.columns[3].width).toEqual("76px");

        headers[5].componentInstance.resizeArea.nativeElement.dispatchEvent(dblclick);
        tick();
        fixture.detectChanges();

        expect(grid.columns[5].width).toEqual("89px");

        discardPeriodicTasks();
    }));

    it("Autoresize column wilth preset max width.", fakeAsync(() => {
        const fixture = TestBed.createComponent(LargePinnedColGridComponent);
        fixture.detectChanges();

        const dblclick = new Event("dblclick");
        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[4].cells[0].nativeElement.getBoundingClientRect().width).toEqual(48);
        expect(grid.columns[4].maxWidth).toEqual("100px");

        headers[4].componentInstance.resizeArea.nativeElement.dispatchEvent(dblclick);
        tick();
        fixture.detectChanges();

        expect(grid.columns[4].width).toEqual("100px");

        discardPeriodicTasks();
    }));

    it("Autoresize templated column on double click.", fakeAsync(() => {
        const fixture = TestBed.createComponent(GridFeaturesComponent);
        fixture.detectChanges();

        const dblclick = new Event("dblclick");
        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[5].width).toEqual("150px");

        headers[5].componentInstance.resizeArea.nativeElement.dispatchEvent(dblclick);
        tick();
        fixture.detectChanges();

        expect(grid.columns[5].width).toEqual("89px");

        discardPeriodicTasks();
    }));

    it("Autoresize pinned column on double click.", fakeAsync(() => {
        const fixture = TestBed.createComponent(LargePinnedColGridComponent);
        fixture.detectChanges();

        const dblclick = new Event("dblclick");
        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[2].width).toEqual("100px");

        headers[2].componentInstance.resizeArea.nativeElement.dispatchEvent(dblclick);
        tick();
        fixture.detectChanges();

        expect(grid.columns[2].width).toEqual("97px");

        discardPeriodicTasks();
    }));

    it("Autoresize pinned column on double click - edge case.", fakeAsync(() => {
        const fixture = TestBed.createComponent(LargePinnedColGridComponent);
        fixture.detectChanges();

        const dblclick = new Event("dblclick");
        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[0].width).toEqual("100px");
        expect(grid.columns[1].width).toEqual("100px");
        expect(grid.columns[2].width).toEqual("100px");

        headers[1].componentInstance.resizeArea.nativeElement.dispatchEvent(dblclick);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual("100px");
        expect(grid.columns[1].width).toEqual("100px");
        expect(grid.columns[2].width).toEqual("100px");

        const headerResArea = headers[0].nativeElement.children[1];
        simulateMouseEvent("mousedown", headerResArea, 100, 0);
        tick();
        fixture.detectChanges();

        const resizer = headers[0].nativeElement.children[1].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent("mousemove", resizer, 450, 5);
        tick();

        simulateMouseEvent("mouseup", resizer, 450, 5);
        tick(100);
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual("280px");
        expect(grid.columns[1].width).toEqual("100px");
        expect(grid.columns[2].width).toEqual("100px");

        discardPeriodicTasks();
    }));

    it("onColumnResized is fired with correct event args.", fakeAsync(() => {
        const fixture = TestBed.createComponent(GridFeaturesComponent);
        fixture.detectChanges();

        const dblclick = new Event("dblclick");
        const grid = fixture.componentInstance.grid;
        const headers: DebugElement[] = fixture.debugElement.queryAll(By.css(COLUMN_HEADER_CLASS));

        expect(grid.columns[0].width).toEqual("150px");
        expect(fixture.componentInstance.count).toEqual(0);

        const headerResArea = headers[0].nativeElement.children[1];
        simulateMouseEvent("mousedown", headerResArea, 150, 5);
        tick();
        fixture.detectChanges();

        const resizer = headers[0].nativeElement.children[1].children[0];
        expect(resizer).toBeDefined();
        simulateMouseEvent("mousemove", resizer, 300, 5);
        tick();

        simulateMouseEvent("mouseup", resizer, 300, 5);
        tick();
        fixture.detectChanges();

        expect(grid.columns[0].width).toEqual("300px");
        expect(fixture.componentInstance.count).toEqual(1);
        expect(fixture.componentInstance.column).toBe(grid.columns[0]);
        expect(fixture.componentInstance.prevWidth).toEqual("150");
        expect(fixture.componentInstance.newWidth).toEqual("300px");

        expect(grid.columns[1].width).toEqual("150px");

        headers[1].componentInstance.resizeArea.nativeElement.dispatchEvent(dblclick);
        tick();
        fixture.detectChanges();

        expect(grid.columns[1].width).toEqual("207px");
        expect(fixture.componentInstance.count).toEqual(2);
        expect(fixture.componentInstance.column).toBe(grid.columns[1]);
        expect(fixture.componentInstance.prevWidth).toEqual("150");
        expect(fixture.componentInstance.newWidth).toEqual("207px");

        discardPeriodicTasks();
    }));
});

function simulateMouseEvent(eventName: string, element, x, y) {
    const options: MouseEventInit = {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y
    };

    return new Promise((resolve, reject) => {
        element.dispatchEvent(new MouseEvent(eventName, options));
        resolve();
    });
}

@Component({
    template: `
        <igx-grid [data]="data" width="500px">
            <igx-column [resizable]="true" field="ID" width="100px"></igx-column>
            <igx-column [resizable]="true" [minWidth]="'70px'" [maxWidth]="'250px'" field="Name" width="100px"></igx-column>
            <igx-column [resizable]="false" [sortable]="true" field="LastName" width="100px"></igx-column>
            <igx-column [resizable]="true" field="Region" width="100px"></igx-column>
        </igx-grid>
    `
})
export class ResizableColumnsComponent {

    public data = [
        { ID: 2, Name: "Jane", LastName: "Brown", Region: "AD" },
        { ID: 1, Name: "Brad", LastName: "Williams", Region: "BD" },
        { ID: 6, Name: "Rick", LastName: "Jones", Region: "ACD"},
        { ID: 7, Name: "Rick", LastName: "BRown", Region: "DD" },
        { ID: 5, Name: "ALex", LastName: "Smith", Region: "MlDs" },
        { ID: 4, Name: "Alex", LastName: "Wilson", Region: "DC" },
        { ID: 3, Name: "Connor", LastName: "Walker", Region: "OC" }
    ];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
}

@Component({
    template: `
        <igx-grid [data]="data" width="500px">
            <igx-column [pinned]="true" [resizable]="true" field="ID" width="100px"></igx-column>
            <igx-column [pinned]="true" [resizable]="true" field="Name" width="100px" [maxWidth]="'150px'"></igx-column>
            <igx-column [resizable]="true" field="LastName" width="100px"></igx-column>
            <igx-column [resizable]="true" field="Region" width="100px"></igx-column>
        </igx-grid>
    `
})
export class PinnedColumnsComponent {

    public data = [
        { ID: 2, Name: "Jane", LastName: "Brown", Region: "AD" },
        { ID: 1, Name: "Brad", LastName: "Williams", Region: "BD" },
        { ID: 6, Name: "Rick", LastName: "Jones", Region: "ACD"},
        { ID: 7, Name: "Rick", LastName: "BRown", Region: "DD" },
        { ID: 5, Name: "ALex", LastName: "Smith", Region: "MlDs" },
        { ID: 4, Name: "Alex", LastName: "Wilson", Region: "DC" },
        { ID: 3, Name: "Connor", LastName: "Walker", Region: "OC" }
    ];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
}

@Component({
    template: `
    <igx-grid width="600px" height="600px" [data]="data" [autoGenerate]="false">
        <igx-column [field]="'Released'" [pinned]="true" width="100px" dataType="boolean" [resizable]="true"></igx-column>
        <igx-column [field]="'ReleaseDate'" [pinned]="true" width="100px" dataType="date" [resizable]="true"></igx-column>
        <igx-column [field]="'Items'" [pinned]="true" width="100px" dataType="string" [resizable]="true"></igx-column>
        <igx-column [field]="'ID'" [width]="'100px'" [header]="'ID'" [resizable]="true"></igx-column>
        <igx-column [field]="'ProductName'" width="25px" [maxWidth]="'100px'" dataType="string" [resizable]="true"></igx-column>
        <igx-column [field]="'Test'" width="100px" dataType="string" [resizable]="true">
            <ng-template igxCell>
                <div></div>
            </ng-template>
        </igx-column>
        <igx-column [field]="'Downloads'" width="100px" dataType="number" [resizable]="true"></igx-column>
        <igx-column [field]="'Category'" width="100px" dataType="string" [resizable]="true"></igx-column>
  </igx-grid>
    `
})
export class LargePinnedColGridComponent implements OnInit {

    timeGenerator: Calendar = new Calendar();
    today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
    data = [];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    ngOnInit() {
        this.createData();
    }

    createData() {
        for (let i = 0; i < 75; i++) {
            const item = {
                Downloads: 100 + i,
                ID: i,
                ProductName: "ProductName" + i,
                ReleaseDate: this.timeGenerator.timedelta(this.today, "month", -1),
                Released: true,
                Category: "Category" + i,
                Items: "Items" + i,
                Test: "test" + i
            };
            this.data.push(item);
        }
      }
}

@Component({
    template: `<igx-grid [data]="data" (onColumnResized)="handleResize($event)">
        <igx-column [field]="'ID'" [width]="'150px'" [resizable]="true"></igx-column>
        <igx-column [field]="'ProductName'" [width]="'150px'" [resizable]="true" dataType="string"></igx-column>
        <igx-column [field]="'Downloads'" [sortable]="true" [header]="'D'" [width]="'150px'" [resizable]="true" dataType="number">
        </igx-column>
        <igx-column [field]="'Released'" [header]="'Re'" [resizable]="true" dataType="boolean"></igx-column>
        <igx-column [field]="'ReleaseDate'" [resizable]="true" dataType="date"></igx-column>
        <igx-column [field]="'Category'" [width]="'150px'" [resizable]="true" dataType="string">
            <ng-template igxCell igxHeader>
                <igx-avatar initials="JS"></igx-avatar>
            </ng-template>
        </igx-column>
        <igx-column [field]="'Items'" [width]="'60px'" [hasSummary]="true" [resizable]="true" dataType="string"></igx-column>
        <igx-column [field]="'Test'" [resizable]="true" dataType="string"></igx-column>
    </igx-grid>`
})
export class GridFeaturesComponent {
    public count = 0;
    public column;
    public prevWidth;
    public newWidth;

    public timeGenerator: Calendar = new Calendar();
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);

    public data = [
        {
            Downloads: 254,
            ID: 1,
            ProductName: "Ignite UI for JavaScript",
            ReleaseDate: this.timeGenerator.timedelta(this.today, "day", 15),
            Released: false,
            Category: "Category 1",
            Items: "Item 1",
            Test: "Test 1"
        },
        {
            Downloads: 127,
            ID: 2,
            ProductName: "NetAdvantage",
            ReleaseDate: this.timeGenerator.timedelta(this.today, "month", -1),
            Released: true,
            Category: "Category 2",
            Items: "Item 2",
            Test: "Test 2"
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: "Ignite UI for Angular",
            ReleaseDate: null,
            Released: null,
            Category: "Category 3",
            Items: "Item 3",
            Test: "Test 3"
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: null,
            ReleaseDate: this.timeGenerator.timedelta(this.today, "day", -1),
            Released: true,
            Category: "Category 4",
            Items: "Item 4",
            Test: "Test 4"
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: "",
            ReleaseDate: undefined,
            Released: "",
            Category: "Category 5",
            Items: "Item 5",
            Test: "Test 5"
        },
        {
            Downloads: 702,
            ID: 6,
            ProductName: "Some other item with Script",
            ReleaseDate: this.timeGenerator.timedelta(this.today, "day", 1),
            Released: null,
            Category: "Category 6",
            Items: "Item 6",
            Test: "Test 6"
        },
        {
            Downloads: 0,
            ID: 7,
            ProductName: null,
            ReleaseDate: this.timeGenerator.timedelta(this.today, "month", 1),
            Released: true,
            Category: "Category 7",
            Items: "Item 7",
            Test: "Test 7"
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: null,
            ReleaseDate: this.today,
            Released: false,
            Category: "Category 8",
            Items: "Item 8",
            Test: "Test 8"
        }
    ];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    handleResize(event) {
        this.count++;
        this.column = event.column;
        this.prevWidth = event.prevWidth;
        this.newWidth = event.newWidth;
    }
}
