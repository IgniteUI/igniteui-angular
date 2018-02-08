import { FilteringCondition } from "../../src/data-operations/filtering-condition";
import { FilteringLogic, IFilteringExpression } from "../../src/data-operations/filtering-expression.interface";
import { IFilteringState } from "../../src/data-operations/filtering-state.interface";
import { FilteringStrategy, IFilteringStrategy } from "../../src/data-operations/filtering-strategy";
import { SortingStrategy } from "../../src/data-operations/sorting-strategy";
import { StableSortingStrategy } from "../../src/data-operations/stable-sorting-strategy";

const KEY_JOB_TITLE =  "JobTitle";

export class CustomJobTitleSortingStrategy extends SortingStrategy {
    public jobTitles = {
        associateSoftwareDev : { name : "Associate Software Developer", weight : 8},
        ceo : { name: "CEO", weight: 1 },
        director: { name: "Director", weight: 3 },
        manager : { name: "Manager", weight: 4 },
        seniorSoftDev : { name: "Senior Software Developer", weight: 6 },
        softwareDevTeamLead : { name: "Software Development Team Lead", weight: 5 },
        softwareDeveloper : { name : "Software Developer", weight: 7 },
        vicePresident : { name: "Vice President", weight: 2 }
    };

    protected compareObjects(obj1: object, obj2: object, key: string, reverse: number, ignoreCase: boolean): number {
        let res;
        if (key === KEY_JOB_TITLE) {
            res = reverse * this.compareValues(this.getJobTitleWeight(obj1[key]),
                                            this.getJobTitleWeight(obj2[key]));
        } else {
            res = super.compareObjects.apply(this, arguments);
        }
        const replacerFn = (replaceKey, val) => {
            if (val === undefined) {
                return null;
            }
            return val;
        };
        if (!res) {
            return JSON.stringify(obj1, replacerFn)
                .localeCompare(JSON.stringify(obj2, replacerFn));
        }
        return res;
    }
    private getJobTitleWeight(value): number {
        let weight = 0;

        switch (value) {
            case this.jobTitles.ceo.name:
                weight = this.jobTitles.ceo.weight;
                break;
            case this.jobTitles.vicePresident.name:
                weight = this.jobTitles.vicePresident.weight;
                break;
            case this.jobTitles.director.name:
                weight = this.jobTitles.director.weight;
                break;
            case this.jobTitles.manager.name:
                weight = this.jobTitles.manager.weight;
                break;
            case this.jobTitles.softwareDevTeamLead.name:
                weight = this.jobTitles.softwareDevTeamLead.weight;
                break;
            case this.jobTitles.seniorSoftDev.name:
                weight = this.jobTitles.seniorSoftDev.weight;
                break;
            case this.jobTitles.softwareDeveloper.name:
                weight = this.jobTitles.softwareDeveloper.weight;
                break;
            case this.jobTitles.associateSoftwareDev.name:
                weight = this.jobTitles.associateSoftwareDev.weight;
                break;
            default:
                break;
        }
        return weight;
    }

}

export class CustomDateRangeFilteringStrategy implements IFilteringStrategy {
    public filter<T>(data: T[],
                     expressions: IFilteringExpression[],
                     logic?: FilteringLogic): T[] {
        let i;
        let rec;
        const len = data.length;
        const res: T[] = [];
        if (!expressions || !expressions.length || !len) {
            return data;
        }
        for (i = 0; i < len; i++) {
            rec = data[i];
            if (this.matchRecordByExpressions(rec, expressions, i, logic)) {
                res.push(rec);
            }
        }
        return res;
    }
    public findMatch(rec: object, expr: IFilteringExpression, index: number): boolean {
        const cond = expr.condition;
        const val = rec[expr.fieldName];
        let searchVal = "";

        try {
            searchVal = JSON.parse(expr.searchVal);
        } catch (e) {
            searchVal = expr.searchVal;
        }

        if (typeof(searchVal) === "object" && Object.keys(searchVal).length === 2) {
            return (new Date(val) > new Date(searchVal[Object.keys(searchVal)[0]])) &&
                (new Date(val) < new Date(searchVal[Object.keys(searchVal)[1]]));
        } else {
            return cond(new Date(val), new Date(searchVal));
        }
    }
    public matchRecordByExpressions(rec: object,
                                    expressions: IFilteringExpression[],
                                    index: number,
                                    logic?: FilteringLogic): boolean {
        let i;
        let match = false;
        const and = (logic === FilteringLogic.And);
        const len = expressions.length;
        for (i = 0; i < len; i++) {
            match = this.findMatch(rec, expressions[i], i);
            if (and) {
                if (!match) {
                    return false;
                }
            } else {
                if (match) {
                    return true;
                }
            }
        }
        return match;
    }
}

export class CustomStrategyData {
    public data = [
        { ID: 1, Name: "Casey Houston", JobTitle: "Vice President", HireDate: "2017-06-19T11:43:07.714Z" },
        { ID: 2, Name: "Gilberto Todd", JobTitle: "Director", HireDate: "2015-12-18T11:23:17.714Z" },
        { ID: 3, Name: "Tanya Bennett", JobTitle: "Director", HireDate: "2005-11-18T11:23:17.714Z" },
        { ID: 4, Name: "Jack Simon", JobTitle: "Software Developer", HireDate: "2008-12-18T11:23:17.714Z" },
        { ID: 5, Name: "Celia Martinez", JobTitle: "Senior Software Developer", HireDate: "2007-12-19T11:23:17.714Z" },
        { ID: 6, Name: "Erma Walsh", JobTitle: "CEO", HireDate: "2016-12-18T11:23:17.714Z" },
        { ID: 7, Name: "Debra Morton", JobTitle: "Associate Software Developer", HireDate: "2005-11-19T11:23:17.714Z" },
        // tslint:disable-next-line:object-literal-sort-keys
        { ID: 8, Name: "Erika Wells", JobTitle: "Software Development Team Lead",
          HireDate: "2005-10-14T11:23:17.714Z" },
        // tslint:disable-next-line:object-literal-sort-keys
        { ID: 9, Name: "Leslie Hansen", JobTitle: "Associate Software Developer",
          HireDate: "2013-10-10T11:23:17.714Z" },
        { ID: 10, Name: "Eduardo Ramirez", JobTitle: "Manager", HireDate: "2011-11-28T11:23:17.714Z" }
    ];
}
