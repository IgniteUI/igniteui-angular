import { CommonModule } from '@angular/common';
import { ContentChild, Directive, Optional } from '@angular/core';
import { Inject } from '@angular/core';
import {
    Component, Input, ViewChild, ChangeDetectorRef, ViewChildren, QueryList, ElementRef, AfterViewInit, OnDestroy, HostBinding, NgModule
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { editor } from '@igniteui/material-icons-extended';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IButtonGroupEventArgs } from '../buttonGroup/buttonGroup.component';
import { IgxChipComponent } from '../chips/chip.component';
import { IgxChipsModule } from '../chips/chips.module';
import { DisplayDensityBase, DisplayDensityToken, IDisplayDensityOptions } from '../core/displayDensity';
import { PlatformUtil } from '../core/utils';
import { DataUtil, GridColumnDataType } from '../data-operations/data-util';
import { IgxBooleanFilteringOperand, IgxDateFilteringOperand, IgxDateTimeFilteringOperand, IgxFilteringOperand, IgxNumberFilteringOperand, IgxStringFilteringOperand, IgxTimeFilteringOperand } from '../data-operations/filtering-condition';
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IgxDatePickerComponent } from '../date-picker/date-picker.component';
import { IgxDatePickerModule } from '../date-picker/date-picker.module';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxDragDropModule } from '../directives/drag-drop/drag-drop.directive';
import { IgxOverlayOutletDirective, IgxToggleDirective, IgxToggleModule } from '../directives/toggle/toggle.directive';
import { ColumnType, GridType } from '../grids/common/grid.interface';
import { IActiveNode } from '../grids/grid-navigation.service';
import { IgxIconModule, IgxIconService } from '../icon/public_api';
import { IgxSelectComponent } from '../select/select.component';
import { IgxSelectModule } from '../select/select.module';
import { IgxOverlayService } from '../services/overlay/overlay';
import { HorizontalAlignment, OverlaySettings, Point, VerticalAlignment } from '../services/overlay/utilities';
import { AbsoluteScrollStrategy, AutoPositionStrategy, CloseScrollStrategy, ConnectedPositioningStrategy } from '../services/public_api';
import { IgxTimePickerComponent } from '../time-picker/time-picker.component';

@Directive({
    selector: 'igx-query-builder-header, [igxQueryBuilderHeader]'
})
export class IgxQueryBuilderHeaderDirective { }

export interface IQueryBuilderField {
    /** The field label */
    label?: string;
    /** The name of the data field */
    fieldName: string;
    /** The field data type */
    //TODO rename the type so that it isn't related to the grid column/define another type/set it as string
    dataType: GridColumnDataType;
    /** The filter conditions for the specified field */
    filteringOperands?: IgxFilteringOperand;
}
/**
 * @hidden
 */
class ExpressionItem {
    public parent: ExpressionGroupItem;
    public selected: boolean;
    constructor(parent?: ExpressionGroupItem) {
        this.parent = parent;
    }
}

/**
 * @hidden
 */
class ExpressionGroupItem extends ExpressionItem {
    public operator: FilteringLogic;
    public children: ExpressionItem[];
    constructor(operator: FilteringLogic, parent?: ExpressionGroupItem) {
        super(parent);
        this.operator = operator;
        this.children = [];
    }
}

/**
 * @hidden
 */
class ExpressionOperandItem extends ExpressionItem {
    public expression: IFilteringExpression;
    public inEditMode: boolean;
    public inAddMode: boolean;
    public hovered: boolean;
    public fieldLabel: string;
    constructor(expression: IFilteringExpression, parent: ExpressionGroupItem) {
        super(parent);
        this.expression = expression;
    }
}

@Component({
    selector: 'igx-query-builder',
    templateUrl: './query-builder.component.html',
    styleUrls: ['./query-builder.component.css']
})
export class IgxQueryBuilderComponent extends DisplayDensityBase implements AfterViewInit, OnDestroy {


