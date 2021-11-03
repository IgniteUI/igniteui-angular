import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxFocusTrapDirective, IgxFocusTrapModule } from './focus-trap.directive';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxCheckboxModule } from '../../checkbox/checkbox.component';
import { IgxDialogComponent, IgxDialogModule } from '../../dialog/dialog.component';
import { IgxDatePickerModule } from '../../date-picker/public_api';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxToggleDirective } from 'igniteui-angular';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';

describe('igxFocusTrap', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                TrapFocusTestComponent,
                TrapFocusDialogComponent
            ],
            imports: [IgxFocusTrapModule, IgxCheckboxModule, IgxDatePickerModule, IgxDialogModule, NoopAnimationsModule]
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

    it('should focus focusable elements in dialog on Tab key pressed', () => {
        const fix = TestBed.createComponent(TrapFocusDialogComponent);
        fix.detectChanges();

        const dialog = fix.componentInstance.dialog;
        dialog.leftButtonLabel="left button"
        dialog.rightButtonLabel="right button"
        fix.detectChanges();
        dialog.open();
        fix.detectChanges();

        const buttons = fix.debugElement.queryAll(By.css('button'));
        const toggle = fix.debugElement.query(By.directive(IgxToggleDirective));

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle);
        fix.detectChanges();
        expect(document.activeElement).toEqual(buttons[0].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle);
        fix.detectChanges();
        expect(document.activeElement).toEqual(buttons[1].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle);
        fix.detectChanges();
        expect(document.activeElement).toEqual(buttons[0].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle, false, true);
        fix.detectChanges();
        expect(document.activeElement).toEqual(buttons[1].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle, false, true);
        fix.detectChanges();
        expect(document.activeElement).toEqual(buttons[0].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle, false, true);
        fix.detectChanges();
        expect(document.activeElement).toEqual(buttons[1].nativeElement);
    });

    it('should trap focus on dialog modal with non-focusable elements', () => {
        const fix = TestBed.createComponent(TrapFocusDialogComponent);
        fix.detectChanges();

        const dialog = fix.componentInstance.dialog;
        fix.detectChanges();
        dialog.open();
        fix.detectChanges();

        const toggle = fix.debugElement.query(By.directive(IgxToggleDirective));

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle);
        fix.detectChanges();
        expect(document.activeElement).toEqual(toggle.nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle, false, true);
        fix.detectChanges();
        expect(document.activeElement).toEqual(toggle.nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle);
        fix.detectChanges();
        expect(document.activeElement).toEqual(toggle.nativeElement);
    });

});


@Component({
    template: `<div #wrapper igxFocusTrap>
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

@Component({
    template: `<div #wrapper>
                            <igx-dialog #dialog title="dialog" message="message">
                            </igx-dialog>
                        </div>` })
class TrapFocusDialogComponent {
    @ViewChild('dialog', { static: true }) public dialog: IgxDialogComponent;
}
