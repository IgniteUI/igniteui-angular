import { GridBaseAPIService } from '../api.service';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxChildLayoutComponent } from './igx-layout.component';
import { Subject } from 'rxjs';
export class IgxHierarchicalGridAPIService extends GridBaseAPIService<IgxHierarchicalGridComponent> {
    protected layouts: Map<string, IgxChildLayoutComponent> = new Map<string, IgxChildLayoutComponent>();
    protected childGrids: Map<any, IgxHierarchicalGridComponent> = new Map<any, IgxHierarchicalGridComponent>();
    registerLayout(layout: IgxChildLayoutComponent) {
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
