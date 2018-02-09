import { CommonModule, NgForOf, NgForOfContext } from "@angular/common";
import {
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    Directive,
    IterableChanges,
    IterableDiffers,
    NgZone,
    QueryList,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewContainerRef
} from "@angular/core";
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgxVirtualForOf, IgxVirtForModule } from "./igx_virtual_for.directive";

describe("IgxVirtual directive - simple template", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestIgVirtualForOf,
                EmptyVirtualComp,
                VerticalVirtualComp,
                HorizontalVirtualComp,
                VirtualComp
            ],
            imports: [IgxVirtForModule]
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
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector("virtual-helper");
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector("horizontal-virtual-helper");
        expect(displayContainer).not.toBeNull();
        expect(verticalScroller).toBeNull();
        expect(horizontalScroller).not.toBeNull();

        fix.componentInstance.scrollLeft(100);
        fix.detectChanges();

        const firstRecChildren = displayContainer.children;
        for (let i = 0; i < firstRecChildren.length; i++) {
            expect(firstRecChildren[i].textContent)
                .toBe(fix.componentInstance.data[0][i + 1].toString());
        }

        const secondRecChildren = fix.nativeElement.querySelectorAll("display-container")[1].children;
        for (let i = 0; i < secondRecChildren.length; i++) {
            expect(secondRecChildren[i].textContent)
                .toBe(fix.componentInstance.data[1][i + 1].toString());
        }
    });

    it("should initialize directive with vertical virtualization", () => {
        const fix = TestBed.createComponent(VerticalVirtualComp);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector("display-container");
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector("virtual-helper");
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector("horizontal-virtual-helper");
        expect(displayContainer).not.toBeNull();
        expect(verticalScroller).not.toBeNull();
        expect(horizontalScroller).toBeNull();
        /* The height of the row is set to 50px so scrolling by 100px should render the third record */
        fix.componentInstance.scrollTop(100);

        fix.detectChanges();

        const firstRecChildren = displayContainer.children[0].children;
        let i = 0;
        const thirdRecord = fix.componentInstance.data[2];
        for (const item in thirdRecord) {
            if (thirdRecord.hasOwnProperty(item)) {
                expect(thirdRecord[item].toString())
                    .toBe(firstRecChildren[i++].textContent);
            }
        }
    });

    it("should initialize directive with vertical and horizontal virtualization", () => {
        const fix = TestBed.createComponent(VirtualComp);
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector("display-container");
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector("virtual-helper");
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector("horizontal-virtual-helper");
        expect(displayContainer).not.toBeNull();
        expect(verticalScroller).not.toBeNull();
        expect(horizontalScroller).not.toBeNull();
        /* The height of the row is set to 50px so scrolling by 100px should render the third record */
        fix.componentInstance.scrollTop(100);

        const firstInnerDisplayContainer = displayContainer.children[0].querySelector("display-container");
        expect(firstInnerDisplayContainer).not.toBeNull();

        fix.detectChanges();

        const firstRecChildren = firstInnerDisplayContainer.children;
        for (let i = 0; i < firstRecChildren.length; i++) {
            expect(firstInnerDisplayContainer.children[i].textContent)
                .toBe(fix.componentInstance.data[2][i].toString());
        }
    });

    it("should scroll to bottom and correct rows and columns should be rendered", () => {
        const fix = TestBed.createComponent(VirtualComp);
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector("display-container");
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector("virtual-helper");
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector("horizontal-virtual-helper");
        fix.componentInstance.scrollTop(2500000);

        const rows = displayContainer.children;
        const lastInnerDisplayContainer = rows[rows.length - 1].querySelector("display-container");
        expect(lastInnerDisplayContainer).not.toBeNull();

        fix.detectChanges();

        const lastRecChildren = lastInnerDisplayContainer.children;
        const data = fix.componentInstance.data;
        for (let i = 0; i < lastRecChildren.length; i++) {
            expect(lastInnerDisplayContainer.children[i].textContent)
                .toBe(data[data.length - 1][i].toString());
        }
    });

    it("should scroll to wheel event correctly", () => {
        const fix = TestBed.createComponent(VirtualComp);
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector("display-container");
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector("virtual-helper");
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector("horizontal-virtual-helper");

        expect(displayContainer).not.toBeNull();
        expect(verticalScroller).not.toBeNull();
        expect(horizontalScroller).not.toBeNull();

        /* The height of the row is set to 50px so scrolling by 100px should render the third record */
        fix.componentInstance.parentVirtDir.testOnWheel(0, 100);
        fix.componentInstance.parentVirtDir.testOnScroll(verticalScroller);

        const firstInnerDisplayContainer = displayContainer.children[0].querySelector("display-container");
        expect(firstInnerDisplayContainer).not.toBeNull();
        const firstRecChildren = firstInnerDisplayContainer.children;

        fix.detectChanges();

        for (let i = 0; i < firstRecChildren.length; i++) {
            expect(firstInnerDisplayContainer.children[i].textContent)
                .toBe(fix.componentInstance.data[2][i].toString());
        }
    });

    it("should scroll to the far right and last column should be visible", () => {
        const fix = TestBed.createComponent(VirtualComp);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector("display-container");
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector("virtual-helper");
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector("horizontal-virtual-helper");

        expect(displayContainer).not.toBeNull();
        expect(verticalScroller).not.toBeNull();
        expect(horizontalScroller).not.toBeNull();

        // scroll to the last right pos
        fix.componentInstance.scrollLeft(80000);
        fix.detectChanges();

        const rowChildren = displayContainer.querySelectorAll("display-container");
        for (let i = 0; i < rowChildren.length; i++) {
            expect(rowChildren[i].children.length).toBe(1);
            expect(rowChildren[i].children[0].textContent)
                .toBe(fix.componentInstance.data[i][299].toString());
        }
    });

    it("should detect width change and update initially rendered columns", () => {
        const fix = TestBed.createComponent(VirtualComp);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector("display-container");
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector("virtual-helper");
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector("horizontal-virtual-helper");

        expect(displayContainer).not.toBeNull();
        expect(verticalScroller).not.toBeNull();
        expect(horizontalScroller).not.toBeNull();

        let rows = displayContainer.querySelectorAll("display-container");
        expect(rows.length).toBe(8);
        for (let i = 0; i < rows.length; i++) {
            expect(rows[i].children.length).toBe(4);
            expect(rows[i].children[3].textContent)
                .toBe(fix.componentInstance.data[i][3].toString());
        }

        // scroll to the last right pos
        fix.componentInstance.width = "1200px";
        fix.detectChanges();

        rows = displayContainer.querySelectorAll("display-container");
        expect(rows.length).toBe(8);
        for (let i = 0; i < rows.length; i++) {
            expect(rows[i].children.length).toBe(5);
            expect(rows[i].children[4].textContent)
                .toBe(fix.componentInstance.data[i][4].toString());
        }
    });

    it("should detect height change and update initially rendered rows", () => {
        const fix = TestBed.createComponent(VirtualComp);
        fix.componentRef.hostView.detectChanges();
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector("display-container");
        const verticalScroller: HTMLElement = fix.nativeElement.querySelector("virtual-helper");
        const horizontalScroller: HTMLElement = fix.nativeElement.querySelector("horizontal-virtual-helper");

        expect(displayContainer).not.toBeNull();
        expect(verticalScroller).not.toBeNull();
        expect(horizontalScroller).not.toBeNull();

        let rows = displayContainer.querySelectorAll("display-container");
        expect(rows.length).toBe(8);
        for (let i = 0; i < rows.length; i++) {
            expect(rows[i].children.length).toBe(4);
            expect(rows[i].children[2].textContent)
                .toBe(fix.componentInstance.data[i][2].toString());
        }

        // scroll to the last right pos
        fix.componentInstance.height = "700px";
        fix.detectChanges();

        rows = displayContainer.querySelectorAll("display-container");
        expect(rows.length).toBe(14);
        for (let i = 0; i < rows.length; i++) {
            expect(rows[i].children.length).toBe(4);
            expect(rows[i].children[2].textContent)
                .toBe(fix.componentInstance.data[i][2].toString());
        }
    });
});

