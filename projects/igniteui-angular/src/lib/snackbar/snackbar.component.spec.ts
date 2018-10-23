import { Component, ViewChild } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxSnackbarComponent, IgxSnackbarModule } from './snackbar.component';

import { configureTestSuite } from '../test-utils/configure-suite';

describe('IgxSnackbar', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SnackbarInitializeTestComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxSnackbarModule
            ]
        }).compileComponents();
    }));

    let fixture, domSnackbar, snackbar;
    beforeEach(async(() => {
        fixture = TestBed.createComponent(SnackbarInitializeTestComponent);
        fixture.detectChanges();
        snackbar = fixture.componentInstance.snackbar;
        domSnackbar = fixture.debugElement.query(By.css('igx-snackbar')).nativeElement;
    }));

    it('should properly initialize properties', () => {
        expect(snackbar.id).toContain('igx-snackbar-');
        expect(snackbar.message).toBeUndefined();
        expect(snackbar.actionText).toBeUndefined();
        expect(snackbar.displayTime).toBe(4000);
        expect(snackbar.autoHide).toBeTruthy();
        expect(snackbar.isVisible).toBeFalsy();
        expect(snackbar.actionText).toBeUndefined();

        expect(domSnackbar.id).toContain('igx-snackbar-');
        snackbar.id = 'customId';
        fixture.detectChanges();

        expect(snackbar.id).toBe('customId');
        expect(domSnackbar.id).toBe('customId');
    });

    it('should auto hide 1 seconds after is open', fakeAsync(() => {
        const displayTime = 1000;
        snackbar.displayTime = displayTime;
        fixture.detectChanges();
        snackbar.show();

        fixture.detectChanges();
        expect(snackbar.isVisible).toBeTruthy();
        expect(snackbar.autoHide).toBeTruthy();

        tick(1000);
        fixture.detectChanges();
        expect(snackbar.isVisible).toBeFalsy();
    }));

    it('should not auto hide seconds after is open', fakeAsync(() => {
        const displayTime = 1000;
        snackbar.displayTime = displayTime;
        snackbar.autoHide = false;

        snackbar.show();

        expect(snackbar.isVisible).toBeTruthy();
        expect(snackbar.autoHide).toBeFalsy();

        tick(1000);
        fixture.detectChanges();
        expect(snackbar.isVisible).toBeTruthy();
    }));

    it('should trigger on action', () => {
        fixture.componentInstance.text = 'Click';

        spyOn(snackbar.onAction, 'emit');

        snackbar.isVisible = true;
        fixture.detectChanges();

        fixture.debugElement.nativeElement.querySelector('button').click();
        fixture.detectChanges();

        expect(snackbar.onAction.emit).toHaveBeenCalledWith(snackbar);
    });
});

@Component({
    template: `<igx-snackbar #snackbar [actionText]="text">
               </igx-snackbar>`
})
class SnackbarInitializeTestComponent {
    public text: string;
    @ViewChild(IgxSnackbarComponent) public snackbar: IgxSnackbarComponent;
}
