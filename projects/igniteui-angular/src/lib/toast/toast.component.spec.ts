import { Component, ViewChild } from '@angular/core';
import {
    waitForAsync,
    TestBed,
    fakeAsync,
    tick,
    ComponentFixture,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    IgxToastComponent,
    IgxToastModule,
} from './toast.component';
import { configureTestSuite } from '../test-utils/configure-suite';

describe('IgxToast', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ToastInitializeTestComponent],
            imports: [BrowserAnimationsModule, IgxToastModule],
        }).compileComponents();
    }));

    const baseClass = 'igx-toast';
    let fixture: ComponentFixture<ToastInitializeTestComponent>;
    let toast: IgxToastComponent;

    beforeEach(() => {
        fixture = TestBed.createComponent(ToastInitializeTestComponent);
        toast = fixture.componentInstance.toast;
        fixture.detectChanges();
    });

    it('should properly initialize', () => {
        const domToast = fixture.debugElement.query(By.css(baseClass))
            .nativeElement;
        expect(toast.id).toContain('igx-toast-');
        expect(domToast.id).toContain('igx-toast-');
        expect(toast.displayTime).toBe(4000);
        expect(toast.autoHide).toBeTruthy();

        toast.id = 'customToast';
        fixture.detectChanges();

        expect(toast.id).toBe('customToast');
        expect(domToast.id).toBe('customToast');
    });

    it('should auto hide after it\'s open', fakeAsync(() => {
        spyOn(toast.onClosing, 'emit');
        toast.displayTime = 1000;

        toast.open();
        tick(1000);
        expect(toast.onClosing.emit).toHaveBeenCalled();
    }));

    it('should not auto hide after it\'s open', fakeAsync(() => {
        spyOn(toast.onClosing, 'emit');
        toast.displayTime = 1000;
        toast.autoHide = false;

        toast.open();
        tick(1000);
        expect(toast.onClosing.emit).not.toHaveBeenCalled();
    }));

    it('should emit onOpening when toast is shown', () => {
        spyOn(toast.onOpening, 'emit');
        toast.open();
        expect(toast.onOpening.emit).toHaveBeenCalled();
    });

    it('should emit onHiding when toast is hidden', () => {
        spyOn(toast.hiding, 'emit');
        toast.close();
        expect(toast.hiding.emit).toHaveBeenCalled();
    });

    it('should emit onOpened when toast is opened', () => {
        expect(toast.isVisible).toBeFalse();
        toast.open();
        fixture.detectChanges();
        expect(toast.isVisible).toBeTrue();
    });

    it('visibility is updated by the toggle() method', () => {
        expect(toast.isVisible).toBeFalse();
        toast.toggle();
        fixture.detectChanges();
        expect(toast.isVisible).toBeTrue();
    });

    it('can set message through show method', fakeAsync(() => {
        toast.displayTime = 100;
        toast.autoHide = false;

        toast.open('Custom Message');
        tick(100);
        fixture.detectChanges();
        expect(toast.isVisible).toBeTruthy();

        expect(toast.autoHide).toBeFalsy();
        expect(toast.toastMessage).toBe('Custom Message');
    }));
});

@Component({
    template: `<igx-toast #toast></igx-toast>`,
})
class ToastInitializeTestComponent {
    @ViewChild(IgxToastComponent, { static: true })
    public toast: IgxToastComponent;
}

