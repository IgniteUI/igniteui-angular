import {
    Component, Input, ViewChild, ChangeDetectorRef, ViewChildren, QueryList, ElementRef, AfterViewInit, OnDestroy, HostBinding
} from '@angular/core';
import { VerticalAlignment, HorizontalAlignment, Point, OverlaySettings } from '../../../services/overlay/utilities';
import { ConnectedPositioningStrategy } from '../../../services/overlay/position/connected-positioning-strategy';
import { IgxFilteringService } from '../grid-filtering.service';
import { IgxOverlayService } from '../../../services/overlay/overlay';
import { IgxGridBaseComponent, IgxColumnComponent } from '../../grid';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../../data-operations/filtering-expressions-tree';
import { FilteringLogic, IFilteringExpression } from '../../../data-operations/filtering-expression.interface';
import { IgxStringFilteringOperand } from '../../../data-operations/filtering-condition';
import { IgxChipComponent } from '../../../chips/chip.component';
import { IgxSelectComponent } from '../../../select/select.component';
import { IDragStartEventArgs, IDragBaseEventArgs } from '../../../directives/drag-drop/drag-drop.directive';
import { CloseScrollStrategy } from '../../../services/overlay/scroll/close-scroll-strategy';
import { IgxToggleDirective } from '../../../directives/toggle/toggle.directive';
import { IButtonGroupEventArgs } from '../../../buttonGroup/buttonGroup.component';
import { takeUntil, first } from 'rxjs/operators';
import { Subject } from 'rxjs';

class ExpressionItem {
    constructor(parent?: ExpressionGroupItem) {
        this.parent = parent;
    }
    parent: ExpressionGroupItem;
    selected: boolean;
}

class ExpressionGroupItem extends ExpressionItem {
    constructor(operator: FilteringLogic, parent?: ExpressionGroupItem) {
        super(parent);
        this.operator = operator;
        this.children = [];
    }
    operator: FilteringLogic;
    children: ExpressionItem[];
}

class ExpressionOperandItem extends ExpressionItem {
    constructor(expression: IFilteringExpression, parent: ExpressionGroupItem) {
        super(parent);
        this.expression = expression;
    }
    expression: IFilteringExpression;
    inEditMode: boolean;
    inAddMode: boolean;
    hovered: boolean;
}

@Component({
    // changeDetection: ChangeDetectionStrategy.OnPush,
    // preserveWhitespaces: false,
    selector: 'igx-advanced-filtering-dialog',
    templateUrl: './advanced-filtering-dialog.component.html'
})
export class IgxAdvancedFilteringDialogComponent implements AfterViewInit, OnDestroy {
    @Input()
    public filteringService: IgxFilteringService;

    @Input()
    public overlayComponentId: string;

    @Input()
    public overlayService: IgxOverlayService;

    public rootGroup: ExpressionGroupItem;

    public selectedExpressions: ExpressionOperandItem[] = [];

    public selectedGroups: ExpressionGroupItem[] = [];

    public currentGroup: ExpressionGroupItem;

    public editedExpression: ExpressionOperandItem;

    public addModeExpression: ExpressionOperandItem;

    public contextualGroup: ExpressionGroupItem;

    public filteringLogics;

    public selectedCondition: string;
    public searchValue: any;

    public _positionSettings = {
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalStartPoint: VerticalAlignment.Top
    };
    public _overlaySettings: OverlaySettings = {
        closeOnOutsideClick: false,
        modal: false,
        positionStrategy: new ConnectedPositioningStrategy(this._positionSettings),
        scrollStrategy: new CloseScrollStrategy()
    };

    @ViewChild('columnSelect', { read: IgxSelectComponent, static: false })
    public columnSelect: IgxSelectComponent;

    @ViewChild('conditionSelect', { read: IgxSelectComponent, static: false })
    public conditionSelect: IgxSelectComponent;

    @ViewChild('searchValueInput', { read: ElementRef, static: false })
    public searchValueInput: ElementRef;

    @ViewChild(IgxToggleDirective, { static: true })
    public contextMenuToggle: IgxToggleDirective;

    @ViewChildren(IgxChipComponent)
    public chips: QueryList<IgxChipComponent>;

    @ViewChild('expressionsContainer', { static: true })
    protected expressionsContainer: ElementRef;

    @HostBinding('style.pointer-events')
    pointerEvents = 'all';

