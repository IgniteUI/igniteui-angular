import { AfterViewInit, ContentChild, EventEmitter, LOCALE_ID, Output, Pipe, PipeTransform } from '@angular/core';
import { getLocaleFirstDayOfWeek, NgIf, NgFor, NgTemplateOutlet, NgClass, DatePipe } from '@angular/common';
import { Inject } from '@angular/core';
import {
    Component, Input, ViewChild, ChangeDetectorRef, ViewChildren, QueryList, ElementRef, OnDestroy, HostBinding
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { editor } from '@igniteui/material-icons-extended';
import { IButtonGroupEventArgs, IgxButtonGroupComponent } from '../buttonGroup/buttonGroup.component';
import { IgxChipComponent } from '../chips/chip.component';
import { IQueryBuilderResourceStrings, QueryBuilderResourceStringsEN } from '../core/i18n/query-builder-resources';
import { PlatformUtil } from '../core/utils';
import { DataType, DataUtil } from '../data-operations/data-util';
import { IgxBooleanFilteringOperand, IgxDateFilteringOperand, IgxDateTimeFilteringOperand, IgxNumberFilteringOperand, IgxStringFilteringOperand, IgxTimeFilteringOperand } from '../data-operations/filtering-condition';
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { FilteringExpressionsTree, IExpressionTree } from '../data-operations/filtering-expressions-tree';
import { IgxDatePickerComponent } from '../date-picker/date-picker.component';

import { IgxButtonDirective } from '../directives/button/button.directive';
import { IgxDateTimeEditorDirective } from '../directives/date-time-editor/date-time-editor.directive';

import { IgxOverlayOutletDirective, IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { FieldType } from '../grids/common/grid.interface';
import { IgxIconService } from '../icon/icon.service';
import { IgxSelectComponent } from '../select/select.component';
import { HorizontalAlignment, OverlaySettings, Point, VerticalAlignment } from '../services/overlay/utilities';
import { AbsoluteScrollStrategy, AutoPositionStrategy, CloseScrollStrategy, ConnectedPositioningStrategy } from '../services/public_api';
import { IgxTimePickerComponent } from '../time-picker/time-picker.component';
import { IgxQueryBuilderHeaderComponent } from './query-builder-header.component';
import { IgxPickerToggleComponent, IgxPickerClearComponent } from '../date-common/picker-icons.common';
import { IgxInputDirective } from '../directives/input/input.directive';
import { IgxInputGroupComponent } from '../input-group/input-group.component';
import { IgxSelectItemComponent } from '../select/select-item.component';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';
import { IgxPrefixDirective } from '../directives/prefix/prefix.directive';
import { IgxIconComponent } from '../icon/icon.component';
import { getCurrentResourceStrings } from '../core/i18n/resources';
import { IgxIconButtonDirective } from '../directives/button/icon-button.directive';

const DEFAULT_PIPE_DATE_FORMAT = 'mediumDate';
const DEFAULT_PIPE_TIME_FORMAT = 'mediumTime';
const DEFAULT_PIPE_DATE_TIME_FORMAT = 'medium';
const DEFAULT_PIPE_DIGITS_INFO = '1.0-3';
const DEFAULT_DATE_TIME_FORMAT = 'dd/MM/yyyy HH:mm:ss a';
const DEFAULT_TIME_FORMAT = 'hh:mm:ss a';

@Pipe({
    name: 'fieldFormatter',
    standalone: true
})
export class IgxFieldFormatterPipe implements PipeTransform {

    public transform(value: any, formatter: (v: any, data: any, fieldData?: any) => any, rowData: any, fieldData?: any) {
        return formatter(value, rowData, fieldData);
    }
}

/**
 * @hidden @internal
 *
 * Internal class usage
 */
class ExpressionItem {
    public parent: ExpressionGroupItem;
    public selected: boolean;
    constructor(parent?: ExpressionGroupItem) {
        this.parent = parent;
    }
}

/**
 * @hidden @internal
 *
 * Internal class usage
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
 * @hidden @internal
 *
 * Internal class usage
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

/**
 * A component used for operating with complex filters by creating or editing conditions
 * and grouping them using AND/OR logic.
 * It is used internally in the Advanced Filtering of the Grid.
 *
 * @example
 * ```html
 * <igx-query-builder [fields]="this.fields">
 * </igx-query-builder>
 * ```
 */
@Component({
    selector: 'igx-query-builder',
    templateUrl: './query-builder.component.html',
    imports: [NgIf, IgxQueryBuilderHeaderComponent, IgxButtonDirective, IgxIconComponent, IgxChipComponent, IgxPrefixDirective, IgxSuffixDirective, IgxSelectComponent, FormsModule, NgFor, IgxSelectItemComponent, IgxInputGroupComponent, IgxInputDirective, IgxDatePickerComponent, IgxPickerToggleComponent, IgxPickerClearComponent, IgxTimePickerComponent, IgxDateTimeEditorDirective, NgTemplateOutlet, NgClass, IgxToggleDirective, IgxButtonGroupComponent, IgxOverlayOutletDirective, DatePipe, IgxFieldFormatterPipe, IgxIconButtonDirective]
})
export class IgxQueryBuilderComponent implements AfterViewInit, OnDestroy {
    /**
     * @hidden @internal
     */
    @HostBinding('class.igx-query-builder')
    public cssClass = 'igx-query-builder';

    /**
     * @hidden @internal
     */
    @HostBinding('style.display')
    public display = 'block';

    /**
    * Returns the fields.
    */
    public get fields(): FieldType[] {
        return this._fields;
    }

    /**
     * Sets the fields.
     */
    @Input()
    public set fields(fields: FieldType[]) {
        this._fields = fields;

        if (this._fields) {
            this.registerSVGIcons();

            this._fields.forEach(field => {
                this.setFilters(field);
                this.setFormat(field);
            });
        }
    }

    /**
    * Returns the expression tree.
    */
     public get expressionTree(): IExpressionTree {
        return this._expressionTree;
    }

    /**
     * Sets the expression tree.
     */
    @Input()
    public set expressionTree(expressionTree: IExpressionTree) {
        this._expressionTree = expressionTree;

        this.init();
    }

    /**
     * Gets the `locale` of the query builder.
     * If not set, defaults to application's locale.
     */
    @Input()
    public get locale(): string {
        return this._locale;
    }

    /**
     * Sets the `locale` of the query builder.
     * Expects a valid BCP 47 language tag.
     */
    public set locale(value: string) {
        this._locale = value;
        // if value is invalid, set it back to _localeId
        try {
            getLocaleFirstDayOfWeek(this._locale);
        } catch (e) {
            this._locale = this._localeId;
        }
    }

    /**
     * Sets the resource strings.
     * By default it uses EN resources.
     */
    @Input()
    public set resourceStrings(value: IQueryBuilderResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    /**
     * Returns the resource strings.
     */
    public get resourceStrings(): IQueryBuilderResourceStrings {
        return this._resourceStrings;
    }

    /**
     * Event fired as the expression tree is changed.
     *
     * ```html
     *  <igx-query-builder (expressionTreeChange)='onExpressionTreeChange()'></igx-query-builder>
     * ```
     */
    @Output()
    public expressionTreeChange = new EventEmitter();

    @ViewChild('fieldSelect', { read: IgxSelectComponent })
    private fieldSelect: IgxSelectComponent;

    @ViewChild('conditionSelect', { read: IgxSelectComponent })
    private conditionSelect: IgxSelectComponent;

    @ViewChild('searchValueInput', { read: ElementRef })
    private searchValueInput: ElementRef;

    @ViewChild('picker')
    private picker: IgxDatePickerComponent | IgxTimePickerComponent;

    @ViewChild('addRootAndGroupButton', { read: ElementRef })
    private addRootAndGroupButton: ElementRef;

    @ViewChild('addConditionButton', { read: ElementRef })
    private addConditionButton: ElementRef;

    /**
     * @hidden @internal
     */
    @ContentChild(IgxQueryBuilderHeaderComponent)
    public headerContent: IgxQueryBuilderHeaderComponent;

    @ViewChild('editingInputsContainer', { read: ElementRef })
    protected set editingInputsContainer(value: ElementRef) {
        if ((value && !this._editingInputsContainer) ||
            (value && this._editingInputsContainer && this._editingInputsContainer.nativeElement !== value.nativeElement)) {
            requestAnimationFrame(() => {
                this.scrollElementIntoView(value.nativeElement);
            });
        }

        this._editingInputsContainer = value;
    }

    /** @hidden */
    protected get editingInputsContainer(): ElementRef {
        return this._editingInputsContainer;
    }

    @ViewChild('addModeContainer', { read: ElementRef })
    protected set addModeContainer(value: ElementRef) {
        if ((value && !this._addModeContainer) ||
            (value && this._addModeContainer && this._addModeContainer.nativeElement !== value.nativeElement)) {
            requestAnimationFrame(() => {
                this.scrollElementIntoView(value.nativeElement);
            });
        }

        this._addModeContainer = value;
    }

    /** @hidden */
    protected get addModeContainer(): ElementRef {
        return this._addModeContainer;
    }

    @ViewChild('currentGroupButtonsContainer', { read: ElementRef })
    protected set currentGroupButtonsContainer(value: ElementRef) {
        if ((value && !this._currentGroupButtonsContainer) ||
            (value && this._currentGroupButtonsContainer && this._currentGroupButtonsContainer.nativeElement !== value.nativeElement)) {
            requestAnimationFrame(() => {
                this.scrollElementIntoView(value.nativeElement);
            });
        }

        this._currentGroupButtonsContainer = value;
    }

    /** @hidden */
    protected get currentGroupButtonsContainer(): ElementRef {
        return this._currentGroupButtonsContainer;
    }

    @ViewChild(IgxToggleDirective)
    private contextMenuToggle: IgxToggleDirective;

    @ViewChildren(IgxChipComponent)
    private chips: QueryList<IgxChipComponent>;

    @ViewChild('expressionsContainer')
    private expressionsContainer: ElementRef;

    @ViewChild('overlayOutlet', { read: IgxOverlayOutletDirective, static: true })
    private overlayOutlet: IgxOverlayOutletDirective;

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
    public currentGroup: ExpressionGroupItem;

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
    public pickerOutlet: IgxOverlayOutletDirective | ElementRef;

    /**
     * @hidden @internal
     */
    public fieldSelectOverlaySettings: OverlaySettings = {
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
    private _selectedField: FieldType;
    private _clickTimer;
    private _dblClickDelay = 200;
    private _preventChipClick = false;
    private _editingInputsContainer: ElementRef;
    private _addModeContainer: ElementRef;
    private _currentGroupButtonsContainer: ElementRef;
    private _addModeExpression: ExpressionOperandItem;
    private _editedExpression: ExpressionOperandItem;
    private _selectedGroups: ExpressionGroupItem[] = [];
    private _fields: FieldType[];
    private _expressionTree: IExpressionTree;
    private _locale;
    private _resourceStrings = getCurrentResourceStrings(QueryBuilderResourceStringsEN);

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

    constructor(public cdr: ChangeDetectorRef,
        protected iconService: IgxIconService,
        protected platform: PlatformUtil,
        protected el: ElementRef,
        @Inject(LOCALE_ID) protected _localeId: string) {
        this.locale = this.locale || this._localeId;
    }

    /**
     * @hidden @internal
     */
    public ngAfterViewInit(): void {
        this._overlaySettings.outlet = this.overlayOutlet;
        this.fieldSelectOverlaySettings.outlet = this.overlayOutlet;
        this.conditionSelectOverlaySettings.outlet = this.overlayOutlet;
    }

    /**
     * @hidden @internal
     */
    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * @hidden @internal
     */
    public set selectedField(value: FieldType) {
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
    public get selectedField(): FieldType {
        return this._selectedField;
    }

    /**
     * @hidden @internal
     *
     * used by the grid
     */
    public setPickerOutlet(outlet?: IgxOverlayOutletDirective | ElementRef) {
        this.pickerOutlet = outlet;
    }

    /**
     * @hidden @internal
     *
     * used by the grid
     */
    public get isContextMenuVisible(): boolean {
        return !this.contextMenuToggle.collapsed;
    }

    /**
     * @hidden @internal
     */
    public get hasEditedExpression(): boolean {
        return this._editedExpression !== undefined && this._editedExpression !== null;
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
        if (this._editedExpression) {
            this._editedExpression.expression.fieldName = this.selectedField.field;
            this._editedExpression.expression.condition = this.selectedField.filters.condition(this.selectedCondition);
            this._editedExpression.expression.searchVal = DataUtil.parseValue(this.selectedField.dataType, this.searchValue);
            this._editedExpression.fieldLabel = this.selectedField.label
                ? this.selectedField.label
                : this.selectedField.header
                    ? this.selectedField.header
                    : this.selectedField.field;
            this._editedExpression.inEditMode = false;
            this._editedExpression = null;
        }

        this._expressionTree = this.createExpressionTreeFromGroupItem(this.rootGroup);
        this.expressionTreeChange.emit();
    }

    /**
     * @hidden @internal
     */
    public cancelOperandAdd() {
        if (this._addModeExpression) {
            this._addModeExpression.inAddMode = false;
            this._addModeExpression = null;
        }
    }

    /**
     * @hidden @internal
     */
    public cancelOperandEdit() {
        if (this._editedExpression) {
            this._editedExpression.inEditMode = false;

            if (!this._editedExpression.expression.fieldName) {
                this.deleteItem(this._editedExpression);
            }

            this._editedExpression = null;
        }
    }

    /**
     * @hidden @internal
     */
    public operandCanBeCommitted(): boolean {
        return this.selectedField && this.selectedCondition &&
            (!!this.searchValue || this.selectedField.filters.condition(this.selectedCondition).isUnary);
    }

    /**
     * @hidden @internal
     *
     * used by the grid
     */
    public exitOperandEdit() {
        if (!this._editedExpression) {
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

        if (this._editedExpression) {
            this._editedExpression.inEditMode = false;
        }

        expressionItem.hovered = false;

        this.selectedField = expressionItem.expression.fieldName ?
            this.fields.find(field => field.field === expressionItem.expression.fieldName) : null;
        this.selectedCondition = expressionItem.expression.condition ?
            expressionItem.expression.condition.name : null;
        this.searchValue = expressionItem.expression.searchVal;

        expressionItem.inEditMode = true;
        this._editedExpression = expressionItem;

        this.cdr.detectChanges();

        this.fieldSelectOverlaySettings.target = this.fieldSelect.element;
        this.fieldSelectOverlaySettings.excludeFromOutsideClick = [this.fieldSelect.element as HTMLElement];
        this.fieldSelectOverlaySettings.positionStrategy = new AutoPositionStrategy();
        this.conditionSelectOverlaySettings.target = this.conditionSelect.element;
        this.conditionSelectOverlaySettings.excludeFromOutsideClick = [this.conditionSelect.element as HTMLElement];
        this.conditionSelectOverlaySettings.positionStrategy = new AutoPositionStrategy();

        if (!this.selectedField) {
            this.fieldSelect.input.nativeElement.focus();
            } else if (this.selectedField.filters.condition(this.selectedCondition).isUnary) {
                this.conditionSelect.input.nativeElement.focus();
        } else {
            const input = this.searchValueInput?.nativeElement || this.picker?.getEditElement();
            input.focus();
        }
    }

    /**
     * @hidden @internal
     */
    public clearSelection() {
        for (const group of this._selectedGroups) {
            group.selected = false;
        }
        this._selectedGroups = [];

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

        if (this._addModeExpression) {
            this._addModeExpression.inAddMode = false;
        }

        expressionItem.inAddMode = true;
        this._addModeExpression = expressionItem;
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
        this.commitOperandEdit();
    }

    /**
     * @hidden @internal
     */
    public deleteGroup() {
        let selectedGroup = this.contextualGroup;
        let parent = selectedGroup.parent;
        if (!parent) {
            this.rootGroup = null;
        }

        while (parent) {
            let index = parent.children.indexOf(selectedGroup);
            parent.children.splice(index, 1);
            selectedGroup = parent;
            parent = parent.children.length === 0 ? parent.parent : null;
        }

        if (this.rootGroup?.children.length === 0) {
            this.rootGroup = null;
        }

        this.clearSelection();
        this.commitOperandEdit();
    }

    /**
     * @hidden @internal
     */
    public selectFilteringLogic(event: IButtonGroupEventArgs) {
        this.contextualGroup.operator = event.index as FilteringLogic;
        this.commitOperandEdit();
    }

    /**
     * @hidden @internal
     */
    public getConditionFriendlyName(name: string): string {
        return this.resourceStrings[`igx_query_builder_filter_${name}`] || name;
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

    /**
     * @hidden @internal
     */
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
        return this.selectedField ? this.selectedField.filters.conditionList() : [];
    }

    /**
     * @hidden @internal
     */
    public getFormatter(field: string) {
        return this.fields.find(el => el.field === field).formatter;
    }

    /**
     * @hidden @internal
     */
    public getFormat(field: string) {
        return this.fields.find(el => el.field === field).pipeArgs.format;
    }

    /**
     * @hidden @internal
     *
     * used by the grid
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

    private setFormat(field: FieldType) {
        if (!field.pipeArgs) {
            field.pipeArgs = { digitsInfo: DEFAULT_PIPE_DIGITS_INFO };
        }

        if (!field.pipeArgs.format) {
            field.pipeArgs.format = field.dataType === DataType.Time ?
                DEFAULT_PIPE_TIME_FORMAT : field.dataType === DataType.DateTime ?
                    DEFAULT_PIPE_DATE_TIME_FORMAT : DEFAULT_PIPE_DATE_FORMAT;
        }
    }

    private setFilters(field: FieldType) {
        if (!field.filters) {
            switch (field.dataType) {
                case DataType.Boolean:
                    field.filters = IgxBooleanFilteringOperand.instance();
                    break;
                case DataType.Number:
                case DataType.Currency:
                case DataType.Percent:
                    field.filters = IgxNumberFilteringOperand.instance();
                    break;
                case DataType.Date:
                    field.filters = IgxDateFilteringOperand.instance();
                    break;
                case DataType.Time:
                    field.filters = IgxTimeFilteringOperand.instance();
                    break;
                case DataType.DateTime:
                    field.filters = IgxDateTimeFilteringOperand.instance();
                    break;
                case DataType.String:
                default:
                    field.filters = IgxStringFilteringOperand.instance();
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

    private createExpressionGroupItem(expressionTree: IExpressionTree, parent?: ExpressionGroupItem): ExpressionGroupItem | null {
        if (!expressionTree) {
            return null;
        }

        const groupItem = new ExpressionGroupItem(expressionTree.operator, parent);

        for (const expr of expressionTree.filteringOperands) {
            if (expr instanceof FilteringExpressionsTree) {
                const childGroup = this.createExpressionGroupItem(expr, groupItem);
                if (childGroup) {
                    groupItem.children.push(childGroup);
                }
            } else {
                const filteringExpr = expr as IFilteringExpression;
                const field = this.fields.find(el => el.field === filteringExpr.fieldName);

                if (field) {
                    const exprCopy: IFilteringExpression = { ...filteringExpr };
                    const operandItem = new ExpressionOperandItem(exprCopy, groupItem);
                    operandItem.fieldLabel = field.label || field.header || field.field;
                    groupItem.children.push(operandItem);
                }
            }
        }

        return groupItem.children.length > 0 ? groupItem : null;
    }

    private createExpressionTreeFromGroupItem(groupItem: ExpressionGroupItem): FilteringExpressionsTree {
        if (!groupItem) {
            return null;
        }

        const expressionTree = new FilteringExpressionsTree(groupItem.operator);

        for (const item of groupItem.children) {
            if (item instanceof ExpressionGroupItem) {
                const subTree = this.createExpressionTreeFromGroupItem((item as ExpressionGroupItem));
                expressionTree.filteringOperands.push(subTree);
            } else {
                expressionTree.filteringOperands.push((item as ExpressionOperandItem).expression);
            }
        }

        return expressionTree;
    }

    private toggleContextMenu() {
        const contextualGroup = this.findSingleSelectedGroup();

        if (contextualGroup || this.selectedExpressions.length > 1) {
            this.contextualGroup = contextualGroup;

            if (contextualGroup) {
                this.filteringLogics = [
                    {
                        label: this.resourceStrings.igx_query_builder_filter_operator_and,
                        selected: contextualGroup.operator === FilteringLogic.And
                    },
                    {
                        label: this.resourceStrings.igx_query_builder_filter_operator_or,
                        selected: contextualGroup.operator === FilteringLogic.Or
                    }
                ];
            }
        } else if (this.contextMenuToggle) {
            this.contextMenuToggle.close();
        }
    }

    private findSingleSelectedGroup(): ExpressionGroupItem {
        for (const group of this._selectedGroups) {
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
            this._expressionTree = null;
            return;
        }

        if (expressionItem === this.currentGroup) {
            this.currentGroup = this.currentGroup.parent;
        }

        const children = expressionItem.parent.children;
        const index = children.indexOf(expressionItem);
        children.splice(index, 1);
        this._expressionTree = this.createExpressionTreeFromGroupItem(this.rootGroup);

        if (!children.length) {
            this.deleteItem(expressionItem.parent);
        }

        this.expressionTreeChange.emit();
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
            groupItem.children.push(expr);
            this.deleteItem(expr);
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
                this._selectedGroups.push(groupItem);
            } else {
                const index = this._selectedGroups.indexOf(groupItem);
                this._selectedGroups.splice(index, 1);
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
                const index = this._selectedGroups.indexOf(parent);
                this._selectedGroups.splice(index, 1);
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
        this.rootGroup = this.createExpressionGroupItem(this.expressionTree);
        this.currentGroup = this.rootGroup;
    }

    private registerSVGIcons(): void {
        const editorIcons = editor as any[];

        editorIcons.forEach((icon) => {
            this.iconService.addSvgIconFromText(icon.name, icon.value, 'imx-icons');
        });
    }
}

