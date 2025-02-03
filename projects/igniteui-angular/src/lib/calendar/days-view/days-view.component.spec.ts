import { Component, DebugElement, ViewChild } from "@angular/core";
import { IgxDaysViewComponent } from "./days-view.component";
import { configureTestSuite } from "../../test-utils/configure-suite";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { UIInteractions } from "../../test-utils/ui-interactions.spec";
import { CalendarDay } from "../common/model";
import { DateRangeDescriptor, DateRangeType } from 'igniteui-webcomponents';
import { ScrollDirection } from "../calendar";

const TODAY = new Date(2024, 6, 12);

describe("Days View Component", () => {
    configureTestSuite();
    const baseClass = "igx-days-view";

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [InitDaysViewComponent],
        }).compileComponents();
    }));

    it("initializes a days-view component with auto-incremented id", () => {
        const fixture = TestBed.createComponent(InitDaysViewComponent);
        fixture.detectChanges();
        const { instance } = fixture.componentInstance;
        const { nativeElement: hostEl } = fixture.debugElement.query(
            By.css(baseClass),
        );

        expect(instance.id).toContain(`${baseClass}-`);
        expect(hostEl.id).toContain(`${baseClass}-`);

        instance.id = "customDaysView";
        fixture.detectChanges();

        expect(instance.id).toBe("customDaysView");
        expect(hostEl.id).toBe("customDaysView");
    });

    it("should set the showActiveDay property", () => {
        const fixture = TestBed.createComponent(InitDaysViewComponent);
        const { instance } = fixture.componentInstance;
        instance.showActiveDay = true;
        fixture.detectChanges();
    });

    it("should automatically set the showActiveDay property to `true` on focus", () => {
        const fixture = TestBed.createComponent(InitDaysViewComponent);
        const el = fixture.debugElement.query(By.css("igx-days-view"));
        const { instance } = fixture.componentInstance;
        fixture.detectChanges();

        el.nativeElement.focus();
        fixture.detectChanges();

        expect(instance.showActiveDay).toBe(true);
    });

    it("should automatically set the showActiveDay property to `false` on blur", () => {
        const fixture = TestBed.createComponent(InitDaysViewComponent);
        const el = fixture.debugElement.query(By.css("igx-days-view"));
        const { instance } = fixture.componentInstance;
        fixture.detectChanges();

        el.nativeElement.focus();
        fixture.detectChanges();

        el.nativeElement.blur();
        fixture.detectChanges();

        expect(instance.showActiveDay).toBe(false);
    });

    it("should set activeDate to the first day of the current month when no value is provided", () => {
        const firstMonthDay = new Date(
            TODAY.getFullYear(),
            TODAY.getMonth(),
            1,
        );
        const fixture = TestBed.createComponent(InitDaysViewComponent);
        const { instance } = fixture.componentInstance;
        fixture.detectChanges();

        expect(instance.activeDate).toEqual(firstMonthDay);
    });

    it("should hide leading/trailing inactive days when hideLeadingDays/hideTrailingDays are set", () => {
        const fixture = TestBed.createComponent(InitDaysViewComponent);
        const { instance } = fixture.componentInstance;
        fixture.detectChanges();

        const { leading: initialLeading, trailing: initialTrailing } =
            getInactiveDays(fixture);

        instance.hideLeadingDays = true;
        fixture.detectChanges();

        const { leading } = getInactiveDays(fixture);

        if (initialLeading.length > 0) {
            expect(leading.length).toEqual(0);
        }

        instance.hideTrailingDays = true;
        fixture.detectChanges();

        const { trailing } = getInactiveDays(fixture);

        if (initialTrailing.length > 0) {
            expect(trailing.length).toEqual(0);
        }
    });

    describe("Keyboard navigation", () => {
        let fixture: ComponentFixture<InitDaysViewComponent>;
        let el: HTMLElement;
        let instance: IgxDaysViewComponent;
        const firstDay = CalendarDay.from(
            new Date(TODAY.getFullYear(), TODAY.getMonth(), 1),
        );
        const lastDay = CalendarDay.from(
            new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0),
        );

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(InitDaysViewComponent);
            el = fixture.debugElement.query(
                By.css("igx-days-view"),
            ).nativeElement;
            instance = fixture.componentInstance.instance;
            fixture.detectChanges();

            el.focus();
            fixture.detectChanges();
        }));

        it("should navigate to the next day when pressing the right arrow key", () => {
            UIInteractions.triggerKeyDownEvtUponElem(
                "ArrowRight",
                document.activeElement,
            );

            fixture.detectChanges();
            expect(instance.activeDate).toEqual(firstDay.add("day", 1).native);
        });

        it("should navigate to the previous day when pressing the left arrow key", () => {
            UIInteractions.triggerKeyDownEvtUponElem(
                "ArrowLeft",
                document.activeElement,
            );

            fixture.detectChanges();
            expect(instance.activeDate).toEqual(firstDay.add("day", -1).native);
        });

        it("should navigate to same day next week when pressing the down arrow key", () => {
            UIInteractions.triggerKeyDownEvtUponElem(
                "ArrowDown",
                document.activeElement,
            );

            fixture.detectChanges();
            expect(instance.activeDate).toEqual(firstDay.add("day", 7).native);
        });

        it("should navigate to same day prev week when pressing the up arrow key", () => {
            UIInteractions.triggerKeyDownEvtUponElem(
                "ArrowUp",
                document.activeElement,
            );

            fixture.detectChanges();
            expect(instance.activeDate).toEqual(firstDay.add("day", -7).native);
        });

        it("should navigate to the first active date in the month when pressing the Home key", () => {
            instance.activeDate = firstDay.add("day", 10).native;
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem(
                "Home",
                document.activeElement,
            );

            fixture.detectChanges();
            expect(instance.activeDate).toEqual(firstDay.native);
        });

        it("should navigate to the last active date in the month when pressing the End key", () => {
            UIInteractions.triggerKeyDownEvtUponElem(
                "End",
                document.activeElement,
            );

            fixture.detectChanges();
            expect(instance.activeDate).toEqual(lastDay.native);
        });

        it("should select the activeDate when pressing the enter key", () => {
            spyOn(instance.dateSelected, "emit");
            spyOn(instance.selected, "emit");

            instance.activeDate = firstDay.add("day", 4).native;
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem(
                "Enter",
                document.activeElement,
            );
            fixture.detectChanges();

            expect(instance.dateSelected.emit).toHaveBeenCalledWith(
                instance.activeDate,
            );
            expect(instance.selected.emit).toHaveBeenCalledWith([
                instance.activeDate,
            ]);
            expect(instance.selectedDates).toEqual([instance.activeDate]);
        });

        it("should skip disabled dates when navigating with arrow keys", () => {
            instance.activeDate = firstDay.add("day", 10).native;
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem(
                "ArrowRight",
                document.activeElement,
            );

            fixture.detectChanges();
            expect(instance.activeDate).toEqual(firstDay.add("day", 12).native);

            UIInteractions.triggerKeyDownEvtUponElem(
                "ArrowLeft",
                document.activeElement,
            );
            expect(instance.activeDate).toEqual(firstDay.add("day", 10).native);

            instance.activeDate = firstDay.add("day", 4).native;
            UIInteractions.triggerKeyDownEvtUponElem(
                "ArrowDown",
                document.activeElement,
            );
            expect(instance.activeDate).toEqual(firstDay.add("day", 18).native);

            UIInteractions.triggerKeyDownEvtUponElem(
                "ArrowUp",
                document.activeElement,
            );
            expect(instance.activeDate).toEqual(firstDay.add("day", 4).native);
        });

        it("should emit pageChaged event when the active date is in the previous/next months", () => {
            spyOn(instance.pageChanged, "emit");
            instance.activeDate = firstDay.native;
            fixture.detectChanges();

            // Movo to previous month
            UIInteractions.triggerKeyDownEvtUponElem(
                "ArrowLeft",
                document.activeElement,
            );

            expect(instance.pageChanged.emit).toHaveBeenCalledWith({
                monthAction: ScrollDirection.PREV,
                key: "ArrowLeft",
                nextDate: instance.activeDate,
            });

            // Movo to next month
            UIInteractions.triggerKeyDownEvtUponElem(
                "ArrowRight",
                document.activeElement,
            );

            expect(instance.pageChanged.emit).toHaveBeenCalledWith({
                monthAction: ScrollDirection.NEXT,
                key: "ArrowRight",
                nextDate: instance.activeDate,
            });
        });
    });

    describe("Mouse interactions", () => {
        let fixture: ComponentFixture<InitDaysViewComponent>;
        let el: HTMLElement;
        let instance: IgxDaysViewComponent;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(InitDaysViewComponent);
            el = fixture.debugElement.query(
                By.css("igx-days-view"),
            ).nativeElement;
            instance = fixture.componentInstance.instance;
            fixture.detectChanges();

            el.focus();
            fixture.detectChanges();
        }));

        it("should select the clicked date", () => {
            spyOn(instance.dateSelected, "emit");
            spyOn(instance.selected, "emit");

            const day = fixture.debugElement.query(
                By.css(
                    ".igx-days-view__date:not(.igx-days-view__date--inactive)",
                ),
            );

            UIInteractions.simulateClickAndSelectEvent(day.nativeElement.firstChild);
            fixture.detectChanges();

            expect(instance.dateSelected.emit).toHaveBeenCalledWith(
                instance.activeDate,
            );

            expect(instance.selected.emit).toHaveBeenCalledWith([
                instance.activeDate,
            ]);

            expect(instance.selectedDates).toEqual([instance.activeDate]);
        });

        it("should emit pageChanged when clicking on a date outside the previous/next months", () => {
            spyOn(instance.pageChanged, "emit");

            let days = fixture.debugElement.queryAll(
                By.css(".igx-days-view__date--inactive"),
            );

            UIInteractions.simulateClickAndSelectEvent(
                days.at(0).nativeElement.firstChild,
            );
            fixture.detectChanges();

            expect(instance.pageChanged.emit).toHaveBeenCalledWith({
                monthAction: ScrollDirection.PREV,
                key: "",
                nextDate: instance.activeDate,
            });

            days = fixture.debugElement.queryAll(
                By.css(".igx-days-view__date--inactive"),
            );

            UIInteractions.simulateClickAndSelectEvent(
                days.at(-1).nativeElement.firstChild,
            );
            fixture.detectChanges();

            expect(instance.pageChanged.emit).toHaveBeenCalledWith({
                monthAction: ScrollDirection.NEXT,
                key: "",
                nextDate: instance.activeDate,
            });
        });
    });
});

