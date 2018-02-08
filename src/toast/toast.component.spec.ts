import {Component, ViewChild} from "@angular/core";
import {async, TestBed } from "@angular/core/testing";
import {By} from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {IgxToastComponent, IgxToastModule, IgxToastPosition} from "./toast.component";

const oldTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

describe("IgxToast", () => {
    beforeEach(async(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 4000;
        TestBed.configureTestingModule({
            declarations: [
                ToastInitializeTestComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxToastModule
            ]
        });
    }));
    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = oldTimeout;
    });

    it("should properly initialize properties", async(() => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(ToastInitializeTestComponent);
            fixture.componentInstance.toast.isVisible = true;
            fixture.detectChanges();
            const element = fixture.debugElement.query(By.css(".igx-toast--bottom"));

            expect(fixture.componentInstance.toast.message).toBeUndefined();
            expect(fixture.componentInstance.toast.displayTime).toBe(4000);
            expect(fixture.componentInstance.toast.autoHide).toBeTruthy();
            expect(fixture.componentInstance.toast.isVisible).toBeTruthy();
            expect(element.classes[fixture.componentInstance.toast.CSS_CLASSES.IGX_TOAST_BOTTOM]).toBeTruthy();

        }).catch((reason) => {
            return Promise.reject(reason);
        });
    }));

    it("should change toast position to middle", async(() => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(ToastInitializeTestComponent);
            fixture.componentInstance.toast.position = IgxToastPosition.Middle;
            fixture.componentInstance.toast.isVisible = true;
            fixture.detectChanges();

            const element = fixture.debugElement.query(By.css(".igx-toast--middle"));
            expect(element.classes[fixture.componentInstance.toast.CSS_CLASSES.IGX_TOAST_MIDDLE]).toBeTruthy();
        }).catch((reason) => {
            return Promise.reject(reason);
        });
    }));

    it("should change toast position to top", async(() => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(ToastInitializeTestComponent);
            fixture.componentInstance.toast.position = IgxToastPosition.Top;
            fixture.componentInstance.toast.isVisible = true;
            fixture.detectChanges();

            const element = fixture.debugElement.query(By.css(".igx-toast--top"));

            expect(element.classes[fixture.componentInstance.toast.CSS_CLASSES.IGX_TOAST_TOP]).toBeTruthy();
        }).catch((reason) => {
            return Promise.reject(reason);
        });
    }));

    it("should change toast position something else should be undefined", async(() => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(ToastInitializeTestComponent);
            fixture.componentInstance.toast.position = IgxToastPosition.Bottom;
            fixture.componentInstance.toast.isVisible = true;
            fixture.detectChanges();

            const element = fixture.debugElement.query(By.css(".igx-toast--bottom"));

            expect(element.classes[fixture.componentInstance.toast.CSS_CLASSES.IGX_TOAST_TOP] &&
                element.classes[fixture.componentInstance.toast.CSS_CLASSES.IGX_TOAST_MIDDLE] &&
                element.classes[fixture.componentInstance.toast.CSS_CLASSES.IGX_TOAST_BOTTOM]).toBeUndefined();
        }).catch((reason) => {
            return Promise.reject(reason);
        });
    }));

    it("should auto hide 10 seconds after is open", (done) => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(ToastInitializeTestComponent);
            fixture.detectChanges();

            const displayTime = 1000;
            fixture.componentInstance.toast.displayTime = displayTime;

            fixture.componentInstance.toast.show();

            expect(fixture.componentInstance.toast.isVisible).toBeTruthy();
            expect(fixture.componentInstance.toast.autoHide).toBeTruthy();

            setTimeout(() => {
                expect(fixture.componentInstance.toast.isVisible).toBeFalsy();
                done();
            }, displayTime);
        }).catch((reason) => {
            return Promise.reject(reason);
        });
    });

    it("should not auto hide seconds after is open", (done) => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(ToastInitializeTestComponent);
            fixture.detectChanges();

            const displayTime = 1000;
            fixture.componentInstance.toast.displayTime = displayTime;
            fixture.componentInstance.toast.autoHide = false;

            fixture.componentInstance.toast.show();

            expect(fixture.componentInstance.toast.isVisible).toBeTruthy();
            expect(fixture.componentInstance.toast.autoHide).toBeFalsy();

            setTimeout(() => {
                expect(fixture.componentInstance.toast.isVisible).toBeTruthy();
                done();
            }, displayTime);
        }).catch((reason) => {
            return Promise.reject(reason);
        });
    });
});
@Component({
    template: `<igx-toast #toast>
               </igx-toast>`
})
class ToastInitializeTestComponent {
    @ViewChild(IgxToastComponent) public toast: IgxToastComponent;
}
