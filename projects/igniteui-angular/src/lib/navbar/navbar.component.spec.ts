import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxNavbarComponent, IgxNavbarModule, IgxNavbarTitleDirective, IgxNavbarActionDirective } from './navbar.component';
import { IgxIconModule } from '../icon/public_api';

import { configureTestSuite } from '../test-utils/configure-suite';
import { wait } from '../test-utils/ui-interactions.spec';

const LEFT_AREA_CSS_CLAS = '.igx-navbar__left';

describe('IgxNavbar', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                NavbarIntializeTestComponent,
                NavbarCustomActionIconTestComponent,
                NavbarCustomIgxIconTestComponent,
                NavbarCustomTitleTestComponent,
                NavbarCustomTitleDirectiveTestComponent,
                NavbarCustomIgxIconDirectiveTestComponent
            ],
            imports: [
                IgxNavbarModule,
                IgxIconModule
            ]
        }).compileComponents();
    }));

    let fixture; let component; let domNavbar;

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

            spyOn(component.navbar.action, 'emit');
            fixture.debugElement.nativeElement.querySelector('igx-icon').click();
            fixture.detectChanges();

            expect(component.navbar.action.emit)
                .toHaveBeenCalledWith(component.navbar);
        });

        it('should have default action icon/content when user has not provided one', () => {
            // Test prerequisites
            component.isActionButtonVisible = true;
            component.actionButtonIcon = 'home';
            fixture.detectChanges();

            const leftArea = fixture.debugElement.query(By.css(LEFT_AREA_CSS_CLAS));

            // Verify there is no custom content on the left
            const customContent = leftArea.query(By.css('igx-navbar-action'));
            expect(customContent).toBeNull('Custom action icon content is found on the left.');

            // Verify there is a default icon on the left.
            const defaultIcon = leftArea.query(By.css('igx-icon'));
            expect(defaultIcon).not.toBeNull('Default icon is not found on the left.');
            const leftAreaLeft = leftArea.nativeElement.getBoundingClientRect().left;
            const defaultIconLeft = defaultIcon.nativeElement.getBoundingClientRect().left;
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
            const customContent = leftArea.query(By.css('igx-navbar-action'));
            expect(customContent).not.toBeNull('Custom action icon content is not found on the left.');
            const leftAreaLeft = leftArea.nativeElement.getBoundingClientRect().left;
            const customContentLeft = customContent.nativeElement.getBoundingClientRect().left;
            expect(leftAreaLeft).toBe(customContentLeft, 'Custom action icon content is not first on the left.');
        });

        it('should have vertically-centered custom action icon content', (async () => {
            fixture = TestBed.createComponent(NavbarCustomIgxIconTestComponent);
            fixture.detectChanges();

            await wait(100);

            domNavbar = fixture.debugElement.query(By.css('igx-navbar'));
            const customActionIcon = domNavbar.query(By.css('igx-navbar-action'));
            const customIcon = customActionIcon.query(By.css('igx-icon'));

            // Verify custom igxIcon is vertically-centered within the igx-navbar-action.
            const navbarTop = domNavbar.nativeElement.getBoundingClientRect().top;
            const customIconTop = customIcon.nativeElement.getBoundingClientRect().top;
            const topOffset = customIconTop - navbarTop;

            const navbarBottom = domNavbar.nativeElement.getBoundingClientRect().bottom;
            const customIconBottom = customIcon.nativeElement.getBoundingClientRect().bottom;
            const bottomOffset = navbarBottom - customIconBottom;

            expect(topOffset).toBe(bottomOffset, 'Custom icon is not vertically-centered.');
        }));

        it('action icon via directive', (async () => {
            fixture = TestBed.createComponent(NavbarCustomIgxIconDirectiveTestComponent);
            fixture.detectChanges();

            const leftArea = fixture.debugElement.query(By.css(LEFT_AREA_CSS_CLAS));
            const customContent = leftArea.query(By.directive(IgxNavbarActionDirective));
            expect(customContent).not.toBeNull('Custom action icon content is not found on the left.');

            const leftAreaLeft = leftArea.nativeElement.getBoundingClientRect().left;
            const customContentLeft = customContent.nativeElement.getBoundingClientRect().left;
            expect(leftAreaLeft).toBe(customContentLeft, 'Custom action icon content is not first on the left.');
        }));
    });

    describe('Custom title content', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(NavbarIntializeTestComponent);
            fixture.detectChanges();
            component = fixture.componentInstance;
            domNavbar = fixture.debugElement.query(By.css('igx-navbar')).nativeElement;
        });

        it('Custom content should override the title property value', () => {
            fixture = TestBed.createComponent(NavbarCustomTitleTestComponent);
            fixture.detectChanges();

            const leftArea = fixture.debugElement.query(By.css(LEFT_AREA_CSS_CLAS));

            // Verify there is no default icon on the left.
            const customTitle = leftArea.query(By.css('igx-navbar-title'));
            expect(customTitle.nativeElement.textContent).toBe('Custom Title', 'Custom title is missing');

            const defaultTitle = leftArea.query(By.css('igx-navbar__title'));
            expect(defaultTitle).toBeNull('Default title should not be present');
        });

        it('Custom content should override the default title property', () => {
            fixture = TestBed.createComponent(NavbarCustomTitleDirectiveTestComponent);
            fixture.detectChanges();

            const leftArea = fixture.debugElement.query(By.css(LEFT_AREA_CSS_CLAS));

            // Verify there is no default icon on the left.
            const customTitle = leftArea.query(By.directive(IgxNavbarTitleDirective));
            expect(customTitle.nativeElement.children[0].textContent).toBe('Custom', 'Custom title is missing');
            expect(customTitle.nativeElement.children[1].textContent).toBe('Title', 'Custom title is missing');

            const defaultTitle = leftArea.query(By.css('igx-navbar__title'));
            expect(defaultTitle).toBeNull('Default title should not be present');
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
    @ViewChild(IgxNavbarComponent, { static: true }) public navbar: IgxNavbarComponent;
    public title: string;
    public actionButtonIcon: string;
    public isActionButtonVisible: boolean;
}

@Component({
    selector: 'igx-navbar-custom-icon-component',
    template: `<igx-navbar #navbar
                            title="Test Title"
                            actionButtonIcon="home"
                            isActionButtonVisible="true">
                    <igx-navbar-action>
                        <button>custom action</button>
                    </igx-navbar-action>
               </igx-navbar>`
})
class NavbarCustomActionIconTestComponent {
    @ViewChild(IgxNavbarComponent, { static: true }) public navbar: IgxNavbarComponent;
}

@Component({
    selector: 'igx-navbar-custom-igxicon-component',
    template: `<igx-navbar #navbar
                            title="Test Title"
                            actionButtonIcon="home"
                            isActionButtonVisible="true">
                    <igx-navbar-action>
                        <igx-icon>arrow_back</igx-icon>
                    </igx-navbar-action>
               </igx-navbar>`
})
class NavbarCustomIgxIconTestComponent {
    @ViewChild(IgxNavbarComponent, { static: true }) public navbar: IgxNavbarComponent;
}

@Component({
    selector: 'igx-navbar-custom-igxicon-component',
    template: `<igx-navbar #navbar
                            title="Test Title"
                            actionButtonIcon="home"
                            isActionButtonVisible="true">
                    <igx-icon igxNavbarAction>arrow_back</igx-icon>
               </igx-navbar>`
})
class NavbarCustomIgxIconDirectiveTestComponent {
    @ViewChild(IgxNavbarComponent, { static: true }) public navbar: IgxNavbarComponent;
}

@Component({
    selector: 'igx-navbar-custom-title',
    template: `<igx-navbar #navbar
                           title="Test Title"
                           actionButtonIcon="home"
                           isActionButtonVisible="true">
                    <igx-navbar-action>
                        <igx-icon>arrow_back</igx-icon>
                    </igx-navbar-action>
                    <igx-navbar-title>Custom Title</igx-navbar-title>
               </igx-navbar>`
})
class NavbarCustomTitleTestComponent {
    @ViewChild(IgxNavbarComponent, { static: true }) public navbar: IgxNavbarComponent;
}

@Component({
    selector: 'igx-navbar-custom-title',
    template: `<igx-navbar #navbar
                           title="Test Title"
                           actionButtonIcon="home"
                           isActionButtonVisible="true">
                    <igx-navbar-action>
                        <igx-icon>arrow_back</igx-icon>
                    </igx-navbar-action>
                    <div igxNavbarTitle>
                        <div>Custom</div>
                        <span>Title</span>
                    </div>
               </igx-navbar>`
})
class NavbarCustomTitleDirectiveTestComponent {
    @ViewChild(IgxNavbarComponent, { static: true }) public navbar: IgxNavbarComponent;
}