    private destroy$ = new Subject<any>();
    private _selectedColumn: IgxColumnComponent;
    private _clickTimer;
    private _dblClickDelay = 200;
    private _preventChipClick = false;

    constructor(private element: ElementRef, public cdr: ChangeDetectorRef) { }

    public ngAfterViewInit(): void {
        this._overlaySettings.outlet = this.grid.outletDirective;
        this.contextMenuToggle.onClosed.pipe(takeUntil(this.destroy$)).subscribe((args) => {
            this.contextualGroup = null;
        });
    }

    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    public get displayDensity() {
        return this.grid.displayDensity;
    }

    public get selectedColumn(): IgxColumnComponent {
        return this._selectedColumn;
    }

    public set selectedColumn(value: IgxColumnComponent) {
        const oldValue = this._selectedColumn;

        if (this._selectedColumn !== value) {
            this._selectedColumn = value;
            if (oldValue && this._selectedColumn && this._selectedColumn.dataType !== oldValue.dataType) {
                this.selectedCondition = null;
                this.searchValue = null;
                this.cdr.detectChanges();
            }
        }
    }

    get grid(): IgxGridBaseComponent {
        return this.filteringService.grid;
    }

    get filterableColumns(): IgxColumnComponent[] {
        return this.grid.columns.filter((col) => col.filterable);
    }

    public dragStart(dragArgs: IDragStartEventArgs) {
        if (!this.contextMenuToggle.collapsed) {
            this.contextMenuToggle.element.style.display = 'none';
        }
    }

    public dragEnd(dragArgs: IDragBaseEventArgs) {
        if (!this.contextMenuToggle.collapsed) {
            this.calculateContextMenuTarget();
            this.contextMenuToggle.reposition();
            // 'flex' should be changed '' when styling class is added to contextMenuToggle
            this.contextMenuToggle.element.style.display = 'flex';
        }
    }

    public addCondition(parent: ExpressionGroupItem, afterExpression?: ExpressionItem) {
        this.cancelOperandAdd();

        const operandItem = new ExpressionOperandItem({
            fieldName: null,
            condition: null,
            ignoreCase: true,
            searchVal: null
        }, parent);

        if (afterExpression) {
            const index = parent.children.indexOf(afterExpression);
            parent.children.splice(index + 1, 0, operandItem);
        } else {
            parent.children.push(operandItem);
        }

        this.enterExpressionEdit(operandItem);
        this.scrollToBottom();
    }

    public addAndGroup(parent?: ExpressionGroupItem, afterExpression?: ExpressionItem) {
        this.addGroup(FilteringLogic.And, parent, afterExpression);
    }

    public addOrGroup(parent?: ExpressionGroupItem, afterExpression?: ExpressionItem) {
        this.addGroup(FilteringLogic.Or, parent, afterExpression);
    }

    public endGroup(groupItem: ExpressionGroupItem) {
        this.currentGroup = groupItem.parent;
    }

    public commitOperandEdit() {
        if (this.editedExpression) {
            this.editedExpression.expression.fieldName = this.selectedColumn.field;
            this.editedExpression.expression.condition = this.selectedColumn.filters.condition(this.selectedCondition);
            this.editedExpression.expression.searchVal = this.searchValue;

            this.editedExpression.inEditMode = false;
            this.editedExpression = null;
        }
    }

    public cancelOperandAdd() {
        if (this.addModeExpression) {
            this.addModeExpression.inAddMode = false;
            this.addModeExpression = null;
        }
    }

    public cancelOperandEdit() {
        if (this.editedExpression) {
            this.editedExpression.inEditMode = false;

            if (!this.editedExpression.expression.fieldName) {
                this.deleteItem(this.editedExpression);
            }

            this.editedExpression = null;
        }
    }

    public operandCanBeCommitted(): boolean {
        return this.selectedColumn && this.selectedCondition &&
            (!!this.searchValue || this.selectedColumn.filters.condition(this.selectedCondition).isUnary);
    }

    public exitOperandEdit() {
        if (!this.editedExpression) {
            return;
        }

        if (this.operandCanBeCommitted()) {
            this.commitOperandEdit();
        } else {
            this.cancelOperandEdit();
        }
    }

    public isExpressionGroup(expression: ExpressionItem): boolean {
        return expression instanceof ExpressionGroupItem;
    }

