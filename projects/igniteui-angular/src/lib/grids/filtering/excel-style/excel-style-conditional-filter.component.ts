import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GridColumnDataType } from '../../../data-operations/data-util';
import { IFilteringOperation } from '../../../data-operations/filtering-condition';
import { IFilteringExpression } from '../../../data-operations/filtering-expression.interface';
import { IgxExcelStyleCustomDialogComponent } from './excel-style-custom-dialog.component';
import { PlatformUtil } from '../../../core/utils';
import { BaseFilteringComponent } from './base-filtering.component';
import { AutoPositionStrategy } from '../../../services/overlay/position/auto-position-strategy';
import { AbsoluteScrollStrategy } from '../../../services/overlay/scroll/absolute-scroll-strategy';
import { HorizontalAlignment, OverlaySettings, VerticalAlignment } from '../../../services/overlay/utilities';
import { IgxDropDownItemComponent } from '../../../drop-down/drop-down-item.component';
import { IgxDropDownComponent } from '../../../drop-down/drop-down.component';
import { IgxIconComponent } from '../../../icon/icon.component';
import { IgxDropDownItemNavigationDirective } from '../../../drop-down/drop-down-navigation.directive';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { ISelectionEventArgs } from '../../../drop-down/drop-down.common';


/**
 * A component used for presenting Excel style conditional filter UI.
 */
@Component({
    selector: 'igx-excel-style-conditional-filter',
    templateUrl: './excel-style-conditional-filter.component.html',
    imports: [NgIf, NgClass, IgxDropDownItemNavigationDirective, IgxIconComponent, IgxDropDownComponent, NgFor, IgxDropDownItemComponent, IgxExcelStyleCustomDialogComponent]
})
export class IgxExcelStyleConditionalFilterComponent implements OnDestroy {
    /**
     * @hidden @internal
     */
    @ViewChild('customDialog', { read: IgxExcelStyleCustomDialogComponent })
    public customDialog: IgxExcelStyleCustomDialogComponent;

    /**
     * @hidden @internal
     */
    @ViewChild('subMenu', { read: IgxDropDownComponent })
    public subMenu: IgxDropDownComponent;

    protected get filterNumber() {
        return this.esf.expressionsList.filter(e => e.expression.condition).length;
    }

    private shouldOpenSubMenu = true;
    private destroy$ = new Subject<boolean>();

    private _subMenuPositionSettings = {
        verticalStartPoint: VerticalAlignment.Top
    };

    private _subMenuOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        positionStrategy: new AutoPositionStrategy(this._subMenuPositionSettings),
        scrollStrategy: new AbsoluteScrollStrategy()
    };

    constructor(
        public esf: BaseFilteringComponent,
        protected platform: PlatformUtil,
    ) {
        this.esf.columnChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (this.esf.grid) {
                this.shouldOpenSubMenu = true;
                this._subMenuOverlaySettings.outlet = this.esf.grid.outlet;
            }
        });

        if (this.esf.grid) {
            this._subMenuOverlaySettings.outlet = this.esf.grid.outlet;
        }
    }

    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * @hidden @internal
     */
    public onTextFilterKeyDown(eventArgs: KeyboardEvent) {
        if (eventArgs.key === this.platform.KEYMAP.ENTER) {
            this.onTextFilterClick(eventArgs);
        } else if (eventArgs.key === this.platform.KEYMAP.TAB) {
            this.subMenu.close();
        }
    }

    /**
     * @hidden @internal
     */
    public onTextFilterClick(eventArgs) {
        if (this.shouldOpenSubMenu) {
            this._subMenuOverlaySettings.target = eventArgs.currentTarget;

            const gridRect = this.esf.grid.nativeElement.getBoundingClientRect();
            const dropdownRect = this.esf.mainDropdown.nativeElement.getBoundingClientRect();

            let x = dropdownRect.left + dropdownRect.width;
            let x1 = gridRect.left + gridRect.width;
            x += window.pageXOffset;
            x1 += window.pageXOffset;
            if (Math.abs(x - x1) < 200) {
                this._subMenuOverlaySettings.positionStrategy.settings.horizontalDirection = HorizontalAlignment.Left;
                this._subMenuOverlaySettings.positionStrategy.settings.horizontalStartPoint = HorizontalAlignment.Left;
            } else {
                this._subMenuOverlaySettings.positionStrategy.settings.horizontalDirection = HorizontalAlignment.Right;
                this._subMenuOverlaySettings.positionStrategy.settings.horizontalStartPoint = HorizontalAlignment.Right;
            }

            this.subMenu.open(this._subMenuOverlaySettings);
            this.shouldOpenSubMenu = false;
        }
    }

    /**
     * @hidden @internal
     */
    public getCondition(value: string): IFilteringOperation {
        return this.esf.column.filters.condition(value);
    }

    protected getSelectedCondition(condition: string): boolean {
        const expressions = this.esf.expressionsList;
        if (expressions.length < 1) {
            return false;
        }
        return expressions.length === 1 ? expressions[0].expression.condition.name === condition : condition === 'custom';
    }

    /**
     * @hidden @internal
     */
    public translateCondition(value: string): string {
        return this.esf.grid.resourceStrings[`igx_grid_filter_${this.getCondition(value).name}`] || value;
    }

    /**
     * @hidden @internal
     */
    public onSubMenuSelection(eventArgs: ISelectionEventArgs) {
        if (this.esf.expressionsList && this.esf.expressionsList.length &&
            this.esf.expressionsList[0].expression.condition.name !== 'in') {
            this.customDialog.expressionsList = this.esf.expressionsList;
        } else {
            this.customDialog.expressionsList = this.customDialog.expressionsList.filter(e => e.expression.fieldName === this.esf.column.field && e.expression.condition);
        }

        this.customDialog.selectedOperator = eventArgs.newSelection.value;
        eventArgs.cancel = true;
        if (this.esf.overlayComponentId) {
            this.esf.hide();
        }
        this.subMenu.close();
        this.customDialog.open(this.esf.mainDropdown.nativeElement);
    }

    /**
     * @hidden @internal
     */
    public onSubMenuClosed() {
        requestAnimationFrame(() => {
            this.shouldOpenSubMenu = true;
        });
    }

    /**
     * @hidden @internal
     */
    public showCustomFilterItem(): boolean {
        const exprTree = this.esf.column.filteringExpressionsTree;
        return exprTree && exprTree.filteringOperands && exprTree.filteringOperands.length &&
            !((exprTree.filteringOperands[0] as IFilteringExpression).condition &&
                (exprTree.filteringOperands[0] as IFilteringExpression).condition.name === 'in');
    }

    /**
     * @hidden @internal
     */
    public get subMenuText() {
        switch (this.esf.column.dataType) {
            case GridColumnDataType.Boolean:
                return this.esf.grid.resourceStrings.igx_grid_excel_boolean_filter;
            case GridColumnDataType.Number:
            case GridColumnDataType.Percent:
                return this.esf.grid.resourceStrings.igx_grid_excel_number_filter;
            case GridColumnDataType.Date:
            case GridColumnDataType.DateTime:
            case GridColumnDataType.Time:
                return this.esf.grid.resourceStrings.igx_grid_excel_date_filter;
            case GridColumnDataType.Currency:
                return this.esf.grid.resourceStrings.igx_grid_excel_currency_filter;
            default:
                return this.esf.grid.resourceStrings.igx_grid_excel_text_filter;
        }
    }

    /**
     * @hidden @internal
     */
    public get conditions() {
        return this.esf.column.filters.conditionList();
    }
}
