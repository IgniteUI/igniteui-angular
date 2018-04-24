import { Component, ViewChild } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgxNavbarComponent, IgxNavbarModule } from "./navbar.component";

describe("IgxNavbar", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                NavbarIntializeTestComponent
            ],
            imports: [
                IgxNavbarModule
            ]
        });
    }));

    it("should properly initialize properties", async(() => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(NavbarIntializeTestComponent);
            fixture.detectChanges();

            const domNavbar = fixture.debugElement.query(By.css("igx-navbar")).nativeElement;

            expect(fixture.componentInstance.navbar.id).toContain("igx-navbar-");
            expect(domNavbar.id).toContain("igx-navbar-");
            expect(fixture.componentInstance.navbar.title).toBeUndefined();
            expect(fixture.componentInstance.navbar.isActionButtonVisible).toBeFalsy();
            expect(fixture.componentInstance.navbar.actionButtonIcon).toBeUndefined();

            fixture.componentInstance.navbar.id = "customNavbar";
            fixture.detectChanges();

            expect(fixture.componentInstance.navbar.id).toBe("customNavbar");
            expect(domNavbar.id).toBe("customNavbar");
        }).catch((reason) => {
            return Promise.reject(reason);
        });
    }));

    it("should change properties default values", async(() => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(NavbarIntializeTestComponent);
            const title = "Test title";
            const isActionButtonVisible = true;
            const actionButtonIcon = "Test icon";

            fixture.componentInstance.title = title;
            fixture.componentInstance.isActionButtonVisible = isActionButtonVisible;
            fixture.componentInstance.actionButtonIcon = actionButtonIcon;
            fixture.detectChanges();

            expect(fixture.componentInstance.navbar.title).toBe(title);
            expect(fixture.componentInstance.navbar.isActionButtonVisible).toBeTruthy();
            expect(fixture.componentInstance.navbar.actionButtonIcon).toBe(actionButtonIcon);
        }).catch((reason) => {
            return Promise.reject(reason);
        });
    }));

    it("should trigger on action", async(() => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(NavbarIntializeTestComponent);
            fixture.componentInstance.isActionButtonVisible = true;
            fixture.componentInstance.actionButtonIcon = "home";
            fixture.detectChanges();

            spyOn(fixture.componentInstance.navbar.onAction, "emit");
            fixture.debugElement.nativeElement.querySelector("igx-icon").click();
            fixture.detectChanges();

            expect(fixture.componentInstance.navbar.onAction.emit)
                .toHaveBeenCalledWith(fixture.componentInstance.navbar);
        }).catch((reason) => {
            return Promise.reject(reason);
        });
    }));
});
@Component({
    selector: "igx-navbar-test-component",
    template: `<igx-navbar #navbar
                            [title]="title"
                            [actionButtonIcon]="actionButtonIcon"
                            [isActionButtonVisible]="isActionButtonVisible">
               </igx-navbar>`
})
class NavbarIntializeTestComponent {
    public title: string;
    public actionButtonIcon: string;
    public isActionButtonVisible: boolean;
    @ViewChild(IgxNavbarComponent) public navbar: IgxNavbarComponent;
}
