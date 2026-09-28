import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgModel } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { UIInteractions } from '../../../../test-utils/ui-interactions.spec';
import { IgxYearsViewComponent } from './years-view.component';

const VIEW_ITEM_CSSCLASS = '.igx-calendar-view-item';
const SELECTED_ITEM_CSSCLASS = 'igx-calendar-view-item--selected';
const ACTIVE_ITEM_CSSCLASS = 'igx-calendar-view-item--active';

describe('IgxYearsView', () => {
    let fixture: ComponentFixture<IgxYearsViewSampleComponent>;
    let yearsView: IgxYearsViewComponent;
    let viewElement: HTMLElement;

    const items = (): HTMLElement[] =>
        fixture.debugElement.queryAll(By.css(VIEW_ITEM_CSSCLASS)).map(item => item.nativeElement);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [IgxYearsViewSampleComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(IgxYearsViewSampleComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        yearsView = fixture.componentInstance.yearsView;
        viewElement = fixture.debugElement.query(By.directive(IgxYearsViewComponent)).nativeElement;
    });

    it('should render a page of years and select the bound year', () => {
        expect(viewElement.classList).toContain('igx-calendar-view--standalone');
        expect(viewElement.getAttribute('aria-activedescendant')).toBe(`${yearsView.date.getTime()}`);

        const years = items();
        const selected = years.find(year => year.classList.contains(SELECTED_ITEM_CSSCLASS));

        expect(years.length).toBe(15);
        expect(selected.textContent.trim()).toBe('2020');
        expect(selected.getAttribute('aria-label')).toBe('2020');
    });

    it('should focus the view and update the model when a year is clicked', () => {
        spyOn(yearsView.selected, 'emit');
        const years = items();
        const target = years.findIndex(year => year.textContent.trim() === '2022');

        UIInteractions.simulateMouseDownEvent(years[target]);
        fixture.detectChanges();

        expect(document.activeElement).toBe(viewElement);
        expect(yearsView.selected.emit).toHaveBeenCalled();
        expect(fixture.componentInstance.model.getFullYear()).toBe(2022);
        expect(items()[target].classList).toContain(SELECTED_ITEM_CSSCLASS);
    });

    it('should not take focus on click when it is not focusable', () => {
        yearsView.tabIndex = -1;
        fixture.detectChanges();

        const years = items();
        const target = years.findIndex(year => year.textContent.trim() === '2022');
        UIInteractions.simulateMouseDownEvent(years[target]);
        fixture.detectChanges();

        expect(document.activeElement).not.toBe(viewElement);
        expect(viewElement.hasAttribute('aria-activedescendant')).toBe(false);
        expect(fixture.componentInstance.model.getFullYear()).toBe(2022);
    });

    it('should show the active year only while focused', () => {
        const activeItems = () => fixture.debugElement.queryAll(By.css(`.${ACTIVE_ITEM_CSSCLASS}`));

        expect(activeItems().length).toBe(0);

        viewElement.dispatchEvent(new FocusEvent('focus'));
        fixture.detectChanges();
        expect(activeItems().length).toBe(1);
        expect(activeItems()[0].nativeElement.textContent.trim()).toBe('2020');

        viewElement.dispatchEvent(new FocusEvent('blur'));
        fixture.detectChanges();
        expect(activeItems().length).toBe(0);
    });

    it('should update the model when a year is selected with the keyboard', () => {
        viewElement.focus();
        UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', viewElement);
        UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', viewElement);
        fixture.detectChanges();

        expect(yearsView.date.getFullYear()).toBe(2022);
        expect(fixture.componentInstance.model.getFullYear()).toBe(2020);

        UIInteractions.triggerKeyDownEvtUponElem('Enter', viewElement);
        fixture.detectChanges();

        expect(fixture.componentInstance.model.getFullYear()).toBe(2022);
    });

    it('should mark the control as touched when the view loses focus', () => {
        const ngModel = fixture.debugElement.query(By.directive(IgxYearsViewComponent)).injector.get(NgModel);
        expect(ngModel.touched).toBe(false);

        viewElement.dispatchEvent(new FocusEvent('focus'));
        fixture.detectChanges();
        expect(ngModel.touched).toBe(false);

        viewElement.dispatchEvent(new FocusEvent('blur'));
        fixture.detectChanges();
        expect(ngModel.touched).toBe(true);
    });

    it('should apply the year format only when the view is formatted', () => {
        const selectedYear = () => items().find(year => year.classList.contains(SELECTED_ITEM_CSSCLASS));

        yearsView.yearFormat = '2-digit';
        fixture.detectChanges();

        expect(yearsView.formatView).toBeFalsy();
        expect(selectedYear().textContent.trim()).toBe('2020');

        yearsView.formatView = true;
        fixture.detectChanges();

        expect(selectedYear().textContent.trim()).toBe('20');
        expect(selectedYear().getAttribute('aria-label')).toBe('2020');
    });
});

@Component({
    template: `<igx-years-view [(ngModel)]="model"></igx-years-view>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, IgxYearsViewComponent]
})
class IgxYearsViewSampleComponent {
    @ViewChild(IgxYearsViewComponent, { static: true }) public yearsView: IgxYearsViewComponent;
    public model = new Date(2020, 0, 1);
}
