import { cloneValue } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { FilteringLogic } from '../../data-operations/filtering-expression.interface';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { ISortingExpression } from '../../data-operations/sorting-strategy';
import { IGridSortingStrategy, IgxSorting } from '../common/strategy';
import { IPivotConfiguration, IPivotDimension, IPivotGridRecord, IPivotKeys, IPivotValue, PivotDimensionType } from './pivot-grid.interface';

export class PivotUtil {
    public static assignLevels(dims) {
        for (const dim of dims) {
            let currDim = dim;
            let lvl = 0;
            while (currDim.childLevel) {
                currDim.level = lvl;
                currDim = currDim.childLevel;
                lvl++;
            }
            currDim.level = lvl;
        }
    }
    public static getFieldsHierarchy(data: any[], dimensions: IPivotDimension[],
        dimensionType: PivotDimensionType, pivotKeys: IPivotKeys): Map<string, any> {
        const hierarchy = new Map<string, any>();
        for (const rec of data) {
            const vals = dimensionType === PivotDimensionType.Column ?
                this.extractValuesForColumn(dimensions, rec, pivotKeys) :
                this.extractValuesForRow(dimensions, rec, pivotKeys);
            for (const [key, val] of vals) { // this should go in depth also vals.children
                if (hierarchy.get(val.value) != null) {
                    this.applyHierarchyChildren(hierarchy, val, rec, pivotKeys);
                } else {
                    hierarchy.set(val.value, cloneValue(val));
                    this.applyHierarchyChildren(hierarchy, val, rec, pivotKeys);
                }
            }
        }
        return hierarchy;
    }

    public static sort(data: any[], expressions: ISortingExpression[], sorting: IGridSortingStrategy = new IgxSorting(), pivotKeys): any[] {
        data.forEach(rec => {
            const keys = Object.keys(rec);
            rec.sorted = true;
            keys.forEach(k => {
                if (k.indexOf(pivotKeys.records) !== -1 && k !== pivotKeys.records) {
                    const unsorted = rec[k].filter(x => !x.sorted);
                    // sort all child record collections based on expression recursively.
                    rec[k] = this.sort(unsorted, expressions, sorting, pivotKeys);
                }
            });
        });
        return DataUtil.sort(data, expressions, sorting);
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
        let level = rec[dim.memberName + pivotKeys.rowDimensionSeparator + pivotKeys.level];
        while (dim.childLevel && level === undefined) {
            dim = dim.childLevel;
            level = rec[dim.memberName + pivotKeys.rowDimensionSeparator + pivotKeys.level];
        }
        return { level, dimension: dim };
    }

