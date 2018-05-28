function applyIgnoreCase(a, ignoreCase) {
    a = a || "";
    return ignoreCase ? ("" + a).toLowerCase() : a;
}
function getDateParts(date, dateFormat) {
    var res = {
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
export var FilteringCondition = {
    boolean: {
        true: function (target) {
            return target;
        },
        false: function (target) {
            return !target && target !== null && target !== undefined;
        },
        null: function (target) {
            return target === null;
        },
        notNull: function (target) {
            return target !== null;
        },
        empty: function (target) {
            return target === null || target === undefined;
        },
        notEmpty: function (target) {
            return target !== null && target !== undefined;
        }
    },
    date: {
        equals: function (target, searchVal) {
            var targetp = getDateParts(target, "yMd");
            var searchp = getDateParts(searchVal, "yMd");
            return targetp.year === searchp.year &&
                targetp.month === searchp.month &&
                targetp.day === searchp.day;
        },
        doesNotEqual: function (target, searchVal) {
            return !FilteringCondition.date.equals(target, searchVal);
        },
        before: function (target, searchVal) {
            return target < searchVal;
        },
        after: function (target, searchVal) {
            return target > searchVal;
        },
        today: function (target) {
            var d = getDateParts(target, "yMd");
            var now = getDateParts(new Date(), "yMd");
            return d.year === now.year &&
                d.month === now.month &&
                d.day === now.day;
        },
        yesterday: function (target) {
            var td = getDateParts(target, "yMd");
            var y = (function (d) { return new Date(d.setDate(d.getDate() - 1)); })(new Date());
            var yesterday = getDateParts(y, "yMd");
            return td.year === yesterday.year &&
                td.month === yesterday.month &&
                td.day === yesterday.day;
        },
        thisMonth: function (target) {
            var d = getDateParts(target, "yM");
            var now = getDateParts(new Date(), "yM");
            return d.year === now.year &&
                d.month === now.month;
        },
        lastMonth: function (target) {
            var d = getDateParts(target, "yM");
            var now = getDateParts(new Date(), "yM");
            if (!now.month) {
                now.month = 11;
                now.year -= 1;
            }
            else {
                now.month--;
            }
            return d.year === now.year &&
                d.month === now.month;
        },
        nextMonth: function (target) {
            var d = getDateParts(target, "yM");
            var now = getDateParts(new Date(), "yM");
            if (now.month === 11) {
                now.month = 0;
                now.year += 1;
            }
            else {
                now.month++;
            }
            return d.year === now.year &&
                d.month === now.month;
        },
        thisYear: function (target) {
            var d = getDateParts(target, "y");
            var now = getDateParts(new Date(), "y");
            return d.year === now.year;
        },
        lastYear: function (target) {
            var d = getDateParts(target, "y");
            var now = getDateParts(new Date(), "y");
            return d.year === now.year - 1;
        },
        nextYear: function (target) {
            var d = getDateParts(target, "y");
            var now = getDateParts(new Date(), "y");
            return d.year === now.year + 1;
        },
        null: function (target) {
            return target === null;
        },
        notNull: function (target) {
            return target !== null;
        },
        empty: function (target) {
            return target === null || target === undefined;
        },
        notEmpty: function (target) {
            return target !== null && target !== undefined;
        }
    },
    number: {
        equals: function (target, searchVal) {
            return target === searchVal;
        },
        doesNotEqual: function (target, searchVal) {
            return target !== searchVal;
        },
        greaterThan: function (target, searchVal) {
            return target > searchVal;
        },
        lessThan: function (target, searchVal) {
            return target < searchVal;
        },
        greaterThanOrEqualTo: function (target, searchVal) {
            return target >= searchVal;
        },
        lessThanOrEqualTo: function (target, searchVal) {
            return target <= searchVal;
        },
        null: function (target) {
            return target === null;
        },
        notNull: function (target) {
            return target !== null;
        },
        empty: function (target) {
            return target === null || target === undefined || isNaN(target);
        },
        notEmpty: function (target) {
            return target !== null && target !== undefined && !isNaN(target);
        }
    },
    string: {
        contains: function (target, searchVal, ignoreCase) {
            var search = applyIgnoreCase(searchVal, ignoreCase);
            target = applyIgnoreCase(target, ignoreCase);
            return target.indexOf(search) !== -1;
        },
        startsWith: function (target, searchVal, ignoreCase) {
            var search = applyIgnoreCase(searchVal, ignoreCase);
            target = applyIgnoreCase(target, ignoreCase);
            return target.startsWith(search);
        },
        endsWith: function (target, searchVal, ignoreCase) {
            var search = applyIgnoreCase(searchVal, ignoreCase);
            target = applyIgnoreCase(target, ignoreCase);
            return target.endsWith(search);
        },
        doesNotContain: function (target, searchVal, ignoreCase) {
            var search = applyIgnoreCase(searchVal, ignoreCase);
            target = applyIgnoreCase(target, ignoreCase);
            return target.indexOf(search) === -1;
        },
        equals: function (target, searchVal, ignoreCase) {
            var search = applyIgnoreCase(searchVal, ignoreCase);
            target = applyIgnoreCase(target, ignoreCase);
            return target === search;
        },
        doesNotEqual: function (target, searchVal, ignoreCase) {
            var search = applyIgnoreCase(searchVal, ignoreCase);
            target = applyIgnoreCase(target, ignoreCase);
            return target !== search;
        },
        null: function (target) {
            return target === null;
        },
        notNull: function (target) {
            return target !== null;
        },
        empty: function (target) {
            return target === null || target === undefined || target.length === 0;
        },
        notEmpty: function (target) {
            return target !== null && target !== undefined && target.length > 0;
        }
    }
};
export var STRING_FILTERS = {
    contains: function (target, searchVal, ignoreCase) {
        var search = applyIgnoreCase(searchVal, ignoreCase);
        target = applyIgnoreCase(target, ignoreCase);
        return target.indexOf(search) !== -1;
    },
    startsWith: function (target, searchVal, ignoreCase) {
        var search = applyIgnoreCase(searchVal, ignoreCase);
        target = applyIgnoreCase(target, ignoreCase);
        return target.startsWith(search);
    },
    endsWith: function (target, searchVal, ignoreCase) {
        var search = applyIgnoreCase(searchVal, ignoreCase);
        target = applyIgnoreCase(target, ignoreCase);
        return target.endsWith(search);
    },
    doesNotContain: function (target, searchVal, ignoreCase) {
        var search = applyIgnoreCase(searchVal, ignoreCase);
        target = applyIgnoreCase(target, ignoreCase);
        return target.indexOf(search) === -1;
    },
    equals: function (target, searchVal, ignoreCase) {
        var search = applyIgnoreCase(searchVal, ignoreCase);
        target = applyIgnoreCase(target, ignoreCase);
        return target === search;
    },
    doesNotEqual: function (target, searchVal, ignoreCase) {
        var search = applyIgnoreCase(searchVal, ignoreCase);
        target = applyIgnoreCase(target, ignoreCase);
        return target !== search;
    },
    null: function (target) {
        return target === null;
    },
    notNull: function (target) {
        return target !== null;
    },
    empty: function (target) {
        return target === null || target === undefined || target.length === 0;
    },
    notEmpty: function (target) {
        return target !== null && target !== undefined && target.length > 0;
    }
};
export var NUMBER_FILTERS = {
    equals: function (target, searchVal) {
        return target === searchVal;
    },
    doesNotEqual: function (target, searchVal) {
        return target !== searchVal;
    },
    greaterThan: function (target, searchVal) {
        return target > searchVal;
    },
    lessThan: function (target, searchVal) {
        return target < searchVal;
    },
    greaterThanOrEqualTo: function (target, searchVal) {
        return target >= searchVal;
    },
    lessThanOrEqualTo: function (target, searchVal) {
        return target <= searchVal;
    },
    null: function (target) {
        return target === null;
    },
    notNull: function (target) {
        return target !== null;
    },
    empty: function (target) {
        return target === null || target === undefined || isNaN(target);
    },
    notEmpty: function (target) {
        return target !== null && target !== undefined && !isNaN(target);
    }
};
export var BOOLEAN_FILTERS = {
    true: function (target) {
        return target;
    },
    false: function (target) {
        return !target && target !== null && target !== undefined;
    },
    null: function (target) {
        return target === null;
    },
    notNull: function (target) {
        return target !== null;
    },
    empty: function (target) {
        return target === null || target === undefined;
    },
    notEmpty: function (target) {
        return target !== null && target !== undefined;
    }
};
export var DATE_FILTERS = {
    equals: function (target, searchVal) {
        var targetp = getDateParts(target, "yMd");
        var searchp = getDateParts(searchVal, "yMd");
        return targetp.year === searchp.year &&
            targetp.month === searchp.month &&
            targetp.day === searchp.day;
    },
    doesNotEqual: function (target, searchVal) {
        return !DATE_FILTERS.equals(target, searchVal);
    },
    before: function (target, searchVal) {
        return target < searchVal;
    },
    after: function (target, searchVal) {
        return target > searchVal;
    },
    today: function (target) {
        var d = getDateParts(target, "yMd");
        var now = getDateParts(new Date(), "yMd");
        return d.year === now.year &&
            d.month === now.month &&
            d.day === now.day;
    },
    yesterday: function (target) {
        var td = getDateParts(target, "yMd");
        var y = (function (d) { return new Date(d.setDate(d.getDate() - 1)); })(new Date());
        var yesterday = getDateParts(y, "yMd");
        return td.year === yesterday.year &&
            td.month === yesterday.month &&
            td.day === yesterday.day;
    },
    thisMonth: function (target) {
        var d = getDateParts(target, "yM");
        var now = getDateParts(new Date(), "yM");
        return d.year === now.year &&
            d.month === now.month;
    },
    lastMonth: function (target) {
        var d = getDateParts(target, "yM");
        var now = getDateParts(new Date(), "yM");
        if (!now.month) {
            now.month = 11;
            now.year -= 1;
        }
        else {
            now.month--;
        }
        return d.year === now.year &&
            d.month === now.month;
    },
    nextMonth: function (target) {
        var d = getDateParts(target, "yM");
        var now = getDateParts(new Date(), "yM");
        if (now.month === 11) {
            now.month = 0;
            now.year += 1;
        }
        else {
            now.month++;
        }
        return d.year === now.year &&
            d.month === now.month;
    },
    thisYear: function (target) {
        var d = getDateParts(target, "y");
        var now = getDateParts(new Date(), "y");
        return d.year === now.year;
    },
    lastYear: function (target) {
        var d = getDateParts(target, "y");
        var now = getDateParts(new Date(), "y");
        return d.year === now.year - 1;
    },
    nextYear: function (target) {
        var d = getDateParts(target, "y");
        var now = getDateParts(new Date(), "y");
        return d.year === now.year + 1;
    },
    null: function (target) {
        return target === null;
    },
    notNull: function (target) {
        return target !== null;
    },
    empty: function (target) {
        return target === null || target === undefined;
    },
    notEmpty: function (target) {
        return target !== null && target !== undefined;
    }
};