    private addGroup(operator: FilteringLogic, parent?: ExpressionGroupItem, afterExpression?: ExpressionItem) {
        this.cancelOperandAdd();

        const groupItem = new ExpressionGroupItem(operator, parent);

        if (parent) {
            if (afterExpression) {
                const index = parent.children.indexOf(afterExpression);
                parent.children.splice(index + 1, 0, groupItem);
            } else {
                parent.children.push(groupItem);
            }
        } else {
            this.rootGroup = groupItem;
        }

        this.addCondition(groupItem);
        this.currentGroup = groupItem;
    }

    private createExpressionGroupItem(expressionTree: IFilteringExpressionsTree, parent?: ExpressionGroupItem): ExpressionGroupItem {
        let groupItem: ExpressionGroupItem;
        if (expressionTree) {
            groupItem = new ExpressionGroupItem(expressionTree.operator, parent);

            for (const expr of expressionTree.filteringOperands) {
                if (expr instanceof FilteringExpressionsTree) {
                    groupItem.children.push(this.createExpressionGroupItem(expr, groupItem));
                } else {
                    const operandItem = new ExpressionOperandItem(expr as IFilteringExpression, groupItem);
                    groupItem.children.push(operandItem);
                }
            }
        }

        return groupItem;
    }

    private createExpressionsTreeFromGroupItem(groupItem: ExpressionGroupItem): FilteringExpressionsTree {
        if (!groupItem) {
            return null;
        }

        const expressionsTree = new FilteringExpressionsTree(groupItem.operator);

        for (const item of groupItem.children) {
            if (item instanceof ExpressionGroupItem) {
                const subTree = this.createExpressionsTreeFromGroupItem((item as ExpressionGroupItem));
                expressionsTree.filteringOperands.push(subTree);
            } else {
                expressionsTree.filteringOperands.push((item as ExpressionOperandItem).expression);
            }
        }

        return expressionsTree;
    }

    public onChipRemove(expressionItem: ExpressionItem) {
       this.deleteItem(expressionItem);
    }

    public onChipClick(expressionItem: ExpressionOperandItem) {
        this._clickTimer = setTimeout(() => {
            if (!this._preventChipClick) {
                this.onToggleExpression(expressionItem);
            }
            this._preventChipClick = false;
        }, this._dblClickDelay);
    }

    public onChipDblClick(expressionItem: ExpressionOperandItem) {
        clearTimeout(this._clickTimer);
        this._preventChipClick = true;
        this.enterExpressionEdit(expressionItem);
    }

    public enterExpressionEdit(expressionItem: ExpressionOperandItem) {
        this.clearSelection();
        this.cancelOperandAdd();

        if (this.editedExpression) {
            this.editedExpression.inEditMode = false;
        }

        expressionItem.hovered = false;

        this.selectedColumn = expressionItem.expression.fieldName ?
            this.grid.getColumnByName(expressionItem.expression.fieldName) : null;
        this.selectedCondition = expressionItem.expression.condition ?
            expressionItem.expression.condition.name : null;
        this.searchValue = expressionItem.expression.searchVal;

        expressionItem.inEditMode = true;
        this.editedExpression = expressionItem;

        requestAnimationFrame(() => {
            if (!this.selectedColumn) {
                this.columnSelect.input.nativeElement.focus();
            } else if (this.selectedColumn.filters.condition(this.selectedCondition).isUnary) {
                this.conditionSelect.input.nativeElement.focus();
            } else {
                this.searchValueInput.nativeElement.focus();
            }
        });
    }

    private clearSelection() {
        for (const group of this.selectedGroups) {
            group.selected = false;
        }
        this.selectedGroups = [];

        for (const expr of this.selectedExpressions) {
            expr.selected = false;
        }
        this.selectedExpressions = [];

        this.toggleContextMenu();
    }

    public enterExpressionAdd(expressionItem: ExpressionOperandItem) {
        this.clearSelection();
        this.cancelOperandEdit();

        if (this.addModeExpression) {
            this.addModeExpression.inAddMode = false;
        }

        expressionItem.inAddMode = true;
        this.addModeExpression = expressionItem;
        if (expressionItem.selected) {
            this.toggleExpression(expressionItem);
        }
    }

    private onToggleExpression(expressionItem: ExpressionOperandItem) {
        this.exitOperandEdit();
        this.toggleExpression(expressionItem);

        this.toggleContextMenu();
    }

