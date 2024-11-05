/**
 * Provides base filtering operations
 * Implementations should be Singleton
 *
 * @export
 */
export class IgxFilteringOperand {
    protected static _instance: IgxFilteringOperand = null;
    public operations: IFilteringOperation[];

    constructor() {
        this.operations = [{
            name: 'null',
            isUnary: true,
            iconName: 'filter_null',
            logic: (target: any) => target === null
        }, {
            name: 'notNull',
            isUnary: true,
            iconName: 'filter_not_null',
            logic: (target: any) => target !== null
        }, {
            name: 'in',
            isUnary: false,
            iconName: 'filter_in',
            hidden: true,
            logic: (target: any, searchVal: Set<any>) => this.findValueInSet(target, searchVal)
        }];
    }

    public static instance(): IgxFilteringOperand {
        return this._instance || (this._instance = new this());
    }

    /**
     * Returns an array of names of the conditions which are visible in the UI
     */
    public conditionList(): string[] {
        return this.operations.filter(f => !f.hidden).map((element) => element.name);
    }

    /**
     * Returns an instance of the condition with the specified name.
     *
     * @param name The name of the condition.
     */
    public condition(name: string): IFilteringOperation {
        return this.operations.find((element) => element.name === name);
    }

    /**
     * Adds a new condition to the filtering operations.
     *
     * @param operation The filtering operation.
     */
    public append(operation: IFilteringOperation) {
        this.operations.push(operation);
    }

    /**
     * @hidden
     */
    protected findValueInSet(target: any, searchVal: Set<any>) {
        return searchVal.has(target);
    }
}

/* blazorCSSuppress */
/**
 * Provides filtering operations for booleans
 *
 * @export
 */
export class IgxBooleanFilteringOperand extends IgxFilteringOperand {
    protected constructor() {
        super();
        this.operations = [{
            name: 'all',
            isUnary: true,
            iconName: 'filter_all',
            logic: (_target: boolean) => true
        }, {
            name: 'true',
            isUnary: true,
            iconName: 'filter_true',
            logic: (target: boolean) => !!(target && target !== null && target !== undefined)
        }, {
            name: 'false',
            isUnary: true,
            iconName: 'filter_false',
            logic: (target: boolean) => !target && target !== null && target !== undefined
        }, {
            name: 'empty',
            isUnary: true,
            iconName: 'filter_empty',
            logic: (target: boolean) => target === null || target === undefined
        }, {
            name: 'notEmpty',
            isUnary: true,
            iconName: 'filter_not_empty',
            logic: (target: boolean) => target !== null && target !== undefined
        }].concat(this.operations);
    }
}

/* blazorCSSuppress */
/**
 * @internal
 * @hidden
 */
class IgxBaseDateTimeFilteringOperand extends IgxFilteringOperand {
    protected constructor() {
        super();
        this.operations = [{
            name: 'empty',
            isUnary: true,
            iconName: 'filter_empty',
            logic: (target: Date) => target === null || target === undefined
        }, {
            name: 'notEmpty',
            isUnary: true,
            iconName: 'filter_not_empty',
            logic: (target: Date) => target !== null && target !== undefined
        }].concat(this.operations);
    }

    /**
     * Splits a Date object into parts
     *
     * @memberof IgxDateFilteringOperand
     */
    public static getDateParts(date: Date, dateFormat?: string): IDateParts {
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
        if (dateFormat.indexOf('y') >= 0) {
            res.year = date.getFullYear();
        }
        if (dateFormat.indexOf('M') >= 0) {
            res.month = date.getMonth();
        }
        if (dateFormat.indexOf('d') >= 0) {
            res.day = date.getDate();
        }
        if (dateFormat.indexOf('h') >= 0) {
            res.hours = date.getHours();
        }
        if (dateFormat.indexOf('m') >= 0) {
            res.minutes = date.getMinutes();
        }
        if (dateFormat.indexOf('s') >= 0) {
            res.seconds = date.getSeconds();
        }
        if (dateFormat.indexOf('f') >= 0) {
            res.milliseconds = date.getMilliseconds();
        }
        return res;
    }

