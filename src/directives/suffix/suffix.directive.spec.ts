import { Component } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgxInputGroupModule } from "../../input-group/input-group.component";

describe("IgxSuffix", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SuffixComponent
            ],
            imports: [
                IgxInputGroupModule
            ]
        })
        .compileComponents();
    }));

    it("Initializes a suffix.", () => {
        const fixture = TestBed.createComponent(SuffixComponent);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css(".igx-input-group__bundle-suffix"))).toBeTruthy();
    });
});

@Component({
    template: `<igx-suffix>suffix</igx-suffix>`
})
class SuffixComponent {
}
