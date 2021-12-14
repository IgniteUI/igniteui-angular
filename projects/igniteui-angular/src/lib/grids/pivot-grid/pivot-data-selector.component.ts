import { AfterViewInit, Component, HostBinding, Input } from '@angular/core';
import { DisplayDensity } from '../../core/displayDensity';
import { PivotGridType } from '../common/grid.interface';

@Component({
    selector: 'igx-pivot-data-selector',
    templateUrl: './pivot-data-selector.component.html'
})

export class IgxPivotDataSelectorComponent implements AfterViewInit {
    @HostBinding('class.igx-pivot-data-selector')
    public cssClass = 'igx-pivot-data-selector';

    private _grid: PivotGridType;

    /**
     * @hidden @internal
     */
    public get displayDensity(): DisplayDensity {
        return this.grid?.displayDensity;
    }

    /**
     * An @Input property that sets the grid.
     */
    @Input()
    public set grid(grid: PivotGridType) {
        this._grid = grid;
    }

    /**
     * Returns the grid.
     */
    public get grid(): PivotGridType {
        return this._grid;
    }

    public ngAfterViewInit() {
        console.log(this.grid.pivotConfiguration);
    }
}
