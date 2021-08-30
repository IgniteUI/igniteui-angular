import { Component, ViewChild } from '@angular/core';
import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxDividerModule, IgxDividerType } from './divider.directive';

describe('Divider', () => {
    configureTestSuite();
    const baseClass = 'igx-divider';

    const classes = {
        dashed: `${baseClass}--dashed`,
        vertical: `${baseClass}--vertical`,
        inset: `${baseClass}--inset`
    };

    let fixture: ComponentFixture<TestDividerComponent>;

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [TestDividerComponent],
            imports: [IgxDividerModule]
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
        expect(divider.nativeElement).toHaveClass(baseClass);
    });

    it('should initialize dashed divider', () => {
        const divider = fixture.debugElement.query(By.css('igx-divider'));
        fixture.componentInstance.type = IgxDividerType.DASHED;
        fixture.detectChanges();

        expect(divider.nativeElement).toHaveClass(baseClass);
        expect(divider.nativeElement).toHaveClass(classes.dashed);
    });

    it('should initialize vertical divider', () => {
        const divider = fixture.debugElement.query(By.css('igx-divider'));
        fixture.componentInstance.vertical = true;
        fixture.detectChanges();

        expect(divider.nativeElement).toHaveClass(classes.vertical);
    });

    it('should initialize middle divider', () => {
        const divider = fixture.debugElement.query(By.css('igx-divider'));
        fixture.componentInstance.middle = true;
        fixture.detectChanges();

        expect(divider.nativeElement).not.toHaveClass(classes.vertical);
        expect(divider.nativeElement).toHaveClass(classes.inset);
    });

    it('should initialize middle, vertical divider', () => {
        const divider = fixture.debugElement.query(By.css('igx-divider'));
        fixture.componentInstance.vertical = true;
        fixture.componentInstance.middle = true;
        fixture.detectChanges();

        expect(divider.nativeElement).toHaveClass(classes.vertical);
        expect(divider.nativeElement).toHaveClass(classes.inset);
    });

    it('should set in the divider by the specified inset amount', () => {
        const inset = '16px';
        const divider = fixture.debugElement.query(By.css('igx-divider'));
        fixture.componentInstance.inset = inset;
        fixture.detectChanges();

        expect(divider.nativeElement.style.marginTop).toEqual('0px');
        expect(divider.nativeElement.style.marginRight).toEqual('0px');
        expect(divider.nativeElement.style.marginBottom).toEqual('0px');
        expect(divider.nativeElement.style.marginLeft).toEqual(inset);

        fixture.componentInstance.middle = true;
        fixture.detectChanges();

        expect(divider.nativeElement.style.marginTop).toEqual('0px');
        expect(divider.nativeElement.style.marginRight).toEqual(inset);
        expect(divider.nativeElement.style.marginBottom).toEqual('0px');
        expect(divider.nativeElement.style.marginLeft).toEqual(inset);

        fixture.componentInstance.vertical = true;
        fixture.detectChanges();

        expect(divider.nativeElement.style.marginTop).toEqual(inset);
        expect(divider.nativeElement.style.marginRight).toEqual('0px');
        expect(divider.nativeElement.style.marginBottom).toEqual(inset);
        expect(divider.nativeElement.style.marginLeft).toEqual('0px');

        fixture.componentInstance.middle = false;
        fixture.detectChanges();

        expect(divider.nativeElement.style.marginTop).toEqual(inset);
        expect(divider.nativeElement.style.marginRight).toEqual('0px');
        expect(divider.nativeElement.style.marginBottom).toEqual('0px');
        expect(divider.nativeElement.style.marginLeft).toEqual('0px');
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
    </igx-divider>`
})
class TestDividerComponent {
    public type: string;
    public vertical: boolean;
    public middle: boolean;
    public inset: string;
    public role: string;
}
