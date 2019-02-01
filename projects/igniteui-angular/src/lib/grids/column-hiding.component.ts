import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    NgModule,
    Output,
    OnDestroy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxCheckboxModule } from '../checkbox/checkbox.component';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IColumnVisibilityChangedEventArgs, IgxColumnHidingItemDirective } from './column-hiding-item.directive';
import { IgxInputGroupModule } from '../input-group/input-group.component';
import { ColumnChooserBase } from './column-chooser-base';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    preserveWhitespaces: false,
    selector: 'igx-column-hiding',
    templateUrl: './column-hiding.component.html'
})
export class IgxColumnHidingComponent extends ColumnChooserBase implements OnDestroy {
    /**
     * Returns a boolean indicating whether the `HIDE ALL` button is disabled.
     * ```html
     * <igx-column-hiding #columnHidingUI
     *     [columns]="grid.columns" [title]="'Column Hiding'">
     * </igx-column-hiding>
     * ```
     * ```typescript
     * @ViewChild("'columnHidingUI'")
     * public columnHiding: IgxColumnHidingComponent;
     * let isHideAlldisabled =  this.columnHiding.disableHideAll;
     * ```
     *@memberof IgxColumnHidingComponent
     */
    @Input()
    get disableHideAll(): boolean {
        if (!this.columnItems || this.columnItems.length < 1 ||
            this.hiddenColumnsCount === this.columns.length) {
            return true;
        } else if (this.hidableColumns.length < 1 ||
            this.hidableColumns.length === this.hidableColumns.filter((col) => col.value).length) {
            return true;
        } else {
            return false;
        }
    }
    /**
     * Returns a boolean indicating whether the `SHOW ALL` button is disabled.
     * ```typescript
     * let isShowAlldisabled =  this.columnHiding.disableShowAll;
     * ```
     * @memberof IgxColumnHidingComponent
     */
    @Input()
    get disableShowAll(): boolean {
        if (!this.columnItems || this.columnItems.length < 1 ||
            this.hiddenColumnsCount < 1 || this.hidableColumns.length < 1) {
            return true;
        } else if (this.hidableColumns.length === this.hidableColumns.filter((col) => !col.value).length) {
            return true;
        } else {
            return false;
        }
    }
    /**
     * Sets/gets the text of the button that shows all columns if they are hidden.
     * ```typescript
     * let showAllButtonText =  this.columnHiding.showAllText;
     * ```
     *
     * ```html
     * <igx-column-hiding [showAllText] = "'Show Columns'"></igx-column-hiding>
     * ```
     * @memberof IgxColumnHidingComponent
     */
    @Input()
    public showAllText = 'Show All';
    /**
     * Sets/gets the text of the button that hides all columns if they are shown.
     * ```typescript
     * let hideAllButtonText =  this.columnHiding.hideAllText;
     * ```
     *
     * ```html
     * <igx-column-hiding [hideAllText] = "'Hide Columns'"></igx-column-hiding>
     * ```
     * @memberof IgxColumnHidingComponent
     */
    @Input()
    public hideAllText = 'Hide All';
    /**
     * An event that is emitted after the columns visibility is changed.
     * Provides references to the `column` and the `newValue` properties as event arguments.
     * ```html
     *  <igx-column-hiding (onColumnVisibilityChanged) = "onColumnVisibilityChanged($event)"></igx-column-hiding>
     * ```
     * @memberof IgxColumnHidingComponent
     */
    @Output()
    public onColumnVisibilityChanged = new EventEmitter<IColumnVisibilityChangedEventArgs>();
    /**
     * Gets the count of the hidden columns.
     * ```typescript
     * let hiddenColumnsCount =  this.columnHiding.hiddenColumnsCount;
     * ```
     * @memberof IgxColumnHidingComponent
     */
    public get hiddenColumnsCount() {
        return (this.columns) ? this.columns.filter((col) => col.hidden).length : 0;
    }

    constructor(public cdr: ChangeDetectorRef) {
        super(cdr);
    }

    /**
     *@hidden
     */
    public get hidableColumns() {
        return this.columnItems.filter((col) => !col.disabled);
    }

    private destroy$ = new Subject<boolean>();
    /**
     *@hidden
     */
    protected createColumnItem(container: any, column: any) {
        const item = new IgxColumnHidingItemDirective();
        item.container = container;
        item.column = column;
        if (!item.column.columnGroup) {
            item.valueChanged.pipe(takeUntil(this.destroy$)).subscribe((args) => {
                this.onVisibilityChanged({ column: item.column, newValue: args.newValue });
            });
        }
        return item;
    }
    /**
     * Shows all columns in the grid.
     * ```typescript
     * this.columnHiding.showAllColumns();
     * ```
     * @memberof IgxColumnHidingComponent
     */
    public showAllColumns() {
        for (const col of this.hidableColumns) {
            col.value = false;
        }
    }
    /**
     * Hides all columns in the grid.
     * ```typescript
     * this.columnHiding.hideAllColumns();
     * ```
     * @memberof IgxColumnHidingComponent
     */
    public hideAllColumns() {
        for (const col of this.hidableColumns) {
            col.value = true;
        }
    }
    /**
     * @hidden
     */
    public onVisibilityChanged(args: IColumnVisibilityChangedEventArgs) {
        this.onColumnVisibilityChanged.emit(args);
    }

    /**
     *@hidden
     */
    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
}
/**
 *The `IgxColumnHidingModule` provides the {@link IgxColumnHidingComponent} inside your application.
 */
@NgModule({
    declarations: [IgxColumnHidingComponent, IgxColumnHidingItemDirective],
    exports: [IgxColumnHidingComponent],
    imports: [
        IgxButtonModule,
        IgxCheckboxModule,
        IgxInputGroupModule,
        CommonModule,
        FormsModule,
    ]
})
export class IgxColumnHidingModule {
}