    public static flattenHierarchy(records: any[],
        config: IPivotConfiguration,
        dim: IPivotDimension,
        expansionStates: any,
        defaultExpandState: boolean,
        pivotKeys: IPivotKeys,
        lvl: number,
        prevDims: IPivotDimension[],
        currDimLvl: number,
        maxDimLvl: number) {
        const data = records;
        for (let i = 0; i < data.length; i++) {
            const rec = data[i];
            const field = dim.memberName;
            if (!field) {
                continue;
            }
            rec[field + pivotKeys.rowDimensionSeparator + pivotKeys.level] = currDimLvl;
            const expansionRowKey = PivotUtil.getRecordKey(rec, dim, prevDims, pivotKeys);
            const isExpanded = expansionStates.get(expansionRowKey) === undefined ?
                defaultExpandState :
                expansionStates.get(expansionRowKey);
            const recordsData = rec[field + pivotKeys.rowDimensionSeparator + pivotKeys.records];
            if (recordsData && recordsData.length > 0 &&
                ((isExpanded && lvl > 0) || (maxDimLvl == currDimLvl))) {
                let dimData = recordsData;
                if (dim.childLevel) {
                    if (PivotUtil.getDimensionDepth(dim) > 1) {
                        dimData = this.flattenHierarchy(dimData, config, dim.childLevel,
                            expansionStates, defaultExpandState, pivotKeys, lvl - 1, prevDims, currDimLvl + 1, maxDimLvl);
                    } else {
                        dimData.forEach(d => {
                            d[dim.childLevel.memberName + pivotKeys.rowDimensionSeparator + pivotKeys.level] = currDimLvl + 1;
                        });
                    }
                }

                let prevDimRecs = [];
                const dimLevel = rec[field + pivotKeys.rowDimensionSeparator + pivotKeys.level];
                let prevDimLevel;
                let shouldConcat = true;
                const prevDim = prevDims ? prevDims[prevDims.length - 1] : null;
                if (prevDim) {
                    let prevDimName = prevDim.memberName;
                    prevDimRecs = rec[prevDimName + pivotKeys.rowDimensionSeparator + pivotKeys.records];
                    if (!prevDimRecs) {
                        prevDimName = prevDim.childLevel.memberName;
                        prevDimRecs = rec[prevDimName + pivotKeys.rowDimensionSeparator + pivotKeys.records];
                    }
                    prevDimLevel = rec[prevDimName + pivotKeys.rowDimensionSeparator + pivotKeys.level];
                    shouldConcat = !!rec[field] && (prevDimLevel === undefined || prevDimLevel >= dimLevel);
                }
                dimData.forEach(d => {
                    if (prevDims && prevDims.length > 0) {
                        if (!shouldConcat) {
                            d[dim.memberName + pivotKeys.rowDimensionSeparator + pivotKeys.level] = currDimLvl;
                        }
                        prevDims.forEach(prev => {
                            const dimInfo = PivotUtil.getDimensionLevel(prev, rec, pivotKeys);
                            d[dimInfo.dimension.memberName + pivotKeys.rowDimensionSeparator + pivotKeys.level] = dimInfo.level;
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
            } else if (isExpanded) {
                // this is leaf
                let leafDim = dim;
                let currLvl = currDimLvl;
                while (leafDim.childLevel) {
                    leafDim = leafDim.childLevel;
                    currLvl++;
                }
                rec[leafDim.memberName + pivotKeys.rowDimensionSeparator + pivotKeys.level] = currLvl;
                if (leafDim.memberName !== field) {
                    delete rec[field + pivotKeys.rowDimensionSeparator + pivotKeys.level];
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

    public static extractValuesForColumn(dims: IPivotDimension[], recData: any, pivotKeys: IPivotKeys, path = []) {
        const vals = new Map<string, any>();
        let lvlCollection = vals;
        const flattenedDims = this.flatten(dims);
        for (const col of flattenedDims) {
            const value = this.extractValueFromDimension(col, recData);
            path.push(value);
            const newValue = path.join(pivotKeys.columnDimensionSeparator);
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
                const childRecords = this.collectRecords(children, pivotKeys);
                hierarchy[pivotKeys.aggregations] = this.aggregate(childRecords, values);
            } else if (hierarchy[pivotKeys.records]) {
                hierarchy[pivotKeys.aggregations] = this.aggregate(hierarchy[pivotKeys.records], values);
            }
        });
    }

    public static aggregate(records, values: IPivotValue[]) {
        const result = {};
        for (const pivotValue of values) {
            result[pivotValue.member] = pivotValue.aggregate.aggregator(records.map(r => r[pivotValue.member]), records);
        }

        return result;
    }

    public static resolveSiblingChildren(parentRec: IPivotGridRecord, siblingData: IPivotGridRecord[], pivotKeys: IPivotKeys) {
        if (!siblingData) {
            return;
        }

        siblingData.forEach(sib => {
            const parentDims = parentRec.dimensionValues;
            parentDims.forEach((key, value) => {
                sib.dimensionValues.set(value, key);
                const hierarchyFields = PivotUtil
                    .getFieldsHierarchy(sib.records, parentRec.dimensions, PivotDimensionType.Row, pivotKeys);
                const siblingData = PivotUtil
                    .processHierarchy(hierarchyFields, pivotKeys, 0);
                if (parentRec.dimensions[0].childLevel) {
                    sib.children.set(value, siblingData);
                }
                sib.dimensions = sib.dimensions.concat(parentRec.dimensions);
            });
        });
    }

    public static processSubGroups(row, prevRowDims, siblingData: IPivotGridRecord[], pivotKeys, lvl = 0) {
        const prevRowDimsIter = prevRowDims.slice(0);
        // process combined groups
        while (prevRowDimsIter.length > 0) {
            const prevRowDim = prevRowDimsIter.pop();
            const prevRowField = prevRowDim.memberName;
            for (const sibling of siblingData) {
                const childCollection = sibling.children.get(prevRowField);
                if (!childCollection) return;
                for (const child of childCollection) {
                    if (!child.records) {
                        continue;
                    }
                    const recordsAccessKey = row.memberName + pivotKeys.rowDimensionSeparator + pivotKeys.records;
                    const hierarchyFields2 = PivotUtil
                        .getFieldsHierarchy(child.records, [row], PivotDimensionType.Row, pivotKeys);
                    const siblingData2 = PivotUtil
                        .processHierarchy(hierarchyFields2, pivotKeys, 0);
                    if (siblingData2.length === 1) {
                        child.dimensionValues.set(row.memberName, sibling.dimensionValues.get(row.memberName));
                        // add children to current level if dimensions have same depth
                        for (const sib of siblingData2) {
                            const collection = child.children.get(row.memberName);
                            if (collection) {
                                const newCollection = child.children.get(row.memberName).concat(sib.children.get(row.memberName));
                                child.children.set(row.memberName, newCollection);
                            }
                            // if (sib[recordsAccessKey]) {
                            //     child[recordsAccessKey] = child[recordsAccessKey].concat(sib[recordsAccessKey]);
                            //     child[row.memberName] = sib[row.memberName];
                            // }
                        }
                    } else {
                        // otherwise overwrite direct child collection
                        child.children.set(row.memberName, siblingData2);
                    }
                    const sibs = prevRowDims.filter(x => x.memberName !== prevRowField);
                    if (sibs.length > 0) {
                        // Process sibling dimensions in depth
                        this.processSubGroups(row, [...sibs], [child], pivotKeys, lvl);
                    }
                    PivotUtil.resolveSiblingChildren(child, siblingData2, pivotKeys);
                }
                const prevRowDimsFromLvl = prevRowDims.filter(x => x.level === lvl);
                if (prevRowDimsFromLvl.some(x => x.childLevel)) {
                    // Get child dimensions now as well since we go a level deeper into the hierarchy.
                    // Keep above level dims as well since lower level dims correspond to upper sibling dims as well.
                    const childDimensions = prevRowDimsFromLvl.filter(dim => !!dim.childLevel).map(dim => dim.childLevel);
                    this.processSubGroups(row, [...prevRowDimsFromLvl, ...childDimensions], childCollection, pivotKeys, lvl + 1);
                }
            }
        }
    }

    public static processHierarchy(hierarchies, pivotKeys, level = 0, rootData = false): IPivotGridRecord[] {
        const flatData: IPivotGridRecord[] = [];
        hierarchies.forEach((h, key) => {
            const field = h.dimension.memberName;
            const rec: IPivotGridRecord = {
                dimensionValues: new Map<string, string>(),
                aggregationValues: new Map<string, string>(),
                children: new Map<string, IPivotGridRecord[]>(),
                dimensions: [h.dimension]
            };
            rec.dimensionValues.set(field, key);
            if (h[pivotKeys.records]) {
                rec.records = this.getDirectLeafs(h[pivotKeys.records]);
            }
            rec.level = level;
            flatData.push(rec);
            if (h[pivotKeys.children] && h[pivotKeys.children].size > 0) {
                const nestedData = this.processHierarchy(h[pivotKeys.children],
                    pivotKeys, level + 1, rootData);
                rec.records = this.getDirectLeafs(nestedData);
                rec.children.set(field, nestedData);
            }
        });

        return flatData;
    }

    public static getDirectLeafs(records: IPivotGridRecord[]) {
        let leafs = [];
        for (const rec of records) {
            if (rec.records) {
                const data = rec.records.filter(x => !x.records && leafs.indexOf(x) === -1);
                leafs = leafs.concat(data);
            } else {
                leafs.push(rec);
            }
        }
        return leafs;
    }

    public static getRecordKey(rec, currentDim: IPivotDimension, prevDims: IPivotDimension[], pivotKeys: IPivotKeys) {
        const parentFields = [];
        const field = currentDim.memberName;
        const value = rec[field];
        for (const prev of prevDims) {
            const dimData = PivotUtil.getDimensionLevel(prev, rec, pivotKeys);
            parentFields.push(rec[prev.memberName] || rec[dimData.dimension.memberName]);
        }
        parentFields.push(value);
        return parentFields.join(pivotKeys.rowDimensionSeparator);
    }

    public static getTotalLvl(rec, pivotKeys: IPivotKeys) {
        let total = 0;
        Object.keys(rec).forEach(key => {
            if (key.indexOf(pivotKeys.rowDimensionSeparator + pivotKeys.level) !== -1 &&
                key.indexOf(pivotKeys.level + pivotKeys.rowDimensionSeparator) === -1 &&
                key.indexOf(pivotKeys.records) === -1) {
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
                        obj[key + pivotKeys.columnDimensionSeparator + value.member] = h[pivotKeys.aggregations][value.member];
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

    public static buildExpressionTree(config: IPivotConfiguration) {
        const allDimensions = config.rows.concat(config.columns).concat(config.filters).filter(x => x !== null && x !== undefined);
        const enabledDimensions = allDimensions.filter(x => x && x.enabled);

        const expressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
        // add expression trees from all filters
        PivotUtil.flatten(enabledDimensions).forEach((x: IPivotDimension) => {
            if (x.filter && x.filter.filteringOperands) {
                expressionsTree.filteringOperands.push(...x.filter.filteringOperands);
            }
        });

        return expressionsTree;
    }

    private static collectRecords(children, pivotKeys: IPivotKeys) {
        let result = [];
        children.forEach(value => result = result.concat(value[pivotKeys.records]));
        return result;
    }

    private static applyHierarchyChildren(hierarchy, val, rec, pivotKeys: IPivotKeys) {
        const recordsKey = pivotKeys.records;
        const childKey = pivotKeys.children;
        const childCollection = val[childKey];
        const hierarchyValue = hierarchy.get(val.value);
        if (Array.isArray(hierarchyValue[childKey])) {
            hierarchyValue[childKey] = new Map<string, any>();
        }
        if (!childCollection || childCollection.size === 0) {
            const dim = hierarchyValue.dimension;
            const isValid = this.extractValueFromDimension(dim, rec) === val.value;
            if (isValid) {
                if (hierarchyValue[recordsKey]) {
                    hierarchyValue[recordsKey].push(rec);
                } else {
                    hierarchyValue[recordsKey] = [rec];
                }
            }
        } else {
            const hierarchyChild = hierarchyValue[childKey];
            for (const [key, child] of childCollection) {
                let hierarchyChildValue = hierarchyChild.get(child.value);
                if (!hierarchyChildValue) {
                    hierarchyChild.set(child.value, child);
                    hierarchyChildValue = child;
                }

                if (hierarchyChildValue[recordsKey]) {
                    const copy = Object.assign({}, rec);
                    if (rec[recordsKey]) {
                        // not all nested children are valid
                        const nestedValue = hierarchyChildValue.value;
                        const dimension = hierarchyChildValue.dimension;
                        const validRecs = rec[recordsKey].filter(x => this.extractValueFromDimension(dimension, x) === nestedValue);
                        copy[recordsKey] = validRecs;
                    }
                    hierarchyChildValue[recordsKey].push(copy);
                } else {
                    hierarchyChildValue[recordsKey] = [rec];
                }

                if (child[childKey] && child[childKey].size > 0) {
                    this.applyHierarchyChildren(hierarchyChild, child, rec, pivotKeys);
                }
            }
        }
    }
}