    protected override findValueInSet(target: any, searchVal: Set<any>) {
        if (!target) {
            return false;
        }
        return searchVal.has((target instanceof Date) ? target.toISOString() : target);
    }

    protected validateInputData(target: Date) {
        if (!(target instanceof Date)) {
            throw new Error('Could not perform filtering on \'date\' column because the datasource object type is not \'Date\'.');
        }
    }
}

/* blazorCSSuppress */
/**
 * Provides filtering operations for Dates
 *
 * @export
 */
export class IgxDateFilteringOperand extends IgxBaseDateTimeFilteringOperand {
    protected constructor() {
        super();
        this.operations = [{
            name: 'equals',
            isUnary: false,
            iconName: 'filter_equal',
            logic: (target: Date, searchVal: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const targetp = IgxDateFilteringOperand.getDateParts(target, 'yMd');
                const searchp = IgxDateFilteringOperand.getDateParts(searchVal, 'yMd');
                return targetp.year === searchp.year &&
                    targetp.month === searchp.month &&
                    targetp.day === searchp.day;
            }
        }, {
            name: 'doesNotEqual',
            isUnary: false,
            iconName: 'filter_not_equal',
            logic: (target: Date, searchVal: Date) => {
                if (!target) {
                    return true;
                }

                this.validateInputData(target);

                const targetp = IgxDateFilteringOperand.getDateParts(target, 'yMd');
                const searchp = IgxDateFilteringOperand.getDateParts(searchVal, 'yMd');
                return targetp.year !== searchp.year ||
                    targetp.month !== searchp.month ||
                    targetp.day !== searchp.day;
            }
        }, {
            name: 'before',
            isUnary: false,
            iconName: 'filter_before',
            logic: (target: Date, searchVal: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                return target < searchVal;
            }
        }, {
            name: 'after',
            isUnary: false,
            iconName: 'filter_after',
            logic: (target: Date, searchVal: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                return target > searchVal;
            }
        }, {
            name: 'today',
            isUnary: true,
            iconName: 'filter_today',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateFilteringOperand.getDateParts(target, 'yMd');
                const now = IgxDateFilteringOperand.getDateParts(new Date(), 'yMd');
                return d.year === now.year &&
                    d.month === now.month &&
                    d.day === now.day;
            }
        }, {
            name: 'yesterday',
            isUnary: true,
            iconName: 'filter_yesterday',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const td = IgxDateFilteringOperand.getDateParts(target, 'yMd');
                const y = ((d) => new Date(d.setDate(d.getDate() - 1)))(new Date());
                const yesterday = IgxDateFilteringOperand.getDateParts(y, 'yMd');
                return td.year === yesterday.year &&
                    td.month === yesterday.month &&
                    td.day === yesterday.day;
            }
        }, {
            name: 'thisMonth',
            isUnary: true,
            iconName: 'filter_this_month',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateFilteringOperand.getDateParts(target, 'yM');
                const now = IgxDateFilteringOperand.getDateParts(new Date(), 'yM');
                return d.year === now.year &&
                    d.month === now.month;
            }
        }, {
            name: 'lastMonth',
            isUnary: true,
            iconName: 'filter_last_month',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateFilteringOperand.getDateParts(target, 'yM');
                const now = IgxDateFilteringOperand.getDateParts(new Date(), 'yM');
                if (!now.month) {
                    now.month = 11;
                    now.year -= 1;
                } else {
                    now.month--;
                }
                return d.year === now.year &&
                    d.month === now.month;
            }
        }, {
            name: 'nextMonth',
            isUnary: true,
            iconName: 'filter_next_month',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateFilteringOperand.getDateParts(target, 'yM');
                const now = IgxDateFilteringOperand.getDateParts(new Date(), 'yM');
                if (now.month === 11) {
                    now.month = 0;
                    now.year += 1;
                } else {
                    now.month++;
                }
                return d.year === now.year &&
                    d.month === now.month;
            }
        }, {
            name: 'thisYear',
            isUnary: true,
            iconName: 'filter_this_year',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateFilteringOperand.getDateParts(target, 'y');
                const now = IgxDateFilteringOperand.getDateParts(new Date(), 'y');
                return d.year === now.year;
            }
        }, {
            name: 'lastYear',
            isUnary: true,
            iconName: 'filter_last_year',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateFilteringOperand.getDateParts(target, 'y');
                const now = IgxDateFilteringOperand.getDateParts(new Date(), 'y');
                return d.year === now.year - 1;
            }
        }, {
            name: 'nextYear',
            isUnary: true,
            iconName: 'filter_next_year',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateFilteringOperand.getDateParts(target, 'y');
                const now = IgxDateFilteringOperand.getDateParts(new Date(), 'y');
                return d.year === now.year + 1;
            }
        }].concat(this.operations);
    }

    protected override findValueInSet(target: any, searchVal: Set<any>) {
        if (!target) {
            return false;
        }

        target = target.toDateString();
        return searchVal.has(target);
    }
}

