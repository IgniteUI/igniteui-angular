import { Component, DebugElement, ViewChild } from "@angular/core";
import {
    async,
    TestBed
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgxAutoFocusDirective } from "./auto-focus.directive";

describe("igxAutoFocus", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxAutoFocusDirective,
                SetAutoFocusComponent,
                TriggerFocusOnClickComponent
            ]
        }).compileComponents();
    }));

    it("The second element should be focused", () => {
        const fix = TestBed.createComponent(SetAutoFocusComponent);
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
            <input type="text" [igxAutoFocus]="false" value="Fifth" />
            <input type="text" value="Seventh" />
        `;
        TestBed.overrideComponent(SetAutoFocusComponent, {
            set: {
                template
            }
        });

        TestBed.compileComponents().then(() => {
            const fix = TestBed.createComponent(SetAutoFocusComponent);
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
        <input type="text" [igxAutoFocus]="true" value="Fifth" />
        <input type="text" value="Seventh" />
    `
})
class SetAutoFocusComponent {
    @ViewChild(IgxAutoFocusDirective) public autoFocusDir: IgxAutoFocusDirective;
}

@Component({
    template:
    `
    <div>First</div>
    <div>Second</div>
    <div [igxAutoFocus] #autoFocus="igxFocus" (focus)="autoFocus.trigger()">Third</div>
    <button (click)="focus()">Focus the third one</button>
    `
})
class TriggerFocusOnClickComponent {
    @ViewChild(IgxAutoFocusDirective) public autoFocus: IgxAutoFocusDirective;

    focus() {
        this.autoFocus.trigger();
    }

}
