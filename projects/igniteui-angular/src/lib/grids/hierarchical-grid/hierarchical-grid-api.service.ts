import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxRowIslandComponent } from './row-island.component';
import { Subject } from 'rxjs';
import { IPathSegment } from './hierarchical-grid-base.component';
import { IgxGridBaseComponent, GridBaseAPIService } from '../grid';
import { GridType } from '../common/grid.interface';
export class IgxHierarchicalGridAPIService extends GridBaseAPIService<IgxGridBaseComponent & GridType> {
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
}