/* blazorCSSuppress */
export class IgxDateTimeFilteringOperand extends IgxBaseDateTimeFilteringOperand {
    protected constructor() {
        super();
        this.operations = [{
            name: 'equals',
            isUnary: false,
            iconName: 'filter_equal',
            logic: (target: Date, searchVal: Date) => {
                if (!target) {
                    return false;
                }
                this.validateInputData(target);
                const targetp = IgxDateTimeFilteringOperand.getDateParts(target, 'yMdhms');
                const searchp = IgxDateTimeFilteringOperand.getDateParts(searchVal, 'yMdhms');
                return targetp.year === searchp.year &&
                    targetp.month === searchp.month &&
                    targetp.day === searchp.day &&
                    targetp.hours === searchp.hours &&
                    targetp.minutes === searchp.minutes &&
                    targetp.seconds === searchp.seconds;
            }
        }, {
            name: 'doesNotEqual',
            isUnary: false,
            iconName: 'filter_not_equal',
            logic: (target: Date, searchVal: Date) => {
                if (!target) {
                    return true;
                }
                this.validateInputData(target);
                const targetp = IgxDateTimeFilteringOperand.getDateParts(target, 'yMdhms');
                const searchp = IgxDateTimeFilteringOperand.getDateParts(searchVal, 'yMdhms');
                return targetp.year !== searchp.year ||
                    targetp.month !== searchp.month ||
                    targetp.day !== searchp.day ||
                    targetp.hours !== searchp.hours ||
                    targetp.minutes !== searchp.minutes ||
                    targetp.seconds !== searchp.seconds;
            }
        }, {
            name: 'before',
            isUnary: false,
            iconName: 'filter_before',
            logic: (target: Date, searchVal: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                return target < searchVal;
            }
        }, {
            name: 'after',
            isUnary: false,
            iconName: 'filter_after',
            logic: (target: Date, searchVal: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                return target > searchVal;
            }
        }, {
            name: 'today',
            isUnary: true,
            iconName: 'filter_today',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateTimeFilteringOperand.getDateParts(target, 'yMd');
                const now = IgxDateTimeFilteringOperand.getDateParts(new Date(), 'yMd');
                return d.year === now.year &&
                    d.month === now.month &&
                    d.day === now.day;
            }
        }, {
            name: 'yesterday',
            isUnary: true,
            iconName: 'filter_yesterday',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const td = IgxDateTimeFilteringOperand.getDateParts(target, 'yMd');
                const y = ((d) => new Date(d.setDate(d.getDate() - 1)))(new Date());
                const yesterday = IgxDateTimeFilteringOperand.getDateParts(y, 'yMd');
                return td.year === yesterday.year &&
                    td.month === yesterday.month &&
                    td.day === yesterday.day;
            }
        }, {
            name: 'thisMonth',
            isUnary: true,
            iconName: 'filter_this_month',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateTimeFilteringOperand.getDateParts(target, 'yM');
                const now = IgxDateTimeFilteringOperand.getDateParts(new Date(), 'yM');
                return d.year === now.year &&
                    d.month === now.month;
            }
        }, {
            name: 'lastMonth',
            isUnary: true,
            iconName: 'filter_last_month',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateTimeFilteringOperand.getDateParts(target, 'yM');
                const now = IgxDateTimeFilteringOperand.getDateParts(new Date(), 'yM');
                if (!now.month) {
                    now.month = 11;
                    now.year -= 1;
                } else {
                    now.month--;
                }
                return d.year === now.year &&
                    d.month === now.month;
            }
        }, {
            name: 'nextMonth',
            isUnary: true,
            iconName: 'filter_next_month',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateTimeFilteringOperand.getDateParts(target, 'yM');
                const now = IgxDateTimeFilteringOperand.getDateParts(new Date(), 'yM');
                if (now.month === 11) {
                    now.month = 0;
                    now.year += 1;
                } else {
                    now.month++;
                }
                return d.year === now.year &&
                    d.month === now.month;
            }
        }, {
            name: 'thisYear',
            isUnary: true,
            iconName: 'filter_this_year',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateTimeFilteringOperand.getDateParts(target, 'y');
                const now = IgxDateTimeFilteringOperand.getDateParts(new Date(), 'y');
                return d.year === now.year;
            }
        }, {
            name: 'lastYear',
            isUnary: true,
            iconName: 'filter_last_year',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateTimeFilteringOperand.getDateParts(target, 'y');
                const now = IgxDateTimeFilteringOperand.getDateParts(new Date(), 'y');
                return d.year === now.year - 1;
            }
        }, {
            name: 'nextYear',
            isUnary: true,
            iconName: 'filter_next_year',
            logic: (target: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);

                const d = IgxDateTimeFilteringOperand.getDateParts(target, 'y');
                const now = IgxDateTimeFilteringOperand.getDateParts(new Date(), 'y');
                return d.year === now.year + 1;
            }
        }].concat(this.operations);
    }
}

