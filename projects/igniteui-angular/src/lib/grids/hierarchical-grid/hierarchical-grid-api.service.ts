import { GridBaseAPIService } from '../api.service';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxRowIslandComponent } from './row-island.component';
import { Subject } from 'rxjs';
export class IgxHierarchicalGridAPIService extends GridBaseAPIService<IgxHierarchicalGridComponent> {
    protected layouts: Map<string, IgxRowIslandComponent> = new Map<string, IgxRowIslandComponent>();
    protected layoutChildGrids:  Map<string, Map<any, IgxHierarchicalGridComponent>> =
    new Map<string, Map<any, IgxHierarchicalGridComponent>>();
    protected gridsPerLayout: Map<string, IgxHierarchicalGridComponent[]> = new Map<any, IgxHierarchicalGridComponent[]>();
    registerLayout(layout: IgxRowIslandComponent) {
        this.layouts.set(layout.id, layout);
        this.destroyMap.set(layout.id, new Subject<boolean>());
    }

    getChildGrid(parentRowID: string|object, layoutID: string) {
        const childrenForLayout = this.layoutChildGrids.get(layoutID);
        let res;
        if (childrenForLayout) {
            res = childrenForLayout.get(parentRowID);
        }
        return res;
    }

    getChildGrids() {
        const allChildren = [];
        this.layoutChildGrids.forEach((layoutMap) => {
            layoutMap.forEach((grid) => {
                allChildren.push(grid);
            });
        });
        return allChildren;
    }

    registerChildGridForLayout(layoutID: string, grid: IgxHierarchicalGridComponent) {
        const grids = this.gridsPerLayout.get(layoutID);
        if (!grids) {
            this.gridsPerLayout.set(layoutID, [grid]);
        } else {
            grids.push(grid);
        }
    }

    registerChildGrid(parentRowID: string|object, layoutID: string, grid: IgxHierarchicalGridComponent) {
        let childrenForLayout = this.layoutChildGrids.get(layoutID);
        if (!childrenForLayout) {
            this.layoutChildGrids.set(layoutID, new Map<any, IgxHierarchicalGridComponent>());
            childrenForLayout = this.layoutChildGrids.get(layoutID);
        }
        childrenForLayout.set(parentRowID, grid);
    }

    getLayout(id: string) {
      return this.layouts.get(id);
    }

    getChildGridsForRowIsland(id) {
        return this.gridsPerLayout.get(id);
    }
}
