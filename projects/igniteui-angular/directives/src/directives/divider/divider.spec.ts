import { Component } from '@angular/core';
import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { IgxDividerDirective, IgxDividerType } from './divider.directive';

describe('Divider', () => {
    const baseClass = 'igx-divider';

    const classes = {
        dashed: `${baseClass}--dashed`,
        vertical: `${baseClass}--vertical`,
        inset: `${baseClass}--inset`
    };

    let fixture: ComponentFixture<TestDividerComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [TestDividerComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestDividerComponent);
    });

    it('should initialize default divider', () => {
        const divider = fixture.debugElement.query(By.css('igx-divider'));
        fixture.componentInstance.type = IgxDividerType.SOLID;
        fixture.detectChanges();

        expect(divider.nativeElement).toBeDefined();
        expect(divider.nativeElement.classList.contains(baseClass)).toBe(true);
    });

    it('should initialize dashed divider', () => {
        const divider = fixture.debugElement.query(By.css('igx-divider'));
        fixture.componentInstance.type = IgxDividerType.DASHED;
        fixture.detectChanges();

        expect(divider.nativeElement.classList.contains(baseClass)).toBe(true);
        expect(divider.nativeElement.classList.contains(classes.dashed)).toBe(true);
    });

    it('should initialize vertical divider', () => {
        const divider = fixture.debugElement.query(By.css('igx-divider'));
        fixture.componentInstance.vertical = true;
        fixture.detectChanges();

        expect(divider.nativeElement.classList.contains(classes.vertical)).toBe(true);
    });

    it('should initialize middle divider', () => {
        const divider = fixture.debugElement.query(By.css('igx-divider'));
        fixture.componentInstance.middle = true;
        fixture.detectChanges();

        expect(divider.nativeElement.classList.contains(classes.vertical)).toBe(false);
        expect(divider.nativeElement.classList.contains(classes.inset)).toBe(true);
    });

    it('should initialize middle, vertical divider', () => {
        const divider = fixture.debugElement.query(By.css('igx-divider'));
        fixture.componentInstance.vertical = true;
        fixture.componentInstance.middle = true;
        fixture.detectChanges();

        expect(divider.nativeElement.classList.contains(classes.vertical)).toBe(true);
        expect(divider.nativeElement.classList.contains(classes.inset)).toBe(true);
    });

    it('should inset the divider by the specified amount', () => {
        const inset = '16px';
        const divider = fixture.debugElement.query(By.css('igx-divider'));
        const insetVar = () => window.getComputedStyle(divider.nativeElement).getPropertyValue('--inset');
        fixture.componentInstance.inset = inset;
        fixture.detectChanges();

        expect(insetVar()).toEqual(`${inset}`);
    });

    it('should change the role of the divider to the specified value', () => {
        const role = 'foo';
        const divider = fixture.debugElement.query(By.css('igx-divider'));
        fixture.componentInstance.role = role;
        fixture.detectChanges();

        expect(divider.nativeElement.getAttribute('role')).toEqual(role);
    });
});

@Component({
    template: `<igx-divider
        [type]="type"
        [vertical]="vertical"
        [middle]="middle"
        [inset]="inset"
        [role]="role">
    </igx-divider>`,
    imports: [IgxDividerDirective]
})
class TestDividerComponent {
    public type: string;
    public vertical: boolean;
    public middle: boolean;
    public inset: string;
    public role: string;
}
