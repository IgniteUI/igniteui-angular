import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgModel } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { getCurrentI18n, setCurrentI18n } from 'igniteui-i18n-core';
import { UIInteractions } from '../../../../test-utils/ui-interactions.spec';
import { IgxMonthsViewComponent } from './months-view.component';

const VIEW_ITEM_CSSCLASS = '.igx-calendar-view-item';
const SELECTED_ITEM_CSSCLASS = 'igx-calendar-view-item--selected';
const ACTIVE_ITEM_CSSCLASS = 'igx-calendar-view-item--active';

describe('IgxMonthsView', () => {
    let fixture: ComponentFixture<IgxMonthsViewSampleComponent>;
    let monthsView: IgxMonthsViewComponent;
    let viewElement: HTMLElement;

    const items = (): HTMLElement[] =>
        fixture.debugElement.queryAll(By.css(VIEW_ITEM_CSSCLASS)).map(item => item.nativeElement);

    beforeAll(() => {
        registerLocaleData(localeFr);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [IgxMonthsViewSampleComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(IgxMonthsViewSampleComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        monthsView = fixture.componentInstance.monthsView;
        viewElement = fixture.debugElement.query(By.directive(IgxMonthsViewComponent)).nativeElement;
    });

    it('should render the months of the year and select the bound month', () => {
        expect(viewElement.classList).toContain('igx-calendar-view--standalone');
        expect(viewElement.getAttribute('aria-activedescendant')).toBe(`${monthsView.date.getTime()}`);

        const months = items();
        expect(months.length).toBe(12);
        expect(months[0].textContent.trim()).toBe('Jan');
        expect(months[2].classList).toContain(SELECTED_ITEM_CSSCLASS);
        expect(months[2].getAttribute('aria-label')).toBe('March 2020');
    });

    it('should expose the native element of the view items', () => {
        const months = items();

        monthsView.viewItems.forEach((item, index) => {
            expect(item.nativeElement).toBe(months[index]);
        });
    });

    it('should focus the view and update the model when a month is clicked', () => {
        spyOn(monthsView.selected, 'emit');

        UIInteractions.simulateMouseDownEvent(items()[6]);
        fixture.detectChanges();

        expect(document.activeElement).toBe(viewElement);
        expect(monthsView.selected.emit).toHaveBeenCalledWith(new Date(2020, 6, 1));
        expect(fixture.componentInstance.model).toEqual(new Date(2020, 6, 1));
        expect(items()[6].classList).toContain(SELECTED_ITEM_CSSCLASS);
    });

    it('should not take focus on click when it is not focusable', () => {
        monthsView.tabIndex = -1;
        fixture.detectChanges();

        UIInteractions.simulateMouseDownEvent(items()[6]);
        fixture.detectChanges();

        expect(document.activeElement).not.toBe(viewElement);
        expect(viewElement.hasAttribute('aria-activedescendant')).toBe(false);
        expect(fixture.componentInstance.model).toEqual(new Date(2020, 6, 1));
    });

    it('should show the active month only while focused', () => {
        const activeItems = () => fixture.debugElement.queryAll(By.css(`.${ACTIVE_ITEM_CSSCLASS}`));

        expect(activeItems().length).toBe(0);

        viewElement.dispatchEvent(new FocusEvent('focus'));
        fixture.detectChanges();
        expect(activeItems().length).toBe(1);
        expect(activeItems()[0].nativeElement.textContent.trim()).toBe('Mar');

        viewElement.dispatchEvent(new FocusEvent('blur'));
        fixture.detectChanges();
        expect(activeItems().length).toBe(0);
    });

    it('should update the model when a month is selected with the keyboard', () => {
        viewElement.focus();
        UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', viewElement);
        UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', viewElement);
        fixture.detectChanges();

        expect(monthsView.date).toEqual(new Date(2020, 6, 1));
        // the model changes only when the selection is committed
        expect(fixture.componentInstance.model).toEqual(new Date(2020, 2, 1));

        UIInteractions.triggerKeyDownEvtUponElem('Enter', viewElement);
        fixture.detectChanges();

        expect(fixture.componentInstance.model).toEqual(new Date(2020, 6, 1));
    });

    it('should render the Date.getMonth() value of the months when the view is not formatted', () => {
        monthsView.formatView = false;
        fixture.detectChanges();

        const months = items();
        expect(months[0].textContent.trim()).toBe('0');
        expect(months[11].textContent.trim()).toBe('11');
        expect(months[0].getAttribute('aria-label')).toBe('January 2020');
    });

    it('should mark the control as touched when the view loses focus', () => {
        const ngModel = fixture.debugElement.query(By.directive(IgxMonthsViewComponent)).injector.get(NgModel);
        expect(ngModel.touched).toBe(false);

        viewElement.dispatchEvent(new FocusEvent('focus'));
        fixture.detectChanges();
        expect(ngModel.touched).toBe(false);

        viewElement.dispatchEvent(new FocusEvent('blur'));
        fixture.detectChanges();
        expect(ngModel.touched).toBe(true);
    });

    it('should keep the current date when an empty value is written', () => {
        monthsView.writeValue(null);
        expect(monthsView.date).toEqual(new Date(2020, 2, 1));

        monthsView.writeValue(new Date(2021, 9, 1));
        fixture.detectChanges();

        expect(monthsView.date).toEqual(new Date(2021, 9, 1));
        expect(items()[9].classList).toContain(SELECTED_ITEM_CSSCLASS);
    });

    it('should follow the global locale when no locale is set', () => {
        const initialLocale = getCurrentI18n();

        try {
            setCurrentI18n('fr');
            fixture.detectChanges();

            expect(monthsView.locale).toBe('fr');
            expect(items()[0].textContent.trim()).toBe('Janv.');
        } finally {
            setCurrentI18n(initialLocale);
        }

        fixture.detectChanges();
        expect(monthsView.locale).toBe(initialLocale);
    });
});

@Component({
    template: `<igx-months-view [(ngModel)]="model"></igx-months-view>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, IgxMonthsViewComponent]
})
class IgxMonthsViewSampleComponent {
    @ViewChild(IgxMonthsViewComponent, { static: true }) public monthsView: IgxMonthsViewComponent;
    public model = new Date(2020, 2, 1);
}
