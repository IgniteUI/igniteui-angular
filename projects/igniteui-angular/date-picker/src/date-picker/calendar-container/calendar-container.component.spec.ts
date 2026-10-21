import { Component, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxCalendarComponent } from '../../../../calendar/src/public_api';
import { IgxButtonDirective } from '../../../../directives/src/directives/button/button.directive';
import { IgxPickerActionsDirective } from '../../../../core/src/date-common/picker-icons.common';
import { IgxCalendarContainerComponent } from './calendar-container.component';
import { describe, it, expect, beforeEach, vi } from 'vitest';


describe('Calendar Container', () => {
    let fixture: ComponentFixture<IgxDatePickerTestComponent>;
    let container: IgxCalendarContainerComponent;
    let detectChanges: () => void;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, IgxDatePickerTestComponent]
        }).compileComponents();
    });

    beforeEach(async () => {
        fixture = TestBed.createComponent(IgxDatePickerTestComponent);
        fixture.detectChanges();

        container = fixture.componentInstance.container();
        detectChanges = () => fixture.changeDetectorRef.detectChanges();
    });

    it('should render calendar', () => {
        const calendar = fixture.debugElement.query(By.directive(IgxCalendarComponent));
        expect(calendar).toBeDefined();
    });

    it('should render default actions', () => {
        vi.spyOn(container.calendarClose, 'emit');
        vi.spyOn(container.todaySelection, 'emit');

        container.closeButtonLabel = 'cancel';
        detectChanges();

        let buttons = fixture.debugElement.queryAll(By.directive(IgxButtonDirective));
        expect(buttons).toHaveLength(1);
        expect(buttons[0].nativeElement.innerText).toEqual('cancel');

        buttons[0].triggerEventHandler('click');
        detectChanges();
        expect(container.calendarClose.emit).toHaveBeenCalledTimes(1);

        container.todayButtonLabel = 'ok';
        detectChanges();

        buttons = fixture.debugElement.queryAll(By.directive(IgxButtonDirective));
        expect(buttons).toHaveLength(2);
        expect(buttons[1].nativeElement.innerText).toEqual('ok');

        buttons[1].triggerEventHandler('click');
        detectChanges();
        expect(container.todaySelection.emit).toHaveBeenCalledTimes(1);
    });

    it('should render default toggle and clear icons', () => {
        vi.spyOn(fixture.componentInstance, 'doWork');

        container.pickerActions = fixture.componentInstance.actions();
        detectChanges();

        const calendar = fixture.debugElement.query(By.directive(IgxCalendarComponent)).componentInstance;
        const buttons = fixture.debugElement.queryAll(By.directive(IgxButtonDirective));

        expect(buttons).toHaveLength(1);
        expect(buttons[0].nativeElement.innerText).toEqual('action');

        buttons[0].triggerEventHandler('click');
        detectChanges();
        expect(fixture.componentInstance.doWork).toHaveBeenCalledWith(calendar);
    });

    describe('Keyboard', () => {
        let parentKeydown: ReturnType<typeof vi.fn>;

        beforeEach(() => {
            parentKeydown = vi.fn();
            fixture.nativeElement.addEventListener('keydown', parentKeydown);
        });

        it('should emit calendarClose on ALT + UP ARROW and stop the event', () => {
            vi.spyOn(container.calendarClose, 'emit');
            const wrapper = fixture.debugElement.query(By.css('.igx-calendar__wrapper')).nativeElement;

            const altArrowUp = new KeyboardEvent('keydown', { key: 'ArrowUp', altKey: true, bubbles: true, cancelable: true });
            wrapper.dispatchEvent(altArrowUp);

            expect(container.calendarClose.emit).toHaveBeenCalledTimes(1);
            expect(altArrowUp.defaultPrevented).toBe(true);
            expect(parentKeydown, 'the picker should not close a second time').not.toHaveBeenCalled();
        });

        it('should handle ALT + UP ARROW from an input in the picker actions', () => {
            vi.spyOn(container.calendarClose, 'emit');
            container.pickerActions = fixture.componentInstance.actions();
            detectChanges();

            const input = fixture.debugElement.query(By.css('.action-input')).nativeElement;
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', altKey: true, bubbles: true, cancelable: true }));

            expect(container.calendarClose.emit).toHaveBeenCalledTimes(1);
        });
    });
});

@Component({
    template: `
        <igx-calendar-container>
        </igx-calendar-container>
        <ng-template igxPickerActions let-calendar>
            <button type="button" igxButton (click)="doWork(calendar)">action</button>
            <input class="action-input" />
        </ng-template>
        `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCalendarContainerComponent, IgxPickerActionsDirective, IgxButtonDirective]
})
export class IgxDatePickerTestComponent {
    public container = viewChild.required(IgxCalendarContainerComponent);
    public actions = viewChild.required(IgxPickerActionsDirective);

    public doWork = (_calendar: any) => { };
}
