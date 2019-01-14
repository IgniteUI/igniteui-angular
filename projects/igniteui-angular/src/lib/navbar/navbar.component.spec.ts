import { Component, ViewChild } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxNavbarComponent, IgxNavbarModule } from './navbar.component';
import { IgxIconModule } from '../icon/index';

import { configureTestSuite } from '../test-utils/configure-suite';
import { wait } from '../test-utils/ui-interactions.spec';

const LEFT_AREA_CSS_CLAS = '.igx-navbar__left';

describe('IgxNavbar', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                NavbarIntializeTestComponent,
                NavbarCustomActionIconTestComponent,
                NavbarCustomIgxIconTestComponent
            ],
            imports: [
                IgxNavbarModule,
                IgxIconModule
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
        it('should have custom action icon/content when user has provided one', () => {
            fixture = TestBed.createComponent(NavbarCustomActionIconTestComponent);
            fixture.detectChanges();

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

        it('should have vertically-centered custom action icon content', (async() => {
            fixture = TestBed.createComponent(NavbarCustomIgxIconTestComponent);
            fixture.detectChanges();

            await wait(100);            

            const domNavbar = fixture.debugElement.query(By.css('igx-navbar'));
            const customActionIcon = domNavbar.query(By.css('igx-action-icon'));
            const customIcon = customActionIcon.query(By.css('igx-icon'));

            // Verify custom igxIcon is vertically-centered within the igx-action-icon.
            const navbarTop = (<HTMLElement>domNavbar.nativeElement).getBoundingClientRect().top;
            const customIconTop = (<HTMLElement>customIcon.nativeElement).getBoundingClientRect().top;
            const topOffset = customIconTop - navbarTop;

            const navbarBottom = (<HTMLElement>domNavbar.nativeElement).getBoundingClientRect().bottom;
            const customIconBottom = (<HTMLElement>customIcon.nativeElement).getBoundingClientRect().bottom;
            const bottomOffset = navbarBottom - customIconBottom;
            
            expect(topOffset).toBe(bottomOffset, 'Custom icon is not vertically-centered.');
        }));
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

@Component({
    selector: 'igx-navbar-custom-igxicon-component',
    template: `<igx-navbar #navbar
                            title="Test Title"
                            actionButtonIcon="home"
                            isActionButtonVisible="true">
                    <igx-action-icon>
                        <igx-icon fontSet="material">arrow_back</igx-icon>
                    </igx-action-icon>
               </igx-navbar>`
})
class NavbarCustomIgxIconTestComponent {
    @ViewChild(IgxNavbarComponent) public navbar: IgxNavbarComponent;
}