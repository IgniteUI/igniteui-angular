import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { IgxPredefinedRangesAreaComponent } from './predefined-ranges-area.component';
import { CalendarDay } from '../../calendar/common/model';
import { CustomDateRange } from '../date-range-picker-inputs.common';
import { IDateRangePickerResourceStrings } from '../../core/i18n/date-range-picker-resources';
import { IgxChipComponent } from '../../chips/chip.component';
import { IgxChipsModule } from 'igniteui-angular';
import { Component, ViewChild } from '@angular/core';

describe('IgxPredefinedRangesAreaComponent', () => {
  let fixture: ComponentFixture<PredefinedRangesDefaultComponent>;
  let component: PredefinedRangesDefaultComponent;
  let predefinedRanges:IgxPredefinedRangesAreaComponent;

  const customRanges: CustomDateRange[] = [
    {
      label: 'Previous Three Months',
      dateRange: {
        start: CalendarDay.today.add('month', -3).set({ date: 1 }).native,
        end: CalendarDay.today.set({ date: 1 }).add('day', -1).native,
      },
    },
    {
      label: 'Next Three Months',
      dateRange: {
        start: CalendarDay.today.add('month', 1).set({ date: 1 }).native,
        end: CalendarDay.today.add('month', 4).add('day', -1).native,
      },
    },
  ];

  function getChips() {
    return fixture.debugElement.queryAll(By.css('igx-chip'));
  }


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IgxPredefinedRangesAreaComponent, IgxChipComponent, IgxChipsModule, PredefinedRangesDefaultComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PredefinedRangesDefaultComponent);
    component = fixture.componentInstance;
    predefinedRanges = component.predefinedRanges;
    fixture.detectChanges();
  });

  it('should render no chips by default', () => {
    expect(getChips().length).toBe(0);
  });

  it('should render predefined ranges when usePredefinedRanges = true', () => {
    component.usePredefinedRanges = true;
    fixture.detectChanges();

    const chips = getChips();
    expect(chips.length).toBe(predefinedRanges.ranges.length);
    chips.forEach((de, i) => {
      const text = (de.nativeElement as HTMLElement).innerText.trim();
      expect(text).toBe(predefinedRanges.ranges[i].label);
    });
  });

  it('should render predefined + custom ranges together', () => {
    component.usePredefinedRanges = true;
    component.customRanges = customRanges;
    fixture.detectChanges();

    const chips = getChips();
    const ranges = predefinedRanges.ranges;

    expect(chips.length).toBe(ranges.length);
    chips.forEach((de, i) => {
        const text = (de.nativeElement as HTMLElement).innerText.trim();
        expect(text).toBe(ranges[i].label);
    });
  });

  it('should render only custom ranges when usePredefinedRanges = false', () => {
    component.usePredefinedRanges = false;
    component.customRanges = customRanges;
    fixture.detectChanges();

    const chips = getChips();
    const ranges = predefinedRanges.ranges;

    expect(chips.length).toBe(ranges.length);
    chips.forEach((de, i) => {
        const text = (de.nativeElement as HTMLElement).innerText.trim();
        expect(text).toBe(ranges[i].label);
    });
  });

  it('should emit selected range on chip click', () => {
    component.usePredefinedRanges = true;
    component.customRanges = customRanges;
    fixture.detectChanges();

    const chips = getChips();
    const ranges = predefinedRanges.ranges;
    expect(chips.length).toBe(ranges.length);

    const emitSpy = spyOn(predefinedRanges.rangeSelect, 'emit');

    chips.forEach((de, i) => {
        (de.nativeElement as HTMLElement).click();
        fixture.detectChanges();
        expect(emitSpy).toHaveBeenCalledWith(ranges[i].dateRange);
    });
  });

  it('should use provided resourceStrings for labels when available', () => {
    const strings: any = {
        last7Days: 'Last 7 - localized',
        currentMonth: 'Current Month - localized',
        yearToDate: 'YTD - localized',
        igx_date_range_picker_last7Days: 'Last 7 - localized',
        igx_date_range_picker_currentMonth: 'Current Month - localized',
        igx_date_range_picker_yearToDate: 'YTD - localized',
        // last30Days omitted to test fallback
    };

    predefinedRanges.resourceStrings = strings;
    component.usePredefinedRanges = true;
    component.customRanges = [];
    fixture.detectChanges();

    const chips = getChips();
    const labels = chips.map(de => (de.nativeElement as HTMLElement).innerText.trim());

    expect(labels).toContain('Last 7 - localized');
    expect(labels).toContain('Current Month - localized');
    expect(labels).toContain('YTD - localized');

    expect(labels).toContain('Last 30 Days');
  });
});

@Component({
  standalone: true,
  template: `
    <igx-predefined-ranges-area
      [usePredefinedRanges]="usePredefinedRanges"
      [customRanges]="customRanges">
    </igx-predefined-ranges-area>
  `,
  imports: [IgxPredefinedRangesAreaComponent]
})
class PredefinedRangesDefaultComponent {
  public usePredefinedRanges = false;
  public customRanges = [];
  public resourceStrings?: IDateRangePickerResourceStrings;

  @ViewChild(IgxPredefinedRangesAreaComponent, { static: true })
  public predefinedRanges!: IgxPredefinedRangesAreaComponent;
}
