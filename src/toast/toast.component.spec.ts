import {TestBed, async } from '@angular/core/testing';
import {IgxToast, IgxToastModule, IgxToastPosition} from './toast.component';
import {Component, ViewChild} from "@angular/core";
import {By} from "@angular/platform-browser";

var oldTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

describe('IgxToast', () => {
    beforeEach(async(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 4000;
        TestBed.configureTestingModule({
            imports: [
                IgxToastModule
            ],
            declarations: [
                ToastIntializeTestComponent
            ]
        });
    }));

    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = oldTimeout;
    });

    it('should properly initialize properties', async(() => {
        TestBed.compileComponents().then(() => {
            let fixture = TestBed.createComponent(ToastIntializeTestComponent);
            fixture.detectChanges();
            let element = fixture.debugElement.query(By.css(".igx-toast"));

            expect(fixture.componentInstance.toast.message).toBeUndefined();
            expect(fixture.componentInstance.toast.displayTime).toBe(4000);
            expect(fixture.componentInstance.toast.autoHide).toBeTruthy();
            expect(fixture.componentInstance.toast.isVisible).toBeFalsy();
            expect(element.classes[fixture.componentInstance.toast.CSS_CLASSES.IGX_TOAST_BOTTOM]).toBeTruthy();

        }).catch(reason => {
            console.log(reason);
            return Promise.reject(reason);
        });
    }));

    it('should change toast position to middle', async(() => {
        TestBed.compileComponents().then(() => {
            let fixture = TestBed.createComponent(ToastIntializeTestComponent);
            fixture.componentInstance.toast.position = IgxToastPosition.Middle;
            fixture.detectChanges();

            let element = fixture.debugElement.query(By.css(".igx-toast"));
            expect(element.classes[fixture.componentInstance.toast.CSS_CLASSES.IGX_TOAST_MIDDLE]).toBeTruthy();
        }).catch(reason => {
            console.log(reason);
            return Promise.reject(reason);
        });
    }));

    it('should change toast position to top', async(() => {
        TestBed.compileComponents().then(() => {
            let fixture = TestBed.createComponent(ToastIntializeTestComponent);
            fixture.componentInstance.toast.position = IgxToastPosition.Top;
            fixture.detectChanges();

            let element = fixture.debugElement.query(By.css(".igx-toast"));
            expect(element.classes[fixture.componentInstance.toast.CSS_CLASSES.IGX_TOAST_TOP]).toBeTruthy();
        }).catch(reason => {
            console.log(reason);
            return Promise.reject(reason);
        });
    }));

    it('should change toast position something else should be undefined', async(() => {
        TestBed.compileComponents().then(() => {
            let fixture = TestBed.createComponent(ToastIntializeTestComponent);
            fixture.componentInstance.toast.position = 5;
            fixture.detectChanges();

            let element = fixture.debugElement.query(By.css(".igx-toast"));

            expect(element.classes[fixture.componentInstance.toast.CSS_CLASSES.IGX_TOAST_TOP] &&
                element.classes[fixture.componentInstance.toast.CSS_CLASSES.IGX_TOAST_MIDDLE] &&
                element.classes[fixture.componentInstance.toast.CSS_CLASSES.IGX_TOAST_BOTTOM]).toBeUndefined();
        }).catch(reason => {
            console.log(reason);
            return Promise.reject(reason);
        });
    }));

    it('should auto hide 10 seconds after is open', (done) => {
        TestBed.compileComponents().then(() => {
            let fixture = TestBed.createComponent(ToastIntializeTestComponent);
            fixture.detectChanges();

            var displayTime: number = 1000;
            fixture.componentInstance.toast.displayTime = displayTime;

            fixture.componentInstance.toast.show();

            expect(fixture.componentInstance.toast.isVisible).toBeTruthy();
            expect(fixture.componentInstance.toast.autoHide).toBeTruthy();

            setTimeout(() => {
                expect(fixture.componentInstance.toast.isVisible).toBeFalsy();
                done();
            }, displayTime);
        }).catch(reason => {
            console.log(reason);
            return Promise.reject(reason);
        });
    });

    it('should not auto hide seconds after is open', (done) => {
        TestBed.compileComponents().then(() => {
            let fixture = TestBed.createComponent(ToastIntializeTestComponent);
            fixture.detectChanges();

            var displayTime: number = 1000;
            fixture.componentInstance.toast.displayTime = displayTime;
            fixture.componentInstance.toast.autoHide = false;

            fixture.componentInstance.toast.show();

            expect(fixture.componentInstance.toast.isVisible).toBeTruthy();
            expect(fixture.componentInstance.toast.autoHide).toBeFalsy();

            setTimeout(() => {
                expect(fixture.componentInstance.toast.isVisible).toBeTruthy();
                done();
            }, displayTime);
        }).catch(reason => {
            console.log(reason);
            return Promise.reject(reason);
        });
    });
});
@Component({
    selector: 'snackbar-test-component',
    template: `<igx-toast #snackbar>
               </igx-toast>`
})
class ToastIntializeTestComponent {
    @ViewChild(IgxToast) toast: IgxToast;
}