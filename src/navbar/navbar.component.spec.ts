import {TestBed, async } from '@angular/core/testing';
import {IgxNavbar, IgxNavbarModule} from './navbar.component';
import {Component, ViewChild} from "@angular/core";

describe('IgxNavbar', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                IgxNavbarModule
            ],
            declarations: [
                NavbarIntializeTestComponent
            ]
        });
    }));

    it('should properly initialize properties', async(() => {
        TestBed.compileComponents().then(() => {
            let fixture = TestBed.createComponent(NavbarIntializeTestComponent);
            fixture.detectChanges();

            expect(fixture.componentInstance.navbar.title).toBeUndefined();
            expect(fixture.componentInstance.navbar.isActionButtonVisible).toBeFalsy();
            expect(fixture.componentInstance.navbar.actionButtonIcon).toBeUndefined();
        }).catch(reason => {
            console.log(reason);
            return Promise.reject(reason);
        });
    }));

    it('should change properties default values', async(() => {
        TestBed.compileComponents().then(() => {
            let fixture = TestBed.createComponent(NavbarIntializeTestComponent),
                title = 'Test title',
                isActionButtonVisible = true,
                actionButtonIcon = 'Test icon';

            fixture.componentInstance.title = title;
            fixture.componentInstance.isActionButtonVisible = isActionButtonVisible;
            fixture.componentInstance.actionButtonIcon = actionButtonIcon;
            fixture.detectChanges();

            expect(fixture.componentInstance.navbar.title).toBe(title);
            expect(fixture.componentInstance.navbar.isActionButtonVisible).toBeTruthy();
            expect(fixture.componentInstance.navbar.actionButtonIcon).toBe(actionButtonIcon);
        }).catch(reason => {
            console.log(reason);
            return Promise.reject(reason);
        });
    }));

    it('should trigger on action', async(() => {
        TestBed.compileComponents().then(() => {
            let fixture = TestBed.createComponent(NavbarIntializeTestComponent);
            fixture.detectChanges();

            spyOn(fixture.componentInstance.navbar.onAction, 'emit');
            fixture.debugElement.nativeElement.querySelector('button').click();
            fixture.detectChanges();

            expect(fixture.componentInstance.navbar.onAction.emit).toHaveBeenCalledWith(fixture.componentInstance.navbar);
        }).catch(reason => {
            console.log(reason);
            return Promise.reject(reason);
        });
    }));
});
@Component({
    selector: 'navbar-test-component',
    template: `<igx-navbar #navbar 
                            [title]="title" 
                            [actionButtonIcon]="actionButtonIcon"
                            [isActionButtonVisible]="isActionButtonVisible">
               </igx-navbar>`
})
class NavbarIntializeTestComponent {
    title: string;
    actionButtonIcon: string;
    isActionButtonVisible: boolean;
    @ViewChild(IgxNavbar) navbar: IgxNavbar;
}