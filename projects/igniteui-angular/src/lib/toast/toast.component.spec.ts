import { Component, ViewChild } from '@angular/core';
import {
    waitForAsync,
    TestBed,
    ComponentFixture,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    IgxToastComponent,
    IgxToastModule,
} from './toast.component';
import { configureTestSuite } from '../test-utils/configure-suite';
import { useAnimation } from '@angular/animations';
import { HorizontalAlignment, PositionSettings, slideInLeft, slideInRight, VerticalAlignment } from 'igniteui-angular';

describe('IgxToast', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ToastInitializeTestComponent],
            imports: [NoopAnimationsModule, IgxToastModule]
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

        toast.id = 'customToast';
        fixture.detectChanges();

        expect(toast.id).toBe('customToast');
        expect(domToast.id).toBe('customToast');
    });

    it('should properly change verical position', () => {
        toast.open();
        fixture.detectChanges();
        expect(toast.position).toBe('bottom');
        expect(toast.positionSettings.verticalDirection).toBe(0);
        toast.toggle();
        fixture.detectChanges();

        toast.position = 'top';
        toast.open();
        fixture.detectChanges();
        expect(toast.position).toBe('top');
        expect(toast.positionSettings.verticalDirection).toBe(-1);
    });

    it('should be able to set custom positionSettings', () => {
        const defaultPositionSettings = toast.positionSettings;
        expect(defaultPositionSettings.horizontalDirection).toBe(-0.5);
        expect(defaultPositionSettings.verticalDirection).toBe(0);
        const newPositionSettings: PositionSettings = {
            openAnimation: useAnimation(slideInLeft, { params: { duration: '1000ms' } }),
            closeAnimation: useAnimation(slideInRight, { params: { duration: '1000ms' } }),
            horizontalDirection: HorizontalAlignment.Center,
            verticalDirection: VerticalAlignment.Middle,
            horizontalStartPoint: HorizontalAlignment.Center,
            verticalStartPoint: VerticalAlignment.Middle,
            minSize: { height: 100, width: 100 }
        };
        toast.positionSettings = newPositionSettings;
        fixture.detectChanges();
        const customPositionSettings = toast.positionSettings;
        expect(customPositionSettings.horizontalDirection).toBe(-0.5);
        expect(customPositionSettings.verticalDirection).toBe(-0.5);
        expect(customPositionSettings.openAnimation.options.params).toEqual({duration: '1000ms'});
        expect(customPositionSettings.minSize).toEqual({height: 100, width: 100});
    });
});

@Component({
    template: `<igx-toast #toast></igx-toast>`,
})
class ToastInitializeTestComponent {
    @ViewChild(IgxToastComponent, { static: true })
    public toast: IgxToastComponent;
}

