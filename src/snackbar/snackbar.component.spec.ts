import {Component, ViewChild} from "@angular/core";
import {async, TestBed } from "@angular/core/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {IgxSnackbar, IgxSnackbarModule} from "./snackbar.component";

const oldTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

describe("IgxSnackbar", () => {
    beforeEach(async(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 4000;
        TestBed.configureTestingModule({
            imports: [
                BrowserAnimationsModule,
                IgxSnackbarModule
            ],
            declarations: [
                SnackbarIntializeTestComponent
            ]
        });
    }));

    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = oldTimeout;
    });

    it("should properly initialize properties", async(() => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(SnackbarIntializeTestComponent);
            fixture.detectChanges();

            expect(fixture.componentInstance.snackbar.message).toBeUndefined();
            expect(fixture.componentInstance.snackbar.actionText).toBeUndefined();
            expect(fixture.componentInstance.snackbar.displayTime).toBe(4000);
            expect(fixture.componentInstance.snackbar.autoHide).toBeTruthy();
            expect(fixture.componentInstance.snackbar.isVisible).toBeFalsy();
            expect(fixture.componentInstance.snackbar.actionText).toBeUndefined();
        }).catch((reason) => {
            console.log(reason);
            return Promise.reject(reason);
        });
    }));

    it("should auto hide 1 seconds after is open", (done) => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(SnackbarIntializeTestComponent);
            fixture.detectChanges();

            const displayTime: number = 1000;
            fixture.componentInstance.snackbar.displayTime = displayTime;

            fixture.componentInstance.snackbar.show();

            expect(fixture.componentInstance.snackbar.isVisible).toBeTruthy();
            expect(fixture.componentInstance.snackbar.autoHide).toBeTruthy();

            setTimeout(() => {
                expect(fixture.componentInstance.snackbar.isVisible).toBeFalsy();
                done();
            }, displayTime);
        }).catch((reason) => {
            console.log(reason);
            return Promise.reject(reason);
        });
    });

    it("should not auto hide seconds after is open", (done) => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(SnackbarIntializeTestComponent);
            fixture.detectChanges();

            const displayTime: number = 1000;
            fixture.componentInstance.snackbar.displayTime = displayTime;
            fixture.componentInstance.snackbar.autoHide = false;

            fixture.componentInstance.snackbar.show();

            expect(fixture.componentInstance.snackbar.isVisible).toBeTruthy();
            expect(fixture.componentInstance.snackbar.autoHide).toBeFalsy();

            setTimeout(() => {
                expect(fixture.componentInstance.snackbar.isVisible).toBeTruthy();
                done();
            }, displayTime);
        }).catch((reason) => {
            console.log(reason);
            return Promise.reject(reason);
        });
    });

    it("should trigger on action", async(() => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(SnackbarIntializeTestComponent);
            fixture.componentInstance.text = "Click";
            fixture.componentInstance.snackbar.isVisible = true;
            fixture.detectChanges();

            spyOn(fixture.componentInstance.snackbar.onAction, "emit");
            fixture.debugElement.nativeElement.querySelector("button").click();
            fixture.detectChanges();

            expect(fixture.componentInstance.snackbar.onAction.emit).toHaveBeenCalledWith(fixture.componentInstance.snackbar);
        }).catch((reason) => {
            console.log(reason);
            return Promise.reject(reason);
        });
    }));
});
@Component({
    selector: "snackbar-test-component",
    template: `<igx-snackbar #snackbar [actionText]="text">
               </igx-snackbar>`
})
class SnackbarIntializeTestComponent {
    text: string;
    @ViewChild(IgxSnackbar) snackbar: IgxSnackbar;
}
