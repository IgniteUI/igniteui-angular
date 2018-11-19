import { GridBaseAPIService } from '../api.service';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxRowIslandComponent } from './row-island.component';
import { Subject } from 'rxjs';
export class IgxHierarchicalGridAPIService extends GridBaseAPIService<IgxHierarchicalGridComponent> {
    protected layouts: Map<string, IgxRowIslandComponent> = new Map<string, IgxRowIslandComponent>();
    protected childGrids: Map<any, IgxHierarchicalGridComponent> = new Map<any, IgxHierarchicalGridComponent>();
    registerLayout(layout: IgxRowIslandComponent) {
        this.layouts.set(layout.id, layout);
        this.destroyMap.set(layout.id, new Subject<boolean>());
    }

    getChildGrid(parentRowID: string|object) {
        return this.childGrids.get(parentRowID);
    }

    getChildGrids() {
        const allChildren = [];
        this.childGrids.forEach((child) => {
            allChildren.push(child);
        });
        return allChildren;
    }
    registerChildGrid(parentRowID: any, grid: IgxHierarchicalGridComponent) {
        this.childGrids.set(parentRowID, grid);
    }

    getLayout(id: string) {
      return this.layouts.get(id);
    }

    getLayoutsPerLevel(level: number) {
        const res = [];
        this.layouts.forEach((value) => {
            if (value.level === level) {
                res.push(value);
            }
        });
        return res;
    }
}
