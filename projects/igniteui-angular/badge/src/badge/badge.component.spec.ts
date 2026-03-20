import { Component, Signal, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxBadgeComponent, IgxBadgeType } from './badge.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('Badge', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                InitBadgeComponent,
                InitBadgeWithDefaultsComponent,
                InitBadgeWithIconComponent,
                IgxBadgeComponent,
                InitBadgeWithIconARIAComponent,
                InitBadgeWithDotComponent
            ]
        }).compileComponents();
    });

    it('Initializes outlined badge of type error', () => {
        const { fixture, badge } = createComponent(InitBadgeComponent);

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
        const { fixture, badge, hostElement } = createComponent(InitBadgeComponent);

        expect(badge.id).toContain('igx-badge-');
        expect(hostElement.id).toContain('igx-badge-');

        expect(badge.id).toContain('igx-badge-');
        expect(hostElement.id).toContain('igx-badge-');

        badge.id = 'customBadge';
        detectChanges(fixture);

        expect(badge.id).toBe('customBadge');
        expect(hostElement.id).toBe('customBadge');
    });

    it('Initializes badge defaults', () => {
        const { fixture, badge } = createComponent(InitBadgeWithDefaultsComponent);

        expect(badge.value).toMatch('');
        expect(badge.icon).toBeFalsy();
        expect(badge.outlined).toBeFalsy();

        expect(fixture.debugElement.query(By.css('.igx-badge'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.igx-badge--icon'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.igx-badge--outlined'))).toBeFalsy();
    });

    it('Initializes badge with icon', () => {
        const { fixture, badge } = createComponent(InitBadgeWithIconComponent);

        expect(badge.icon === 'person').toBeTruthy();
        expect(badge.type === IgxBadgeType.INFO).toBeTruthy();
        expect(badge.value === '').toBeTruthy();

        expect(fixture.debugElement.query(By.css('.igx-badge'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.igx-badge--info'))).toBeTruthy();
    });

    it('Initializes badge with icon ARIA', () => {
        const { fixture, badge } = createComponent(InitBadgeWithIconARIAComponent);

        const expectedDescription = `${badge.type} type badge with icon type ${badge.icon}`;
        expect(badge.roleDescription).toMatch(expectedDescription);

        const container = fixture.nativeElement.querySelectorAll('.igx-badge')[0];
        expect(container.getAttribute('aria-roledescription')).toMatch(expectedDescription);
    });

    it('Initializes badge with dot property', () => {
        const { fixture, badge } = createComponent(InitBadgeWithDotComponent);

        expect(badge.dot).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.igx-badge--dot'))).toBeTruthy();
    });

    it('Initializes success badge as dot', () => {
        const { fixture, badge } = createComponent(InitBadgeWithDotComponent);

        expect(badge.type).toBe(IgxBadgeType.SUCCESS);
        expect(badge.dot).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.igx-badge--dot'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.igx-badge--success'))).toBeTruthy();
    });
});

@Component({
    template: `<igx-badge type="error" value="22" outlined></igx-badge>`,
    imports: [IgxBadgeComponent]
})
class InitBadgeComponent {
    public badge = viewChild.required(IgxBadgeComponent);
}

@Component({
    template: `<igx-badge></igx-badge>`,
    imports: [IgxBadgeComponent]
})
class InitBadgeWithDefaultsComponent {
    public badge = viewChild.required(IgxBadgeComponent);
}

@Component({
    template: `<igx-badge icon="person" type="info"></igx-badge>`,
    imports: [IgxBadgeComponent]
})
class InitBadgeWithIconComponent {
    public badge = viewChild.required(IgxBadgeComponent);
}

@Component({
    template: `<igx-badge icon="person"></igx-badge>`,
    imports: [IgxBadgeComponent]
})
class InitBadgeWithIconARIAComponent {
    public badge = viewChild.required(IgxBadgeComponent);
}

@Component({
    template: `<igx-badge dot type="success"></igx-badge>`,
    imports: [IgxBadgeComponent]
})
class InitBadgeWithDotComponent {
    public badge = viewChild.required(IgxBadgeComponent);
}

function createComponent<T extends { badge: Signal<IgxBadgeComponent> }>(component: Type<T>) {
    const fixture = TestBed.createComponent(component);
    fixture.detectChanges();

    return {
        fixture,
        badge: fixture.componentInstance.badge(),
        hostElement: fixture.debugElement.query(By.directive(IgxBadgeComponent)).nativeElement
    };
}

function detectChanges<T>(fixture: ComponentFixture<T>) {
    fixture.changeDetectorRef.detectChanges();
}
