import {
    contains, doesNotContain, endsWith, equals, greaterThan, greaterThanOrEqual,
    isAfter, isBefore, isEmpty, isFalse, isNull, isNotNull, isTrue,
    lastMonth, lastYear, lessThan, lessThanOrEqual, nextMonth, nextYear,
    notEmpty, notEqual, selectAll, startsWith, thisMonth, thisYear, today, ungroup, yesterday
} from '@igniteui/material-icons-extended/editor';
import { IMXIcon } from '@igniteui/material-icons-extended';
import { IgxIconService } from './icon.service';

/**
 * Register filtering SVG icons
 * @param iconService
 */
export function registerFilteringSVGIcons(iconService: IgxIconService) {
    const filteringIcons: IMXIcon[] = [
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

    filteringIcons.forEach(icon => {
        iconService.addSvgIconFromText(icon.name, icon.value, 'imx-icons');
    });
}
