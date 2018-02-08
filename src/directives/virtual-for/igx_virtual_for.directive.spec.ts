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
import { IgVirtualForOf, IgxVirtForModule } from "./igx_virtual_for.directive";

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
        horizontalScroller.scrollLeft = 100;
        fix.componentInstance.igxVirtDir.forEach((item) => {
            item.testOnHScroll(horizontalScroller);
        });

        fix.detectChanges();
        fix.changeDetectorRef.detectChanges();

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
        verticalScroller.scrollTop = 100;
        fix.componentInstance.parentVirtDir.testOnScroll(verticalScroller);

        const firstInnerDisplayContainer = displayContainer.children[0].querySelector("display-container");
        expect(firstInnerDisplayContainer).not.toBeNull();

        fix.detectChanges();

        const firstRecChildren = firstInnerDisplayContainer.children;
        for (let i = 0; i < firstRecChildren.length; i++) {
            expect(firstInnerDisplayContainer.children[i].textContent)
                .toBe(fix.componentInstance.data[2][i].toString());
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
});

/** igxVirtFor for testing */
@Directive({ selector: "[igxVirtForTest]" })
export class TestIgVirtualForOf<T> extends IgVirtualForOf<T> {
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
        return super.getHorizontalScroll(viewref, nodeName);
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

    @ViewChild("scrollContainer", { read: TestIgVirtualForOf })
    public parentVirtDir: TestIgVirtualForOf<any>;

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
                    <ng-template #igxVirtDir igxVirtForTest let-col [igxVirtForOf]="cols"
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

    @ViewChildren("igxVirtDir", {read: TestIgVirtualForOf})
    public igxVirtDir: QueryList<TestIgVirtualForOf<any>>;

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
            <ng-template #scrollContainer igxVirtForTest let-rowData [igxVirtForOf]="data"
                [igxVirtForScrolling]="'vertical'"
                [igxVirtForContainerSize]='height'
                [igxVirtForItemSize]='"50px"'>
                <div [style.display]="'flex'" [style.height]="'50px'">
                    <ng-template igxVirtForTest let-col [igxVirtForOf]="cols"
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

    @ViewChild("scrollContainer", { read: TestIgVirtualForOf })
    public parentVirtDir: TestIgVirtualForOf<any>;

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
