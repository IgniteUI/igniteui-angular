import {
    Component,
    ChangeDetectionStrategy,
    ViewChild,
    Input,
    AfterViewInit,
    OnDestroy,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { IgxColumnComponent } from '../../column.component';
import { IgxButtonGroupComponent } from '../../../buttonGroup/buttonGroup.component';
import { DisplayDensity } from '../../../core/density';
import { IgxGridBaseComponent } from '../../grid';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-excel-style-sorting',
    templateUrl: './excel-style-sorting.component.html'
})
export class IgxExcelStyleSortingComponent implements AfterViewInit, OnDestroy, OnChanges {
    private destroy$ = new Subject<boolean>();

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public grid: IgxGridBaseComponent;

    @Input()
    public displayDensity: DisplayDensity;

    @ViewChild('sortButtonGroup', { read: IgxButtonGroupComponent, static: true })
    public sortButtonGroup: IgxButtonGroupComponent;

    constructor() {}

    ngAfterViewInit(): void {
        this.grid.sortingExpressionsChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.updateSelectedButtons(this.column.field);
        });
        this.updateSelectedButtons(this.column.field);
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.column && !changes.column.firstChange) {
            this.updateSelectedButtons(changes.column.currentValue.field);
        }
    }

    private updateSelectedButtons(fieldName: string) {
        const sortIndex = this.grid.sortingExpressions.findIndex(s => s.fieldName === fieldName);

        this.sortButtonGroup.buttons.forEach((b, i) => {
            this.sortButtonGroup.deselectButton(i);
        });

        if (sortIndex !== -1 ) {
            const sortDirection = this.grid.sortingExpressions[sortIndex].dir;
            this.sortButtonGroup.selectButton(sortDirection - 1);
        }
    }

    public onSortButtonClicked(sortDirection) {
        if (this.sortButtonGroup.selectedIndexes.length === 0) {
            if (this.grid.isColumnGrouped(this.column.field)) {
                this.sortButtonGroup.selectButton(sortDirection - 1);
            } else {
                this.grid.clearSort(this.column.field);
            }
        } else {
            this.grid.sort({ fieldName: this.column.field, dir: sortDirection, ignoreCase: true });
        }
    }
}
