// helper functions
function applyIgnoreCase(a: string, ignoreCase: boolean): string {
    a = a || "";
    // bulletproof
    return ignoreCase ? ("" + a).toLowerCase() : a;
}
function getDateParts(date: Date, dateFormat?: string):
                    {   year?: number,
                        month?: number,
                        day?: number,
                        hours?: number,
                        minutes?: number,
                        seconds?: number,
                        milliseconds?: number
                    } {
    const res = {
        day: null,
        hours: null,
        milliseconds: null,
        minutes: null,
        month: null,
        seconds: null,
        year: null
    };
    if (!date || !dateFormat) {
        return res;
    }
    if (dateFormat.indexOf("y") >= 0) {
        res.year = date.getFullYear();
    }
    if (dateFormat.indexOf("M") >= 0) {
        res.month = date.getMonth();
    }
    if (dateFormat.indexOf("d") >= 0) {
        res.day = date.getDate();
    }
    if (dateFormat.indexOf("h") >= 0) {
        res.hours = date.getHours();
    }
    if (dateFormat.indexOf("m") >= 0) {
        res.minutes = date.getMinutes();
    }
    if (dateFormat.indexOf("s") >= 0) {
        res.seconds = date.getSeconds();
    }
    if (dateFormat.indexOf("f") >= 0) {
        res.milliseconds = date.getMilliseconds();
    }
    return res;
}

// tslint:disable-next-line:variable-name
export let FilteringCondition = {
    boolean: {
        true(target: boolean): boolean {
            return target;
        },
        false(target: boolean): boolean {
            return !target && target !== null && target !== undefined;
        },
        null(target: boolean): boolean {
            return target === null;
        },
        notNull(target: boolean): boolean {
            return target !== null;
        },
        empty(target: boolean): boolean {
            return target === null || target === undefined;
        },
        notEmpty(target: boolean): boolean {
            return target !== null && target !== undefined;
        }
    },
    date: {
        equals(target: Date, searchVal: Date): boolean {
            const targetp = getDateParts(target, "yMd");
            const searchp = getDateParts(searchVal, "yMd");
            return targetp.year === searchp.year &&
                targetp.month === searchp.month &&
                targetp.day === searchp.day;
        },
        doesNotEqual(target: Date, searchVal: Date): boolean {
            return !FilteringCondition.date.equals(target, searchVal);
        },
        before(target: Date, searchVal: Date): boolean {
            return target < searchVal;
        },
        after(target: Date, searchVal: Date): boolean {
            return target > searchVal;
        },
        today(target: Date): boolean {
            const d = getDateParts(target, "yMd");
            const now = getDateParts(new Date(), "yMd");
            return  d.year === now.year &&
                    d.month === now.month &&
                    d.day === now.day;
        },
        yesterday(target: Date): boolean {
            const td = getDateParts(target, "yMd");
            const y = ((d) => new Date(d.setDate(d.getDate() - 1)))(new Date());
            const yesterday = getDateParts(y, "yMd");
            return  td.year === yesterday.year &&
                    td.month === yesterday.month &&
                    td.day === yesterday.day;
        },
        thisMonth(target: Date): boolean {
            const d = getDateParts(target, "yM");
            const now = getDateParts(new Date(), "yM");
            return  d.year === now.year &&
                    d.month === now.month;
        },
        lastMonth(target: Date): boolean {
            const d = getDateParts(target, "yM");
            const now = getDateParts(new Date(), "yM");
            if (!now.month) {
                now.month = 11;
                now.year -= 1;
            } else {
                now.month--;
            }
            return  d.year === now.year &&
                    d.month === now.month;
        },
        nextMonth(target: Date): boolean {
            const d = getDateParts(target, "yM");
            const now = getDateParts(new Date(), "yM");
            if (now.month === 11) {
                now.month = 0;
                now.year += 1;
            } else {
                now.month++;
            }
            return  d.year === now.year &&
                    d.month === now.month;
        },
        thisYear(target: Date): boolean {
            const d = getDateParts(target, "y");
            const now = getDateParts(new Date(), "y");
            return  d.year === now.year;
        },
        lastYear(target: Date): boolean {
            const d = getDateParts(target, "y");
            const now = getDateParts(new Date(), "y");
            return  d.year === now.year - 1;
        },
        nextYear(target: Date): boolean {
            const d = getDateParts(target, "y");
            const now = getDateParts(new Date(), "y");
            return  d.year === now.year + 1;
        },
        null(target: Date): boolean {
            return target === null;
        },
        notNull(target: Date): boolean {
            return target !== null;
        },
        empty(target: Date): boolean {
            return target === null || target === undefined;
        },
        notEmpty(target: Date): boolean {
            return target !== null && target !== undefined;
        }
    },
    number: {
        equals(target: number, searchVal: number): boolean {
            return target === searchVal;
        },
        doesNotEqual(target: number, searchVal: number): boolean {
            return target !== searchVal;
        },
        greaterThan(target: number, searchVal: number): boolean {
            return target > searchVal;
        },
        lessThan(target: number, searchVal: number): boolean {
            return target < searchVal;
        },
        greaterThanOrEqualTo(target: number, searchVal: number): boolean {
            return target >= searchVal;
        },
        lessThanOrEqualTo(target: number, searchVal: number): boolean {
            return target <= searchVal;
        },
        null(target: number): boolean {
            return target === null;
        },
        notNull(target): boolean {
            return target !== null;
        },
        empty(target: number): boolean {
            return target === null || target === undefined || isNaN(target);
        },
        notEmpty(target: number): boolean {
            return target !== null && target !== undefined && !isNaN(target);
        }
    },
    string: {
        contains(target: string, searchVal: string, ignoreCase?: boolean): boolean {
            const search = applyIgnoreCase(searchVal, ignoreCase);
            target = applyIgnoreCase(target, ignoreCase);
            return target.indexOf(search) !== -1;
        },
        startsWith(target: string, searchVal: string, ignoreCase?: boolean): boolean {
            const search = applyIgnoreCase(searchVal, ignoreCase);
            target = applyIgnoreCase(target, ignoreCase);
            return target.startsWith(search);
        },
        endsWith(target: string, searchVal: string, ignoreCase?: boolean): boolean {
            const search = applyIgnoreCase(searchVal, ignoreCase);
            target = applyIgnoreCase(target, ignoreCase);
            return target.endsWith(search);
        },
        doesNotContain(target: string, searchVal: string, ignoreCase?: boolean): boolean {
            const search = applyIgnoreCase(searchVal, ignoreCase);
            target = applyIgnoreCase(target, ignoreCase);
            return target.indexOf(search) === -1;
        },
        equals(target: string, searchVal: string, ignoreCase?: boolean): boolean {
            const search = applyIgnoreCase(searchVal, ignoreCase);
            target = applyIgnoreCase(target, ignoreCase);
            return target === search;
        },
        doesNotEqual(target: string, searchVal: string, ignoreCase?: boolean): boolean {
            const search = applyIgnoreCase(searchVal, ignoreCase);
            target = applyIgnoreCase(target, ignoreCase);
            return target !== search;
        },
        null(target: string): boolean {
            return target === null;
        },
        notNull(target: string): boolean {
            return target !== null;
        },
        empty(target: string): boolean {
            return target === null || target === undefined || target.length === 0;
        },
        notEmpty(target: string): boolean {
            return target !== null && target !== undefined && target.length > 0;
        }
    }
};

