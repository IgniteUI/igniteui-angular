import { Component, DebugElement, EventEmitter, Output, ViewChild } from "@angular/core";
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { IgxToggleActionDirective, IgxToggleDirective, IgxToggleModule } from "./toggle.directive";

describe("IgxToggler", () => {
    const HIDDEN_TOGGLER_CLASS = "igx-toggle--hidden";
    const TOGGLER_CLASS = "igx-toggle";
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxToggleActionDirective,
                IgxToggleActionTestComponent,
                IgxToggleDirective,
                IgxToggleTestComponent
            ],
            imports: [BrowserAnimationsModule]
        })
        .compileComponents();
    }));
    it("IgxToggleDirective is defined", () => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.directive(IgxToggleDirective))).toBeDefined();
        expect(fixture.debugElement.query(By.css("ul"))).toBeDefined();
        expect(fixture.debugElement.queryAll(By.css("li")).length).toBe(4);
    });
    it("verify that initially toggled content is hidden", () => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();
        const divEl = fixture.debugElement.query(By.directive(IgxToggleDirective)).nativeElement;
        expect(fixture.componentInstance.isClosed).toBe(true);
        expect(divEl.classList.contains(HIDDEN_TOGGLER_CLASS)).toBeTruthy();
    });
    it("should show and hide contenct according 'collapsed' attribute", () => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        const divEl = fixture.debugElement.query(By.directive(IgxToggleDirective)).nativeElement;
        expect(fixture.componentInstance.isClosed).toBe(true);
        expect(divEl.classList.contains(HIDDEN_TOGGLER_CLASS)).toBeTruthy();
        fixture.componentInstance.isClosed = false;
        fixture.detectChanges();

        expect(fixture.componentInstance.isClosed).toBe(false);
        expect(divEl.classList.contains(TOGGLER_CLASS)).toBeTruthy();
    });
    it("should emit 'onOpen' event", () => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        const toggle = fixture.componentInstance.toggle;
        spyOn(toggle.onOpen, "emit");
        toggle.open(true);
        fixture.detectChanges();

        expect(toggle.onOpen.emit).toHaveBeenCalled();
    });
    it("should emit 'onClose' event", fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        const toggle = fixture.componentInstance.toggle;
        fixture.componentInstance.isClosed = false;
        fixture.detectChanges();

        spyOn(toggle.onClose, "emit");
        toggle.close(true);
        tick();
        fixture.detectChanges();

        expect(toggle.onClose.emit).toHaveBeenCalled();
    }));
    it("should open toggle when IgxToggleActionDiretive is clicked and toggle is closed", fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
        fixture.detectChanges();
        fixture.debugElement.componentInstance.isClosed = true;
        tick();
        fixture.detectChanges();

        const button: DebugElement = fixture.debugElement.query(By.directive(IgxToggleActionDirective));
        const divEl: DebugElement = fixture.debugElement.query(By.directive(IgxToggleDirective));
        expect(fixture.debugElement.componentInstance.isClosed).toBeTruthy();
        expect(divEl.classes[HIDDEN_TOGGLER_CLASS]).toBeTruthy();
        button.triggerEventHandler("click", null);
        tick();
        fixture.detectChanges();

        expect(divEl.classes[TOGGLER_CLASS]).toBeTruthy();
    }));
/*     it("should close toggle when IgxToggleActionDiretive is clicked and toggle is opened", fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
        fixture.detectChanges();
        const divEl: DebugElement = fixture.debugElement.query(By.directive(IgxToggleDirective));
        const button: DebugElement = fixture.debugElement.query(By.directive(IgxToggleActionDirective));
        expect(divEl.classes[TOGGLER_CLASS]).toBeTruthy();
        button.triggerEventHandler("click", null);
        fixture.whenStable().then(() => {
            tick();
            fixture.detectChanges();
            const t = divEl.classes["igx-toggle--hidden"];
            expect(t).toBeTruthy();
        });
    })); */
    it("should hide content and emit 'onClose' event when you click outside the toggler's content", fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
        fixture.detectChanges();

        const divEl = fixture.debugElement.query(By.directive(IgxToggleDirective)).nativeElement;
        const toggle = fixture.componentInstance.toggle;
        const p = fixture.debugElement.query(By.css("p"));

        expect(fixture.debugElement.componentInstance.isClosed).toBeFalsy();
        expect(divEl.classList.contains(TOGGLER_CLASS)).toBeTruthy();
        spyOn(toggle.onClose, "emit");
        p.nativeElement.click();
        tick();
        fixture.detectChanges();

        expect(toggle.onClose.emit).toHaveBeenCalled();
    }));
});

@Component({
    template: `
    <div igxToggle #toggleRef="toggle" [collapsed]="isClosed" (onOpen)="open()" (onClose)="close()">
      <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
        <li>4</li>
      </ul>
    </div>
    `
})
export class IgxToggleTestComponent {
    @ViewChild(IgxToggleDirective) public toggle: IgxToggleDirective;
    public isClosed = true;
    public open() {}
    public close() {}
}
@Component({
    template: `
    <button [igxToggleAction]="toggleRef"
    [closeOnOutsideClick]="outsideClickClose">Open/Close Toggle</button>
    <div igxToggle #toggleRef="toggle" [collapsed]="isClosed">
      <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
        <li>4</li>
      </ul>
    </div>
    <p>Test</p>
    `
})
export class IgxToggleActionTestComponent {
    public isClosed = false;
    public outsideClickClose = true;
    @ViewChild(IgxToggleDirective) public toggle: IgxToggleDirective;
}