/** igxVirtFor for testing */
@Directive({ selector: "[igxVirtForTest]" })
export class TestIgVirtualForOf<T> extends IgxVirtualForOf<T> {
    constructor(
        public viewContainer: ViewContainerRef,
        public template: TemplateRef<NgForOfContext<T>>,
        public differs: IterableDiffers,
        public fResolver: ComponentFactoryResolver,
        public changeDet: ChangeDetectorRef,
        public zone: NgZone) {
        super(viewContainer, template, differs, fResolver, changeDet, zone);
    }

    public testOnScroll(target) {
        const event = new Event("scroll");
        Object.defineProperty(event, "target", {value: target, enumerable: true});
        super.onScroll(event);
    }

    public testOnHScroll(target) {
        const event = new Event("scroll");
        Object.defineProperty(event, "target", {value: target, enumerable: true});
        super.onHScroll(event);
    }

    public testOnWheel(_deltaX: number, _deltaY: number) {
        const event = new WheelEvent("wheel", {deltaX: _deltaX, deltaY: _deltaY});
        super.onWheel(event);
    }

    public testApplyChanges(changes: IterableChanges<T>) {
        super._applyChanges(changes);
    }

    public testCalculatePageSize(): number {
        return super._calculatePageSize();
    }

    public testInitHCache(cols: any[]): number {
        return super.initHCache(cols);
    }

