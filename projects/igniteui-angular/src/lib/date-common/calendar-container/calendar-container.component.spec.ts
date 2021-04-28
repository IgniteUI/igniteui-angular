import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxCalendarComponent } from '../../calendar/public_api';
import { IgxButtonDirective, IgxButtonModule } from '../../directives/button/button.directive';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxPickerActionsDirective, IgxPickersCommonModule } from '../picker-icons.common';
import { IgxCalendarContainerComponent, IgxCalendarContainerModule } from './calendar-container.component';


describe('Calendar Container', () => {
    let fixture: ComponentFixture<IgxDatePickerTestComponent>;
    let container: IgxCalendarContainerComponent;
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxDatePickerTestComponent
            ],
            imports: [IgxCalendarContainerModule, IgxPickersCommonModule, IgxButtonModule, NoopAnimationsModule]
        })
            .compileComponents();
    }));

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(IgxDatePickerTestComponent);
        fixture.detectChanges();
        container = fixture.componentInstance.container;
    }));

    it('should render calendar', () => {
        fixture = TestBed.createComponent(IgxDatePickerTestComponent);
        fixture.detectChanges();
        const calendar = fixture.debugElement.query(By.directive(IgxCalendarComponent));
        expect(calendar).toBeDefined();
    });

    it('should render default actions', () => {
        spyOn(container.calendarClose, 'emit');
        spyOn(container.todaySelection, 'emit');
        container.closeButtonLabel = 'cancel';
        fixture.detectChanges();
        let buttons = fixture.debugElement.queryAll(By.directive(IgxButtonDirective));
        expect(buttons).toHaveSize(1);
        expect(buttons[0].nativeElement.innerText).toEqual('cancel');
        buttons[0].triggerEventHandler('click', {});
        expect(container.calendarClose.emit).toHaveBeenCalledTimes(1);

        container.todayButtonLabel = 'ok';
        fixture.detectChanges();
        buttons = fixture.debugElement.queryAll(By.directive(IgxButtonDirective));
        expect(buttons).toHaveSize(2);
        expect(buttons[1].nativeElement.innerText).toEqual('ok');
        buttons[1].triggerEventHandler('click', {});
        expect(container.todaySelection.emit).toHaveBeenCalledTimes(1);
    });

    it('should render default toggle and clear icons', () => {
        spyOn(fixture.componentInstance, 'doWork');
        container.pickerActions = fixture.componentInstance.actions;
        fixture.detectChanges();

        const calendar = fixture.debugElement.query(By.directive(IgxCalendarComponent)).componentInstance;
        const buttons = fixture.debugElement.queryAll(By.directive(IgxButtonDirective));
        expect(buttons).toHaveSize(1);
        expect(buttons[0].nativeElement.innerText).toEqual('action');
        buttons[0].triggerEventHandler('click', {});
        expect(fixture.componentInstance.doWork).toHaveBeenCalledWith(calendar);
    });
});

@Component({
    template: `
        <igx-calendar-container>
        </igx-calendar-container>
        <ng-template igxPickerActions let-calendar>
            <button igxButton (click)="doWork(calendar)">action</button>
        </ng-template>
        `
})
export class IgxDatePickerTestComponent {
    @ViewChild(IgxCalendarContainerComponent) public container: IgxCalendarContainerComponent;
    @ViewChild(IgxPickerActionsDirective) public actions: IgxPickerActionsDirective;
    public doWork = (_calendar: any) => {};
}
