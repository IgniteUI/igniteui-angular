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
import { HorizontalAlignment, PositionSettings, VerticalAlignment } from 'igniteui-angular';

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
        expect(toast.position).toBe('bottom');
        expect(toast.positionSettings.verticalDirection).toBe(0);

        toast.position = 'top';
        fixture.detectChanges();
        expect(toast.positionSettings.verticalDirection).toBe(-1);
    });
});

describe('IgxToast with positionSettings', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ToastPositionSettingsTestComponent],
            imports: [NoopAnimationsModule, IgxToastModule]
        }).compileComponents();
    }));

    let fixture: ComponentFixture<ToastPositionSettingsTestComponent>;
    let toast: IgxToastComponent;

    beforeEach(() => {
        fixture = TestBed.createComponent(ToastPositionSettingsTestComponent);
        toast = fixture.componentInstance.toast;
        fixture.detectChanges();
    });

    it('should be able to change positionSettings', () => {
        expect(toast.positionSettings.horizontalDirection).toBe(-1);
        expect(toast.positionSettings.verticalDirection).toBe(-0.5);
        toast.positionSettings = fixture.componentInstance.secondPositionSettings;
        fixture.detectChanges();
        expect(toast.positionSettings.horizontalDirection).toBe(-0.5);
        expect(toast.positionSettings.verticalDirection).toBe(-0.5);
    });

    it('positionSettings passed in the open method should be applied', () => {
        const positions = fixture.componentInstance.secondPositionSettings;
        toast.open(undefined, positions);
        fixture.detectChanges();
        expect(toast.positionSettings.horizontalDirection).toBe(-0.5);
        expect(toast.positionSettings.verticalDirection).toBe(-0.5);
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
    template: `<igx-toast #toast [positionSettings]="firstPositionSettings"></igx-toast>`,
})
class ToastPositionSettingsTestComponent {
    @ViewChild(IgxToastComponent, { static: true })
    public toast: IgxToastComponent;
    public firstPositionSettings: PositionSettings = {
        horizontalDirection: HorizontalAlignment.Left,
        verticalDirection: VerticalAlignment.Middle,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Middle
    };
    public secondPositionSettings: PositionSettings = {
        horizontalDirection: HorizontalAlignment.Center,
        verticalDirection: VerticalAlignment.Middle,
        horizontalStartPoint: HorizontalAlignment.Center,
        verticalStartPoint: VerticalAlignment.Middle
    };
}

