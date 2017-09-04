import {Component, ViewChild} from "@angular/core";
import {async, TestBed} from "@angular/core/testing";
import {IgxScroll, IgxScrollEvent, IgxScrollModule} from "./scroll.component";

declare var Simulator: any;

fdescribe("IgxScroll", () => {
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
    });

    it("should change visible items when scrolling through api", () => {
        const fixture = TestBed.createComponent(ScrollInitializeTestComponent);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement;
        const listItemsBeforeScroll = [];
        const listItemsAfterScroll = [];

        nativeElement.querySelectorAll(".list-item").forEach((item) => {
            listItemsBeforeScroll.push(item.innerText);
        });

        fixture.componentInstance.scroll.scrollVertically(400);
        fixture.detectChanges();

        nativeElement.querySelectorAll(".list-item").forEach((item) => {
            listItemsAfterScroll.push(item.innerText);
        });

        expect(listItemsBeforeScroll.length).toBe(5);
        expect(listItemsAfterScroll.length).toBe(5);
        expect(listItemsBeforeScroll).not.toEqual(listItemsAfterScroll);
    });

    it("should not change visible items when scrolling through api when it scrolled " +
        "all the way to top and scrolling with negative delta", () => {
        const fixture = TestBed.createComponent(ScrollInitializeTestComponent);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement;
        const listItemsBeforeScroll = [];
        const listItemsAfterScroll = [];

        nativeElement.querySelectorAll(".list-item").forEach((item) => {
            listItemsBeforeScroll.push(item.innerText);
        });

        fixture.componentInstance.scroll.scrollVertically(-1000);
        fixture.detectChanges();

        nativeElement.querySelectorAll(".list-item").forEach((item) => {
            listItemsAfterScroll.push(item.innerText);
        });

        expect(listItemsBeforeScroll.length).toBe(5);
        expect(listItemsAfterScroll.length).toBe(5);
        expect(listItemsBeforeScroll).toEqual(listItemsAfterScroll);
    });

    it("should not change visible items when scrolling through api when it scrolled " +
        "all the way to bottom and scrolling with positive delta", () => {
        const fixture = TestBed.createComponent(ScrollInitializeTestComponent);
        fixture.detectChanges();
        const nativeElement = fixture.nativeElement;

        fixture.componentInstance.scroll.scrollVertically(250000);
        fixture.detectChanges();

        const listItemsBeforeScroll = [];
        const listItemsAfterScroll = [];

        nativeElement.querySelectorAll(".list-item").forEach((item) => {
            listItemsBeforeScroll.push(item.innerText);
        });

        fixture.componentInstance.scroll.scrollVertically(237);
        fixture.detectChanges();

        nativeElement.querySelectorAll(".list-item").forEach((item) => {
            listItemsAfterScroll.push(item.innerText);
        });

        expect(listItemsBeforeScroll.length).toBe(5);
        expect(listItemsAfterScroll.length).toBe(5);
        expect(listItemsBeforeScroll).toEqual(listItemsAfterScroll);
    });

    it("should scroll with mouse wheel to bottom and change items when is at top position", (done) => {
        const listItemsBeforeScroll = [];
        const listItemsAfterScroll = [];
        let fixture;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ScrollInitializeTestComponent);
            fixture.detectChanges();

            return fixture.whenStable();
        }).then(() => {
            const scrollViewPort = fixture.nativeElement.querySelector(".igx-scroll__viewport");

            fixture.nativeElement.querySelectorAll(".list-item").forEach((item) => {
                listItemsBeforeScroll.push(item.innerText);
            });

            return simulateWheel(scrollViewPort, 0, 150);
        }).then(() => {
            fixture.detectChanges();
            fixture.nativeElement.querySelectorAll(".list-item").forEach((item) => {
                listItemsAfterScroll.push(item.innerText);
            });

            expect(listItemsBeforeScroll).not.toEqual(listItemsAfterScroll);
            done();
        });
    }, 5000);

    fit("should scroll with mouse wheel to top and change items when is at bottom position", (done) => {
        const listItemsBeforeScroll = [];
        const listItemsAfterScroll = [];
        let fixture;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ScrollInitializeTestComponent);
            fixture.detectChanges();

            fixture.componentInstance.scroll.scrollVertically(250000);
            fixture.detectChanges();

            return fixture.whenStable();
        }).then(() => {
            const scrollViewPort = fixture.nativeElement.querySelector(".igx-scroll__viewport");

            fixture.nativeElement.querySelectorAll(".list-item").forEach((item) => {
                listItemsBeforeScroll.push(item.innerText);
            });

            return simulateWheel(scrollViewPort, 0, -150);
        }).then(() => {
            fixture.detectChanges();
            fixture.nativeElement.querySelectorAll(".list-item").forEach((item) => {
                listItemsAfterScroll.push(item.innerText);
            });

            expect(listItemsBeforeScroll).not.toEqual(listItemsAfterScroll);
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

    fit("should scroll with pan to bottom and change items when is at top position", (done) => {
        const listItemsBeforeScroll = [];
        const listItemsAfterScroll = [];
        let fixture;

        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ScrollInitializeTestComponent);
            fixture.detectChanges();

            return fixture.whenStable();
        }).then(() => {
            const scrollViewPort = fixture.nativeElement.querySelector(".igx-scroll__viewport");

            debugger;

            fixture.nativeElement.querySelectorAll(".list-item").forEach((item) => {
                listItemsBeforeScroll.push(item.innerText);
            });

            return pan(scrollViewPort, 50, 200, 100, 0, -100);
        }).then(() => {
            fixture.detectChanges();
            fixture.nativeElement.querySelectorAll(".list-item").forEach((item) => {
                listItemsAfterScroll.push(item.innerText);
            });

            expect(listItemsBeforeScroll).not.toEqual(listItemsAfterScroll);
            done();
        });
    }, 5000);

    function pan(element, posX, posY, duration, deltaX, deltaY) {
        const swipeOptions = {
            deltaX,
            deltaY,
            duration,
            pos: [posX, posY]
        };

        return new Promise((resolve, reject) => {
            Simulator.gestures.pan(element, swipeOptions, () => {
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
                    [itemsToViewCount]="visibleItemsCount"
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

    public constructor() {
        for (let i = 1; i <= 5000; i++) {
            this.items.push("item #" + i);
        }

        this.visibleItems = this.items.slice(0, 5);
    }

    private updateList($event: IgxScrollEvent): void {
        this.visibleItems = this.items.slice($event.currentTop, $event.currentTop + this.visibleItemsCount);
    }
}
