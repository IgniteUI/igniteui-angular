import { Component, Input, ViewChild } from "@angular/core";
import {
  async,
  fakeAsync,
  TestBed,
  tick
} from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { IgxInputModule } from "../input/input.directive";
import { IgxMaskModule } from "./mask.directive";

describe("AppComponent", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                AlphanumSpaceMaskComponent,
                AnyCharMaskComponent,
                DefMaskComponent,
                DigitPlusMinusMaskComponent,
                DigitSpaceMaskComponent,
                EventFiringComponent,
                IncludeLiteralsComponent,
                LetterSpaceMaskComponent,
                MaskComponent,
                OneWayBindComponent
            ],
            imports: [
                FormsModule,
                IgxInputModule,
                IgxMaskModule
            ]
        })
        .compileComponents();
    }));

    it("Initializes an input with default mask", fakeAsync(() => {
        const fixture = TestBed.createComponent(DefMaskComponent);
        fixture.detectChanges();

        // const comp = fixture.componentInstance;
        const input = fixture.debugElement.query(By.css("input"));

        expect(input.nativeElement.value).toEqual("__________");

        input.triggerEventHandler("click", {});
        tick();

        input.nativeElement.value = "@#$YUA123";
        input.nativeElement.dispatchEvent(new Event("input"));
        tick();

        input.triggerEventHandler("focus", {});
        tick();

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual("@#$YUA123_");
        });
    }));

    it("Mask rules - digit (0-9) or a space", fakeAsync(() => {
        const fixture = TestBed.createComponent(DigitSpaceMaskComponent);
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css("input"));

        input.triggerEventHandler("focus", {});
        tick();

        expect(input.nativeElement.value).toEqual("555 55");

    }));

    it("Mask rules - digit (0-9), plus (+), or minus (-) sign", fakeAsync(() => {
        const fixture = TestBed.createComponent(DigitPlusMinusMaskComponent);
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css("input"));

        input.triggerEventHandler("focus", {});
        tick();

        expect(input.nativeElement.value).toEqual("+359-884 19 08 54");
    }));

    it("Mask rules - letter (a-Z) or a space", fakeAsync(() => {
        const fixture = TestBed.createComponent(LetterSpaceMaskComponent);
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css("input"));

        input.triggerEventHandler("focus", {});
        tick();

        expect(input.nativeElement.value).toEqual("AB _CD E");
    }));

    it("Mask rules - alphanumeric (0-9, a-Z) or a space", fakeAsync(() => {
        const fixture = TestBed.createComponent(AlphanumSpaceMaskComponent);
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css("input"));

        input.triggerEventHandler("focus", {});
        tick();

        expect(input.nativeElement.value).toEqual("7c_ 8u");
    }));

    it("Mask rules - any keyboard character", fakeAsync(() => {
        const fixture = TestBed.createComponent(AnyCharMaskComponent);
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css("input"));

        input.triggerEventHandler("focus", {});
        tick();

        expect(input.nativeElement.value).toEqual("_=%. p]");
    }));

    it("Enter value with a preset mask and value", fakeAsync(() => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();

        const comp = fixture.componentInstance;
        const input = fixture.debugElement.query(By.css("input"));

        input.triggerEventHandler("focus", {});
        tick();
        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual("(123) 4567-890");
        expect(comp.value).toEqual("1234567890");

        input.nativeElement.value = "7777";
        input.nativeElement.dispatchEvent(new Event("input"));
        tick();

        input.triggerEventHandler("focus", {});
        tick();

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual("(777) 7___-___");
            expect(comp.value).toEqual("7777");
        });
    }));

    it("Enter incorrect value with a preset mask", fakeAsync(() => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css("input[type=text]"));

        input.triggerEventHandler("focus", {});
        tick();

        input.nativeElement.value = "abc4569d12";
        input.nativeElement.dispatchEvent(new Event("input"));
        tick();

        input.triggerEventHandler("focus", {});
        tick();

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual("(___) 4569-_12");
        });

        input.triggerEventHandler("focus", {});
        tick();

        input.nativeElement.value = "1111111111111111111";
        input.nativeElement.dispatchEvent(new Event("input"));
        tick();

        input.triggerEventHandler("focus", {});
        tick();

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual("(111) 1111-111");
        });
    }));

    it("Include literals in component value", fakeAsync(() => {
        const fixture = TestBed.createComponent(IncludeLiteralsComponent);
        fixture.detectChanges();

        const comp = fixture.componentInstance;
        const inputs = fixture.debugElement.queryAll(By.css("input"));

        inputs[0].triggerEventHandler("focus", {});
        tick();

        expect(inputs[0].nativeElement.value).toEqual("(555) 55__-___");
    }));

    it("Correct event firing", fakeAsync(() => {
        const fixture = TestBed.createComponent(EventFiringComponent);
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css("input[type=text]"));

        input.triggerEventHandler("focus", {});
        tick();

        input.nativeElement.value = "123";
        input.nativeElement.dispatchEvent(new Event("input"));
        tick();

        input.triggerEventHandler("focus", {});
        tick();

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual("(123) ____-___");

            expect(fixture.componentInstance.raw).toEqual("123");
        });
    }));

    it("One way binding", fakeAsync(() => {
        const fixture = TestBed.createComponent(OneWayBindComponent);
        fixture.detectChanges();

        const comp = fixture.componentInstance;
        const input = fixture.debugElement.query(By.css("input"));

        expect(input.nativeElement.value).toEqual("3456");

        input.triggerEventHandler("focus", null);
        tick();

        fixture.whenStable().then(() => {
            fixture.detectChanges();

            expect(input.nativeElement.value).toEqual("3456****");
            expect(comp.value).toEqual(3456);

            input.nativeElement.value = "A";
            input.nativeElement.dispatchEvent(new Event("input"));
            tick();

            input.triggerEventHandler("focus", null);
            tick();

            expect(input.nativeElement.value).toEqual("A*******");
        });
    }));

    it("Selection", fakeAsync(() => {
        const fixture = TestBed.createComponent(MaskComponent);
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css("input"));

        input.nativeElement.focus();
        tick();

        input.nativeElement.select();
        tick();

        const keyEvent = new KeyboardEvent("keydown", {key : "57"});
        input.nativeElement.dispatchEvent(keyEvent);
        tick();

        fixture.detectChanges();

        input.nativeElement.value = "";
        input.triggerEventHandler("input", {});
        tick();

        input.triggerEventHandler("focus", {});
        tick();

        fixture.detectChanges();

        expect(input.nativeElement.value).toEqual("(___) ____-___");

    }));
});

