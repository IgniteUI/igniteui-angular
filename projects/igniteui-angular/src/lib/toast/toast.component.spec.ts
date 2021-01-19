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
            declarations: [ToastInitializeTestComponent, ToastTestBindingComponent],
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
        spyOn(toast.onHiding, 'emit');
        toast.displayTime = 1000;

        toast.open();
        tick(1000);
        expect(toast.onHiding.emit).toHaveBeenCalled();
    }));

    it('should not auto hide after it\'s open', fakeAsync(() => {
        spyOn(toast.onHiding, 'emit');
        toast.displayTime = 1000;
        toast.autoHide = false;

        toast.open();
        tick(1000);
        expect(toast.onHiding.emit).not.toHaveBeenCalled();
    }));

    it('should emit onShowing when toast is shown', () => {
        spyOn(toast.onShowing, 'emit');
        toast.open();
        expect(toast.onShowing.emit).toHaveBeenCalled();
    });

    it('should emit onHiding when toast is hidden', () => {
        spyOn(toast.onHiding, 'emit');
        toast.close();
        expect(toast.onHiding.emit).toHaveBeenCalled();
    });

    it('should emit onShown when toggle onOpened is fired', () => {
        spyOn(toast.onShown, 'emit');
        toast.open();
        expect(toast.onShown.emit).toHaveBeenCalled();
    });

    it('should emit onHidden when toggle onClosed is fired', () => {
        spyOn(toast.onHidden, 'emit');
        toast.isVisible = true;
        toast.close();
        expect(toast.onHidden.emit).toHaveBeenCalled();
    });

    it('visibility is updated by the toggle() method', () => {
        spyOn(toast.onShown, 'emit');
        spyOn(toast.onHidden, 'emit');
        toast.autoHide = false;

        toast.toggle();
        expect(toast.onShown.emit).toHaveBeenCalled();

        toast.toggle();
        expect(toast.onHidden.emit).toHaveBeenCalled();
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

    it('should open and close toast when set values to isVisible', () => {
        const toastFixture = TestBed.createComponent(ToastTestBindingComponent);
        const component = fixture.componentInstance.toast;
        toastFixture.detectChanges();
        spyOn(toast.onShown, 'emit');
        spyOn(toast.onHidden, 'emit');

        toastFixture.componentInstance.model = true;
        toastFixture.detectChanges();

        expect(component.onShown.emit).toHaveBeenCalled();

        toastFixture.componentInstance.model = false;
        toastFixture.detectChanges();

        expect(component.onHidden.emit).toHaveBeenCalled();
    });
});

@Component({
    template: `<igx-toast #toast></igx-toast>`,
})
class ToastInitializeTestComponent {
    @ViewChild(IgxToastComponent, { static: true })
    public toast: IgxToastComponent;
}

@Component({
    template: `<igx-toast #toast [(isVisible)]="model"></igx-toast>`,
})
class ToastTestBindingComponent {
    @ViewChild(IgxToastComponent, { static: true })
    public toast: IgxToastComponent;
    public model = false;
}