export const STRING_FILTERS = {
    contains(target: string, searchVal: string, ignoreCase?: boolean): boolean {
        const search = applyIgnoreCase(searchVal, ignoreCase);
        target = applyIgnoreCase(target, ignoreCase);
        return target.indexOf(search) !== -1;
    },
    startsWith(target: string, searchVal: string, ignoreCase?: boolean): boolean {
        const search = applyIgnoreCase(searchVal, ignoreCase);
        target = applyIgnoreCase(target, ignoreCase);
        return target.startsWith(search);
    },
    endsWith(target: string, searchVal: string, ignoreCase?: boolean): boolean {
        const search = applyIgnoreCase(searchVal, ignoreCase);
        target = applyIgnoreCase(target, ignoreCase);
        return target.endsWith(search);
    },
    doesNotContain(target: string, searchVal: string, ignoreCase?: boolean): boolean {
        const search = applyIgnoreCase(searchVal, ignoreCase);
        target = applyIgnoreCase(target, ignoreCase);
        return target.indexOf(search) === -1;
    },
    equals(target: string, searchVal: string, ignoreCase?: boolean): boolean {
        const search = applyIgnoreCase(searchVal, ignoreCase);
        target = applyIgnoreCase(target, ignoreCase);
        return target === search;
    },
    doesNotEqual(target: string, searchVal: string, ignoreCase?: boolean): boolean {
        const search = applyIgnoreCase(searchVal, ignoreCase);
        target = applyIgnoreCase(target, ignoreCase);
        return target !== search;
    },
    null(target: string): boolean {
        return target === null;
    },
    notNull(target: string): boolean {
        return target !== null;
    },
    empty(target: string): boolean {
        return target === null || target === undefined || target.length === 0;
    },
    notEmpty(target: string): boolean {
        return target !== null && target !== undefined && target.length > 0;
    }
};

