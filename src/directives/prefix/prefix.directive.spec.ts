import { Component } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgxInputGroupModule } from "../../input-group/input-group.component";

describe("IgxPrefix", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                PrefixComponent
            ],
            imports: [
                IgxInputGroupModule
            ]
        })
        .compileComponents();
    }));

    it("Initializes a prefix.", () => {
        const fixture = TestBed.createComponent(PrefixComponent);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css(".igx-input-group__bundle-prefix"))).toBeTruthy();
    });
});

@Component({
    template: `<igx-prefix>prefix</igx-prefix>`
})
class PrefixComponent {
}
