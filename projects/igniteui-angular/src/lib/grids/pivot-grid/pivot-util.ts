import { IDataCloneStrategy } from '../../data-operations/data-clone-strategy';
import { DataUtil, GridColumnDataType } from '../../data-operations/data-util';
import { FilteringLogic } from '../../data-operations/filtering-expression.interface';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { ISortingExpression } from '../../data-operations/sorting-strategy';
import { PivotGridType } from '../common/grid.interface';
import { IGridSortingStrategy, IgxSorting } from '../common/strategy';
import { IgxPivotAggregate, IgxPivotDateAggregate, IgxPivotNumericAggregate, IgxPivotTimeAggregate } from './pivot-grid-aggregate';
import { IPivotAggregator, IPivotConfiguration, IPivotDimension, IPivotGridRecord, IPivotKeys, IPivotValue, PivotDimensionType, PivotSummaryPosition } from './pivot-grid.interface';

export class PivotUtil {

    // go through all children and apply new dimension groups as child
    public static processGroups(recs: IPivotGridRecord[], dimension: IPivotDimension, pivotKeys: IPivotKeys, cloneStrategy: IDataCloneStrategy) {
        for (const rec of recs) {
            // process existing children
            if (rec.children && rec.children.size > 0) {
                // process hierarchy in dept
                rec.children.forEach((values) => {
                    this.processGroups(values, dimension, pivotKeys, cloneStrategy);
                });
            }
            // add children for current dimension
            const hierarchyFields = PivotUtil
                .getFieldsHierarchy(rec.records, [dimension], PivotDimensionType.Row, pivotKeys, cloneStrategy);
            const siblingData = PivotUtil
                .processHierarchy(hierarchyFields, pivotKeys, 0);
            rec.children.set(dimension.memberName, siblingData);
        }
    }

    public static flattenGroups(data: IPivotGridRecord[], dimension: IPivotDimension, expansionStates, defaultExpand: boolean, parent?: IPivotDimension, parentRec?: IPivotGridRecord) {
        for (let i = 0; i < data.length; i++) {
            const rec = data[i];
            const field = dimension.memberName;
            if (!field) {
                continue;
            }

            let recordsData = rec.children.get(field);
            if (!recordsData && parent) {
                // check parent
                recordsData = rec.children.get(parent.memberName);
                if (recordsData) {
                    dimension = parent;
                }
            }

            if (parentRec) {
                parentRec.dimensionValues.forEach((value, key) => {
                    if (parent.memberName !== key) {
                        rec.dimensionValues.set(key, value);
                        const dim = parentRec.dimensions.find(x => x.memberName === key);
                        rec.dimensions.unshift(dim);
                    }

                });
            }


            const expansionRowKey = PivotUtil.getRecordKey(rec, dimension);
            const isExpanded = expansionStates.get(expansionRowKey) === undefined ?
                defaultExpand :
                expansionStates.get(expansionRowKey);
            const shouldExpand = isExpanded || !dimension.childLevel || !rec.dimensionValues.get(dimension.memberName);
            if (shouldExpand && recordsData) {
                if (dimension.childLevel) {
                    this.flattenGroups(recordsData, dimension.childLevel, expansionStates, defaultExpand, dimension, rec);
                } else {
                    // copy parent values and dims in child
                    recordsData.forEach(x => {
                        rec.dimensionValues.forEach((value, key) => {
                            if (dimension.memberName !== key) {
                                x.dimensionValues.set(key, value);
                                const dim = rec.dimensions.find(y => y.memberName === key);
                                x.dimensions.unshift(dim);
                            }

                        });
                    });
                }

                data.splice(i + 1, 0, ...recordsData);
                i += recordsData.length;

            }
        }
    }

