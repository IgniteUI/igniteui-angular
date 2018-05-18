import { Component, DebugElement, ViewChild } from "@angular/core";
import {
    async,
    TestBed
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgxFocusDirective } from "./focus.directive";

describe("igxFocus", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxFocusDirective,
                SetFocusComponent,
                TriggerFocusOnClickComponent
            ]
        }).compileComponents();
    }));

    it("The second element should be focused", () => {
        const fix = TestBed.createComponent(SetFocusComponent);
        fix.detectChanges();

        const secondElem: HTMLElement = fix.debugElement.queryAll(By.all())[1].nativeElement;

        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(document.activeElement.isSameNode(secondElem)).toBe(true);
        });
    });

    it("Should select the last input element when click the button", () => {
        const fix = TestBed.createComponent(TriggerFocusOnClickComponent);
        fix.detectChanges();

        const button: DebugElement = fix.debugElement.query(By.css("button"));
        const divs = fix.debugElement.queryAll(By.all());
        const lastDiv = divs[divs.length - 1 ].nativeElement;

        button.triggerEventHandler("click", null);

        fix.detectChanges();

        fix.whenStable().then(() => {
            expect(document.activeElement.isSameNode(lastDiv));
        });
    });

    it("Should not focus when the focus state is set to false", () => {
        const template =
        `
            <input type="text" value="First" />
            <input type="text" [igxFocus]="false" value="Fifth" />
            <input type="text" value="Seventh" />
        `;
        TestBed.overrideComponent(SetFocusComponent, {
            set: {
                template
            }
        });

        TestBed.compileComponents().then(() => {
            const fix = TestBed.createComponent(SetFocusComponent);
            fix.detectChanges();

            const secondInput = fix.debugElement.queryAll(By.all())[1].nativeElement;

            expect(document.activeElement.isSameNode(secondInput)).toBe(false);
            expect(document.activeElement.isSameNode(document.body)).toBe(true);

        }).catch((reason) => {
            return Promise.reject(reason);
        });
    });
});

@Component({
    template:
    `
        <input type="text" value="First" />
        <input type="text" [igxFocus]="true" value="Fifth" />
        <input type="text" value="Seventh" />
    `
})
class SetFocusComponent { }

@Component({
    template:
    `
    <div>First</div>
    <div>Second</div>
    <div [igxFocus]>Third</div>
    <button (click)="focus()">Focus the third one</button>
    `
})
class TriggerFocusOnClickComponent {
    @ViewChild(IgxFocusDirective) public focusRef: IgxFocusDirective;

    focus() {
        this.focusRef.trigger();
    }

}