function getInactiveDays(fixture: ComponentFixture<InitDaysViewComponent>) {
    const days = fixture.debugElement.queryAll(By.css(".igx-days-view__date"));
    const inactiveDays = fixture.debugElement.queryAll(
        By.css(
            ".igx-days-view__date--inactive:not(igx-dasy-view__date--hidden)",
        ),
    );

    const firstActiveIndex = days.findIndex(
        (d: DebugElement) =>
            !d.nativeElement.classList.contains(
                "igx-days-view__date--inactive",
            ),
    );

    const notHidden = (d: DebugElement) =>
        !d.nativeElement.classList.contains("igx-days-view__date--hidden");

    const leading = inactiveDays.slice(0, firstActiveIndex).filter(notHidden);
    const trailing = inactiveDays
        .slice(firstActiveIndex, inactiveDays.length)
        .filter(notHidden);

    return { leading, trailing };
}

@Component({
    template: `<igx-days-view
        [value]="date"
        [disabledDates]="disabledDates"
    ></igx-days-view>`,
    imports: [IgxDaysViewComponent]
})
class InitDaysViewComponent {
    @ViewChild(IgxDaysViewComponent, { static: true })
    public instance: IgxDaysViewComponent;
    public date = TODAY;
    protected disabledDates: DateRangeDescriptor[] = [
        {
            type: DateRangeType.Specific,
            dateRange: [
                new Date(TODAY.getFullYear(), TODAY.getMonth(), 12),
                new Date(TODAY.getFullYear(), TODAY.getMonth(), 24),
            ],
        },
    ];
}