    private toggleExpression(expressionItem: ExpressionOperandItem) {
        expressionItem.selected = !expressionItem.selected;

        if (expressionItem.selected) {
            this.selectedExpressions.push(expressionItem);
        } else {
            const index = this.selectedExpressions.indexOf(expressionItem);
            this.selectedExpressions.splice(index, 1);
            this.deselectParentRecursive(expressionItem);
        }
    }

    private toggleContextMenu() {
        const contextualGroup = this.findSingleSelectedGroup();

        if (contextualGroup || this.selectedExpressions.length > 1) {
            this.contextualGroup = contextualGroup;

            if (contextualGroup) {
                this.filteringLogics = [
                    {
                        label: this.grid.resourceStrings.igx_grid_filter_operator_and,
                        selected: contextualGroup.operator === FilteringLogic.And
                    },
                    {
                        label: this.grid.resourceStrings.igx_grid_filter_operator_or,
                        selected: contextualGroup.operator === FilteringLogic.Or
                    }
                ];
            }

            setTimeout(() => {
                this.calculateContextMenuTarget();
               if (this.contextMenuToggle.collapsed) {
                    this.contextMenuToggle.open(this._overlaySettings);
                } else {
                    this.contextMenuToggle.reposition();
                }
            }, 200);
        } else {
            this.contextMenuToggle.close();
        }
    }

    private findSingleSelectedGroup(): ExpressionGroupItem {
        for (const group of this.selectedGroups) {
            const containsAllSelectedExpressions = this.selectedExpressions.every(op => this.isInsideGroup(op, group));

            if (containsAllSelectedExpressions) {
                return group;
            }
        }

        return null;
    }

    private isInsideGroup(item: ExpressionItem, group: ExpressionGroupItem): boolean {
        if (!item) {
            return false;
        }

        if (item.parent === group) {
            return true;
        }

        return this.isInsideGroup(item.parent, group);
    }

    private deleteItem(expressionItem: ExpressionItem) {
        if (!expressionItem.parent) {
            this.rootGroup = null;
            this.currentGroup = null;
            return;
        }

        if (expressionItem === this.currentGroup) {
            this.currentGroup = this.currentGroup.parent;
        }

        const children = expressionItem.parent.children;
        const index = children.indexOf(expressionItem);
        children.splice(index, 1);

        if (!children.length) {
            this.deleteItem(expressionItem.parent);
        }
    }

    public onKeyDown(eventArgs) {
        eventArgs.stopPropagation();
    }

    public createAndGroup() {
        this.createGroup(FilteringLogic.And);
    }

    public createOrGroup() {
        this.createGroup(FilteringLogic.Or);
    }

    private createGroup(operator: FilteringLogic) {
        const chips = this.chips.toArray();
        const minIndex = this.selectedExpressions.reduce((i, e) => Math.min(i, chips.findIndex(c => c.data === e)), Number.MAX_VALUE);
        const firstExpression = chips[minIndex].data;

        const parent = firstExpression.parent;
        const groupItem = new ExpressionGroupItem(operator, parent);

        const index = parent.children.indexOf(firstExpression);
        parent.children.splice(index, 0, groupItem);

        for (const expr of this.selectedExpressions) {
            this.deleteItem(expr);
            groupItem.children.push(expr);
            expr.parent = groupItem;
        }

        this.clearSelection();
    }

    public deleteFilters() {
        for (const expr of this.selectedExpressions) {
            this.deleteItem(expr);
        }

        this.clearSelection();
    }

    public onGroupClick(groupItem: ExpressionGroupItem) {
        this.toggleGroup(groupItem);
    }

    private toggleGroup(groupItem: ExpressionGroupItem) {
        this.exitOperandEdit();
        this.toggleGroupRecursive(groupItem, !groupItem.selected);
        if (!groupItem.selected) {
            this.deselectParentRecursive(groupItem);
        }
        this.toggleContextMenu();
    }

    private toggleGroupRecursive(groupItem: ExpressionGroupItem, selected: boolean) {
        if (groupItem.selected !== selected) {
            groupItem.selected = selected;

            if (groupItem.selected) {
                this.selectedGroups.push(groupItem);
            } else {
                const index = this.selectedGroups.indexOf(groupItem);
                this.selectedGroups.splice(index, 1);
            }
        }

        for (const expr of groupItem.children) {
            if (expr instanceof ExpressionGroupItem) {
                this.toggleGroupRecursive(expr, selected);
            } else {
                const operandExpression = expr as ExpressionOperandItem;
                if (operandExpression.selected !== selected) {
                    this.toggleExpression(operandExpression);
                }
            }
        }
    }

