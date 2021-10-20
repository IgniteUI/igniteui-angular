
import { cloneValue } from '../../core/utils';
import { IPivotDimension, IPivotKeys, IPivotValue, PivotDimensionType } from './pivot-grid.interface';

export class PivotUtil {
    public static getFieldsHierarchy(data: any[], dimensions: IPivotDimension[],
        dimensionType: PivotDimensionType, pivotKeys: IPivotKeys): Map<string, any> {
        const hierarchy = new Map<string, any>();
        for (const rec of data) {
            const vals = dimensionType === PivotDimensionType.Column ?
                this.extractValuesForColumn(dimensions, rec) :
                this.extractValuesForRow(dimensions, rec, pivotKeys);
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

    public static extractValuesForRow(dims: IPivotDimension[], recData: any,  pivotKeys: IPivotKeys) {
        const values: any[] = [];
        let i = 0;
        for (const col of dims) {
            const value = this.extractValueFromDimension(col, recData);
            const objValue = {};
            objValue['value'] = value;
            objValue['dimension'] = col;
            values.push(objValue);
            if (col.childLevels != null && col.childLevels.length > 0) {
                const childValues = this.extractValuesForRow(col.childLevels, recData, pivotKeys);
                values[i].children = childValues;
            }
            if (recData.level && recData.level > 0) {
                const childData = recData.records;
                const res =  this.getFieldsHierarchy(childData, [col], PivotDimensionType.Row, pivotKeys);
                const arrRes = Array.from(res.values());
                arrRes.forEach(arr => {
                    if (arr.children) {
                        arr.children =  Array.from(arr.children.values());
                    }
                });
                return Array.from(arrRes);
            }
            i++;
        }
        return values;
    }

    public static extractValuesForColumn(dims: IPivotDimension[], recData: any, path = []) {
        const vals = [];
        let lvlCollection = vals;
        const flattenedDims = this.flatten(dims);
        for (const col of flattenedDims) {
            const value = this.extractValueFromDimension(col, recData);
            path.push(value);
            const newValue = path.join('-');
            lvlCollection.push({ value: newValue });
            lvlCollection[0].expandable = col.expandable;
            if (!lvlCollection[0].children) {
                lvlCollection[0].children = [];
            }
            lvlCollection = lvlCollection[0].children;
        }
        return vals;
    }

    public static flatten(arr, lvl = 0) {
        const newArr = arr.reduce((acc, item) => {
            item.level = lvl;
            acc.push(item);
          if (Array.isArray(item.childLevels) && item.childLevels.length > 0) {
            item.expandable = true;
            acc = acc.concat(this.flatten(item.childLevels, lvl + 1));
          }
          return acc;
        }, []);
        return newArr;
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

    public static processSiblingProperties(parentRec, siblingData, pivotKeys) {
        if (!siblingData) {
            return;
        }
        for (const property in parentRec) {
            if (parentRec.hasOwnProperty(property) &&
                Object.keys(pivotKeys).indexOf(property) === -1) {
                siblingData.forEach(s => {
                    s[property] = parentRec[property];
                    if (property.indexOf(pivotKeys.level) === -1) {
                        s[property + '_'  + pivotKeys.level] = s[pivotKeys.level];
                    }
                });
            }
        }
    }

    public static processHierarchy(hierarchies, rec, pivotKeys, level = 0, rootData = false) {
        const flatData = [];
        hierarchies.forEach((h, key) => {
            const field = this.resolveFieldName(h.dimension, rec);
            let obj = {};
            obj[field] = key;
            obj[pivotKeys.records] = h[pivotKeys.records];
            obj = { ...obj, ...h[pivotKeys.aggregations] };
            obj[pivotKeys.level] = level;
            obj[field + '_' + pivotKeys.level] = level;
            flatData.push(obj);
            if (h[pivotKeys.children] && h[pivotKeys.children].size > 0) {
                obj[pivotKeys.records] = this.processHierarchy(h[pivotKeys.children], rec,
                        pivotKeys, level + 1);
                obj[field + '_' + pivotKeys.records] = obj[pivotKeys.records];
                if (!rootData) {
                    PivotUtil.processSiblingProperties(rec, obj[pivotKeys.records], pivotKeys);
                }
            }
        });

        return flatData;
    }

    public static getRecordKey(rec, key) {
        const pivotKeys =  { aggregations: 'aggregations', records: 'records', children: 'children', level: 'level'};
        const parentFields = [];
        for (const property in rec) {
            if (rec.hasOwnProperty(property) &&
             Object.keys(pivotKeys).indexOf(property) === -1
             && Object.keys(pivotKeys).filter(x => property.indexOf(x) !== -1).length === 0) {
                 const currLevel = rec[property + '_level'];
                 if (currLevel > 0) {
                    parentFields.unshift(rec[property]);
                 }
            }
        }
        return parentFields.concat(key).join('_');
    }

    public static getTotalLvl(rec) {
        let total = 0;
        Object.keys(rec).forEach(key => {
            if (key.indexOf('_level') !== -1 && key.indexOf('level_') === -1) {
                total += rec[key] || 0;
            }
        });
        return total;
    }

    public static flattenColumnHierarchy(hierarchies, values, pivotKeys) {
        const flatData = [];
        hierarchies.forEach((h, key) => {
            const obj = {};
            const multipleValues = values.length > 1;
            for (const value of values) {
                if(h[pivotKeys.aggregations]) {
                    if (multipleValues) {
                        obj[key + '-' + value.member] = h[pivotKeys.aggregations][value.member];
                    } else {
                        obj[key] = h[pivotKeys.aggregations][value.member];
                    }
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

    public static resolveFieldName(dimension, record) {
         if (typeof dimension.member === 'string') {
            return dimension.member;
         } else {
            const fieldName = (dimension && dimension.fieldName) ?? this.generateFieldValue(record);
            dimension.fieldName = fieldName;
            return fieldName;
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
                    const copy = Object.assign({}, rec);
                    if(rec[recordsKey]) {
                        // not all nested children are valid
                        const nestedValue =  hierarchy.get(val.value).children.get(child.value).value;
                        const member = hierarchy.get(val.value).children.get(child.value).dimension.member;
                        const validRecs = rec[recordsKey].filter(x => x[member] === nestedValue);
                        copy[recordsKey] = validRecs;
                    }
                    hierarchy.get(val.value).children.get(child.value)[recordsKey].push(copy);
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
