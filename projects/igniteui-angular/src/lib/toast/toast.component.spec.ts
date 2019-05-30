import {Component, ViewChild} from '@angular/core';
import {async, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {IgxToastComponent, IgxToastModule, IgxToastPosition} from './toast.component';

import { configureTestSuite } from '../test-utils/configure-suite';
import { wait } from '../test-utils/ui-interactions.spec';

describe('IgxToast', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ToastInitializeTestComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxToastModule
            ]
        }).compileComponents();
    }));
    let fixture, toast, element;
    beforeEach(() => {
        fixture = TestBed.createComponent(ToastInitializeTestComponent);
        toast = fixture.componentInstance.toast;
        toast.isVisible = true;
        fixture.detectChanges();
        element = fixture.debugElement.query(By.css('.igx-toast--bottom'));
    });

    it('should properly initialize properties', () => {
        const domToast = fixture.debugElement.query(By.css('igx-toast')).nativeElement;
        expect(toast.id).toContain('igx-toast-');
        expect(domToast.id).toContain('igx-toast-');
        expect(toast.message).toBeUndefined();
        expect(toast.displayTime).toBe(4000);
        expect(toast.autoHide).toBeTruthy();
        expect(toast.isVisible).toBeTruthy();
        expect(element.classes[toast.CSS_CLASSES.IGX_TOAST_BOTTOM]).toBeTruthy();

        toast.id = 'customToast';
        fixture.detectChanges();

        expect(toast.id).toBe('customToast');
        expect(domToast.id).toBe('customToast');
    });

    it('should change toast position to middle', () => {
        toast.position = IgxToastPosition.Middle;
        fixture.detectChanges();

        element = fixture.debugElement.query(By.css('.igx-toast--middle'));
        expect(element.classes[toast.CSS_CLASSES.IGX_TOAST_MIDDLE]).toBeTruthy();
    });

    it('should change toast position to top', () => {
        toast.position = IgxToastPosition.Top;
        fixture.detectChanges();

        element = fixture.debugElement.query(By.css('.igx-toast--top'));
        expect(element.classes[toast.CSS_CLASSES.IGX_TOAST_TOP]).toBeTruthy();
    });

    it('should change toast position to bottom, the rest should be undefined', () => {
        toast.position = IgxToastPosition.Bottom;
        fixture.detectChanges();

        expect(element.classes[toast.CSS_CLASSES.IGX_TOAST_TOP]).toBeUndefined();
        expect(element.classes[toast.CSS_CLASSES.IGX_TOAST_MIDDLE]).toBeUndefined();
        expect(element.classes[toast.CSS_CLASSES.IGX_TOAST_BOTTOM]).toBe(true);
    });

    it('should auto hide 1 second after is open', fakeAsync(() => {
        toast.displayTime = 1000;

        toast.show();

        expect(toast.isVisible).toBeTruthy();
        expect(toast.autoHide).toBeTruthy();

        tick(1000);
        fixture.detectChanges();
        expect(toast.isVisible).toBeFalsy();
    }));

    it('should not auto hide seconds after is open', fakeAsync(() => {
        toast.displayTime = 1000;
        toast.autoHide = false;

        toast.show();

        expect(toast.isVisible).toBeTruthy();
        expect(toast.autoHide).toBeFalsy();

        tick(1000);
        fixture.detectChanges();
        expect(toast.isVisible).toBeTruthy();
    }));

    it('visibility is properly toggled by its toggle() method.', (async() => {
        spyOn(toast.onShowing, 'emit');
        spyOn(toast.onShown, 'emit');
        spyOn(toast.onHiding, 'emit');
        spyOn(toast.onHidden, 'emit');

        expect(toast.isVisible).toBe(true);
        toast.toggle();
        await wait();
        fixture.detectChanges();

        expect(toast.isVisible).toBe(false);
        expect(toast.onShowing.emit).toHaveBeenCalledTimes(0);
        expect(toast.onShown.emit).toHaveBeenCalledTimes(0);
        expect(toast.onHiding.emit).toHaveBeenCalledTimes(1);
        expect(toast.onHidden.emit).toHaveBeenCalledTimes(1);

        toast.toggle();
        await wait();
        fixture.detectChanges();

        expect(toast.isVisible).toBe(true);
        expect(toast.onShowing.emit).toHaveBeenCalledTimes(1);
        expect(toast.onShown.emit).toHaveBeenCalledTimes(1);
        expect(toast.onHiding.emit).toHaveBeenCalledTimes(1);
        expect(toast.onHidden.emit).toHaveBeenCalledTimes(1);

        toast.toggle();
        await wait();
        fixture.detectChanges();
        expect(toast.isVisible).toBe(false);
    }));
});
@Component({
    template: `<igx-toast #toast>
               </igx-toast>`
})
class ToastInitializeTestComponent {
    @ViewChild(IgxToastComponent, { static: true }) public toast: IgxToastComponent;
}
