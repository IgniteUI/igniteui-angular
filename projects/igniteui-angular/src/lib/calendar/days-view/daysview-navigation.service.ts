import { Injectable } from '@angular/core';
import { IgxDayItemComponent } from './day-item.component';
import { IgxDaysViewComponent } from './days-view.component';
import { ScrollMonth } from '../calendar-base';

enum Direction {
    Up = 'ArrowUp',
    Down = 'ArrowDown',
    Left = 'ArrowLeft',
    Right = 'ArrowRight',
}

const ARROW = 'Arrow';

/** @hidden */
@Injectable()
export class IgxDaysViewNavigationService {
    public monthView: IgxDaysViewComponent;
    /**
     * Implements kb navigation in all MoveDirections. nextDate and nextMonthView naming convention is used for both previous/next
     *
     * @hidden
     */
    public focusNextDate(target: HTMLElement, key: string, nextView = false) {
        if (target.childElementCount === 0) {
            target = target.parentElement;
        }
        if (key.indexOf('Arrow') === -1) {
            key = ARROW.concat(key);
        }
        const monthView = this.monthView;
        const node = monthView.dates.find((date) => date.nativeElement === target);
        let dates = monthView.dates.toArray();
            let day: IgxDayItemComponent; let step; let i; let nextDate: Date;
        const index = dates.indexOf(node);

        if (!node) {
            return;
        }

        // focus item in current month
        switch (key) {
            case Direction.Left: {
                step = -1;
                nextDate = this.timedelta(node.date.date, step);
                for (i = index; i > 0; i--) {
                    day = nextView ? dates[i] : dates[i - 1];
                    nextDate = day.date.date;
                    if (day.date.isPrevMonth) {
                        break;
                    }
                    if (day && day.isFocusable) {
                        day.nativeElement.focus();
                        return;
                    }
                }
                break;
            }
            case Direction.Right: {
                step = 1;
                nextDate = this.timedelta(node.date.date, step);
                for (i = index; i < dates.length - 1; i++) {
                    day = nextView ? dates[i] : dates[i + 1];
                    nextDate = day.date.date;
                    if (day.date.isNextMonth) {
                        break;
                    }
                    if (day && day.isFocusable) {
                        day.nativeElement.focus();
                        return;
                    }
                }
                break;
            }
            case Direction.Up: {
                step = -7;
                nextDate = this.timedelta(node.date.date, step);
                for (i = index; i - 7 > -1; i -= 7) {
                    day = nextView ? dates[i] : dates[i - 7];
                    nextDate = day.date.date;
                    if (day.date.isPrevMonth) {
                        break;
                    }
                    if (day && day.isFocusable) {
                        day.nativeElement.focus();
                        return;
                    }
                }
                break;
            }
            case Direction.Down: {
                step = 7;
                nextDate = this.timedelta(node.date.date, step);
                for (i = index; i + 7 < 42; i += 7) {
                    day = nextView ? dates[i] : dates[i + 7];
                    nextDate = day.date.date;
                    if (day.date.isNextMonth) {
                        break;
                    }
                    if (day && day.isFocusable) {
                        day.nativeElement.focus();
                        return;
                    }
                }
                break;
            }
        }

        // focus item in prev/next visible month
        const nextMonthView = step > 0 ? monthView.nextMonthView : monthView.prevMonthView;
        if (nextMonthView) {
            dates = nextMonthView.dates.toArray();
            day = dates.find((item) => item.date.date.getTime() === nextDate.getTime());

            if (day && day.isFocusable) {
                day.nativeElement.focus();
                return;
            }
            nextMonthView.daysNavService.focusNextDate(day.nativeElement, key);
        }

        // if iterating in the visible prev/next moths above found a day that is not focusable, ie is disabled, hidden, etc
        // then it is needed to recalculate the next day, which is going to be part of the prev/next months
        if (day && !day.isFocusable) {
            day = dates[i + step];
            if (!day) {
                nextDate = this.timedelta(node.date.date, step + i - index);
            }
        }

        // focus item in prev/next month, which is currently out of view
        let dayIsNextMonth: boolean; // determine what we need to check for next date - if it belongs to prev or next month
        if (day) {
            dayIsNextMonth = step > 0 ? day.date.isNextMonth : day.date.isPrevMonth;
        }
        if (monthView.changeDaysView && !nextMonthView && ((day && dayIsNextMonth) || !day)) {
            const monthAction = step > 0 ? ScrollMonth.NEXT : ScrollMonth.PREV;
            monthView.viewChanging.emit({monthAction, key, nextDate});
        }
    }

    /**
     * Focuses first focusable day in the month. Will go to next visible month, if no day in the first month is focusable
     *
     * @hidden
     */
    public focusHomeDate() {
        let monthView = this.monthView;
        while (!this.focusFirstDay(monthView) && monthView.nextMonthView) {
            monthView = monthView.nextMonthView;
        }
    }

    /**
     * Focuses last focusable day in the month. Will go to previous visible month, if no day in the first month is focusable
     *
     * @hidden
     */
    public focusEndDate() {
        let monthView = this.monthView;
        while (!this.focusLastDay(monthView) && monthView.prevMonthView) {
            monthView = monthView.prevMonthView;
        }
    }

    private timedelta(date: Date, units: number): Date {
        const ret = new Date(date);
        ret.setDate(ret.getDate() + units);
        return ret;
    }

    private focusFirstDay(monthView: IgxDaysViewComponent): boolean {
        const dates = monthView.dates.filter(d => d.isCurrentMonth);
        for (const date of dates) {
            if (date.isFocusable) {
                date.nativeElement.focus();
                return true;
            }
        }
        return false;
    }

    private focusLastDay(monthView: IgxDaysViewComponent): boolean {
        const dates = monthView.dates.filter(d => d.isCurrentMonth);
        for (let i = dates.length - 1; i >= 0; i--) {
            if (dates[i].isFocusable) {
                dates[i].nativeElement.focus();
                return true;
            }
        }
        return false;
    }
}
