import { Component, ViewChild } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxNavbarComponent, IgxNavbarModule } from './navbar.component';

import { configureTestSuite } from '../test-utils/configure-suite';

const LEFT_AREA_CSS_CLAS = '.igx-navbar__left';

describe('IgxNavbar', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                NavbarIntializeTestComponent,
                NavbarCustomActionIconTestComponent
            ],
            imports: [
                IgxNavbarModule
            ]
        }).compileComponents();
    }));

    let fixture, component, domNavbar;

    describe('Default Action Icon', () => {
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

        it('should have default action icon/content when user has not provided one', () => {
            // Test prerequisites
            component.isActionButtonVisible = true;
            component.actionButtonIcon = 'home';
            fixture.detectChanges();

            const leftArea = fixture.debugElement.query(By.css(LEFT_AREA_CSS_CLAS));

            // Verify there is no custom content on the left
            const customContent = leftArea.query(By.css('igx-action-icon'));
            expect(customContent).toBeNull('Custom action icon content is found on the left.');

            // Verify there is a default icon on the left.
            const defaultIcon = leftArea.query(By.css('igx-icon'));
            expect(defaultIcon).not.toBeNull('Default icon is not found on the left.');
            const leftAreaLeft = (<HTMLElement>leftArea.nativeElement).getBoundingClientRect().left;
            const defaultIconLeft = (<HTMLElement>defaultIcon.nativeElement).getBoundingClientRect().left;
            expect(leftAreaLeft).toBe(defaultIconLeft, 'Default icon is not first on the left.');
        });
    });

    describe('Custom Action Icon', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(NavbarCustomActionIconTestComponent);
            fixture.detectChanges();
        });

        it('should have custom action icon/content when user has provided one', () => {
            const leftArea = fixture.debugElement.query(By.css(LEFT_AREA_CSS_CLAS));

            // Verify there is no default icon on the left.
            const defaultIcon = leftArea.query(By.css('igx-icon'));
            expect(defaultIcon).toBeNull('Default icon is found on the left.');

            // Verify there is a custom content on the left.
            const customContent = leftArea.query(By.css('igx-action-icon'));
            expect(customContent).not.toBeNull('Custom action icon content is not found on the left.');
            const leftAreaLeft = (<HTMLElement>leftArea.nativeElement).getBoundingClientRect().left;
            const customContentLeft = (<HTMLElement>customContent.nativeElement).getBoundingClientRect().left;
            expect(leftAreaLeft).toBe(customContentLeft, 'Custom action icon content is not first on the left.');
        });
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

@Component({
    selector: 'igx-navbar-custom-icon-component',
    template: `<igx-navbar #navbar
                            title="Test Title"
                            actionButtonIcon="home"
                            isActionButtonVisible="true">
                    <igx-action-icon>
                        <button>custom action</button>
                    </igx-action-icon>
               </igx-navbar>`
})
class NavbarCustomActionIconTestComponent {
    @ViewChild(IgxNavbarComponent) public navbar: IgxNavbarComponent;
}
