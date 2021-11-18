import { cloneValue } from '../../core/utils';
import { IPivotConfiguration, IPivotDimension, IPivotKeys, IPivotValue, PivotDimensionType } from './pivot-grid.interface';

export class PivotUtil {
    public static getFieldsHierarchy(data: any[], dimensions: IPivotDimension[],
        dimensionType: PivotDimensionType, pivotKeys: IPivotKeys): Map<string, any> {
        const hierarchy = new Map<string, any>();
        for (const rec of data) {
            const vals = dimensionType === PivotDimensionType.Column ?
                this.extractValuesForColumn(dimensions, rec) :
                this.extractValuesForRow(dimensions, rec, pivotKeys);
            for (const [key, val] of vals) { // this should go in depth also vals.children
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
        return dim.memberFunction ? dim.memberFunction.call(null, recData) : recData[dim.memberName];
    }

    public static getDimensionDepth(dim: IPivotDimension): number {
        let lvl = 0;
        while (dim.childLevel) {
            lvl++;
            dim = dim.childLevel;
        }
        return lvl;
    }

    public static getDimensionLevel(dim: IPivotDimension, rec: any, pivotKeys: IPivotKeys) {
        let level = rec[dim.memberName + '_' + pivotKeys.level];
        while (dim.childLevel && level === undefined) {
            dim = dim.childLevel;
            level = rec[dim.memberName + '_' + pivotKeys.level];
        }
        return { level, dimension: dim };
    }

    public static flattenHierarchy(records: any[],
        config: IPivotConfiguration,
        dim: IPivotDimension,
        expansionStates: any,
        pivotKeys: IPivotKeys,
        lvl: number,
        prevDims: IPivotDimension[],
        currDimLvl: number) {
        const data = records;
        const defaultExpandState = true;
        for (let i = 0; i < data.length; i++) {
            const rec = data[i];
            const field = dim.memberName;
            if (!field) {
                continue;
            }
            rec[field + '_' + pivotKeys.level] = currDimLvl;
            const expansionRowKey = PivotUtil.getRecordKey(rec, dim, prevDims);
            const isExpanded = expansionStates.get(expansionRowKey) === undefined ?
                defaultExpandState :
                expansionStates.get(expansionRowKey);
            if (rec[field + '_' + pivotKeys.records] &&
                rec[field + '_' + pivotKeys.records].length > 0 &&
                isExpanded && lvl > 0) {
                let dimData = rec[field + '_' + pivotKeys.records];
                if (dim.childLevel) {
                    if (PivotUtil.getDimensionDepth(dim) > 1) {
                        dimData = this.flattenHierarchy(dimData, config, dim.childLevel,
                            expansionStates, pivotKeys, lvl - 1, prevDims, currDimLvl + 1);
                    } else {
                        dimData.forEach(d => {
                            d[dim.childLevel.memberName + '_' + pivotKeys.level] = currDimLvl + 1;
                        });
                    }
                }

                let prevDimRecs = [];
                const dimLevel = rec[field + '_' + pivotKeys.level];
                let prevDimLevel;
                let shouldConcat = true;
                const prevDim = prevDims ? prevDims[prevDims.length - 1] : null;
                if (prevDim) {
                    let prevDimName = prevDim.memberName;
                    prevDimRecs = rec[prevDimName + '_' + pivotKeys.records];
                    if (!prevDimRecs) {
                        prevDimName = prevDim.childLevel.memberName;
                        prevDimRecs = rec[prevDimName + '_' + pivotKeys.records];
                    }
                    prevDimLevel = rec[prevDimName + '_' + pivotKeys.level];
                    shouldConcat = !!rec[field] && (prevDimLevel === undefined || prevDimLevel >= dimLevel);
                }
                dimData.forEach(d => {
                    if (prevDims && prevDims.length > 0) {
                        if (!shouldConcat) {
                            d[dim.memberName + '_' + pivotKeys.level] = currDimLvl;
                        }
                        prevDims.forEach(prev => {
                            const dimInfo = PivotUtil.getDimensionLevel(prev, rec, pivotKeys);
                            d[dimInfo.dimension.memberName + '_' + pivotKeys.level] = dimInfo.level;
                        });
                    }
                });
                if (shouldConcat) {
                    // concat
                    data.splice(i + 1, 0, ...dimData);
                    i += dimData.length;
                } else {
                    // merge
                    data.splice(i, 1, ...dimData);
                    i += dimData.length - 1;
                }
            }
        }
        return data;
    }

    public static extractValuesForRow(dims: IPivotDimension[], recData: any, pivotKeys: IPivotKeys) {
        const values = new Map<string, any>();
        for (const col of dims) {
            if (recData[pivotKeys.level] && recData[pivotKeys.level] > 0) {
                const childData = recData[pivotKeys.records];
                return this.getFieldsHierarchy(childData, [col], PivotDimensionType.Row, pivotKeys);
            }

            const value = this.extractValueFromDimension(col, recData);
            const objValue = {};
            objValue['value'] = value;
            objValue['dimension'] = col;
            if (col.childLevel) {
                const childValues = this.extractValuesForRow([col.childLevel], recData, pivotKeys);
                objValue[pivotKeys.children] = childValues;
            }
            values.set(value, objValue);
        }

        return values;
    }

    public static extractValuesForColumn(dims: IPivotDimension[], recData: any, path = []) {
        const vals = new Map<string, any>();
        let lvlCollection = vals;
        const flattenedDims = this.flatten(dims);
        for (const col of flattenedDims) {
            const value = this.extractValueFromDimension(col, recData);
            path.push(value);
            const newValue = path.join('-');
            const newObj = { value: newValue, expandable: col.expandable, children: null, dimension: col };
            if (!newObj.children) {
                newObj.children = new Map<string, any>();
            }
            lvlCollection.set(newValue, newObj);
            lvlCollection = newObj.children;
        }
        return vals;
    }

    public static flatten(arr, lvl = 0) {
        const newArr = arr.reduce((acc, item) => {
            item.level = lvl;
            acc.push(item);
            if (item.childLevel) {
                item.expandable = true;
                acc = acc.concat(this.flatten([item.childLevel], lvl + 1));
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
            result[pivotValue.member] = pivotValue.aggregate(records.map(r => r[pivotValue.member]), records);
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
                });
            }
        }
    }

    public static processSubGroups(row, prevRowDims, siblingData, pivotKeys) {
        const prevRowDimsIter = prevRowDims.slice(0);
        // process combined groups
        while (prevRowDimsIter.length > 0) {
            const prevRowDim = prevRowDimsIter.pop();
            const prevRowField = prevRowDim.memberName;
            for (const sibling of siblingData) {
                const childCollection = sibling[prevRowField + '_' + pivotKeys.records] || [];
                for (const child of childCollection) {
                    if (!child[pivotKeys.records]) {
                        continue;
                    }
                    child[row.memberName + '_' + pivotKeys.records] = [];
                    const keys = Object.assign({}, pivotKeys) as any;
                    keys[row.memberName] = row.memberName;
                    const hierarchyFields2 = PivotUtil
                        .getFieldsHierarchy(child[pivotKeys.records], [row], PivotDimensionType.Row, pivotKeys);
                    const siblingData2 = PivotUtil
                        .processHierarchy(hierarchyFields2, child ?? [], keys, 0);
                        if (siblingData2.length === 1) {
                            child[row.memberName] = sibling[row.memberName];
                            // add children to current level if dimensions have same depth
                            for (const sib of siblingData2) {
                                if (sib[row.memberName + '_' + pivotKeys.records]) {
                                    child[row.memberName + '_' + pivotKeys.records] =
                                        child[row.memberName + '_' + pivotKeys.records]
                                        .concat(sib[row.memberName + '_' + pivotKeys.records]);
                                    child[row.memberName] = sib[row.memberName];
                                }
                            }
                        } else {
                            // otherwise overwrite direct child collection
                            child[row.memberName + '_' + pivotKeys.records] = siblingData2;
                        }
                    PivotUtil.processSiblingProperties(child, siblingData2, keys);
                }
                if (prevRowDim.childLevel) {
                    // Get child dimensions now as well since we go a level deeper into the hierarchy.
                    // Keep above level dims as well since lower level dims correspond to upper sibling dims as well.
                    const childDimensions = prevRowDims.filter(dim => !!dim.childLevel).map(dim => dim.childLevel);
                    this.processSubGroups(row, [...prevRowDims, ...childDimensions], childCollection, pivotKeys);
                }
            }
        }
    }

    public static processHierarchy(hierarchies, rec, pivotKeys, level = 0, rootData = false) {
        const flatData = [];
        hierarchies.forEach((h, key) => {
            const field = h.dimension.memberName;
            let obj = {};
            obj[field] = key;
            if (h[pivotKeys.records]) {
                obj[pivotKeys.records] = this.getDirectLeafs(h[pivotKeys.records], pivotKeys);
            }
            obj[field + '_' + pivotKeys.records] = h[pivotKeys.records];
            obj = { ...obj, ...h[pivotKeys.aggregations] };
            obj[pivotKeys.level] = level;
            flatData.push(obj);
            if (h[pivotKeys.children] && h[pivotKeys.children].size > 0) {
                const nestedData = this.processHierarchy(h[pivotKeys.children], rec,
                    pivotKeys, level + 1, rootData);
                obj[pivotKeys.records] = this.getDirectLeafs(nestedData, pivotKeys);
                obj[field + '_' + pivotKeys.records] = nestedData;
                if (!rootData) {
                    PivotUtil.processSiblingProperties(rec, obj[field + '_' + pivotKeys.records], pivotKeys);
                }
            }
        });

        return flatData;
    }

    public static getDirectLeafs(records, pivotKeys) {
        let leafs = [];
        for (const rec of records) {
            if (rec[pivotKeys.records]) {
                const data = rec[pivotKeys.records].filter(x => !x[pivotKeys.records] && leafs.indexOf(x) === -1);
                leafs = leafs.concat(data);
            } else {
                leafs.push(rec);
            }
        }
        return leafs;
    }

    public static getRecordKey(rec, currentDim: IPivotDimension, prevDims: IPivotDimension[]) {
        const parentFields = [];
        const field = currentDim.memberName;
        const value = rec[field];
        for(const prev of prevDims) {
            const dimData = PivotUtil.getDimensionLevel(prev, rec,
                { aggregations: 'aggregations', records: 'records', children: 'children', level: 'level'});
                parentFields.push(rec[dimData.dimension.memberName]);
        }
        parentFields.push(value);
        return parentFields.join('_');
    }

    public static getTotalLvl(rec) {
        let total = 0;
        Object.keys(rec).forEach(key => {
            if (key.indexOf('_level') !== -1 && key.indexOf('level_') === -1 && key.indexOf('records') === -1) {
                total += rec[key] || 0;
            }
        });
        return total;
    }

    public static flattenColumnHierarchy(hierarchies: any, values: IPivotValue[], pivotKeys: IPivotKeys) {
        const flatData = [];
        hierarchies.forEach((h, key) => {
            const obj = {};
            const multipleValues = values.length > 1;
            for (const value of values) {
                if (h[pivotKeys.aggregations]) {
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
        if (!childCollection || childCollection.size === 0) {
            const dim = hierarchy.get(val.value).dimension;
            const isValid = this.extractValueFromDimension(dim, rec) === val.value;
            if (isValid) {
                if (hierarchy.get(val.value)[recordsKey]) {
                    hierarchy.get(val.value)[recordsKey].push(rec);
                } else {
                    hierarchy.get(val.value)[recordsKey] = [rec];
                }
            }
        } else {
            for (const [key, child] of childCollection) {
                if (!hierarchy.get(val.value).children.get(child.value)) {
                    hierarchy.get(val.value).children.set(child.value, child);
                }

                if (hierarchy.get(val.value).children.get(child.value)[recordsKey]) {
                    const copy = Object.assign({}, rec);
                    if (rec[recordsKey]) {
                        // not all nested children are valid
                        const nestedValue = hierarchy.get(val.value).children.get(child.value).value;
                        const dimension = hierarchy.get(val.value).children.get(child.value).dimension;
                        const validRecs = rec[recordsKey].filter(x => this.extractValueFromDimension(dimension, x) === nestedValue);
                        copy[recordsKey] = validRecs;
                    }
                    hierarchy.get(val.value).children.get(child.value)[recordsKey].push(copy);
                } else {
                    hierarchy.get(val.value).children.get(child.value)[recordsKey] = [rec];
                }

                if (child.children && child.children.size > 0) {
                    this.applyHierarchyChildren(hierarchy.get(val.value).children, child, rec, recordsKey);
                }
            }
        }
    }
}
