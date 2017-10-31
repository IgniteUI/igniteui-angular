import {Component, ViewChild} from "@angular/core";
import {async, TestBed} from "@angular/core/testing";
import {IgxScroll, IgxScrollEvent, IgxScrollModule} from "./scroll.component";

declare var Simulator: any;

describe("IgxScroll", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ScrollInitializeTestComponent
            ],
            imports: [
                IgxScrollModule
            ]
        }).compileComponents();
    }));

    afterEach(() => {

    });

    it("should initialize only with specified items", () => {
        const fixture = TestBed.createComponent(ScrollInitializeTestComponent);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement;
        const listItems = nativeElement.querySelectorAll(".list-item");

        expect(listItems.length).toBe(5);
        expect(fixture.componentInstance.scroll.scrollTop).toEqual(0);
    });

    it("should change current top when scrolling through api", () => {
        const fixture = TestBed.createComponent(ScrollInitializeTestComponent);
        fixture.detectChanges();

        const currentTopBeforeScroll = fixture.componentInstance.currentTop;

        fixture.componentInstance.scroll.scrollVertically(400);
        fixture.detectChanges();

        const currentTopAfterScroll = fixture.componentInstance.currentTop;

        expect(currentTopBeforeScroll).not.toEqual(currentTopAfterScroll);
    });

    it("should not change currentTop when scrolling through api when it scrolled " +
        "all the way to top and scrolling with negative delta", () => {
        const fixture = TestBed.createComponent(ScrollInitializeTestComponent);
        fixture.detectChanges();

        const currentTopBeforeScroll = fixture.componentInstance.currentTop;

        fixture.componentInstance.scroll.scrollVertically(-1000);
        fixture.detectChanges();

        const currentTopAfterScroll = fixture.componentInstance.currentTop;

        expect(currentTopBeforeScroll).toEqual(currentTopAfterScroll);
    });

    it("should not change currentTop when scrolling through api when it scrolled " +
        "all the way to bottom and scrolling with positive delta", () => {
        const fixture = TestBed.createComponent(ScrollInitializeTestComponent);
        fixture.detectChanges();

        fixture.componentInstance.scroll.scrollVertically(250000);
        fixture.detectChanges();

        const currentTopBeforeScroll = fixture.componentInstance.currentTop;

        fixture.componentInstance.scroll.scrollVertically(237);
        fixture.detectChanges();

        const currentTopAfterScroll = fixture.componentInstance.currentTop;

        expect(currentTopBeforeScroll).toEqual(currentTopAfterScroll);
    });

    it("should scroll with mouse wheel to bottom and change currentTop when is at top position", (done) => {
        let fixture;
        let currentTopBeforeScroll;
        let currentTopAfterScroll;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ScrollInitializeTestComponent);
            fixture.detectChanges();

            return fixture.whenStable();
        }).then(() => {
            const scrollViewPort = fixture.nativeElement.querySelector(".igx-scroll__viewport");
            currentTopBeforeScroll = fixture.componentInstance.currentTop;

            return simulateWheel(scrollViewPort, 0, 150);
        }).then(() => {
            fixture.detectChanges();
            currentTopAfterScroll = fixture.componentInstance.currentTop;

            expect(currentTopBeforeScroll).not.toEqual(currentTopAfterScroll);
            done();
        });
    }, 5000);

    it("should scroll with mouse wheel to top and change currentTop when is at bottom position", (done) => {
        let fixture;
        let currentTopBeforeScroll;
        let currentTopAfterScroll;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ScrollInitializeTestComponent);
            fixture.detectChanges();

            fixture.componentInstance.scroll.scrollVertically(250000);
            fixture.detectChanges();

            return fixture.whenStable();
        }).then(() => {
            const scrollViewPort = fixture.nativeElement.querySelector(".igx-scroll__viewport");
            currentTopBeforeScroll = fixture.componentInstance.currentTop;

            return simulateWheel(scrollViewPort, 0, -150);
        }).then(() => {
            fixture.detectChanges();
            currentTopAfterScroll = fixture.componentInstance.currentTop;

            expect(currentTopBeforeScroll).not.toEqual(currentTopAfterScroll);
            done();
        });
    }, 5000);

    function simulateWheel(element, deltaX, deltaY) {
        const wheelOptions = {
            deltaMode: 0,
            deltaX,
            deltaY
        };

        const wheelEvent = new WheelEvent("wheel", wheelOptions);

        return new Promise((resolve, reject) => {
            element.dispatchEvent(wheelEvent);
            resolve();
        });
    }

    xit("should scroll with pan to bottom and change currentTop when is at top position", (done) => {
        let fixture;
        let currentTopBeforeScroll;
        let currentTopAfterScroll;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ScrollInitializeTestComponent);
            fixture.detectChanges();

            return fixture.whenStable();
        }).then(() => {
            const scrollViewPort = fixture.nativeElement.querySelector(".igx-scroll__viewport");
            currentTopBeforeScroll = fixture.componentInstance.currentTop;

            return pan(scrollViewPort, 40, 200, 100, 0, -100);
        }).then(() => {
            fixture.detectChanges();
            currentTopAfterScroll = fixture.componentInstance.currentTop;

            expect(currentTopBeforeScroll).not.toEqual(currentTopAfterScroll);
            done();
        });
    }, 5000);

    xit("should scroll with pan to top and change currentTop when is at bottom position", (done) => {
        let fixture;
        let currentTopBeforeScroll;
        let currentTopAfterScroll;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ScrollInitializeTestComponent);
            fixture.detectChanges();

            fixture.componentInstance.scroll.scrollVertically(250000);
            fixture.detectChanges();

            return fixture.whenStable();
        }).then(() => {
            const scrollViewPort = fixture.nativeElement.querySelector(".igx-scroll__viewport");
            currentTopBeforeScroll = fixture.componentInstance.currentTop;

            return pan(scrollViewPort, 40, 10, 100, 0, 100);
        }).then(() => {
            fixture.detectChanges();
            currentTopAfterScroll = fixture.componentInstance.currentTop;

            expect(currentTopBeforeScroll).not.toEqual(currentTopAfterScroll);
            done();
        });
    }, 5000);

    it("should not scroll with pan to top and change currentTop when is at top position", (done) => {
        let fixture;
        let currentTopBeforeScroll;
        let currentTopAfterScroll;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ScrollInitializeTestComponent);
            fixture.detectChanges();

            return fixture.whenStable();
        }).then(() => {
            const scrollViewPort = fixture.nativeElement.querySelector(".igx-scroll__viewport");
            currentTopBeforeScroll = fixture.componentInstance.currentTop;

            return pan(scrollViewPort, 40, 200, 100, 0, 100);
        }).then(() => {
            fixture.detectChanges();
            currentTopAfterScroll = fixture.componentInstance.currentTop;

            expect(currentTopBeforeScroll).toEqual(currentTopAfterScroll);
            done();
        });
    }, 5000);

    it("should not scroll with pan to bottom and change currentTop when is at bottom position", (done) => {
        let fixture;
        let currentTopBeforeScroll;
        let currentTopAfterScroll;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ScrollInitializeTestComponent);
            fixture.detectChanges();

            fixture.componentInstance.scroll.scrollVertically(250000);
            fixture.detectChanges();

            return fixture.whenStable();
        }).then(() => {
            const scrollViewPort = fixture.nativeElement.querySelector(".igx-scroll__viewport");
            currentTopBeforeScroll = fixture.componentInstance.currentTop;

            return pan(scrollViewPort, 40, 10, 100, 0, -100);
        }).then(() => {
            fixture.detectChanges();
            currentTopAfterScroll = fixture.componentInstance.currentTop;

            expect(currentTopBeforeScroll).toEqual(currentTopAfterScroll);
            done();
        });
    }, 5000);

    function pan(element, posX, posY, duration, deltaX, deltaY) {
        const panOptions = {
            deltaX,
            deltaY,
            duration,
            pos: [posX, posY]
        };

        return new Promise((resolve, reject) => {
            Simulator.gestures.pan(element, panOptions, () => {
                resolve();
            });
        });
    }
});
@Component({
    selector: "scroll-test-component",
    template: `
        <igx-scroll #scroll
                    (onScroll)="updateList($event)"
                    [visibleItemsCount]="visibleItemsCount"
                    [itemHeight]="50"
                    [totalItemsCount]="items.length">
            <ul class="list">
                <li class="list-item" *ngFor="let item of visibleItems" style="width:150px; height: 50px;">
                    {{item}}
                </li>
            </ul>
        </igx-scroll>`
})
class ScrollInitializeTestComponent {
    @ViewChild(IgxScroll) public scroll: IgxScroll;

    public items: string[] = [];

    public visibleItems: string[] = [];

    public visibleItemsCount: number = 5;

    public currentTop: number = 0;

    public constructor() {
        for (let i = 1; i <= 5000; i++) {
            this.items.push("item #" + i);
        }

        this.visibleItems = this.items.slice(0, 5);
    }

    private updateList($event: IgxScrollEvent): void {
        this.currentTop = $event.currentTop;

        this.visibleItems = this.items.slice($event.currentTop, $event.currentTop + this.visibleItemsCount);
    }
}
