import { Component, ViewChild, ViewContainerRef } from "@angular/core";
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgVirtualForOf, IgxVirtForModule } from "./igx_virtual_for.directive";

describe("IgxVirtual directive - simple template", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EmptyVirtualComp, VerticalVirtualComp, HorizontalVirtualComp, VirtualComp],
            imports: [ IgxVirtForModule ]
        }).compileComponents();
    }));

    it("should initialize empty directive", () => {
        const fix = TestBed.createComponent(EmptyVirtualComp);
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector("display-container");
        expect(displayContainer).not.toBeNull();
    });

    it("should initialize directive with horizontal virtualization", () => {
        const fix = TestBed.createComponent(HorizontalVirtualComp);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector("display-container");
        expect(displayContainer).not.toBeNull();
    });
});

/** Empty virtualized component */
@Component({
    template: `
        <span #container>
            <ng-template igxVirtFor [igxVirtForOf]="data"></ng-template>
        </span>
    `
})
export class EmptyVirtualComp {
    public data = [];

    @ViewChild("container") public container;
}

/** Only vertically virtualized component */
@Component({
    template: `
        <div #container [style.width]='width' [style.height]='height'>
            <ng-template igxVirtFor let-rowData [igxVirtForOf]="data"
                [igxVirtForScrolling]="'vertical'"
                [igxVirtForContainerSize]='height'
                [igxVirtForItemSize]='"50px"'>
                <div [style.display]="'flex'" [style.height]="'50px'">
                    <div [style.width]=cols[0].width>{{rowData['1']}}</div>
                    <div [style.width]=cols[1].width>{{rowData['2']}}</div>
                    <div [style.width]=cols[2].width>{{rowData['3']}}</div>
                    <div [style.width]=cols[3].width>{{rowData['4']}}</div>
                    <div [style.width]=cols[4].width>{{rowData['5']}}</div>
                </div>
            </ng-template>
        </div>
    `
})
export class VerticalVirtualComp {

    public width = "450px";
    public height = "300px";
    public cols = [
        {field: "1", width: "150px"},
        {field: "2", width: "70px"},
        {field: "3", width: "50px"},
        {field: "4", width: "80px"},
        {field: "5", width: "100px"}
    ];
    public data = [];

    @ViewChild("container") public container;

    public ngOnInit(): void {
        this.generateData();
    }

    private generateData() {
        const dummyData = [];
        for (let i = 0; i < 50000; i++) {
            const obj = {};
            for (let j = 0; j <  this.cols.length; j++) {
                const col = this.cols[j].field;
                obj[col] = 10 * i * j;
            }
            dummyData.push(obj);
        }

        this.data = dummyData;
    }
}

/** Both vertically and horizontally virtualized component */
@Component({
    template: `
        <div [style.width]='width'>
            <div #container
                [style.width]='"calc(100% - 18px)"'
                [style.height]='"calc(100% - 18px)"'
                [style.overflow]='"hidden"'
                [style.float]='"left"'
                [style.position]='"relative"'>
                <div *ngFor="let rowData of data" [style.display]="'flex'" [style.height]="'50px'">
                    <ng-template igxVirtFor let-col [igxVirtForOf]="cols"
                        [igxVirtForScrolling]="'horizontal'"
                        [igxVirtForUseForScroll]="scrollContainer"
                        [igxVirtForContainerSize]='width'>
                            <div [style.width]='col.width + "px"'>{{rowData[col.field]}}</div>
                    </ng-template>
                </div>
            </div>
        </div>
    `
})
export class HorizontalVirtualComp {

    public width = "800px";
    public height = "400px";
    public cols = [];
    public data = [];
    public scrollContainer = { _viewContainer: null };

    @ViewChild("container", {read: ViewContainerRef})
    public container: ViewContainerRef;

    public ngOnInit(): void {
        this.generateData();
        this.scrollContainer._viewContainer = this.container;
    }

    private generateData() {
        const dummyData = [];
        for (let j = 0; j < 300; j++) {
            this.cols.push({
                field: j.toString(),
                width: j % 8 < 2 ? 100 : (j % 6) * 125
            });
        }

        for (let i = 0; i < 5; i++) {
            const obj = {};
            for (let j = 0; j <  this.cols.length; j++) {
                const col = this.cols[j].field;
                obj[col] = 10 * i * j;
            }
            dummyData.push(obj);
        }

        this.data = dummyData;
    }
}

/** Both vertically and horizontally virtualized component */
@Component({
    template: `
        <div #container [style.width]='width' [style.height]='height'>
            <ng-template #scrollContainer igxVirtFor let-rowData [igxVirtForOf]="data"
                [igxVirtForScrolling]="'vertical'"
                [igxVirtForContainerSize]='height'
                [igxVirtForItemSize]='"50px"'>
                <div [style.display]="'flex'" [style.height]="'50px'">
                    <ng-template igxVirtFor let-col [igxVirtForOf]="cols"
                        [igxVirtForScrolling]="'horizontal'"
                        [igxVirtForUseForScroll]="parentVirtDir"
                        [igxVirtForContainerSize]='width'>
                            <div [style.width]='col.width + "px"'>{{rowData[col.field]}}</div>
                    </ng-template>
                </div>
            </ng-template>
        </div>
    `
})
export class VirtualComp {

    public width = "800px";
    public height = "400px";
    public cols = [];
    public data = [];

    @ViewChild("container") public container;

    @ViewChild("scrollContainer", { read: IgVirtualForOf })
    public parentVirtDir: IgVirtualForOf<any>;

    public ngOnInit(): void {
        this.generateData();
    }

    private generateData() {
        const dummyData = [];
        for (let j = 0; j < 300; j++) {
            this.cols.push({
                field: j.toString(),
                width: j % 8 < 2 ? 100 : (j % 6) * 125
            });
        }

        for (let i = 0; i < 50000; i++) {
            const obj = {};
            for (let j = 0; j <  this.cols.length; j++) {
                const col = this.cols[j].field;
                obj[col] = 10 * i * j;
            }
            dummyData.push(obj);
        }

        this.data = dummyData;
    }
}
