import { Component, ViewChild } from "@angular/core";
import {
    async,
    TestBed
} from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { IgxCheckbox } from "./checkbox.component";

describe("IgxCheckbox", function() {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitCheckbox,
                CheckboxSimple,
                CheckboxDisabled,
                IgxCheckbox
            ],
            imports: [FormsModule]
        })
        .compileComponents();
    }));

    it("Initializes a checkbox", () => {
        const fixture = TestBed.createComponent(InitCheckbox);
        fixture.detectChanges();

        const nativeCheckbox = fixture.debugElement.query(By.css("input")).nativeElement;
        const nativeLabel = fixture.debugElement.query(By.css("label")).nativeElement;

        expect(nativeCheckbox).toBeTruthy();
        expect(nativeLabel).toBeTruthy();
        expect(nativeLabel.textContent.trim()).toEqual("Init");
    });

    it("Initialize with a ngModel", () => {
        const fixture = TestBed.createComponent(CheckboxSimple);
        fixture.detectChanges();

        const nativeCheckbox = fixture.debugElement.query(By.css("input")).nativeElement;
        const checkboxInstance = fixture.componentInstance.cb;
        const testInstance = fixture.componentInstance;

        fixture.detectChanges();

        expect(nativeCheckbox.checked).toBe(false);
        expect(checkboxInstance.checked).toBe(false);

        testInstance.subscribed = true;
        fixture.detectChanges();

        expect(nativeCheckbox.checked).toBe(true);
        expect(checkboxInstance.checked).toBe(true);
    });

    it("Disabled state", () => {
        const fixture = TestBed.createComponent(CheckboxDisabled);
        fixture.detectChanges();

        const nativeCheckbox = fixture.debugElement.query(By.css("input")).nativeElement;
        const checkboxInstance = fixture.componentInstance.cb;
        const testInstance = fixture.componentInstance;

        fixture.detectChanges();

        expect(checkboxInstance.disabled).toBe(true);
        expect(nativeCheckbox.getAttribute("disabled")).toBe("true");

        nativeCheckbox.dispatchEvent(new Event("change"));
        fixture.detectChanges();

        // Should not update
        expect(checkboxInstance.checked).toBe(false);
        expect(testInstance.subscribed).toBe(false);
    });

    it("Event handling", () => {
        const fixture = TestBed.createComponent(CheckboxSimple);
        fixture.detectChanges();

        const nativeCheckbox = fixture.debugElement.query(By.css("input")).nativeElement;
        const checkboxInstance = fixture.componentInstance.cb;
        const testInstance = fixture.componentInstance;

        nativeCheckbox.dispatchEvent(new Event("focus"));
        fixture.detectChanges();

        expect(checkboxInstance.focused).toBe(true);

        nativeCheckbox.dispatchEvent(new Event("blur"));
        fixture.detectChanges();

        expect(checkboxInstance.focused).toBe(false);

        spyOn(checkboxInstance.change, "emit");
        nativeCheckbox.dispatchEvent(new Event("change"));
        fixture.detectChanges();

        expect(checkboxInstance.change.emit).toHaveBeenCalled();
        expect(testInstance.subscribed).toBe(true);
    });
});

@Component({ template: `<igx-checkbox>Init</igx-checkbox>`})
class InitCheckbox {}

@Component({ template: `<igx-checkbox #cb [(ngModel)]="subscribed" [checked]="subscribed">Simple</igx-checkbox>`})
class CheckboxSimple {
    @ViewChild("cb") cb: IgxCheckbox;

    subscribed: boolean = false;
}

@Component({ template: `<igx-checkbox #cb [(ngModel)]="subscribed" [checked]="subscribed" [disabled]="true">Disabled</igx-checkbox>`})
class CheckboxDisabled {
    @ViewChild("cb") cb: IgxCheckbox;

    subscribed: boolean = false;
}
