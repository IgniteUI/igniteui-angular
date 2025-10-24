import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxChipComponent } from '../../chips/chip.component';
import { DateRangePickerResourceStringsEN, IDateRangePickerResourceStrings } from '../../core/i18n/date-range-picker-resources';
import { DateRange, CustomDateRange} from '.././date-range-picker-inputs.common';
import { CalendarDay } from '../../calendar/common/model';


type PredefinedRangeKey = 'last7Days' | 'currentMonth' | 'last30Days' | 'yearToDate';

@Component({
  selector: 'igx-predefined-ranges-area',
  standalone: true,
  imports: [CommonModule, IgxChipComponent],
  templateUrl: './predefined-ranges-area-component.html',
  styles: [`
    :host { display:block; }
    .igx-predefined-ranges {
      display:flex; flex-wrap:wrap; gap:.5rem; padding:.5rem .75rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IgxPredefinedRangesAreaComponent {
  @Input() public usePredefinedRanges = false;
  @Input() public customRanges: CustomDateRange[] = [];
  @Input() public resourceStrings: IDateRangePickerResourceStrings = DateRangePickerResourceStringsEN as any;

  @Output() public rangeSelect = new EventEmitter<DateRange>();

  public get ranges(): CustomDateRange[] {
    const base = this.usePredefinedRanges ? this.getPredefinedRanges() : [];
    return [...base, ...(this.customRanges ?? [])];
  }

  public trackByLabel = (i: number, r: CustomDateRange) => r.label;

  public onSelect(range: DateRange) {
    this.rangeSelect.emit(range);
  }

  private getLabel(rs: any, shortKey: string, prefixedKey: string, fallback: string): string {
    return rs?.[shortKey] ?? rs?.[prefixedKey] ?? fallback;
    }

  private getPredefinedRanges(): CustomDateRange[] {
    const today = CalendarDay.today;
    const rs: any = this.resourceStrings ?? {};

    const labels = {
        last7Days: this.getLabel(rs, 'last7Days', 'igx_date_range_picker_last7Days', 'Last 7 Days'),
        currentMonth: this.getLabel(rs, 'currentMonth', 'igx_date_range_picker_currentMonth', 'Current Month'),
        last30Days: this.getLabel(rs, 'last30Days', 'igx_date_range_picker_last30Days', 'Last 30 Days'),
        yearToDate: this.getLabel(rs, 'yearToDate', 'igx_date_range_picker_yearToDate', 'Year to Date')
    };

    const startOfMonth = new Date(today.native.getFullYear(), today.native.getMonth(), 1);
    const endOfMonth = new Date(today.native.getFullYear(), today.native.getMonth() + 1, 0);
    const startOfYear = new Date(today.native.getFullYear(), 0, 1);

    const predefinedRanges: { key: PredefinedRangeKey; get: () => { start: Date; end: Date } }[] = [
      { key: 'last7Days', get: () => ({ start: today.add('day', -7).native, end: today.native }) },
      { key: 'currentMonth', get: () => ({ start: startOfMonth, end: endOfMonth }) },
      { key: 'last30Days', get: () => ({ start: today.add('day', -29).native, end: today.native }) },
      { key: 'yearToDate', get: () => ({ start: startOfYear, end: today.native }) },
    ];

    return predefinedRanges.map(range => ({
      label: labels[range.key],
      dateRange: range.get()
    }));
  }
}
