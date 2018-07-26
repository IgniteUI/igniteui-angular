import {Component, ViewChild} from '@angular/core';
import {async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {IgxSnackbarComponent, IgxSnackbarModule} from './snackbar.component';

const oldTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

describe('IgxSnackbar', () => {
    let fixture;
    beforeEach(async(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 4000;
        TestBed.configureTestingModule({
            declarations: [
                SnackbarInitializeTestComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxSnackbarModule
            ]
        }).compileComponents().then(() => {
            fixture = TestBed.createComponent(SnackbarInitializeTestComponent);
            fixture.detectChanges();
        }).catch((reason) => {
            return Promise.reject(reason);
        });
    }));

    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = oldTimeout;
    });

    it('should properly initialize properties', () => {
        const domSnackbar = fixture.debugElement.query(By.css('igx-snackbar')).nativeElement;

        expect(fixture.componentInstance.snackbar.id).toContain('igx-snackbar-');
        expect(fixture.componentInstance.snackbar.message).toBeUndefined();
        expect(fixture.componentInstance.snackbar.actionText).toBeUndefined();
        expect(fixture.componentInstance.snackbar.displayTime).toBe(4000);
        expect(fixture.componentInstance.snackbar.autoHide).toBeTruthy();
        expect(fixture.componentInstance.snackbar.isVisible).toBeFalsy();
        expect(fixture.componentInstance.snackbar.actionText).toBeUndefined();

        expect(domSnackbar.id).toContain('igx-snackbar-');
        fixture.componentInstance.snackbar.id = 'customId';
        fixture.detectChanges();

        expect(fixture.componentInstance.snackbar.id).toBe('customId');
        expect(domSnackbar.id).toBe('customId');
    });

    it('should auto hide 1 seconds after is open', fakeAsync(() => {
        const displayTime = 1000;
        fixture.componentInstance.snackbar.displayTime = displayTime;

        fixture.componentInstance.snackbar.autoHide = true;

        fixture.componentInstance.snackbar.show();

        tick();

        expect(fixture.componentInstance.snackbar.isVisible).toBeTruthy();
        expect(fixture.componentInstance.snackbar.autoHide).toBeTruthy();

        tick(displayTime);
        fixture.detectChanges();

        expect(fixture.componentInstance.snackbar.isVisible).toBeFalsy();
    }));

    it('should not auto hide seconds after is open', fakeAsync(() => {
        const displayTime = 1000;
        fixture.componentInstance.snackbar.displayTime = displayTime;
        fixture.componentInstance.snackbar.autoHide = false;

        fixture.componentInstance.snackbar.show();

        tick();

        expect(fixture.componentInstance.snackbar.isVisible).toBeTruthy();
        expect(fixture.componentInstance.snackbar.autoHide).toBeFalsy();

        tick(displayTime);
        fixture.detectChanges();
        expect(fixture.componentInstance.snackbar.isVisible).toBeTruthy();
    }));

    it('should trigger on action', fakeAsync(() => {
        fixture.componentInstance.text = 'Click';
        fixture.componentInstance.snackbar.isVisible = true;
        fixture.detectChanges();

        spyOn(fixture.componentInstance.snackbar.onAction, 'emit');
        fixture.debugElement.nativeElement.querySelector('button').click();
        fixture.detectChanges();
        tick();

        expect(fixture.componentInstance.snackbar.onAction.emit)
            .toHaveBeenCalledWith(fixture.componentInstance.snackbar);

    }));
});
@Component({
    template: `<igx-snackbar #snackbar [actionText]="text">
               </igx-snackbar>`
})
class SnackbarInitializeTestComponent {
    public text: string;
    @ViewChild(IgxSnackbarComponent) public snackbar: IgxSnackbarComponent;
}
