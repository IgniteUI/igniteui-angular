import {
    Component,
    ChangeDetectionStrategy,
    ViewChild,
    AfterViewInit,
    OnDestroy,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { IgxButtonGroupComponent } from '../../../buttonGroup/buttonGroup.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IgxGridExcelStyleFilteringComponent } from './grid.excel-style-filtering.component';

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

    @ViewChild('sortButtonGroup', { read: IgxButtonGroupComponent, static: true })
    public sortButtonGroup: IgxButtonGroupComponent;

    constructor(public esf: IgxGridExcelStyleFilteringComponent) { }

    ngAfterViewInit(): void {
        this.esf.grid.sortingExpressionsChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.updateSelectedButtons(this.esf.column.field);
        });
        this.updateSelectedButtons(this.esf.column.field);
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
        const sortIndex = this.esf.grid.sortingExpressions.findIndex(s => s.fieldName === fieldName);

        this.sortButtonGroup.buttons.forEach((b, i) => {
            this.sortButtonGroup.deselectButton(i);
        });

        if (sortIndex !== -1 ) {
            const sortDirection = this.esf.grid.sortingExpressions[sortIndex].dir;
            this.sortButtonGroup.selectButton(sortDirection - 1);
        }
    }

    public onSortButtonClicked(sortDirection) {
        if (this.sortButtonGroup.selectedIndexes.length === 0) {
            if (this.esf.grid.isColumnGrouped(this.esf.column.field)) {
                this.sortButtonGroup.selectButton(sortDirection - 1);
            } else {
                this.esf.grid.clearSort(this.esf.column.field);
            }
        } else {
            this.esf.grid.sort({ fieldName: this.esf.column.field, dir: sortDirection, ignoreCase: true });
        }
    }
}
