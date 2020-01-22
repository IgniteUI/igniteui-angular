import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxRowIslandComponent } from './row-island.component';
import { Subject } from 'rxjs';
import { IPathSegment } from './hierarchical-grid-base.directive';
import { IgxGridBaseDirective, GridBaseAPIService } from '../grid';
import { GridType } from '../common/grid.interface';
import { Injectable } from '@angular/core';

@Injectable()
export class IgxHierarchicalGridAPIService extends GridBaseAPIService<IgxGridBaseDirective & GridType> {
    protected childRowIslands: Map<string, IgxRowIslandComponent> = new Map<string, IgxRowIslandComponent>();
    protected childGrids:  Map<string, Map<any, IgxHierarchicalGridComponent>> =
        new Map<string, Map<any, IgxHierarchicalGridComponent>>();

    registerChildRowIsland(rowIsland: IgxRowIslandComponent) {
        this.childRowIslands.set(rowIsland.key, rowIsland);
        this.destroyMap.set(rowIsland.key, new Subject<boolean>());
    }

    unsetChildRowIsland(rowIsland: IgxRowIslandComponent) {
        this.childGrids.delete(rowIsland.key);
        this.childRowIslands.delete(rowIsland.key);
        this.destroyMap.delete(rowIsland.key);
    }

    getChildRowIsland(key: string) {
        return this.childRowIslands.get(key);
    }

    getChildGrid(path: Array<IPathSegment>) {
        const currPath = path;
        let grid;
        const pathElem = currPath.shift();
        const childrenForLayout = this.childGrids.get(pathElem.rowIslandKey);
        if (childrenForLayout) {
            const childGrid = childrenForLayout.get(pathElem.rowID);
            if (currPath.length === 0) {
                grid = childGrid;
            } else {
                grid = childGrid.hgridAPI.getChildGrid(currPath);
            }
        }
        return grid;
    }

    getChildGrids(inDepth?: boolean) {
        const allChildren = [];
        this.childGrids.forEach((layoutMap) => {
            layoutMap.forEach((grid) => {
                allChildren.push(grid);
                if (inDepth) {
                    const children = grid.hgridAPI.getChildGrids(inDepth);
                    children.forEach((item) => {
                        allChildren.push(item);
                    });
                }
            });
        });

        return allChildren;
    }

    getParentRowId(childGrid: IgxHierarchicalGridComponent) {
        let rowID;
        this.childGrids.forEach((layoutMap) => {
            layoutMap.forEach((grid, key) => {
                if (grid === childGrid) {
                    rowID = key;
                    return;
                }
            });
        });
        return rowID;
    }

    registerChildGrid(parentRowID: string|object, rowIslandKey: string, grid: IgxHierarchicalGridComponent) {
        let childrenForLayout = this.childGrids.get(rowIslandKey);
        if (!childrenForLayout) {
            this.childGrids.set(rowIslandKey, new Map<any, IgxHierarchicalGridComponent>());
            childrenForLayout = this.childGrids.get(rowIslandKey);
        }
        childrenForLayout.set(parentRowID, grid);
    }

    getChildGridsForRowIsland(rowIslandKey): IgxHierarchicalGridComponent[] {
        const childrenForLayout = this.childGrids.get(rowIslandKey);
        const children = [];
        if (childrenForLayout) {
            childrenForLayout.forEach((child) => {
                children.push(child);
            });
        }
        return children;
    }

    getChildGridByID(rowIslandKey, rowID) {
        const childrenForLayout = this.childGrids.get(rowIslandKey);
        return childrenForLayout.get(rowID);
    }

    public get_row_expansion_state(record: any): boolean {
        let inState;
        if (record.childGridsData !== undefined) {
            const ri = record.rowID;
            const rec = this.grid.primaryKey ? this.get_rec_by_id(ri): ri;
            inState = !!super.get_row_expansion_state(rec);
        } else {
            inState = !!super.get_row_expansion_state(record);
        }
        return inState && (this.grid as any).childLayoutList.length !== 0;
    }

    public allow_expansion_state_change(rowID, expanded) : boolean {
        const rec = this.get_rec_by_id(rowID);
        return !!rec && this.grid.expansionStates.get(rowID) !== expanded;
    }

    public get_rec_by_id(rowID): any {
        const data = this.get_all_data(false);
        const index = this.get_row_index_in_data(rowID);
        return data[index];
    }
}