    public static flattenGroupsHorizontally(data: IPivotGridRecord[],
                                            dimension: IPivotDimension,
                                            expansionStates,
                                            defaultExpand: boolean,
                                            visibleDimensions: IPivotDimension[],
                                            summariesPosition: PivotSummaryPosition,
                                            parent?: IPivotDimension,
                                            parentRec?: IPivotGridRecord) {
        for (let i = 0; i < data.length; i++) {
            const rec = data[i];
            const field = dimension.memberName;
            if (!field) {
                continue;
            }

            if (!visibleDimensions.find(recDim => recDim.memberName === rec.dimensions[0].memberName)) {
                visibleDimensions.push(rec.dimensions[0]);
            }

            let recordsData = rec.children.get(field);
            if (!recordsData && parent) {
                // check parent
                recordsData = rec.children.get(parent.memberName);
                if (recordsData) {
                    dimension = parent;
                }
            }

            if (parentRec) {
                parentRec.dimensionValues.forEach((value, key) => {
                    rec.dimensionValues.set(key, value);
                    const dim = parentRec.dimensions.find(x => x.memberName === key);
                    rec.dimensions.unshift(dim);
                });
            }

            const expansionRowKey = PivotUtil.getRecordKey(rec, dimension);
            const isExpanded = expansionStates.get(expansionRowKey) === undefined ?
                defaultExpand :
                expansionStates.get(expansionRowKey);
            const shouldExpand = isExpanded || !dimension.childLevel || !rec.dimensionValues.get(dimension.memberName);
            if (shouldExpand && recordsData && !rec.totalRecordDimensionName) {
                if (dimension.childLevel) {
                    this.flattenGroupsHorizontally(recordsData, dimension.childLevel, expansionStates, defaultExpand, visibleDimensions, summariesPosition, dimension, rec);
                } else {
                    // copy parent values and dims in child
                    recordsData.forEach(x => {
                        rec.dimensionValues.forEach((value, key) => {
                            if (dimension.memberName !== key) {
                                x.dimensionValues.set(key, value);
                                const dim = rec.dimensions.find(y => y.memberName === key);
                                x.dimensions.unshift(dim);
                            }

                        });
                    });
                }

                recordsData.forEach((childRec) => {
                    if (childRec.dimensions.length === 1) {
                        rec.dimensionValues.forEach((value: string, key) => {
                            childRec.dimensionValues.set(key, value);
                        });
                    }

                    childRec.dimensions.forEach((dim) => {
                        if (!visibleDimensions.find(recDim => recDim.memberName === dim.memberName)) {
                            visibleDimensions.push(dim);
                        }
                    });
                });

                const curDimValue = rec.dimensionValues.get(dimension.memberName);
                if (dimension.horizontalSummary && curDimValue) {
                    rec.totalRecordDimensionName = dimension.memberName;
                    rec.dimensionValues.set(dimension.memberName, `${curDimValue} Total`);
                    if (summariesPosition === PivotSummaryPosition.Top) {
                        recordsData.unshift(rec);
                    } else {
                        recordsData.push(rec);
                    }
                }

                data.splice(i, 1, ...recordsData);
                i += recordsData.length - 1;

            }
        }
    }

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
        dimensionType: PivotDimensionType, pivotKeys: IPivotKeys, cloneStrategy: IDataCloneStrategy): Map<string, any> {
        const hierarchy = new Map<string, any>();
        for (const rec of data) {
            const vals = dimensionType === PivotDimensionType.Column ?
                this.extractValuesForColumn(dimensions, rec, pivotKeys) :
                this.extractValuesForRow(dimensions, rec, pivotKeys, cloneStrategy);
            for (const [_key, val] of vals) { // this should go in depth also vals.children
                if (hierarchy.get(val.value) != null) {
                    this.applyHierarchyChildren(hierarchy, val, rec, pivotKeys);
                } else {
                    hierarchy.set(val.value, cloneStrategy.clone(val));
                    this.applyHierarchyChildren(hierarchy, val, rec, pivotKeys);
                }
            }
        }
        return hierarchy;
    }

    public static sort(data: IPivotGridRecord[], expressions: ISortingExpression[], sorting: IGridSortingStrategy = new IgxSorting()): any[] {
        data.forEach(rec => {
            const children = rec.children;
            if (children) {
                children.forEach(x => {
                    this.sort(x, expressions, sorting);
                });
            }
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

    public static extractValuesForRow(dims: IPivotDimension[], recData: any, pivotKeys: IPivotKeys, cloneStrategy: IDataCloneStrategy) {
        const values = new Map<string, any>();
        for (const col of dims) {
            if (recData[pivotKeys.level] && recData[pivotKeys.level] > 0) {
                const childData = recData[pivotKeys.records];
                return this.getFieldsHierarchy(childData, [col], PivotDimensionType.Row, pivotKeys, cloneStrategy);
            }

            const value = this.extractValueFromDimension(col, recData);
            const objValue = {};
            objValue['value'] = value;
            objValue['dimension'] = col;
            if (col.childLevel) {
                const childValues = this.extractValuesForRow([col.childLevel], recData, pivotKeys, cloneStrategy);
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
            if (item) {
                item.level = lvl;
                acc.push(item);
                if (item.childLevel) {
                    item.expandable = true;
                    acc = acc.concat(this.flatten([item.childLevel], lvl + 1));
                }
            }
            return acc;
        }, []);
        return newArr;
    }

    public static applyAggregations(rec: IPivotGridRecord, hierarchies, values, pivotKeys: IPivotKeys) {
        if (hierarchies.size === 0) {
            // no column groups
            const aggregationResult = this.aggregate(rec.records, values);
            this.applyAggregationRecordData(aggregationResult, undefined, rec, pivotKeys);
            return;
        }
        hierarchies.forEach((hierarchy) => {
            const children = hierarchy[pivotKeys.children];
            if (children && children.size > 0) {
                this.applyAggregations(rec, children, values, pivotKeys);
                const childRecords = this.collectRecords(children, pivotKeys);
                hierarchy[pivotKeys.aggregations] = this.aggregate(childRecords, values);
                this.applyAggregationRecordData(hierarchy[pivotKeys.aggregations], hierarchy.value, rec, pivotKeys);
            } else if (hierarchy[pivotKeys.records]) {
                hierarchy[pivotKeys.aggregations] = this.aggregate(hierarchy[pivotKeys.records], values);
                this.applyAggregationRecordData(hierarchy[pivotKeys.aggregations], hierarchy.value, rec, pivotKeys);
            }
        });
    }

    protected static applyAggregationRecordData(aggregationData: any, groupName: string, rec: IPivotGridRecord, pivotKeys: IPivotKeys) {
        const aggregationKeys = Object.keys(aggregationData);
        if (aggregationKeys.length > 1) {
            aggregationKeys.forEach((key) => {
                const aggregationKey = groupName ? groupName + pivotKeys.columnDimensionSeparator + key : key;
                rec.aggregationValues.set(aggregationKey, aggregationData[key]);
            });
        } else  if (aggregationKeys.length === 1) {
            const aggregationKey = aggregationKeys[0];
            rec.aggregationValues.set(groupName || aggregationKey, aggregationData[aggregationKey]);
        }
    }

    public static aggregate(records, values: IPivotValue[]) {
        const result = {};
        for (const pivotValue of values) {
            const aggregator = PivotUtil.getAggregatorForType(pivotValue.aggregate, pivotValue.dataType);
            if (!aggregator) {
                throw `No valid aggregator found for ${pivotValue.member}. Please set either a valid aggregatorName or aggregator`;
            }
            result[pivotValue.member] = aggregator(records.map(r => r[pivotValue.member]), records);
        }

        return result;
    }

    public static getAggregatorForType(aggregate: IPivotAggregator, dataType: GridColumnDataType) {
        let aggregator = aggregate.aggregator;
        if (aggregate.aggregatorName) {
            let aggregators = IgxPivotNumericAggregate.aggregators();
            if (!dataType || dataType === 'date' || dataType === 'dateTime') {
                aggregators = aggregators.concat(IgxPivotDateAggregate.aggregators())
            } else if (dataType === 'time') {
                aggregators = aggregators.concat(IgxPivotTimeAggregate.aggregators());
            }
            aggregator = aggregators.find(x => x.key.toLocaleLowerCase() === aggregate.aggregatorName.toLocaleLowerCase())?.aggregator;
        }
        return aggregator;
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

    public static getRecordKey(rec: IPivotGridRecord, currentDim: IPivotDimension) {
        const parentFields = [];

        const currentDimIndex = rec.dimensions.findIndex(x => x.memberName === currentDim.memberName) + 1;
        const prevDims = rec.dimensions.slice(0, currentDimIndex);
        for (const prev of prevDims) {
            const prevValue = rec.dimensionValues.get(prev.memberName);
            parentFields.push(prevValue);
        }

        return parentFields.join('-');
    }

    public static buildExpressionTree(config: IPivotConfiguration) {
        const allDimensions = (config?.rows || []).concat((config?.columns || [])).concat(config?.filters || []).filter(x => x !== null && x !== undefined);
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
            for (const [_key, child] of childCollection) {
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

    public static getAggregateList(val: IPivotValue, grid: PivotGridType): IPivotAggregator[] {
        if (!val.aggregateList) {
            let defaultAggr = this.getAggregatorsForValue(val, grid);
            const isDefault = defaultAggr.find(
                (x) => x.key === val.aggregate.key
            );
            // resolve custom aggregations
            if (!isDefault && grid.data[0][val.member] !== undefined) {
                // if field exists, then we can apply default aggregations and add the custom one.
                defaultAggr.unshift(val.aggregate);
            } else if (!isDefault) {
                // otherwise this is a custom aggregation that is not compatible
                // with the defaults, since it operates on field that is not in the data
                // leave only the custom one.
                defaultAggr = [val.aggregate];
            }
            val.aggregateList = defaultAggr;
        }
        return val.aggregateList;
    }

    public static getAggregatorsForValue(value: IPivotValue, grid: PivotGridType): IPivotAggregator[] {
        const dataType = value.dataType || grid.resolveDataTypes(grid.data[0][value.member]);
        switch (dataType) {
            case GridColumnDataType.Number:
            case GridColumnDataType.Currency:
                return IgxPivotNumericAggregate.aggregators();
            case GridColumnDataType.Date:
            case GridColumnDataType.DateTime:
                return IgxPivotDateAggregate.aggregators();
            case GridColumnDataType.Time:
                return IgxPivotTimeAggregate.aggregators();
            default:
                return IgxPivotAggregate.aggregators();
        }
    }


}
