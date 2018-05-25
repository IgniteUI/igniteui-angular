/**
 * Provides base filtering operations
 * Singleton
 *
 * @export
 * @class IgxFilteringOperand
 */
export class IgxFilteringOperand {
    private static _instance: IgxFilteringOperand;

    public operations: IFilteringOperation[];

    protected constructor() {
        this.operations = [{
            name: "null",
            logic: (target: any) => {
                return target === null;
            }
        }, {
            name: "notNull",
            logic: (target: any) => {
                return target !== null;
            }
        }, {
            name: "empty",
            logic: (target: any) => {
                return target === null || target === undefined;
            }
        }, {
            name: "notEmpty",
            logic: (target: any) => {
                return target !== null && target !== undefined;
            }
        }];
    }

    public static instance(): IgxFilteringOperand {
        return this._instance || (this._instance = new this());
    }

    public condition(name: string): IFilteringOperation {
        this.operations.forEach((element) => {
            if (element.name === name) {
                return element;
            }
        });
        return null;
    }

    public append(operation: IFilteringOperation) {
        this.operations.push(operation);
    }
}

/**
 * Provides filtering operations for booleans
 *
 * @export
 * @class IgxBooleanFilteringOperand
 * @extends {IgxFilteringOperand}
 */
export class IgxBooleanFilteringOperand extends IgxFilteringOperand {
    protected constructor() {
        super();
        this.operations = [{
            name: "true",
            logic: (target: boolean) => {
                return target;
            }
        }, {
            name: "false",
            logic: (target: boolean) => {
                return !target && target !== null && target !== undefined;
            }
        }].concat(this.operations);
    }
}

/**
 * Provides filtering operations for Dates
 *
 * @export
 * @class IgxDateFilteringOperand
 * @extends {IgxFilteringOperand}
 */
export class IgxDateFilteringOperand extends IgxFilteringOperand {
    protected constructor() {
        super();
        this.operations = [{
            name: "equals",
            logic: (target: Date, searchVal: Date) => {
                const targetp = IgxDateFilteringOperand.getDateParts(target, "yMd");
                const searchp = IgxDateFilteringOperand.getDateParts(searchVal, "yMd");
                return targetp.year === searchp.year &&
                    targetp.month === searchp.month &&
                    targetp.day === searchp.day;
            }
        }, {
            name: "doesNotEqual",
            logic: (target: Date, searchVal: Date) => {
                return !this.operations.find((element) => element.name === "equals").logic(target, searchVal);
            }
        }, {
            name: "before",
            logic: (target: Date, searchVal: Date) => {
                return target < searchVal;
            }
        }, {
            name: "after",
            logic: (target: Date, searchVal: Date) => {
                return target > searchVal;
            }
        }, {
            name: "today",
            logic: (target: Date) => {
                const d = IgxDateFilteringOperand.getDateParts(target, "yMd");
                const now = IgxDateFilteringOperand.getDateParts(new Date(), "yMd");
                return  d.year === now.year &&
                        d.month === now.month &&
                        d.day === now.day;
            }
        }, {
            name: "yesterday",
            logic: (target: Date) => {
                const td = IgxDateFilteringOperand.getDateParts(target, "yMd");
                const y = ((d) => new Date(d.setDate(d.getDate() - 1)))(new Date());
                const yesterday = IgxDateFilteringOperand.getDateParts(y, "yMd");
                return  td.year === yesterday.year &&
                        td.month === yesterday.month &&
                        td.day === yesterday.day;
            }
        }, {
            name: "thisMonth",
            logic: (target: Date) => {
                const d = IgxDateFilteringOperand.getDateParts(target, "yM");
                const now = IgxDateFilteringOperand.getDateParts(new Date(), "yM");
                return  d.year === now.year &&
                        d.month === now.month;
            }
        }, {
            name: "lastMonth",
            logic: (target: Date) => {
                const d = IgxDateFilteringOperand.getDateParts(target, "yM");
                const now = IgxDateFilteringOperand.getDateParts(new Date(), "yM");
                if (!now.month) {
                    now.month = 11;
                    now.year -= 1;
                } else {
                    now.month--;
                }
                return  d.year === now.year &&
                        d.month === now.month;
            }
        }, {
            name: "nextMonth",
            logic: (target: Date) => {
                const d = IgxDateFilteringOperand.getDateParts(target, "yM");
                const now = IgxDateFilteringOperand.getDateParts(new Date(), "yM");
                if (now.month === 11) {
                    now.month = 0;
                    now.year += 1;
                } else {
                    now.month++;
                }
                return  d.year === now.year &&
                        d.month === now.month;
            }
        }, {
            name: "thisYear",
            logic: (target: Date) => {
                const d = IgxDateFilteringOperand.getDateParts(target, "y");
                const now = IgxDateFilteringOperand.getDateParts(new Date(), "y");
                return  d.year === now.year;
            }
        }, {
            name: "lastYear",
            logic: (target: Date) => {
                const d = IgxDateFilteringOperand.getDateParts(target, "y");
                const now = IgxDateFilteringOperand.getDateParts(new Date(), "y");
                return  d.year === now.year - 1;
            }
        }, {
            name: "nextYear",
            logic: (target: Date) => {
                const d = IgxDateFilteringOperand.getDateParts(target, "y");
                const now = IgxDateFilteringOperand.getDateParts(new Date(), "y");
                return  d.year === now.year + 1;
            }
        }].concat(this.operations);
    }

