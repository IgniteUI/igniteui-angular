import { Component, ViewChild } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxNavbarComponent, IgxNavbarModule } from './navbar.component';

import { configureTestSuite } from '../test-utils/configure-suite';

describe('IgxNavbar', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                NavbarIntializeTestComponent
            ],
            imports: [
                IgxNavbarModule
            ]
        }).compileComponents();
    }));

    let fixture, component, domNavbar;
    beforeEach(() => {
        fixture = TestBed.createComponent(NavbarIntializeTestComponent);
        fixture.detectChanges();
        component = fixture.componentInstance;
        domNavbar = fixture.debugElement.query(By.css('igx-navbar')).nativeElement;
    });

    it('should properly initialize properties', () => {
        expect(component.navbar.id).toContain('igx-navbar-');
        expect(domNavbar.id).toContain('igx-navbar-');
        expect(component.navbar.title).toBeUndefined();
        expect(component.navbar.isActionButtonVisible).toBeFalsy();
        expect(component.navbar.actionButtonIcon).toBeUndefined();

        component.navbar.id = 'customNavbar';
        fixture.detectChanges();

        expect(component.navbar.id).toBe('customNavbar');
        expect(domNavbar.id).toBe('customNavbar');
    });

    it('should change properties default values', () => {
        const title = 'Test title';
        const isActionButtonVisible = true;
        const actionButtonIcon = 'Test icon';

        component.title = title;
        component.isActionButtonVisible = isActionButtonVisible;
        component.actionButtonIcon = actionButtonIcon;
        fixture.detectChanges();

        expect(component.navbar.title).toBe(title);
        expect(component.navbar.isActionButtonVisible).toBeTruthy();
        expect(component.navbar.actionButtonIcon).toBe(actionButtonIcon);
    });

    it('should trigger on action', () => {
        component.isActionButtonVisible = true;
        component.actionButtonIcon = 'home';
        fixture.detectChanges();

        spyOn(component.navbar.onAction, 'emit');
        fixture.debugElement.nativeElement.querySelector('igx-icon').click();
        fixture.detectChanges();

        expect(component.navbar.onAction.emit)
            .toHaveBeenCalledWith(component.navbar);
    });
});
@Component({
    selector: 'igx-navbar-test-component',
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
