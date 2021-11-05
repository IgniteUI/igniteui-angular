import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxFocusTrapDirective, IgxFocusTrapModule } from './focus-trap.directive';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxCheckboxModule } from '../../checkbox/checkbox.component';
import { IgxDatePickerModule } from '../../date-picker/public_api';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';

fdescribe('igxFocusTrap', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                TrapFocusTestComponent
            ],
            imports: [IgxFocusTrapModule, IgxCheckboxModule, IgxDatePickerModule, NoopAnimationsModule]
        }).compileComponents();
    }));

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
});


@Component({
    template: `<div #wrapper [igxFocusTrap]="true" tabindex="0">
                <label for="uname"><b>Username</b></label><br>
                <input type="text" *ngIf="showInput" placeholder="Enter Username" name="uname"><br>
                <label for="psw"><b>Password</b></label><br>
                <input type="password" *ngIf="showInput" placeholder="Enter Password" name="psw"><br>
                <button *ngIf="showButton">SIGN IN</button>
            </div>` })
class TrapFocusTestComponent {
    public showInput = true;
    public showButton = true;
}