    /**
     * Splits a Date object into parts
     *
     * @static
     * @param {Date} date
     * @param {string} [dateFormat]
     * @returns {IDateParts}
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
}

/**
 * Provides filtering operations for numbers
 *
 * @export
 * @class IgxNumberFilteringOperand
 * @extends {IgxFilteringOperand}
 */
export class IgxNumberFilteringOperand extends IgxFilteringOperand {
    protected constructor() {
        super();
        this.operations = [{
            name: "equals",
            logic: (target: number, searchVal: number) => {
                return target === searchVal;
            }
        }, {
            name: "doesNotEqual",
            logic: (target: number, searchVal: number) => {
                return target !== searchVal;
            }
        }, {
            name: "greaterThan",
            logic: (target: number, searchVal: number) => {
                return target > searchVal;
            }
        }, {
            name: "lessThan",
            logic: (target: number, searchVal: number) => {
                return target < searchVal;
            }
        }, {
            name: "greaterThanOrEqualTo",
            logic: (target: number, searchVal: number) => {
                return target >= searchVal;
            }
        }, {
            name: "lessThanOrEqualTo",
            logic: (target: number, searchVal: number) => {
                return target <= searchVal;
            }
        }].concat(this.operations);
    }
}

/**
 * Provides filtering operations for strings
 *
 * @export
 * @class IgxStringFilteringOperand
 * @extends {IgxFilteringOperand}
 */
export class IgxStringFilteringOperand extends IgxFilteringOperand {
    protected constructor() {
        super();
        this.operations = [{
            name: "contains",
            logic: (target: string, searchVal: string, ignoreCase?: boolean) =>{
                const search = IgxStringFilteringOperand.applyIgnoreCase(searchVal, ignoreCase);
                target = IgxStringFilteringOperand.applyIgnoreCase(target, ignoreCase);
                return target.indexOf(search) !== -1;
            }
        }, {
            name: "doesNotContain",
            logic: (target: string, searchVal: string, ignoreCase?: boolean) => {
                const search = IgxStringFilteringOperand.applyIgnoreCase(searchVal, ignoreCase);
                target = IgxStringFilteringOperand.applyIgnoreCase(target, ignoreCase);
                return target.indexOf(search) === -1;
            }
        }, {
            name: "startsWith",
            logic: (target: string, searchVal: string, ignoreCase?: boolean) => {
                const search = IgxStringFilteringOperand.applyIgnoreCase(searchVal, ignoreCase);
                target = IgxStringFilteringOperand.applyIgnoreCase(target, ignoreCase);
                return target.startsWith(search);
            }
        }, {
            name: "endsWith",
            logic: (target: string, searchVal: string, ignoreCase?: boolean) => {
                const search = IgxStringFilteringOperand.applyIgnoreCase(searchVal, ignoreCase);
                target = IgxStringFilteringOperand.applyIgnoreCase(target, ignoreCase);
                return target.endsWith(search);
            }
        }, {
            name: "equals",
            logic: (target: string, searchVal: string, ignoreCase?: boolean) => {
                const search = IgxStringFilteringOperand.applyIgnoreCase(searchVal, ignoreCase);
                target = IgxStringFilteringOperand.applyIgnoreCase(target, ignoreCase);
                return target === search;
            }
        }, {
            name: "doesNotEqual",
            logic: (target: string, searchVal: string, ignoreCase?: boolean) => {
                const search = IgxStringFilteringOperand.applyIgnoreCase(searchVal, ignoreCase);
                target = IgxStringFilteringOperand.applyIgnoreCase(target, ignoreCase);
                return target !== search;
            }
        }].concat(this.operations);
    }

    /**
     * Applies case sensitivity on strings if provided
     * @param {string} a
     * @param {boolean} ignoreCase
     * @returns {string}
     * @memberof IgxStringFilteringOperand
     */
    public static applyIgnoreCase(a: string, ignoreCase: boolean): string {
        a = a || "";
        // bulletproof
        return ignoreCase ? ("" + a).toLowerCase() : a;
    }
}

/**
 * Interface describing filtering operations
 *
 * @export
 * @interface IFilteringOperation
 */
export interface IFilteringOperation {
    name: string;
    logic: (value: any, searchVal?: any, ignoreCase?: boolean) => boolean;
}

/**
 * Interface describing Date object in parts
 *
 * @export
 * @interface IDateParts
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