/* blazorCSSuppress */
export class IgxTimeFilteringOperand extends IgxBaseDateTimeFilteringOperand {
    protected constructor() {
        super();
        this.operations = [{
            name: 'at',
            isUnary: false,
            iconName: 'filter_equal',
            logic: (target: Date, searchVal: Date) => {
                if (!target) {
                    return false;
                }
                this.validateInputData(target);
                const targetp = IgxTimeFilteringOperand.getDateParts(target, 'hms');
                const searchp = IgxTimeFilteringOperand.getDateParts(searchVal, 'hms');
                return targetp.hours === searchp.hours &&
                    targetp.minutes === searchp.minutes &&
                    targetp.seconds === searchp.seconds;
            }
        }, {
            name: 'not_at',
            isUnary: false,
            iconName: 'filter_not_equal',
            logic: (target: Date, searchVal: Date) => {
                if (!target) {
                    return true;
                }
                this.validateInputData(target);
                const targetp = IgxTimeFilteringOperand.getDateParts(target, 'hms');
                const searchp = IgxTimeFilteringOperand.getDateParts(searchVal, 'hms');
                return targetp.hours !== searchp.hours ||
                    targetp.minutes !== searchp.minutes ||
                    targetp.seconds !== searchp.seconds;
            }
        }, {
            name: 'before',
            isUnary: false,
            iconName: 'filter_before',
            logic: (target: Date, searchVal: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);
                const targetn = IgxTimeFilteringOperand.getDateParts(target, 'hms');
                const search = IgxTimeFilteringOperand.getDateParts(searchVal, 'hms');

                return targetn.hours < search.hours ? true : targetn.hours === search.hours && targetn.minutes < search.minutes ?
                    true : targetn.hours === search.hours && targetn.minutes === search.minutes && targetn.seconds < search.seconds;
            }
        }, {
            name: 'after',
            isUnary: false,
            iconName: 'filter_after',
            logic: (target: Date, searchVal: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);
                const targetn = IgxTimeFilteringOperand.getDateParts(target, 'hms');
                const search = IgxTimeFilteringOperand.getDateParts(searchVal, 'hms');

                return targetn.hours > search.hours ? true : targetn.hours === search.hours && targetn.minutes > search.minutes ?
                    true : targetn.hours === search.hours && targetn.minutes === search.minutes && targetn.seconds > search.seconds;
            }
        }, {
            name: 'at_before',
            isUnary: false,
            iconName: 'filter_before',
            logic: (target: Date, searchVal: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);
                const targetn = IgxTimeFilteringOperand.getDateParts(target, 'hms');
                const search = IgxTimeFilteringOperand.getDateParts(searchVal, 'hms');
                return (targetn.hours === search.hours && targetn.minutes === search.minutes && targetn.seconds === search.seconds) ||
                targetn.hours < search.hours ? true : targetn.hours === search.hours && targetn.minutes < search.minutes ?
                    true : targetn.hours === search.hours && targetn.minutes === search.minutes && targetn.seconds < search.seconds;
            }
        }, {
            name: 'at_after',
            isUnary: false,
            iconName: 'filter_after',
            logic: (target: Date, searchVal: Date) => {
                if (!target) {
                    return false;
                }

                this.validateInputData(target);
                const targetn = IgxTimeFilteringOperand.getDateParts(target, 'hms');
                const search = IgxTimeFilteringOperand.getDateParts(searchVal, 'hms');
                return (targetn.hours === search.hours && targetn.minutes === search.minutes && targetn.seconds === search.seconds) ||
                    targetn.hours > search.hours ? true : targetn.hours === search.hours && targetn.minutes > search.minutes ?
                    true : targetn.hours === search.hours && targetn.minutes === search.minutes && targetn.seconds > search.seconds;
            }
        }].concat(this.operations);
    }

    protected override findValueInSet(target: any, searchVal: Set<any>) {
        if (!target) {
            return false;
        }
        return searchVal.has(target.toLocaleTimeString());
    }
}