export const NUMBER_FILTERS = {
    equals(target: number, searchVal: number): boolean {
        return target === searchVal;
    },
    doesNotEqual(target: number, searchVal: number): boolean {
        return target !== searchVal;
    },
    greaterThan(target: number, searchVal: number): boolean {
        return target > searchVal;
    },
    lessThan(target: number, searchVal: number): boolean {
        return target < searchVal;
    },
    greaterThanOrEqualTo(target: number, searchVal: number): boolean {
        return target >= searchVal;
    },
    lessThanOrEqualTo(target: number, searchVal: number): boolean {
        return target <= searchVal;
    },
    null(target: number): boolean {
        return target === null;
    },
    notNull(target): boolean {
        return target !== null;
    },
    empty(target: number): boolean {
        return target === null || target === undefined || isNaN(target);
    },
    notEmpty(target: number): boolean {
        return target !== null && target !== undefined && !isNaN(target);
    }
};

export const BOOLEAN_FILTERS = {
    true(target: boolean): boolean {
        return target;
    },
    false(target: boolean): boolean {
        return !target && target !== null && target !== undefined;
    },
    null(target: boolean): boolean {
        return target === null;
    },
    notNull(target: boolean): boolean {
        return target !== null;
    },
    empty(target: boolean): boolean {
        return target === null || target === undefined;
    },
    notEmpty(target: boolean): boolean {
        return target !== null && target !== undefined;
    }
};

export const DATE_FILTERS = {
    equals(target: Date, searchVal: Date): boolean {
        const targetp = getDateParts(target, "yMd");
        const searchp = getDateParts(searchVal, "yMd");
        return targetp.year === searchp.year &&
            targetp.month === searchp.month &&
            targetp.day === searchp.day;
    },
    doesNotEqual(target: Date, searchVal: Date): boolean {
        return !DATE_FILTERS.equals(target, searchVal);
    },
    before(target: Date, searchVal: Date): boolean {
        return target < searchVal;
    },
    after(target: Date, searchVal: Date): boolean {
        return target > searchVal;
    },
    today(target: Date): boolean {
        const d = getDateParts(target, "yMd");
        const now = getDateParts(new Date(), "yMd");
        return  d.year === now.year &&
                d.month === now.month &&
                d.day === now.day;
    },
    yesterday(target: Date): boolean {
        const td = getDateParts(target, "yMd");
        const y = ((d) => new Date(d.setDate(d.getDate() - 1)))(new Date());
        const yesterday = getDateParts(y, "yMd");
        return  td.year === yesterday.year &&
                td.month === yesterday.month &&
                td.day === yesterday.day;
    },
    thisMonth(target: Date): boolean {
        const d = getDateParts(target, "yM");
        const now = getDateParts(new Date(), "yM");
        return  d.year === now.year &&
                d.month === now.month;
    },
    lastMonth(target: Date): boolean {
        const d = getDateParts(target, "yM");
        const now = getDateParts(new Date(), "yM");
        if (!now.month) {
            now.month = 11;
            now.year -= 1;
        } else {
            now.month--;
        }
        return  d.year === now.year &&
                d.month === now.month;
    },
    nextMonth(target: Date): boolean {
        const d = getDateParts(target, "yM");
        const now = getDateParts(new Date(), "yM");
        if (now.month === 11) {
            now.month = 0;
            now.year += 1;
        } else {
            now.month++;
        }
        return  d.year === now.year &&
                d.month === now.month;
    },
    thisYear(target: Date): boolean {
        const d = getDateParts(target, "y");
        const now = getDateParts(new Date(), "y");
        return  d.year === now.year;
    },
    lastYear(target: Date): boolean {
        const d = getDateParts(target, "y");
        const now = getDateParts(new Date(), "y");
        return  d.year === now.year - 1;
    },
    nextYear(target: Date): boolean {
        const d = getDateParts(target, "y");
        const now = getDateParts(new Date(), "y");
        return  d.year === now.year + 1;
    },
    null(target: Date): boolean {
        return target === null;
    },
    notNull(target: Date): boolean {
        return target !== null;
    },
    empty(target: Date): boolean {
        return target === null || target === undefined;
    },
    notEmpty(target: Date): boolean {
        return target !== null && target !== undefined;
    }
};
