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
        toast.isVisible = true;
        fixture.detectChanges();
    });

    it('should properly initialize', () => {
        const domToast = fixture.debugElement.query(By.css(baseClass))
            .nativeElement;
        expect(toast.id).toContain('igx-toast-');
        expect(domToast.id).toContain('igx-toast-');
        expect(toast.displayTime).toBe(4000);
        expect(toast.autoHide).toBeTruthy();
        expect(toast.isVisible).toBeTruthy();

        toast.id = 'customToast';
        fixture.detectChanges();

        expect(toast.id).toBe('customToast');
        expect(domToast.id).toBe('customToast');
    });

    it('should auto hide 1 second after it\'s open', fakeAsync(() => {
        toast.displayTime = 1000;

        toast.show();

        expect(toast.isVisible).toBeTruthy();
        expect(toast.autoHide).toBeTruthy();

        tick(1000);

        expect(toast.isVisible).toBeFalsy();
    }));

    it('should not auto hide after it\'s open', fakeAsync(() => {
        toast.displayTime = 1000;
        toast.autoHide = false;

        toast.show();

        expect(toast.isVisible).toBeTruthy();
        expect(toast.autoHide).toBeFalsy();

        tick(1000);

        expect(toast.isVisible).toBeTruthy();
    }));

    it('should emit onShowing when toast is shown', () => {
        spyOn(toast.onShowing, 'emit');
        toast.show();
        expect(toast.onShowing.emit).toHaveBeenCalled();
    });

    it('should emit onShown when super onAppended is fired', waitForAsync((done: DoneFn) => {
        toast.show();

        toast.onAppended.subscribe(() => {
            spyOn(toast.onShown, 'emit');
            expect(toast.onShown.emit).toHaveBeenCalled();
            done();
        });
    }));

    it('should emit onHiding when toast is hidden', () => {
        spyOn(toast.onHiding, 'emit');
        toast.hide();
        expect(toast.onHiding.emit).toHaveBeenCalled();
    });

    it('should emit onHidden when super onClosed is fired', waitForAsync((done: DoneFn) => {
        toast.isVisible = true;
        toast.hide();

        toast.onClosed.subscribe(() => {
            spyOn(toast.onHidden, 'emit');
            expect(toast.onHidden.emit).toHaveBeenCalled();
            done();
        });
    }));

    it('visibility is updated by the toggle() method', () => {
        toast.toggle();
        fixture.detectChanges();
        expect(toast.isVisible).toEqual(true);

        toast.toggle();
        fixture.detectChanges();
        expect(toast.isVisible).toEqual(false);
    });

    it('can set message through show method', fakeAsync(() => {
        toast.displayTime = 100;
        toast.autoHide = false;

        toast.show('Custom Message');
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