@Component({ template: `<input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>` })
class DefMaskComponent {
    public mask;
    public value;
}

@Component({ template: `<input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>` })
class MaskComponent {
    public mask = "(000) 0000-000";
    public value = "1234567890";
}

@Component({ template: `<input type="text" igxInput [(ngModel)]="value" [igxMask]="mask" [includeLiterals]="true"/>
                            <input [ngModel]="value"/>` })
class IncludeLiteralsComponent {
    public mask = "(000) 0000-000";
    @Input() public value = "55555";
}

@Component({ template: `<input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>` })
class DigitSpaceMaskComponent {
    public mask = "999999";
    public value = "555 555";
}

@Component({ template: `<input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>` })
class DigitPlusMinusMaskComponent {
    public mask = "####-### ## ## ##";
    public value = "+359884190854";
}

@Component({ template: `<input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>` })
class LetterSpaceMaskComponent {
    public mask = "LL??LL??";
    public value = "AB 2CD E";
}

@Component({ template: `<input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>` })
class AlphanumSpaceMaskComponent {
    public mask = "AAAaaa";
    public value = "7c  8u";
}

@Component({ template: `<input type="text" igxInput [(ngModel)]="value" [igxMask]="mask"/>` })
class AnyCharMaskComponent {
    public mask = "&&&.CCC";
    public value = " =% p]";
}

@Component({ template: `<input type="text" igxInput [(ngModel)]="myValue" [igxMask]="myMask"
                        (onValueChange)="handleValueChange($event)"/>` })
class EventFiringComponent {
    myValue = "";
    myMask = "(000) 0000-000";
    raw: string;
    formatted: string;

    handleValueChange(event) {
        this.raw = event.rawValue;
        this.formatted = event.formattedValue;
    }
}

@Component({ template: `<input type="text" igxInput [value]="value" [igxMask]="myMask" [includeLiterals]="true" [promptChar]="'*@#'"/>` })
class OneWayBindComponent {
    myMask = "AAAAAAAA";
    value = 3456;
}