    /**
     * @hidden @internal
     */
    @ViewChild('fieldSelect', { read: IgxSelectComponent })
    public fieldSelect: IgxSelectComponent;

    /**
     * @hidden @internal
     */
    @ViewChild('conditionSelect', { read: IgxSelectComponent })
    public conditionSelect: IgxSelectComponent;

    /**
     * @hidden @internal
     */
    @ViewChild('searchValueInput', { read: ElementRef })
    public searchValueInput: ElementRef;

    /**
     * @hidden @internal
     */
    @ViewChild('picker')
    public picker: IgxDatePickerComponent | IgxTimePickerComponent;

    /**
     * @hidden @internal
     */
    @ViewChild('addRootAndGroupButton', { read: ElementRef })
    public addRootAndGroupButton: ElementRef;

    /**
     * @hidden @internal
     */
    @ViewChild('addConditionButton', { read: ElementRef })
    public addConditionButton: ElementRef;

    /**
     * @hidden
     */
    @ContentChild(IgxQueryBuilderHeaderDirective, { read: IgxQueryBuilderHeaderDirective })
    protected headerContent: IgxQueryBuilderHeaderDirective;
    
    public get isHeaderContentVisible(): boolean {
        return this.headerContent ? true : false;
    }

    /**
     * @hidden @internal
     */
    @ViewChild('editingInputsContainer', { read: ElementRef })
    public set editingInputsContainer(value: ElementRef) {
        if ((value && !this._editingInputsContainer) ||
            (value && this._editingInputsContainer && this._editingInputsContainer.nativeElement !== value.nativeElement)) {
            requestAnimationFrame(() => {
                this.scrollElementIntoView(value.nativeElement);
            });
        }

        this._editingInputsContainer = value;
    }

    /**
     * @hidden @internal
     */
    public get editingInputsContainer(): ElementRef {
        return this._editingInputsContainer;
    }

    /**
     * @hidden @internal
     */
    @ViewChild('addModeContainer', { read: ElementRef })
    public set addModeContainer(value: ElementRef) {
        if ((value && !this._addModeContainer) ||
            (value && this._addModeContainer && this._addModeContainer.nativeElement !== value.nativeElement)) {
            requestAnimationFrame(() => {
                this.scrollElementIntoView(value.nativeElement);
            });
        }

        this._addModeContainer = value;
    }

    /**
     * @hidden @internal
     */
    public get addModeContainer(): ElementRef {
        return this._addModeContainer;
    }

    /**
     * @hidden @internal
     */
    @ViewChild('currentGroupButtonsContainer', { read: ElementRef })
    public set currentGroupButtonsContainer(value: ElementRef) {
        if ((value && !this._currentGroupButtonsContainer) ||
            (value && this._currentGroupButtonsContainer && this._currentGroupButtonsContainer.nativeElement !== value.nativeElement)) {
            requestAnimationFrame(() => {
                this.scrollElementIntoView(value.nativeElement);
            });
        }

        this._currentGroupButtonsContainer = value;
    }

    /**
     * @hidden @internal
     */
    public get currentGroupButtonsContainer(): ElementRef {
        return this._currentGroupButtonsContainer;
    }

    /**
     * @hidden @internal
     */
    @ViewChild(IgxToggleDirective)
    public contextMenuToggle: IgxToggleDirective;

    /**
     * @hidden @internal
     */
    @ViewChildren(IgxChipComponent)
    public chips: QueryList<IgxChipComponent>;

    /**
     * @hidden @internal
     */
    @HostBinding('style.display')
    public display = 'block';

    /**
     * @hidden @internal
     */
    @ViewChild('expressionsContainer')
    protected expressionsContainer: ElementRef;

    /**
     * @hidden @internal
     */
    @ViewChild('overlayOutlet', { read: IgxOverlayOutletDirective, static: true })
    protected overlayOutlet: IgxOverlayOutletDirective;

    /**
     * @hidden @internal
     */
    public inline = true;
    /**
     * @hidden @internal
     */
    public rootGroup: ExpressionGroupItem;

