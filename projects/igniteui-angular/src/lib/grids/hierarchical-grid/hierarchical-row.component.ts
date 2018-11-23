import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    forwardRef
} from '@angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxRowComponent } from '../grid';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-hierarchical-grid-row',
    templateUrl: './hierarchical-row.component.html',
    providers: [{ provide: IgxRowComponent, useExisting: forwardRef(() => IgxHierarchicalRowComponent) } ]
})
export class IgxHierarchicalRowComponent extends IgxRowComponent<IgxHierarchicalGridComponent> {

    /**
     * @hidden
     */
    @HostBinding('attr.tabindex')
    public tabindex = 0;

        /**
     * Returns whether the row is expanded.
     * ```typescript
     * const RowExpanded = this.grid1.rowList.first.expanded;
     * ```
     */
    public get expanded() {
        return this.grid.isExpanded(this.rowID);
    }

    public get hasChildren() {
        let hasChild = false;
        const childKeys = this.grid.childLayoutKeys;
        for (let i = 0; i < childKeys.length; i++) {
            const childKey = childKeys[i];
            if (this.rowData[childKey]) {
                hasChild = true;
                break;
            }
        }
        return  hasChild;
    }

    /**
     * Toggles the hierarchical row.
     * ```typescript
     * this.grid1.rowList.first.toggle()
     * ```
     */
    public toggle() {
        const grid = this.gridAPI.get(this.grid.id);
        const state = this.gridAPI.get(this.grid.id).hierarchicalState;
        if (!this.expanded) {
            state.push({ rowID: this.rowID });
            grid.hierarchicalState = [...state];
        } else {
            grid.hierarchicalState = state.filter(v => {
                return v.rowID !== this.rowID;
            });
        }
    }
}
