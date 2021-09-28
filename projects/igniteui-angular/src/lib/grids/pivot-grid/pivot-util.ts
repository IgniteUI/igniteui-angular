
import { cloneValue } from '../../core/utils';
import { IPivotDimension, IPivotKeys, IPivotValue } from './pivot-grid.interface';

export class PivotUtil {
    public static getFieldsHierarchy(data: any[], columns: IPivotDimension[], pivotKeys: IPivotKeys): Map<string, any> {
        const hierarchy = new Map<string, any>();
        for (const rec of data) {
            const vals = this.extractValuesFromDimension(columns, rec);
            for (const val of vals) { // this should go in depth also vals.children
                if (hierarchy.get(val.value) != null && val.children) {
                    this.applyHierarchyChildren(hierarchy, val, rec, pivotKeys.records);
                } else {
                    hierarchy.set(val.value, cloneValue(val));
                    hierarchy.get(val.value).children = new Map<string, any>();
                    this.applyHierarchyChildren(hierarchy, val, rec, pivotKeys.records);
                }
            }
        }
        return hierarchy;
    }

    public static extractValueFromDimension(dim: IPivotDimension, recData: any) {
        return typeof dim.member === 'string' ? recData[dim.member] : dim.member.call(null, recData);
    }

    public static extractValuesFromDimension(dims: IPivotDimension[], recData: any){
        const vals = [];
        let i = 0;
        for (const col of dims) {
            const value = this.extractValueFromDimension(col, recData);
            vals.push({ value });
            if (col.childLevels != null && col.childLevels.length > 0) {
                const childValues = this.extractValuesFromDimension(col.childLevels, recData);
                vals[i].children = childValues;
            }
            i++;
        }
        return vals;
    }

    public static applyAggregations(hierarchies, values, pivotKeys) {
        hierarchies.forEach((hierarchy) => {
            const children = hierarchy[pivotKeys.children];
            if (children) {
                this.applyAggregations(children, values, pivotKeys);
                const childrenAggregations = this.collectAggregations(children, pivotKeys);
                hierarchy[pivotKeys.aggregations] = this.aggregate(childrenAggregations, values);
            } else if (hierarchy[pivotKeys.records]) {
                hierarchy[pivotKeys.aggregations] = this.aggregate(hierarchy[pivotKeys.records], values);
            }
        });
    }

    public static aggregate(records, values: IPivotValue[]) {
        const result = {};
        for (const pivotValue of values) {
            result[pivotValue.member] = pivotValue.aggregate(records.map(r => r[pivotValue.member]));
        }

        return result;
    }

    public static flattenHierarchy(hierarchies, rec, dims, pivotKeys, level = 0) {
        let flatData = [];
        for (const dim of dims) {
            hierarchies.forEach((h, key) => {
                const field = (dim && dim.fieldName) ?? this.generateFieldValue(rec);
                let obj = {};
                obj[field] = key;
                obj[pivotKeys.records] = h[pivotKeys.records];
                obj = {...obj, ...h[pivotKeys.aggregations]};
                obj[pivotKeys.level] = level;
                flatData.push(obj);
                if (h[pivotKeys.children]) {
                    obj[pivotKeys.records] = this.flattenHierarchy(h[pivotKeys.children], rec, dim.childLevels, pivotKeys, level + 1);
                    flatData = [...flatData, ...obj[pivotKeys.records]];
                }
            });
        }

        return flatData;
    }

    public static flattenColumnHierarchy(hierarchies, values, pivotKeys) {
        let flatData = [];
        hierarchies.forEach((h, key) => {
            const obj = {};
            for (const value of values) {
                obj[key] = h[pivotKeys.aggregations][value.member];
                obj[pivotKeys.records] = h[pivotKeys.records];
                flatData.push(obj);
                if (h[pivotKeys.children]) {
                    flatData = [...flatData, ...this.flattenColumnHierarchy(h[pivotKeys.children], values, pivotKeys)];
                }
            }
        });

        return flatData;
    }

    private static generateFieldValue(rec) {
        let i = 0;
        while (Object.keys(rec).indexOf('field' + ++i) !== -1) {}
        return 'field' + i;
    }

    private static collectAggregations(children, pivotKeys) {
        const result = [];
        children.forEach(value => result.push(value[pivotKeys.aggregations]));

        return result;
    }

    private static applyHierarchyChildren(hierarchy, val, rec, recordsKey) {
        for (const child of val.children) {
            if (!hierarchy.get(val.value).children.get(child.value)) {
                hierarchy.get(val.value).children.set(child.value, child);
            }

            if (hierarchy.get(val.value).children.get(child.value)[recordsKey]) {
                hierarchy.get(val.value).children.get(child.value)[recordsKey].push(rec);
            } else {
                hierarchy.get(val.value).children.get(child.value)[recordsKey] = [rec];
            }
        }
    }
}