/* blazorCSSuppress */
/**
 * Provides filtering operations for numbers
 *
 * @export
 */
export class IgxNumberFilteringOperand extends IgxFilteringOperand {
    protected constructor() {
        super();
        this.operations = [{
            name: 'equals',
            isUnary: false,
            iconName: 'filter_equal',
            logic: (target: number, searchVal: number) => target === searchVal
        }, {
            name: 'doesNotEqual',
            isUnary: false,
            iconName: 'filter_not_equal',
            logic: (target: number, searchVal: number) => target !== searchVal
        }, {
            name: 'greaterThan',
            isUnary: false,
            iconName: 'filter_greater_than',
            logic: (target: number, searchVal: number) => target > searchVal
        }, {
            name: 'lessThan',
            isUnary: false,
            iconName: 'filter_less_than',
            logic: (target: number, searchVal: number) => target < searchVal
        }, {
            name: 'greaterThanOrEqualTo',
            isUnary: false,
            iconName: 'filter_greater_than_or_equal',
            logic: (target: number, searchVal: number) => target >= searchVal
        }, {
            name: 'lessThanOrEqualTo',
            isUnary: false,
            iconName: 'filter_less_than_or_equal',
            logic: (target: number, searchVal: number) => target <= searchVal
        }, {
            name: 'empty',
            isUnary: true,
            iconName: 'filter_empty',
            logic: (target: number) => target === null || target === undefined || isNaN(target)
        }, {
            name: 'notEmpty',
            isUnary: true,
            iconName: 'filter_not_empty',
            logic: (target: number) => target !== null && target !== undefined && !isNaN(target)
        }].concat(this.operations);
    }
}

