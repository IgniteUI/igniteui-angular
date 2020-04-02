import {Component, ViewChild} from '@angular/core';
import {async, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {IgxToastComponent, IgxToastModule, IgxToastPosition} from './toast.component';
import { configureTestSuite } from '../test-utils/configure-suite';
import { wait } from '../test-utils/ui-interactions.spec';

describe('IgxToast', () => {
    configureTestSuite();
    beforeAll(async(() => {
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
    const baseClass = 'igx-toast';

    const classes = {
        top: `${baseClass}--top`,
        middle: `${baseClass}--middle`,
        bottom: `${baseClass}--bottom`,
    };
    let fixture, toast, element;
    beforeEach(() => {
        fixture = TestBed.createComponent(ToastInitializeTestComponent);
        toast = fixture.componentInstance.toast;
        toast.isVisible = true;
        fixture.detectChanges();
        element = fixture.debugElement.query(By.css('.igx-toast--bottom'));
    });

    it('should properly initialize properties', () => {
        const domToast = fixture.debugElement.query(By.css(baseClass)).nativeElement;
        expect(toast.id).toContain('igx-toast-');
        expect(domToast.id).toContain('igx-toast-');
        expect(toast.displayTime).toBe(4000);
        expect(toast.autoHide).toBeTruthy();
        expect(toast.isVisible).toBeTruthy();
        expect(domToast.classList).toContain(classes.bottom);

        toast.id = 'customToast';
        fixture.detectChanges();

        expect(toast.id).toBe('customToast');
        expect(domToast.id).toBe('customToast');
    });

    it('should change toast position to middle', () => {
        toast.position = IgxToastPosition.Middle;
        fixture.detectChanges();
        const domToast = fixture.debugElement.query(By.css(baseClass)).nativeElement;

        element = fixture.debugElement.query(By.css('.igx-toast--middle'));
        expect(domToast.classList).toContain(classes.middle);
    });

    it('should change toast position to top', () => {
        toast.position = IgxToastPosition.Top;
        fixture.detectChanges();
        const domToast = fixture.debugElement.query(By.css(baseClass)).nativeElement;

        element = fixture.debugElement.query(By.css('.igx-toast--top'));
        expect(domToast.classList).toContain(classes.top);
    });

    it('should change toast position to bottom, the rest should be undefined', () => {
        toast.position = IgxToastPosition.Bottom;
        fixture.detectChanges();
        const domToast = fixture.debugElement.query(By.css(baseClass)).nativeElement;

        expect(domToast.classList).not.toContain(classes.top);
        expect(domToast.classList).not.toContain(classes.middle);
        expect(domToast.classList).toContain(classes.bottom);
    });

    it('should auto hide 1 second after is open', fakeAsync(() => {
        toast.displayTime = 1000;

        toast.show();

        expect(toast.isVisible).toBeTruthy();
        expect(toast.animationState).toBe('visible');
        expect(toast.autoHide).toBeTruthy();

        tick(1000);
        fixture.detectChanges();
        expect(toast.isVisible).toBeFalsy();
        expect(toast.animationState).toBe('invisible');
    }));

    it('should not auto hide seconds after is open', fakeAsync(() => {
        toast.displayTime = 1000;
        toast.autoHide = false;

        toast.show();

        expect(toast.isVisible).toBeTruthy();
        expect(toast.animationState).toBe('visible');
        expect(toast.autoHide).toBeFalsy();

        tick(1000);
        fixture.detectChanges();
        expect(toast.isVisible).toBeTruthy();
        expect(toast.animationState).toBe('visible');
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
        expect(toast.animationState).toBe('invisible');
        expect(toast.onShowing.emit).toHaveBeenCalledTimes(0);
        expect(toast.onShown.emit).toHaveBeenCalledTimes(0);
        expect(toast.onHiding.emit).toHaveBeenCalledTimes(1);
        expect(toast.onHidden.emit).toHaveBeenCalledTimes(1);

        toast.toggle();
        await wait();
        fixture.detectChanges();

        expect(toast.isVisible).toBe(true);
        expect(toast.animationState).toBe('visible');
        expect(toast.onShowing.emit).toHaveBeenCalledTimes(1);
        expect(toast.onShown.emit).toHaveBeenCalledTimes(1);
        expect(toast.onHiding.emit).toHaveBeenCalledTimes(1);
        expect(toast.onHidden.emit).toHaveBeenCalledTimes(1);

        toast.toggle();
        await wait();
        fixture.detectChanges();
        expect(toast.isVisible).toBe(false);
        expect(toast.animationState).toBe('invisible');
    }));
});
@Component({
    template: `<igx-toast #toast>
               </igx-toast>`
})
class ToastInitializeTestComponent {
    @ViewChild(IgxToastComponent, { static: true }) public toast: IgxToastComponent;
}
