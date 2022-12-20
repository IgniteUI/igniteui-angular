import { IGridResourceStrings } from '../../core/i18n/grid-resources';
import { CurrentResourceStrings } from '../../core/i18n/resources';
import { GridColumnDataType } from '../../data-operations/data-util';
import { IPivotDimension } from './pivot-grid.interface';
import { PivotUtil } from './pivot-util';

export interface IPivotDateDimensionOptions {
    /** Enables/Disables total value of all periods. */
    total?: boolean;
    /** Enables/Disables dimensions per year from provided periods. */
    years?: boolean;
    /*/** Enables/Disables dimensions per quarter from provided periods. */
    quarters?: boolean;
    /** Enables/Disables dimensions per month from provided periods. */
    months?: boolean;
    /** Enabled/Disables dimensions for the full date provided */
    fullDate?: boolean;
}

// Equals to pretty much this configuration:
// {
//     member: () => 'All Periods',
//     enabled: true,
//     fieldName: 'AllPeriods',
//     childLevel: {
//         fieldName: 'Years',
//         member: (rec) => {
//             const recordValue = rec['Date'];
//             return recordValue ? (new Date(recordValue)).getFullYear().toString() : rec['Years'];
//         },
//         enabled: true,
//         childLevel: {
//                 member: (rec) => {
//                     const recordValue = rec['Date'];
//                     return recordValue ? new Date(recordValue).toLocaleString('default', { month: 'long' }) : rec['Months'];
//                 },
//                 enabled: true,
//                 fieldName: 'Months',
//                 childLevel: {
//                         member: 'Date',
//                         fieldName:'Date',
//                         enabled: true
//                     }
//             }
//     }
// },
export class IgxPivotDateDimension implements IPivotDimension {
    /** Enables/Disables a particular dimension from pivot structure. */
    public enabled = true;

    /**
     * Gets/Sets data type
     */
    public dataType?: GridColumnDataType;

    /** Default options used for initialization. */
    public defaultOptions = {
        total: true,
        years: true,
        months: true,
        fullDate: true
    };

    /**
     * Gets/Sets the resource strings.
     *
     * @remarks
     * By default it uses EN resources.
     */
    public set resourceStrings(value: IGridResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    public get resourceStrings(): IGridResourceStrings {
        return this._resourceStrings;
    }

    /** @hidden @internal */
    public childLevel?: IPivotDimension;
    /** @hidden @internal */
    public memberName = 'AllPeriods';
    private _resourceStrings = CurrentResourceStrings.GridResStrings;
    private _monthIntl = new Intl.DateTimeFormat('default', { month: 'long' });

    /**
     * Creates additional pivot date dimensions based on a provided dimension describing date data:
     *
     * @param inDateDimension Base dimension that is used by this class to determine the other dimensions and their values.
     * @param inOptions Options for the predefined date dimensions whether to show quarter, years and etc.
     * @example
     * ```typescript
     * // Displays only years as parent dimension to the base dimension provided.
     * new IgxPivotDateDimension({ memberName: 'Date', enabled: true }, { total: false, months: false });
     * ```
     */
    constructor(public inBaseDimension: IPivotDimension, public inOptions: IPivotDateDimensionOptions = {}) {
        const options = { ...this.defaultOptions, ...inOptions };

        if (!inBaseDimension) {
            console.warn(`Please provide data child level to the pivot dimension.`);
            return;
        }

        this.dataType = GridColumnDataType.Date;
        inBaseDimension.dataType = GridColumnDataType.Date;

        const baseDimension = options.fullDate ? inBaseDimension : null;
        const monthDimensionDef: IPivotDimension = {
            memberName: 'Months',
            memberFunction: (rec) => {
                const recordValue = PivotUtil.extractValueFromDimension(inBaseDimension, rec);
                return recordValue ? this._monthIntl.format(new Date(recordValue)) : rec['Months'];
            },
            enabled: true,
            childLevel: baseDimension
        };
        const monthDimension = options.months ? monthDimensionDef : baseDimension;

        const quarterDimensionDef: IPivotDimension = {
            memberName: 'Quarters',
            memberFunction: (rec) => {
                const recordValue = PivotUtil.extractValueFromDimension(inBaseDimension, rec);
                return recordValue ? `Q` + Math.ceil((new Date(recordValue).getMonth() + 1) / 3) : rec['Quarters'];
            },
            enabled: true,
            childLevel: monthDimension
        };
        const quarterDimension = options.quarters ? quarterDimensionDef : monthDimension;

        const yearsDimensionDef: IPivotDimension = {
            memberName: 'Years',
            memberFunction: (rec) => {
                const recordValue = PivotUtil.extractValueFromDimension(inBaseDimension, rec);
                return recordValue ? (new Date(recordValue)).getFullYear().toString() : rec['Years'];
            },
            enabled: true,
            childLevel: quarterDimension
        };
        const yearsDimension = options.years ? yearsDimensionDef : quarterDimension;
        this.childLevel = yearsDimension;

        if (!options.total) {
            this.memberName = yearsDimension.memberName;
            this.memberFunction = yearsDimension.memberFunction;
            this.childLevel = yearsDimension.childLevel;
        }
    }

    /** @hidden @internal */
    public memberFunction = (_data) => this.resourceStrings.igx_grid_pivot_date_dimension_total;
}