/* blazorCSSuppress */
/**
 * Provides filtering operations for strings
 *
 * @export
 */
export class IgxStringFilteringOperand extends IgxFilteringOperand {
    protected constructor() {
        super();
        this.operations = [{
            name: 'contains',
            isUnary: false,
            iconName: 'filter_contains',
            logic: (target: string, searchVal: string, ignoreCase?: boolean) => {
                const search = IgxStringFilteringOperand.applyIgnoreCase(searchVal, ignoreCase);
                target = IgxStringFilteringOperand.applyIgnoreCase(target, ignoreCase);
                return target.indexOf(search) !== -1;
            }
        }, {
            name: 'doesNotContain',
            isUnary: false,
            iconName: 'filter_does_not_contain',
            logic: (target: string, searchVal: string, ignoreCase?: boolean) => {
                const search = IgxStringFilteringOperand.applyIgnoreCase(searchVal, ignoreCase);
                target = IgxStringFilteringOperand.applyIgnoreCase(target, ignoreCase);
                return target.indexOf(search) === -1;
            }
        }, {
            name: 'startsWith',
            isUnary: false,
            iconName: 'filter_starts_with',
            logic: (target: string, searchVal: string, ignoreCase?: boolean) => {
                const search = IgxStringFilteringOperand.applyIgnoreCase(searchVal, ignoreCase);
                target = IgxStringFilteringOperand.applyIgnoreCase(target, ignoreCase);
                return target.startsWith(search);
            }
        }, {
            name: 'endsWith',
            isUnary: false,
            iconName: 'filter_ends_with',
            logic: (target: string, searchVal: string, ignoreCase?: boolean) => {
                const search = IgxStringFilteringOperand.applyIgnoreCase(searchVal, ignoreCase);
                target = IgxStringFilteringOperand.applyIgnoreCase(target, ignoreCase);
                return target.endsWith(search);
            }
        }, {
            name: 'equals',
            isUnary: false,
            iconName: 'filter_equal',
            logic: (target: string, searchVal: string, ignoreCase?: boolean) => {
                const search = IgxStringFilteringOperand.applyIgnoreCase(searchVal, ignoreCase);
                target = IgxStringFilteringOperand.applyIgnoreCase(target, ignoreCase);
                return target === search;
            }
        }, {
            name: 'doesNotEqual',
            isUnary: false,
            iconName: 'filter_not_equal',
            logic: (target: string, searchVal: string, ignoreCase?: boolean) => {
                const search = IgxStringFilteringOperand.applyIgnoreCase(searchVal, ignoreCase);
                target = IgxStringFilteringOperand.applyIgnoreCase(target, ignoreCase);
                return target !== search;
            }
        }, {
            name: 'empty',
            isUnary: true,
            iconName: 'filter_empty',
            logic: (target: string) => target === null || target === undefined || target.length === 0
        }, {
            name: 'notEmpty',
            isUnary: true,
            iconName: 'filter_not_empty',
            logic: (target: string) => target !== null && target !== undefined && target.length > 0
        }].concat(this.operations);
    }

    /**
     * Applies case sensitivity on strings if provided
     *
     * @memberof IgxStringFilteringOperand
     */
    public static applyIgnoreCase(a: string, ignoreCase: boolean): string {
        a = a ?? '';
        // bulletproof
        return ignoreCase ? ('' + a).toLowerCase() : a;
    }
}

/* tsPlainInterface */
/* marshalByValue */
/**
 * Interface describing filtering operations
 *
 * @export
 */
export interface IFilteringOperation {
    name: string;
    isUnary: boolean;
    iconName: string;
    hidden?: boolean;
    /* blazorCSSuppress */
    /* blazorAlternateType: FilteringOperationLogicHandler */
    logic: (value: any, searchVal?: any, ignoreCase?: boolean) => boolean;
}

/**
 * Interface describing Date object in parts
 *
 * @export
 */
export interface IDateParts {
    year: number;
    month: number;
    day: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
}