    private deselectParentRecursive(expressionItem: ExpressionItem) {
        const parent = expressionItem.parent;
        if (parent) {
            if (parent.selected) {
                parent.selected = false;
                const index = this.selectedGroups.indexOf(parent);
                this.selectedGroups.splice(index, 1);
            }
            this.deselectParentRecursive(parent);
        }
    }

    private calculateContextMenuTarget() {
        const containerRect = this.expressionsContainer.nativeElement.getBoundingClientRect();
        const chips = this.chips.filter(c => this.selectedExpressions.includes(c.data));
        let minTop = chips.reduce((t, c) =>
            Math.min(t, c.elementRef.nativeElement.getBoundingClientRect().top), Number.MAX_VALUE);
        minTop = Math.max(containerRect.top, minTop);
        minTop = Math.min(containerRect.bottom, minTop);
        const maxRight = chips.reduce((r, c) =>
            Math.max(r, c.elementRef.nativeElement.getBoundingClientRect().right), 0);
        this._overlaySettings.positionStrategy.settings.target = new Point(maxRight, minTop);
    }

    private scrollToBottom() {
        requestAnimationFrame(() => {
            this.expressionsContainer.nativeElement.scrollTop = this.expressionsContainer.nativeElement.scrollHeight;
        });
    }

    public ungroup() {
        const selectedGroup = this.contextualGroup;
        const parent = selectedGroup.parent;
        if (parent) {
            const index = parent.children.indexOf(selectedGroup);
            parent.children.splice(index, 1, ...selectedGroup.children);

            for (const expr of selectedGroup.children) {
                expr.parent = parent;
            }
        }

        this.clearSelection();
    }

    public deleteGroup() {
        const selectedGroup = this.contextualGroup;
        const parent = selectedGroup.parent;
        if (parent) {
            const index = parent.children.indexOf(selectedGroup);
            parent.children.splice(index, 1);
        } else {
            this.rootGroup = null;
        }

        this.clearSelection();
    }

    public selectFilteringLogic(event: IButtonGroupEventArgs) {
        this.contextualGroup.operator = event.index as FilteringLogic;
    }

    public getConditionFriendlyName(name: string): string {
        return this.grid.resourceStrings[`igx_grid_filter_${name}`] || name;
    }

    public isDate(value: any) {
        return value instanceof Date;
    }

    public get inputDatePlaceholder(): string {
        return this.grid.resourceStrings['igx_grid_filter_row_date_placeholder'];
    }

    public onExpressionsScrolled() {
        if (!this.contextMenuToggle.collapsed) {
            this.calculateContextMenuTarget();
            this.contextMenuToggle.reposition();
        }
    }

    public initialize(filteringService: IgxFilteringService, overlayService: IgxOverlayService,
        overlayComponentId: string) {
        this.filteringService = filteringService;
        this.overlayService = overlayService;
        this.overlayComponentId = overlayComponentId;

        // Set pointer-events to none of the overlay content element which blocks the grid interaction after dragging
        this.overlayService.onOpened.pipe(first()).subscribe(() => {
            if (this.element.nativeElement.parentElement) {
                this.element.nativeElement.parentElement.style['pointer-events'] = 'none';
            }
        });

        if (this.grid.advancedFilteringExpressionsTree) {
            this.rootGroup = this.createExpressionGroupItem(this.grid.advancedFilteringExpressionsTree);
            this.currentGroup = this.rootGroup;
        }
    }

    public context(expression: ExpressionItem, afterExpression?: ExpressionItem) {
        return {
            $implicit: expression,
            afterExpression
        };
    }

    public onClearButtonClick() {
        this.cancelOperandAdd();
        this.cancelOperandEdit();
        this.selectedExpressions = [];
        this.selectedGroups = [];
        this.currentGroup = null;
        this.rootGroup = null;
        this.grid.advancedFilteringExpressionsTree = null;
    }

    public closeDialog() {
        if (this.overlayComponentId) {
            this.overlayService.hide(this.overlayComponentId);
        }
    }

    public applyChanges() {
        this.exitOperandEdit();
        this.grid.advancedFilteringExpressionsTree = this.createExpressionsTreeFromGroupItem(this.rootGroup);
    }

    public onApplyButtonClick() {
        this.applyChanges();
        this.closeDialog();
    }
}
