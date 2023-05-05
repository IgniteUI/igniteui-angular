import {
    waitForAsync,
    TestBed,
    ComponentFixture,
    flushMicrotasks,
    fakeAsync,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    IgxToastComponent
} from './toast.component';
import { configureTestSuite } from '../test-utils/configure-suite';
import { HorizontalAlignment, PositionSettings, VerticalAlignment } from 'igniteui-angular';

describe('IgxToast', () => {
    const baseId = 'igx-toast-';
    let fixture: ComponentFixture<IgxToastComponent>;
    let toast: IgxToastComponent;
    const firstPositionSettings: PositionSettings = {
        horizontalDirection: HorizontalAlignment.Left,
        verticalDirection: VerticalAlignment.Middle,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Middle
    };
    const secondPositionSettings: PositionSettings = {
        horizontalDirection: HorizontalAlignment.Center,
        verticalDirection: VerticalAlignment.Middle,
        horizontalStartPoint: HorizontalAlignment.Center,
        verticalStartPoint: VerticalAlignment.Middle
    };

    configureTestSuite();

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, IgxToastComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IgxToastComponent);
        toast = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should properly initialize', () => {
        expect(toast.id).toContain(baseId);
        expect(toast.element.id).toContain(baseId);

        toast.id = 'customToast';
        fixture.detectChanges();

        expect(toast.id).toBe('customToast');
        expect(toast.element.id).toContain('customToast');
    });

    it('should properly toggle and emit isVisibleChange', fakeAsync(() => {
        spyOn(toast.isVisibleChange, 'emit').and.callThrough();
        expect(toast.isVisible).toBe(false);
        expect(toast.isVisibleChange.emit).toHaveBeenCalledTimes(0);

        toast.toggle();
        expect(toast.isVisible).toBe(true);
        flushMicrotasks();
        expect(toast.isVisibleChange.emit).toHaveBeenCalledOnceWith({ owner: toast, id: '0' });

        toast.toggle();
        flushMicrotasks();
        expect(toast.isVisible).toBe(false);
        expect(toast.isVisibleChange.emit).toHaveBeenCalledTimes(2);
    }));

    it('should be able to change positionSettings', () => {
        toast.positionSettings = firstPositionSettings;
        expect(toast.positionSettings.horizontalDirection).toBe(-1);
        expect(toast.positionSettings.verticalDirection).toBe(-0.5);
        toast.positionSettings = secondPositionSettings;
        fixture.detectChanges();
        expect(toast.positionSettings.horizontalDirection).toBe(-0.5);
        expect(toast.positionSettings.verticalDirection).toBe(-0.5);
    });

    it('positionSettings passed in the open method should be applied', () => {
        const positions = secondPositionSettings;
        toast.open("New Message", positions);
        fixture.detectChanges();
        expect(toast.positionSettings.horizontalDirection).toBe(-0.5);
        expect(toast.positionSettings.verticalDirection).toBe(-0.5);
        expect(toast.textMessage).toBe("New Message");
    });
});
