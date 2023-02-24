import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxFocusTrapDirective, IgxFocusTrapModule } from './focus-trap.directive';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxCheckboxModule } from '../../checkbox/checkbox.component';
import { IgxDatePickerModule } from '../../date-picker/public_api';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';

describe('igxFocusTrap', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
    imports: [IgxFocusTrapModule, IgxCheckboxModule, IgxDatePickerModule, NoopAnimationsModule, TrapFocusTestComponent]
}).compileComponents();
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    it('should focus focusable elements on Tab key pressed', () => {
        const fix = TestBed.createComponent(TrapFocusTestComponent);
        fix.detectChanges();

        const focusTrap = fix.debugElement.query(By.directive(IgxFocusTrapDirective));
        const button = fix.debugElement.query(By.css('button'));
        const inputs = fix.debugElement.queryAll(By.css('input'));

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(inputs[0].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(inputs[1].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(button.nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(inputs[0].nativeElement);
    });

    it('should focus focusable elements in reversed order on Shift + Tab key pressed', () => {
        const fix = TestBed.createComponent(TrapFocusTestComponent);
        fix.detectChanges();

        const focusTrap = fix.debugElement.query(By.directive(IgxFocusTrapDirective));
        const button = fix.debugElement.query(By.css('button'));
        const inputs = fix.debugElement.queryAll(By.css('input'));

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap, false, true);
        fix.detectChanges();
        expect(document.activeElement).toEqual(button.nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap, false, true);
        fix.detectChanges();
        expect(document.activeElement).toEqual(inputs[1].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap, false, true);
        fix.detectChanges();
        expect(document.activeElement).toEqual(inputs[0].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap, false, true);
        fix.detectChanges();
        expect(document.activeElement).toEqual(button.nativeElement);
    });

    it('should trap focus on element when there is only one focusable element', () => {
        const fix = TestBed.createComponent(TrapFocusTestComponent);
        fix.detectChanges();

        fix.componentInstance.showInput = false;
        fix.detectChanges();

        const focusTrap = fix.debugElement.query(By.directive(IgxFocusTrapDirective));
        const button = fix.debugElement.query(By.css('button'));

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(button.nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap, false, true);
        fix.detectChanges();
        expect(document.activeElement).toEqual(button.nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(button.nativeElement);
    });

    it('should trap focus on element with non-focusable elements', fakeAsync(() => {
        const fix = TestBed.createComponent(TrapFocusTestComponent);
        fix.detectChanges();

        fix.componentInstance.showInput = false;
        fix.componentInstance.showButton = false;
        fix.detectChanges();

        const focusTrap = fix.debugElement.query(By.directive(IgxFocusTrapDirective));

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        tick();
        fix.detectChanges();
        expect(document.activeElement).toEqual(focusTrap.nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap, false, true);
        tick();
        fix.detectChanges();
        expect(document.activeElement).toEqual(focusTrap.nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        tick();
        fix.detectChanges();
        expect(document.activeElement).toEqual(focusTrap.nativeElement);
    }));

    it('should be able to set focusTrap dynamically', fakeAsync(() => {
        const fix = TestBed.createComponent(TrapFocusTestComponent);
        fix.detectChanges();

        const focusTrap = fix.debugElement.query(By.directive(IgxFocusTrapDirective));
        const button = fix.debugElement.query(By.css('button'));
        const inputs = fix.debugElement.queryAll(By.css('input'));

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(inputs[0].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(inputs[1].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(button.nativeElement);

        button.nativeElement.blur();
        fix.detectChanges();

        fix.componentInstance.focusTrap = false;
        fix.detectChanges();

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).not.toEqual(inputs[0].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap, false, true);
        fix.detectChanges();
        expect(document.activeElement).not.toEqual(inputs[1].nativeElement);

        fix.componentInstance.focusTrap = true;
        fix.detectChanges();

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap);
        fix.detectChanges();
        expect(document.activeElement).toEqual(inputs[0].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', focusTrap, false, true);
        fix.detectChanges();
        expect(document.activeElement).toEqual(button.nativeElement);
    }));
});


@Component({
    template: `<div #wrapper [igxFocusTrap]="focusTrap" tabindex="0">
                <label for="uname"><b>Username</b></label><br>
                <input type="text" *ngIf="showInput" placeholder="Enter Username" name="uname"><br>
                <label for="psw"><b>Password</b></label><br>
                <input type="password" *ngIf="showInput" placeholder="Enter Password" name="psw"><br>
                <button *ngIf="showButton">SIGN IN</button>
            </div>`,
    standalone: true,
    imports: [IgxFocusTrapModule, IgxCheckboxModule, IgxDatePickerModule]
})
class TrapFocusTestComponent {
    public showInput = true;
    public showButton = true;
    public focusTrap = true;
}
