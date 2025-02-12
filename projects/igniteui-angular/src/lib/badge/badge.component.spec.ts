import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxBadgeComponent, IgxBadgeType } from './badge.component';

import { configureTestSuite } from '../test-utils/configure-suite';

describe('Badge', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                InitBadgeComponent,
                InitBadgeWithDefaultsComponent,
                InitBadgeWithIconComponent,
                IgxBadgeComponent,
                InitBadgeWithIconARIAComponent
            ]
        }).compileComponents();
    }));

    it('Initializes outlined badge of type error', () => {
        const fixture = TestBed.createComponent(InitBadgeComponent);
        fixture.detectChanges();
        const badge = fixture.componentInstance.badge;

        expect(badge.value).toBeTruthy();
        expect(badge.type).toBeTruthy();
        expect(badge.outlined).toBeTruthy();

        expect(fixture.debugElement.query(By.css('.igx-badge'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.igx-badge--error'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.igx-badge--outlined'))).toBeTruthy();

        expect(badge.value).toMatch('22');
        expect(badge.type).toMatch('error');
    });

    it('Initializes badge with id', () => {
        const fixture = TestBed.createComponent(InitBadgeComponent);
        fixture.detectChanges();
        const badge = fixture.componentInstance.badge;
        const domBadge = fixture.debugElement.query(By.css('igx-badge')).nativeElement;

        expect(badge.id).toContain('igx-badge-');
        expect(domBadge.id).toContain('igx-badge-');

        badge.id = 'customBadge';
        fixture.detectChanges();

        expect(badge.id).toBe('customBadge');
        expect(domBadge.id).toBe('customBadge');
    });

    it('Initializes badge defaults', () => {
        const fixture = TestBed.createComponent(InitBadgeWithDefaultsComponent);
        fixture.detectChanges();
        const badge = fixture.componentInstance.badge;

        expect(badge.value).toMatch('');
        expect(badge.icon).toBeFalsy();
        expect(badge.outlined).toBeFalsy();

        expect(fixture.debugElement.query(By.css('.igx-badge'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.igx-badge--icon'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.igx-badge--outlined'))).toBeFalsy();
    });

    it('Initializes badge with icon', () => {
        const fixture = TestBed.createComponent(InitBadgeWithIconComponent);
        fixture.detectChanges();
        const badge = fixture.componentInstance.badge;

        expect(badge.icon === 'person').toBeTruthy();
        expect(badge.type === IgxBadgeType.INFO).toBeTruthy();
        expect(badge.value === '').toBeTruthy();

        expect(fixture.debugElement.query(By.css('.igx-badge'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.igx-badge--info'))).toBeTruthy();
    });

    it('Initializes badge with icon ARIA', () => {
        const fixture = TestBed.createComponent(InitBadgeWithIconARIAComponent);
        fixture.detectChanges();
        const badge = fixture.componentInstance.badge;

        const expectedDescription = `${badge.type} type badge with icon type ${badge.icon}`;
        expect(badge.roleDescription).toMatch(expectedDescription);

        const container = fixture.nativeElement.querySelectorAll('.igx-badge')[0];
        expect(container.getAttribute('aria-roledescription')).toMatch(expectedDescription);
    });
});

@Component({
    template: `<igx-badge type="error" value="22" outlined></igx-badge>`,
    imports: [IgxBadgeComponent]
})
class InitBadgeComponent {
    @ViewChild(IgxBadgeComponent, { static: true }) public badge: IgxBadgeComponent;
}

@Component({
    template: `<igx-badge></igx-badge>`,
    imports: [IgxBadgeComponent]
})
class InitBadgeWithDefaultsComponent {
    @ViewChild(IgxBadgeComponent, { static: true }) public badge: IgxBadgeComponent;
}

@Component({
    template: `<igx-badge icon="person" type="info"></igx-badge>`,
    imports: [IgxBadgeComponent]
})
class InitBadgeWithIconComponent {
    @ViewChild(IgxBadgeComponent, { static: true }) public badge: IgxBadgeComponent;
}

@Component({
    template: `<igx-badge icon="person"></igx-badge>`,
    imports: [IgxBadgeComponent]
})
class InitBadgeWithIconARIAComponent {
    @ViewChild(IgxBadgeComponent, { static: true }) public badge: IgxBadgeComponent;
}
