import { IgxGridNavigationService } from '../grid-navigation.service';

export class IgxTreeGridNavigationService extends IgxGridNavigationService {

    protected getCellSelector(visibleIndex?: number) {
        if (visibleIndex === 0) {
            return 'igx-tree-grid-cell';
        }
        return 'igx-grid-cell';
    }

    protected getRowSelector() {
        return 'igx-tree-grid-row';
    }
}
