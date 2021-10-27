import { Component, ViewChild } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxFocusTrapModule } from './focus-trap.directive';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxCheckboxModule } from '../../checkbox/checkbox.component';
import { IgxDialogComponent, IgxDialogModule } from '../../dialog/dialog.component';
import { IgxDatePickerModule } from '../../date-picker/public_api';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxToggleDirective } from 'igniteui-angular';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';

describe('igxFocus', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                TrapFocusDialogComponent
            ],
            imports: [IgxFocusTrapModule, IgxCheckboxModule, IgxDatePickerModule, IgxDialogModule, NoopAnimationsModule]
        }).compileComponents();
    }));

    it('should focus focusable elements on Tab key pressed', () => {
        const fix = TestBed.createComponent(TrapFocusDialogComponent);
        fix.detectChanges();

        const dialog = fix.componentInstance.dialog;
        dialog.open();
        fix.detectChanges();

        const buttons = fix.debugElement.queryAll(By.css('button'));
        const toggle = fix.debugElement.query(By.directive(IgxToggleDirective));

        console.log(buttons);

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle);
        fix.detectChanges();
        expect(document.activeElement).toEqual(buttons[0].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle);
        fix.detectChanges();
        expect(document.activeElement).toEqual(buttons[1].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle);
        fix.detectChanges();
        expect(document.activeElement).toEqual(buttons[0].nativeElement);
    });

    xit('should focus focusable elements in reversed order on Shift + Tab key pressed', fakeAsync(() => {
        const fix = TestBed.createComponent(TrapFocusDialogComponent);
        fix.detectChanges();

        const dialog = fix.componentInstance.dialog;
        dialog.open();
        fix.detectChanges();

        const buttons = fix.debugElement.queryAll(By.css('button'));
        const toggle = fix.debugElement.query(By.directive(IgxToggleDirective));

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle, false, true);
        tick(100);
        fix.detectChanges();
        expect(document.activeElement).toEqual(buttons[1].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle, false, true);
        fix.detectChanges();
        expect(document.activeElement).toEqual(buttons[0].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle, false, true);
        fix.detectChanges();
        expect(document.activeElement).toEqual(buttons[1].nativeElement);
    }));
});


@Component({
    template: `<div #wrapper>
                            <igx-dialog #dialog igxFocusTrap title="dialog" message="message"
                                leftButtonLabel="left button"
                                rightButtonLabel="right button">
                            </igx-dialog>
                        </div>` })
class TrapFocusDialogComponent {
    @ViewChild('dialog', { static: true }) public dialog: IgxDialogComponent;
}
