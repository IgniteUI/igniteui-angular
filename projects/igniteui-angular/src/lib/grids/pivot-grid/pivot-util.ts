
import { cloneValue } from '../../core/utils';
import { IPivotDimension, IPivotKeys, IPivotValue } from './pivot-grid.interface';

export class PivotUtil {
    public static getFieldsHierarchy(data: any[], columns: IPivotDimension[], pivotKeys: IPivotKeys): Map<string, any> {
        const hierarchy = new Map<string, any>();
        for (const rec of data) {
            const vals = this.extractValuesFromDimension(columns, rec);
            for (const val of vals) { // this should go in depth also vals.children
                if (hierarchy.get(val.value) != null) {
                    this.applyHierarchyChildren(hierarchy, val, rec, pivotKeys.records);
                } else {
                    hierarchy.set(val.value, cloneValue(val));
                    this.applyHierarchyChildren(hierarchy, val, rec, pivotKeys.records);
                }
            }
        }
        return hierarchy;
    }

    public static extractValueFromDimension(dim: IPivotDimension, recData: any) {
        return typeof dim.member === 'string' ? recData[dim.member] : dim.member.call(null, recData);
    }

    public static extractValuesFromDimension(dims: IPivotDimension[], recData: any, path = []) {
        const vals = [];
        let lvl = 0;
        let lvlCollection = vals;
        for (const col of dims) {
            const value = this.extractValueFromDimension(col, recData);
            path.push(value);
            const newValue = path.join('-');
            lvlCollection.push({ value: newValue });
            if (col.childLevels != null && col.childLevels.length > 0) {
                const childValues = this.extractValuesFromDimension(col.childLevels, recData, path);
                vals[lvl].children = childValues;
                vals[lvl].expandable = true;
            }
            lvl++;
            if(!lvlCollection[0].children) {
                lvlCollection[0].children = [];
            }
            lvlCollection = lvlCollection[0].children;
        }
        return vals;
    }

    public static applyAggregations(hierarchies, values, pivotKeys) {
        hierarchies.forEach((hierarchy) => {
            const children = hierarchy[pivotKeys.children];
            if (children && children.size > 0) {
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
        const flatData = [];
        for (const dim of dims) {
            hierarchies.forEach((h, key) => {
                const field = this.resolveFieldName(dim, rec);
                let obj = {};
                obj[field] = key;
                obj[pivotKeys.records] = h[pivotKeys.records];
                obj = { ...obj, ...h[pivotKeys.aggregations] };
                obj[pivotKeys.level] = level;
                flatData.push(obj);
                if (h[pivotKeys.children] && h[pivotKeys.children].size > 0) {
                    obj[pivotKeys.records] = this.flattenHierarchy(h[pivotKeys.children], rec, dim.childLevels, pivotKeys, level + 1);
                    for (const record of obj[pivotKeys.records]) {
                        flatData.push(record);
                    }
                }
            });
        }

        return flatData;
    }

    public static flattenColumnHierarchy(hierarchies, values, pivotKeys) {
        const flatData = [];
        hierarchies.forEach((h, key) => {
            const obj = {};
            for (const value of values) {
                if(h[pivotKeys.aggregations]) {
                    obj[key] = h[pivotKeys.aggregations][value.member];
                }
                obj[pivotKeys.records] = h[pivotKeys.records];
                flatData.push(obj);
                if (h[pivotKeys.children]) {
                    const records = this.flattenColumnHierarchy(h[pivotKeys.children], values, pivotKeys);
                    for (const record of records) {
                        delete record[pivotKeys.records];
                        const childKeys = Object.keys(record);
                        for (const childKey of childKeys) {
                            obj[childKey] = record[childKey];
                        }
                    }
                }
            }
        });

        return flatData;
    }

    private static resolveFieldName(dimension, record) {
         if (typeof dimension.member === 'string') {
            return dimension.member;
         } else {
            return (dimension && dimension.fieldName) ?? this.generateFieldValue(record);
         }
    }

    private static generateFieldValue(rec) {
        let i = 0;
        while (Object.keys(rec).indexOf('field' + ++i) !== -1) { }
        return 'field' + i;
    }

    private static collectAggregations(children, pivotKeys) {
        const result = [];
        children.forEach(value => result.push(value[pivotKeys.aggregations]));

        return result;
    }

    private static applyHierarchyChildren(hierarchy, val, rec, recordsKey) {
        const childCollection = val.children;
        if (Array.isArray(hierarchy.get(val.value).children)) {
            hierarchy.get(val.value).children = new Map<string, any>();
        }
        if (!childCollection || childCollection.length === 0) {
            if (hierarchy.get(val.value)[recordsKey]) {
                hierarchy.get(val.value)[recordsKey].push(rec);
            } else {
                hierarchy.get(val.value)[recordsKey] = [rec];
            }
        } else {
            for (const child of childCollection) {
                if (!hierarchy.get(val.value).children.get(child.value)) {
                    hierarchy.get(val.value).children.set(child.value, child);
                }

                if (hierarchy.get(val.value).children.get(child.value)[recordsKey]) {
                    hierarchy.get(val.value).children.get(child.value)[recordsKey].push(rec);
                } else {
                    hierarchy.get(val.value).children.get(child.value)[recordsKey] = [rec];
                }

                if (child.children && child.children.length > 0) {
                    this.applyHierarchyChildren( hierarchy.get(val.value).children, child, rec, recordsKey);
                }
            }
        }
    }
}
