import { IgxHierarchicalGridComponent, IPathSegment } from './hierarchical-grid.component';
import { IgxRowIslandComponent } from './row-island.component';
import { Subject } from 'rxjs';
import { IgxGridAPIService } from '../grid/grid-api.service';
export class IgxHierarchicalGridAPIService extends IgxGridAPIService {
    protected layouts: Map<string, IgxRowIslandComponent> = new Map<string, IgxRowIslandComponent>();
    protected layoutChildGrids:  Map<string, Map<any, IgxHierarchicalGridComponent>> =
    new Map<string, Map<any, IgxHierarchicalGridComponent>>();
    protected gridsPerLayout: Map<string, IgxHierarchicalGridComponent[]> = new Map<any, IgxHierarchicalGridComponent[]>();
    registerLayout(layout: IgxRowIslandComponent) {
        this.layouts.set(layout.id, layout);
        this.destroyMap.set(layout.id, new Subject<boolean>());
    }

    getChildGrid(path: Array<IPathSegment>) {
        const currPath = path;
        let grid;
        const pathElem = currPath.shift();
        const childrenForLayout = this.layoutChildGrids.get(pathElem.rowIslandKey);
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
        this.layoutChildGrids.forEach((layoutMap) => {
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
        this.layoutChildGrids.forEach((layoutMap) => {
            layoutMap.forEach((grid, key) => {
                if (grid === childGrid) {
                    rowID = key;
                    return;
                }
            });
        });
        return rowID;
    }

    registerChildGrid(parentRowID: string|object, layoutKey: string, grid: IgxHierarchicalGridComponent) {
        let childrenForLayout = this.layoutChildGrids.get(layoutKey);
        if (!childrenForLayout) {
            this.layoutChildGrids.set(layoutKey, new Map<any, IgxHierarchicalGridComponent>());
            childrenForLayout = this.layoutChildGrids.get(layoutKey);
        }
        childrenForLayout.set(parentRowID, grid);
    }

    getLayout(id: string) {
      return this.layouts.get(id);
    }

    getChildGridsForRowIsland(layoutKey) {
        const childrenForLayout = this.layoutChildGrids.get(layoutKey);
        const children = [];
        if (childrenForLayout) {
            childrenForLayout.forEach((child) => {
                children.push(child);
            });
        }
        return children;
    }

    getChildGridByID(layoutKey, rowID) {
        const childrenForLayout = this.layoutChildGrids.get(layoutKey);
        return childrenForLayout.get(rowID);
    }
}