    /**
     * @hidden @internal
     */
    public selectedExpressions: ExpressionOperandItem[] = [];

    /**
     * @hidden @internal
     */
    public selectedGroups: ExpressionGroupItem[] = [];

    /**
     * @hidden @internal
     */
    public currentGroup: ExpressionGroupItem;

    /**
     * @hidden @internal
     */
    public editedExpression: ExpressionOperandItem;

    /**
     * @hidden @internal
     */
    public addModeExpression: ExpressionOperandItem;

    /**
     * @hidden @internal
     */
    public contextualGroup: ExpressionGroupItem;

    /**
     * @hidden @internal
     */
    public filteringLogics;

    /**
     * @hidden @internal
     */
    public selectedCondition: string;

    /**
     * @hidden @internal
     */
    public searchValue: any;

    /**
     * @hidden @internal
     */
    public lastActiveNode = {} as IActiveNode;

    /**
     * @hidden @internal
     */
    public columnSelectOverlaySettings: OverlaySettings = {
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnOutsideClick: false
    };

    /**
     * @hidden @internal
     */
    public conditionSelectOverlaySettings: OverlaySettings = {
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnOutsideClick: false
    };

    private destroy$ = new Subject<any>();
    private _overlayComponentId: string;
    private _overlayService: IgxOverlayService;
    private _selectedColumn: ColumnType;
    private _selectedField: IQueryBuilderField;
    private _clickTimer;
    private _dblClickDelay = 200;
    private _preventChipClick = false;
    private _editingInputsContainer: ElementRef;
    private _addModeContainer: ElementRef;
    private _currentGroupButtonsContainer: ElementRef;
    private _grid: GridType;
    private _fields: IQueryBuilderField[];
    private _filteringChange: Subscription;

    private _positionSettings = {
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalStartPoint: VerticalAlignment.Top
    };

    private _overlaySettings: OverlaySettings = {
        closeOnOutsideClick: false,
        modal: false,
        positionStrategy: new ConnectedPositioningStrategy(this._positionSettings),
        scrollStrategy: new CloseScrollStrategy()
    };

    constructor(public cdr: ChangeDetectorRef, protected iconService: IgxIconService, protected platform: PlatformUtil, @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions?: IDisplayDensityOptions) {
        super(_displayDensityOptions);
    }

    /**
     * @hidden @internal
     */
    public ngAfterViewInit(): void {
        this._overlaySettings.outlet = this.overlayOutlet;
        this.columnSelectOverlaySettings.outlet = this.overlayOutlet;
        this.conditionSelectOverlaySettings.outlet = this.overlayOutlet;
    }

    /**
     * @hidden @internal
     */
    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    // /**
    //  * @hidden @internal
    //  */
    // public get selectedColumn(): ColumnType {
    //     return this._selectedColumn;
    // }
    // /**
    //  * @hidden @internal
    //  */
    //  public set selectedColumn(value: ColumnType) {
    //     const oldValue = this._selectedColumn;

    //     if (this._selectedColumn !== value) {
    //         this._selectedColumn = value;
    //         if (oldValue && this._selectedColumn && this._selectedColumn.dataType !== oldValue.dataType) {
    //             this.selectedCondition = null;
    //             this.searchValue = null;
    //             this.cdr.detectChanges();
    //         }
    //     }
    // }

    /**
     * @hidden @internal
     */
    public set selectedField(value: IQueryBuilderField) {
        const oldValue = this._selectedField;

        if (this._selectedField !== value) {
            this._selectedField = value;
            if (oldValue && this._selectedField && this._selectedField.dataType !== oldValue.dataType) {
                this.selectedCondition = null;
                this.searchValue = null;
                this.cdr.detectChanges();
            }
        }
    }

    /**
     * @hidden @internal
     */
    public get selectedField(): IQueryBuilderField {
        return this._selectedField;
    }

