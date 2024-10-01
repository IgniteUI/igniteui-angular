import { InjectionToken, inject } from '@angular/core';
import { IMXIcon, contains, doesNotContain, endsWith, equals, greaterThan, greaterThanOrEqual, isAfter, isBefore, isEmpty, isFalse, isNull, isNotNull, isTrue, lastMonth, lastYear, lessThan, lessThanOrEqual, nextMonth, nextYear, notEmpty, notEqual, selectAll, startsWith, thisMonth, thisYear, today, ungroup, yesterday } from '@igniteui/material-icons-extended';
import { IgxIconService } from 'igniteui-angular';

export const filteringIcons: IMXIcon[] = [
    contains,
    doesNotContain,
    endsWith,
    equals,
    greaterThan,
    greaterThanOrEqual,
    isAfter,
    isBefore,
    isEmpty,
    isFalse,
    isNotNull,
    isNull,
    isTrue,
    lastMonth,
    lastYear,
    lessThan,
    lessThanOrEqual,
    nextMonth,
    nextYear,
    notEmpty,
    notEqual,
    selectAll,
    startsWith,
    thisMonth,
    thisYear,
    today,
    ungroup,
    yesterday
];
export const FILTERING_ICONS = new InjectionToken<void>('FILTERING_ICONS', {
    providedIn: 'root',
    factory: () => registerFilteringSVGIconsFactory(inject(IgxIconService))
});

export function registerFilteringSVGIconsFactory(iconService: IgxIconService) {
    filteringIcons.forEach(icon => {
        iconService.addSvgIconFromText(icon.name, icon.value, 'imx-icons');
    });
}