    public testGetHorizontalScroll(viewref, nodeName) {
        return super.getElement(viewref, nodeName);
    }

    public testGetHorizontalIndexAt(left, set, index) {
        super.getHorizontalIndexAt(left, set, index);
    }
}

/** Empty virtualized component */
@Component({
    template: `
        <span #container>
            <ng-template igxVirtForTest [igxVirtForOf]="data"></ng-template>
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
            <ng-template #scrollContainer igxVirtForTest let-rowData [igxVirtForOf]="data"
                [igxVirtForScrolling]="'vertical'"
                [igxVirtForContainerSize]='height'
                [igxVirtForItemSize]='"50px"'>
                <div [style.display]="'flex'" [style.height]="'50px'">
                    <div [style.min-width]=cols[0].width>{{rowData['1']}}</div>
                    <div [style.min-width]=cols[1].width>{{rowData['2']}}</div>
                    <div [style.min-width]=cols[2].width>{{rowData['3']}}</div>
                    <div [style.min-width]=cols[3].width>{{rowData['4']}}</div>
                    <div [style.min-width]=cols[4].width>{{rowData['5']}}</div>
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

    @ViewChild("scrollContainer", { read: TestIgVirtualForOf })
    public parentVirtDir: TestIgVirtualForOf<any>;

    public ngOnInit(): void {
        this.generateData();
    }

    public scrollTop(newScrollTop) {
        const verticalScrollbar = this.container.nativeElement.querySelector("virtual-helper");
        verticalScrollbar.scrollTop = newScrollTop;

        this.parentVirtDir.testOnScroll(verticalScrollbar);
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
                    <ng-template #childContainer igxVirtForTest let-col [igxVirtForOf]="cols"
                        [igxVirtForScrolling]="'horizontal'"
                        [igxVirtForUseForScroll]="scrollContainer"
                        [igxVirtForContainerSize]='width'>
                            <div [style.min-width]='col.width + "px"'>{{rowData[col.field]}}</div>
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

    @ViewChildren("childContainer", {read: TestIgVirtualForOf})
    public childVirtDirs: QueryList<TestIgVirtualForOf<any>>;

    public ngOnInit(): void {
        this.generateData();
        this.scrollContainer._viewContainer = this.container;
    }

    public scrollLeft(newScrollLeft) {
        const horizontalScrollbar =
            this.container.element.nativeElement.parentElement.querySelector("horizontal-virtual-helper");
        horizontalScrollbar.scrollLeft = newScrollLeft;

        this.childVirtDirs.forEach((item) => {
            item.testOnHScroll(horizontalScrollbar);
        });
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
            <ng-template #scrollContainer igxVirtForTest let-rowData [igxVirtForOf]="data"
                [igxVirtForScrolling]="'vertical'"
                [igxVirtForContainerSize]='height'
                [igxVirtForItemSize]='"50px"'>
                <div [style.display]="'flex'" [style.height]="'50px'">
                    <ng-template #childContainer igxVirtForTest let-col [igxVirtForOf]="cols"
                        [igxVirtForScrolling]="'horizontal'"
                        [igxVirtForUseForScroll]="parentVirtDir"
                        [igxVirtForContainerSize]='width'>
                            <div [style.min-width]='col.width + "px"'>{{rowData[col.field]}}</div>
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

    @ViewChild("container", { read: ViewContainerRef })
    public container: ViewContainerRef;

    @ViewChild("scrollContainer", { read: TestIgVirtualForOf })
    public parentVirtDir: TestIgVirtualForOf<any>;

    @ViewChildren("childContainer", { read: TestIgVirtualForOf })
    public childVirtDirs: QueryList<TestIgVirtualForOf<any>>;

    public ngOnInit(): void {
        this.generateData();
    }

    public scrollTop(newScrollTop) {
        const verticalScrollbar = this.container.element.nativeElement.querySelector("virtual-helper");
        verticalScrollbar.scrollTop = newScrollTop;

        this.parentVirtDir.testOnScroll(verticalScrollbar);
    }

    public scrollLeft(newScrollLeft) {
        const horizontalScrollbar = this.container.element.nativeElement.querySelector("horizontal-virtual-helper");
        horizontalScrollbar.scrollLeft = newScrollLeft;

        this.childVirtDirs.forEach((item) => {
            item.testOnHScroll(horizontalScrollbar);
        });
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
