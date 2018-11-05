import { GridBaseAPIService } from '../api.service';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxChildLayoutComponent } from './igx-layout.component';
import { Subject } from 'rxjs';
export class IgxHierarchicalGridAPIService extends GridBaseAPIService<IgxHierarchicalGridComponent> {
    protected layouts: Map<string, IgxChildLayoutComponent> = new Map<string, IgxChildLayoutComponent>();
    registerLayout(layout: IgxChildLayoutComponent) {
        this.layouts.set(layout.id, layout);
        this.destroyMap.set(layout.id, new Subject<boolean>());
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