    /**
     * An @Input property that sets the grid.
     */
    @Input()
    public set grid(grid: GridType) {
        this._grid = grid;

        if (this._filteringChange) {
            this._filteringChange.unsubscribe();
        }

        if (this._grid) {
            this._grid.filteringService.registerSVGIcons();

            this._filteringChange = this._grid.advancedFilteringExpressionsTreeChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.init();
            });

            this.init();
        }
    }

    /**
     * Returns the grid.
     */
    public get grid(): GridType {
        return this._grid;
    }

    /**
     * An @Input property that sets the fields.
     */
    @Input()
    public set fields(fields: IQueryBuilderField[]) {
        this._fields = fields;

        if (this._filteringChange) {
            this._filteringChange.unsubscribe();
        }

        if (this._fields) {
            this.registerSVGIcons();

            this._fields.forEach(field => this.setFilteringOperands(field));

            // this._filteringChange = this._grid.advancedFilteringExpressionsTreeChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            //     this.init();
            // });

            this.init();
        }
    }

    /**
    * Returns the fields.
    */
    public get fields(): IQueryBuilderField[] {
        return this._fields;
    }

    /**
     * @hidden @internal
     */
    public get hasEditedExpression(): boolean {
        return this.editedExpression !== undefined && this.editedExpression !== null;
    }

    /**
     * @hidden @internal
     */
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
    }

    /**
     * @hidden @internal
     */
    public addAndGroup(parent?: ExpressionGroupItem, afterExpression?: ExpressionItem) {
        this.addGroup(FilteringLogic.And, parent, afterExpression);
    }

    /**
     * @hidden @internal
     */
    public addOrGroup(parent?: ExpressionGroupItem, afterExpression?: ExpressionItem) {
        this.addGroup(FilteringLogic.Or, parent, afterExpression);
    }

    /**
     * @hidden @internal
     */
    public endGroup(groupItem: ExpressionGroupItem) {
        this.currentGroup = groupItem.parent;
    }

    /**
     * @hidden @internal
     */
    public commitOperandEdit() {
        if (this.editedExpression) {
            this.editedExpression.expression.fieldName = this.selectedField.fieldName;
            this.editedExpression.expression.condition = this.selectedField.filteringOperands.condition(this.selectedCondition);
            this.editedExpression.expression.searchVal = DataUtil.parseValue(this.selectedField.dataType, this.searchValue);
            this.editedExpression.fieldLabel = this.selectedField.label ? this.selectedField.label : this.selectedField.fieldName;

            this.editedExpression.inEditMode = false;
            this.editedExpression = null;
        }
    }

    /**
     * @hidden @internal
     */
    public cancelOperandAdd() {
        if (this.addModeExpression) {
            this.addModeExpression.inAddMode = false;
            this.addModeExpression = null;
        }
    }

    /**
     * @hidden @internal
     */
    public cancelOperandEdit() {
        if (this.editedExpression) {
            this.editedExpression.inEditMode = false;

            if (!this.editedExpression.expression.fieldName) {
                this.deleteItem(this.editedExpression);
            }

            this.editedExpression = null;
        }
    }

    /**
     * @hidden @internal
     */
    public operandCanBeCommitted(): boolean {
        //TODO check if !! is needed here
        return !!this.selectedField && !!this.selectedCondition; // &&
        //TODO conditions
        //(!!this.searchValue || this.selectedColumn.filters.condition(this.selectedCondition).isUnary);
    }

    /**
     * @hidden @internal
     */
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

    /**
     * @hidden @internal
     */
    public isExpressionGroup(expression: ExpressionItem): boolean {
        return expression instanceof ExpressionGroupItem;
    }

    /**
     * @hidden @internal
     */
    public onChipRemove(expressionItem: ExpressionItem) {
        this.deleteItem(expressionItem);
    }

    /**
     * @hidden @internal
     */
    public onChipClick(expressionItem: ExpressionOperandItem) {
        this._clickTimer = setTimeout(() => {
            if (!this._preventChipClick) {
                this.onToggleExpression(expressionItem);
            }
            this._preventChipClick = false;
        }, this._dblClickDelay);
    }

    /**
     * @hidden @internal
     */
    public onChipDblClick(expressionItem: ExpressionOperandItem) {
        clearTimeout(this._clickTimer);
        this._preventChipClick = true;
        this.enterExpressionEdit(expressionItem);
    }

    /**
     * @hidden @internal
     */
    public enterExpressionEdit(expressionItem: ExpressionOperandItem) {
        this.clearSelection();
        this.exitOperandEdit();
        this.cancelOperandAdd();

        if (this.editedExpression) {
            this.editedExpression.inEditMode = false;
        }

        expressionItem.hovered = false;

        this.selectedField = expressionItem.expression.fieldName ?
            this.fields.filter(field => field.fieldName === expressionItem.expression.fieldName)[0] : null;
        this.selectedCondition = expressionItem.expression.condition ?
            expressionItem.expression.condition.name : null;
        this.searchValue = expressionItem.expression.searchVal;

        expressionItem.inEditMode = true;
        this.editedExpression = expressionItem;

        this.cdr.detectChanges();

        this.columnSelectOverlaySettings.target = this.fieldSelect.element;
        this.columnSelectOverlaySettings.excludeFromOutsideClick = [this.fieldSelect.element as HTMLElement];
        this.columnSelectOverlaySettings.positionStrategy = new AutoPositionStrategy();
        this.conditionSelectOverlaySettings.target = this.conditionSelect.element;
        this.conditionSelectOverlaySettings.excludeFromOutsideClick = [this.conditionSelect.element as HTMLElement];
        this.conditionSelectOverlaySettings.positionStrategy = new AutoPositionStrategy();

        if (!this.selectedField) {
            this.fieldSelect.input.nativeElement.focus();
            //TODO conditions
            // } else if (this.selectedColumn.filters.condition(this.selectedCondition).isUnary) {
            //     this.conditionSelect.input.nativeElement.focus();
        } else {
            const input = this.searchValueInput?.nativeElement || this.picker?.getEditElement();
            input.focus();
        }
    }

    /**
     * @hidden @internal
     */
    public clearSelection() {
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

    /**
     * @hidden @internal
     */
    public enterExpressionAdd(expressionItem: ExpressionOperandItem) {
        this.clearSelection();
        this.exitOperandEdit();

        if (this.addModeExpression) {
            this.addModeExpression.inAddMode = false;
        }

        expressionItem.inAddMode = true;
        this.addModeExpression = expressionItem;
        if (expressionItem.selected) {
            this.toggleExpression(expressionItem);
        }
    }

    /**
     * @hidden @internal
     */
    public contextMenuClosed() {
        this.contextualGroup = null;
    }

    /**
     * @hidden @internal
     */
    public onKeyDown(eventArgs: KeyboardEvent) {
        eventArgs.stopPropagation();
        const key = eventArgs.key;
        if (!this.contextMenuToggle.collapsed && (key === this.platform.KEYMAP.ESCAPE)) {
            this.clearSelection();
        }
    }

    /**
     * @hidden @internal
     */
    public createAndGroup() {
        this.createGroup(FilteringLogic.And);
    }

    /**
     * @hidden @internal
     */
    public createOrGroup() {
        this.createGroup(FilteringLogic.Or);
    }

    /**
     * @hidden @internal
     */
    public deleteFilters() {
        for (const expr of this.selectedExpressions) {
            this.deleteItem(expr);
        }

        this.clearSelection();
    }

    /**
     * @hidden @internal
     */
    public onGroupClick(groupItem: ExpressionGroupItem) {
        this.toggleGroup(groupItem);
    }

    /**
     * @hidden @internal
     */
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

    /**
     * @hidden @internal
     */
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

    /**
     * @hidden @internal
     */
    public selectFilteringLogic(event: IButtonGroupEventArgs) {
        this.contextualGroup.operator = event.index as FilteringLogic;
    }

    /**
     * @hidden @internal
     */
    public getConditionFriendlyName(name: string): string {
        //TODO resource strings
        //return this.grid.resourceStrings[`igx_grid_filter_${name}`] || name;
        return name;
    }

    /**
     * @hidden @internal
     */
    public isDate(value: any) {
        return value instanceof Date;
    }

    /**
     * @hidden @internal
     */
    public onExpressionsScrolled() {
        if (!this.contextMenuToggle.collapsed) {
            this.calculateContextMenuTarget();
            this.contextMenuToggle.reposition();
        }
    }

    /**
     * @hidden @internal
     */
    public invokeClick(eventArgs: KeyboardEvent) {
        if (this.platform.isActivationKey(eventArgs)) {
            eventArgs.preventDefault();
            (eventArgs.currentTarget as HTMLElement).click();
        }
    }

    /** @hidden @internal */
    public openPicker(args: KeyboardEvent) {
        if (this.platform.isActivationKey(args)) {
            args.preventDefault();
            this.picker.open();
        }
    }

    /**
     * @hidden @internal
     */
    public onOutletPointerDown(event) {
        // This prevents closing the select's dropdown when clicking the scroll
        event.preventDefault();
    }

    /**
     * @hidden @internal
     */
    public getConditionList(): string[] {
        return this.selectedField ? this.selectedField.filteringOperands.conditionList() : [];
    }

    /**
     * @hidden @internal
     */
    public initialize(grid: GridType, overlayService: IgxOverlayService,
        overlayComponentId: string) {
        this.inline = false;
        this.grid = grid;
        this._overlayService = overlayService;
        this._overlayComponentId = overlayComponentId;
    }

    /**
     * @hidden @internal
     */
    public getFormatter(field: string) {
        //TODO formatter
        return this.grid.getColumnByName(field).formatter;
    }

    /**
     * @hidden @internal
     */
    public getFormat(field: string) {
        //TODO formatter
        return this.grid.getColumnByName(field).pipeArgs.format;
    }

    /**
     * @hidden @internal
     */
    public getTimezone(field: string) {
        //TODO formatter time-zone
        return this.grid.getColumnByName(field).pipeArgs.timezone;
    }

    /**
     * @hidden @internal
     */
    public setAddButtonFocus() {
        if (this.addRootAndGroupButton) {
            this.addRootAndGroupButton.nativeElement.focus();
        } else if (this.addConditionButton) {
            this.addConditionButton.nativeElement.focus();
        }
    }

    /**
     * @hidden @internal
     */
    public context(expression: ExpressionItem, afterExpression?: ExpressionItem) {
        return {
            $implicit: expression,
            afterExpression
        };
    }

    /**
     * @hidden @internal
     */
    public onChipSelectionEnd() {
        const contextualGroup = this.findSingleSelectedGroup();
        if (contextualGroup || this.selectedExpressions.length > 1) {
            this.contextualGroup = contextualGroup;
            this.calculateContextMenuTarget();
            if (this.contextMenuToggle.collapsed) {
                this.contextMenuToggle.open(this._overlaySettings);
            } else {
                this.contextMenuToggle.reposition();
            }
        }
    }

    private setFilteringOperands(field: IQueryBuilderField) {
        if (!Array.isArray(field.filteringOperands) || !field.filteringOperands.length) {
            switch (field.dataType) {
                case GridColumnDataType.Boolean:
                    field.filteringOperands = IgxBooleanFilteringOperand.instance();
                    break;
                case GridColumnDataType.Number:
                case GridColumnDataType.Currency:
                case GridColumnDataType.Percent:
                    field.filteringOperands = IgxNumberFilteringOperand.instance();
                    break;
                case GridColumnDataType.Date:
                    field.filteringOperands = IgxDateFilteringOperand.instance();
                    break;
                case GridColumnDataType.Time:
                    field.filteringOperands = IgxTimeFilteringOperand.instance();
                    break;
                case GridColumnDataType.DateTime:
                    field.filteringOperands = IgxDateTimeFilteringOperand.instance();
                    break;
                case GridColumnDataType.String:
                default:
                    field.filteringOperands = IgxStringFilteringOperand.instance();
                    break;
            }

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

    //TODO set default expressiontree
    private createExpressionGroupItem(expressionTree: IFilteringExpressionsTree, parent?: ExpressionGroupItem): ExpressionGroupItem {
        let groupItem: ExpressionGroupItem;
        if (expressionTree) {
            groupItem = new ExpressionGroupItem(expressionTree.operator, parent);

            for (const expr of expressionTree.filteringOperands) {
                if (expr instanceof FilteringExpressionsTree) {
                    groupItem.children.push(this.createExpressionGroupItem(expr, groupItem));
                } else {
                    const filteringExpr = expr as IFilteringExpression;
                    const exprCopy: IFilteringExpression = {
                        fieldName: filteringExpr.fieldName,
                        condition: filteringExpr.condition,
                        searchVal: filteringExpr.searchVal,
                        ignoreCase: filteringExpr.ignoreCase
                    };
                    const operandItem = new ExpressionOperandItem(exprCopy, groupItem);
                    const column = this.grid.getColumnByName(filteringExpr.fieldName);
                    operandItem.fieldLabel = column.header;
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
        } else if (this.contextMenuToggle) {
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

    private toggleGroup(groupItem: ExpressionGroupItem) {
        this.exitOperandEdit();
        if (groupItem.children && groupItem.children.length) {
            this.toggleGroupRecursive(groupItem, !groupItem.selected);
            if (!groupItem.selected) {
                this.deselectParentRecursive(groupItem);
            }
            this.toggleContextMenu();
        }
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
        const chips = this.chips.filter(c => this.selectedExpressions.indexOf(c.data) !== -1);
        let minTop = chips.reduce((t, c) =>
            Math.min(t, c.nativeElement.getBoundingClientRect().top), Number.MAX_VALUE);
        minTop = Math.max(containerRect.top, minTop);
        minTop = Math.min(containerRect.bottom, minTop);
        let maxRight = chips.reduce((r, c) =>
            Math.max(r, c.nativeElement.getBoundingClientRect().right), 0);
        maxRight = Math.max(maxRight, containerRect.left);
        maxRight = Math.min(maxRight, containerRect.right);
        this._overlaySettings.target = new Point(maxRight, minTop);
    }

    private scrollElementIntoView(target: HTMLElement) {
        const container = this.expressionsContainer.nativeElement;
        const targetOffset = target.offsetTop - container.offsetTop;
        const delta = 10;

        if (container.scrollTop + delta > targetOffset) {
            container.scrollTop = targetOffset - delta;
        } else if (container.scrollTop + container.clientHeight < targetOffset + target.offsetHeight + delta) {
            container.scrollTop = targetOffset + target.offsetHeight + delta - container.clientHeight;
        }
    }

    private init() {
        this.clearSelection();
        this.cancelOperandAdd();
        this.cancelOperandEdit();
        //TODO set default expressionstree
        //this.rootGroup = this.createExpressionGroupItem(this.grid.advancedFilteringExpressionsTree);
        this.currentGroup = this.rootGroup;
    }

    private registerSVGIcons(): void {
        const editorIcons = editor as any[];
        editorIcons.forEach(icon => this.iconService.addSvgIconFromText(icon.name, icon.value, 'imx-icons'));
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxQueryBuilderComponent, IgxQueryBuilderHeaderDirective],
    exports: [IgxQueryBuilderComponent, IgxQueryBuilderHeaderDirective],
    imports: [
        CommonModule,
        FormsModule,
        IgxButtonModule,
        IgxDatePickerModule,
        IgxChipsModule,
        IgxDragDropModule,
        IgxIconModule,
        IgxSelectModule,
        IgxToggleModule
    ]
})
export class IgxQueryBuilderModule { }