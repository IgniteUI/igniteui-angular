import { Component, ViewChild } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import {IgxScroll, IgxScrollModule } from "./scroll.component";

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

    it("should have lower bound equal to min value when lower bound is not set", () => {
        const fixture = TestBed.createComponent(ScrollInitializeTestComponent);
        fixture.detectChanges();

        // here be test
        expect(true)
            .toBe(true);
    });
});
@Component({
    selector: "scroll-test-component",
    template: `<igx-scroll #scroll>
    </igx-scroll>`
})
class ScrollInitializeTestComponent {
    @ViewChild(IgxScroll) public scroll: IgxScroll;
}
