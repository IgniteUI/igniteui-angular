import {
    AfterViewInit,
    ContentChild,
    EventEmitter,
    LOCALE_ID,
    Output,
    Pipe,
    PipeTransform,
    TemplateRef
} from '@angular/core';
import { getLocaleFirstDayOfWeek, NgIf, NgFor, NgTemplateOutlet, NgClass, DatePipe } from '@angular/common';
import { Inject } from '@angular/core';
import {
    Component, Input, ViewChild, ChangeDetectorRef, ViewChildren, QueryList, ElementRef, OnDestroy, HostBinding
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { filter, fromEvent, sampleTime, Subject, Subscription, tap } from 'rxjs';
import { IgxButtonGroupComponent } from '../buttonGroup/buttonGroup.component';
import { IgxChipComponent } from '../chips/chip.component';
import { IQueryBuilderResourceStrings, QueryBuilderResourceStringsEN } from '../core/i18n/query-builder-resources';
import { PlatformUtil } from '../core/utils';
import { DataType, DataUtil } from '../data-operations/data-util';
import { IgxBooleanFilteringOperand, IgxDateFilteringOperand, IgxDateTimeFilteringOperand, IgxNumberFilteringOperand, IgxStringFilteringOperand, IgxTimeFilteringOperand } from '../data-operations/filtering-condition';
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { FilteringExpressionsTree, IExpressionTree, IFilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IgxDatePickerComponent } from '../date-picker/date-picker.component';

import { IgxButtonDirective } from '../directives/button/button.directive';
import { IgxDateTimeEditorDirective } from '../directives/date-time-editor/date-time-editor.directive';

import { IgxOverlayOutletDirective, IgxToggleActionDirective, IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { FieldType, EntityType } from '../grids/common/grid.interface';
import { IgxSelectComponent } from '../select/select.component';
import { HorizontalAlignment, OverlaySettings, RelativePosition, VerticalAlignment } from '../services/overlay/utilities';
import { AbsoluteScrollStrategy, AutoPositionStrategy, CloseScrollStrategy, ConnectedPositioningStrategy, IgxOverlayService } from '../services/public_api';
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
import { IComboSelectionChangingEventArgs, IgxComboComponent } from "../combo/combo.component";
import { IgxLabelDirective } from '../input-group/public_api';
import { IgxComboHeaderDirective } from '../combo/public_api';
import { IChangeCheckboxEventArgs, IgxCheckboxComponent } from "../checkbox/checkbox.component";
import { IgxDialogComponent } from "../dialog/dialog.component";
import { ISelectionEventArgs } from '../drop-down/drop-down.common';
import { IgxTooltipDirective } from '../directives/tooltip/tooltip.directive';
import { IgxTooltipTargetDirective } from '../directives/tooltip/tooltip-target.directive';
import { IgxQueryBuilderSearchValueTemplateDirective } from './query-builder.directives';
import { IgxQueryBuilderComponent } from './query-builder.component';
import { IgxChipsAreaComponent } from "../chips/chips-area.component";
import { IgxDragDirective, IgxDragIgnoreDirective, IgxDragHandleDirective, IgxDropDirective } from '../directives/drag-drop/drag-drop.directive';
import { IgxDropDownComponent } from '../drop-down/drop-down.component';
import { IgxDropDownItemComponent } from '../drop-down/drop-down-item.component';
import { IgxDropDownItemNavigationDirective } from '../drop-down/drop-down-navigation.directive';

const DEFAULT_PIPE_DATE_FORMAT = 'mediumDate';
const DEFAULT_PIPE_TIME_FORMAT = 'mediumTime';
const DEFAULT_PIPE_DATE_TIME_FORMAT = 'medium';
const DEFAULT_PIPE_DIGITS_INFO = '1.0-3';
const DEFAULT_CHIP_FOCUS_DELAY = 100;

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
    public expanded: boolean;
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
    public focused: boolean;
    public fieldLabel: string;
    constructor(expression: IFilteringExpression, parent: ExpressionGroupItem) {
        super(parent);
        this.expression = expression;
    }
}

/** @hidden */
@Component({
    selector: 'igx-query-builder-tree',
    templateUrl: './query-builder-tree.component.html',
    host: { 'class': 'igx-query-builder-tree' },
    standalone: true,
    imports: [
        NgIf,
        IgxQueryBuilderHeaderComponent,
        IgxButtonDirective,
        IgxIconComponent,
        IgxChipComponent,
        IgxPrefixDirective,
        IgxSuffixDirective,
        IgxSelectComponent,
        FormsModule,
        NgFor,
        IgxSelectItemComponent,
        IgxInputGroupComponent,
        IgxInputDirective,
        IgxDatePickerComponent,
        IgxPickerToggleComponent,
        IgxPickerClearComponent,
        IgxTimePickerComponent,
        IgxDateTimeEditorDirective,
        NgTemplateOutlet,
        NgClass,
        IgxToggleDirective,
        IgxButtonGroupComponent,
        IgxOverlayOutletDirective,
        DatePipe,
        IgxFieldFormatterPipe,
        IgxIconButtonDirective,
        IgxToggleActionDirective,
        IgxComboComponent,
        IgxLabelDirective,
        IgxComboHeaderDirective,
        IgxCheckboxComponent,
        IgxDialogComponent,
        IgxTooltipTargetDirective,
        IgxTooltipDirective,
        IgxChipsAreaComponent,
        IgxDragDirective,
        IgxDragIgnoreDirective,
        IgxDragHandleDirective,
        IgxDropDirective,
        IgxDropDownComponent,
        IgxDropDownItemComponent,
        IgxDropDownItemNavigationDirective
    ]
})
export class IgxQueryBuilderTreeComponent implements AfterViewInit, OnDestroy {
    /**
     * @hidden @internal
     */
    @HostBinding('class') public get getClass() {
        return `igx-query-builder-tree--level-${this.level}`;
    }

    /**
     * Sets/gets the entities.
     */
    @Input()
    public entities: EntityType[];

    /**
     * Sets/gets the parent query builder component.
     */
    @Input()
    public queryBuilder: IgxQueryBuilderComponent;

    /**
     * Sets/gets the search value template.
     */
    @Input()
    public searchValueTemplate: TemplateRef<IgxQueryBuilderSearchValueTemplateDirective> = null;

    /**
    * Returns the parent expression operand.
    */
    @Input()
    public get parentExpression(): ExpressionOperandItem {
        return this._parentExpression;
    }

    /**
     * Sets the parent expression operand.
     */
    public set parentExpression(value: ExpressionOperandItem) {
        this._parentExpression = value;
    }

    /**
    * Returns the fields.
    */
    public get fields(): FieldType[] {
        if (!this._fields && this.isAdvancedFiltering()) {
            this._fields = this.entities[0].fields;
        }

        return this._fields;
    }

    /**
     * Sets the fields.
     */
    @Input()
    public set fields(fields: FieldType[]) {
        this._fields = fields;

        if (!this._fields && this.isAdvancedFiltering()) {
            this._fields = this.entities[0].fields;
        }

        if (this._fields) {
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
        if (!expressionTree) {
            this._selectedEntity = null;
            this._selectedReturnFields = [];
        }

        if (!this._preventInit) {
            this.init();
        }
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
     */
    @Output()
    public expressionTreeChange = new EventEmitter<IExpressionTree>();

    /**
     * Event fired if a nested query builder tree is being edited.
     */
    @Output()
    public inEditModeChange = new EventEmitter<ExpressionOperandItem>();

    @ViewChild('entitySelect', { read: IgxSelectComponent })
    protected entitySelect: IgxSelectComponent;

    @ViewChild('returnFieldsCombo', { read: IgxComboComponent })
    private returnFieldsCombo: IgxComboComponent;

    @ViewChild('returnFieldSelect', { read: IgxSelectComponent })
    protected returnFieldSelect: IgxSelectComponent;

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

    @ViewChild('entityChangeDialog', { read: IgxDialogComponent })
    private entityChangeDialog: IgxDialogComponent;

    @ViewChild('addOptionsDropDown', { read: IgxDropDownComponent })
    private addExpressionItemDropDown: IgxDropDownComponent;

    @ViewChild('groupContextMenuDropDown', { read: IgxDropDownComponent })
    private groupContextMenuDropDown: IgxDropDownComponent;

    @ViewChildren(IgxChipComponent, { read: IgxChipComponent })
    private expressionsChips: QueryList<IgxChipComponent>;

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

    @ViewChild('expressionsContainer')
    private expressionsContainer: ElementRef;

    @ViewChild('overlayOutlet', { read: IgxOverlayOutletDirective, static: true })
    private overlayOutlet: IgxOverlayOutletDirective;

    @ViewChildren(IgxQueryBuilderTreeComponent)
    private innerQueries: QueryList<IgxQueryBuilderTreeComponent>;

    /**
     * @hidden @internal
     */
    public innerQueryNewExpressionTree: IExpressionTree;

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
    public searchValue: { value: any } = { value: null };

    /**
     * @hidden @internal
     */
    public pickerOutlet: IgxOverlayOutletDirective | ElementRef;

    /**
     * @hidden @internal
     */
    public prevFocusedExpression: ExpressionOperandItem;

    /**
     * @hidden @internal
     */
    public returnFieldSelectOverlaySettings: OverlaySettings = {
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnOutsideClick: true
    };

    /**
     * @hidden @internal
     */
    public entitySelectOverlaySettings: OverlaySettings = {
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnOutsideClick: true
    };

    /**
     * @hidden @internal
     */
    public fieldSelectOverlaySettings: OverlaySettings = {
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnOutsideClick: true
    };

    /**
     * @hidden @internal
     */
    public conditionSelectOverlaySettings: OverlaySettings = {
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnOutsideClick: true
    };

    /**
     * @hidden @internal
     */
    public addExpressionDropDownOverlaySettings: OverlaySettings = {
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnOutsideClick: true
    };

    /**
     * @hidden @internal
     */
    public groupContextMenuDropDownOverlaySettings: OverlaySettings = {
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnOutsideClick: true
    };

    private destroy$ = new Subject<any>();
    private _lastFocusedChipIndex: number;
    private _focusDelay = DEFAULT_CHIP_FOCUS_DELAY;
    private _parentExpression: ExpressionOperandItem;
    private _selectedEntity: EntityType;
    private _selectedReturnFields: string | string[];
    private _selectedField: FieldType;
    private _editingInputsContainer: ElementRef;
    private _currentGroupButtonsContainer: ElementRef;
    private _addModeExpression: ExpressionOperandItem;
    private _editedExpression: ExpressionOperandItem;
    private _preventInit = false;
    private _prevFocusedContainer: ElementRef;
    private _expandedExpressions: IFilteringExpression[] = [];
    private _fields: FieldType[];
    private _expressionTree: IExpressionTree;
    private _locale;
    private _entityNewValue: EntityType;
    private _resourceStrings = getCurrentResourceStrings(QueryBuilderResourceStringsEN);

    public get level(): number {
        let parent = this.elRef.nativeElement.parentElement;
        let _level = 0;
        while (parent) {
            if (parent.localName === 'igx-query-builder-tree') {
                _level++;
            }
            parent = parent.parentElement;
        }
        return _level;
    }

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

    /** @hidden */
    protected isAdvancedFiltering(): boolean {
        return this.entities?.length === 1 && !this.entities[0]?.name;
    }

    /** @hidden */
    protected isSearchValueInputDisabled(): boolean {
        return !this.selectedField ||
            !this.selectedCondition ||
            (this.selectedField &&
                (this.selectedField.filters.condition(this.selectedCondition).isUnary ||
                    this.selectedField.filters.condition(this.selectedCondition).isNestedQuery));
    }

    constructor(public cdr: ChangeDetectorRef,
        protected platform: PlatformUtil,
        protected el: ElementRef,
        private elRef: ElementRef,
        @Inject(LOCALE_ID) protected _localeId: string) {
        this.locale = this.locale || this._localeId;
    }

    /**
     * @hidden @internal
     */
    public ngAfterViewInit(): void {
        this._overlaySettings.outlet = this.overlayOutlet;
        this.entitySelectOverlaySettings.outlet = this.overlayOutlet;
        this.fieldSelectOverlaySettings.outlet = this.overlayOutlet;
        this.conditionSelectOverlaySettings.outlet = this.overlayOutlet;
        this.returnFieldSelectOverlaySettings.outlet = this.overlayOutlet;
        this.addExpressionDropDownOverlaySettings.outlet = this.overlayOutlet;
        this.groupContextMenuDropDownOverlaySettings.outlet = this.overlayOutlet;
        // Trigger additional change detection cycle
        this.cdr.detectChanges();
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
    public set selectedEntity(value: string) {
        this._selectedEntity = this.entities?.find(el => el.name === value);
    }

    /**
     * @hidden @internal
     */
    public get selectedEntity(): EntityType {
        return this._selectedEntity;
    }

    /**
     * @hidden @internal
     */
    public onEntitySelectChanging(event: ISelectionEventArgs) {
        event.cancel = true;
        this._entityNewValue = event.newSelection.value;
        if (event.oldSelection.value && this.queryBuilder.showEntityChangeDialog) {
            this.entityChangeDialog.open();
        } else {
            this.onEntityChangeConfirm();
        }
    }

    /**
     * @hidden
     */
    public onShowEntityChangeDialogChange(eventArgs: IChangeCheckboxEventArgs) {
        this.queryBuilder.showEntityChangeDialog = !eventArgs.checked;
    }

    /**
     * @hidden
     */
    public onEntityChangeCancel() {
        this.entityChangeDialog.close();
        this.entitySelect.close();
        this._entityNewValue = null;
    }

    /**
     * @hidden
     */
    public onEntityChangeConfirm() {
        if (this._parentExpression) {
            this._expressionTree = this.createExpressionTreeFromGroupItem(this.createExpressionGroupItem(this._expressionTree));
        }

        this._selectedEntity = this._entityNewValue;
        if (!this._selectedEntity.fields) {
            this._selectedEntity.fields = [];
        }
        this.fields = this._entityNewValue ? this._entityNewValue.fields : [];

        this._selectedReturnFields = this.parentExpression ? [] : this._entityNewValue.fields?.map(f => f.field);

        if (this._expressionTree) {
            this._expressionTree.entity = this._entityNewValue.name;
            this._expressionTree.returnFields = [];
            this._expressionTree.filteringOperands = [];

            this._editedExpression = null;
            if (!this.parentExpression) {
                this.expressionTreeChange.emit(this._expressionTree);
            }

            this.rootGroup = null;
            this.currentGroup = this.rootGroup;
        }

        this._selectedField = null;
        this.selectedCondition = null;
        this.searchValue.value = null;

        this.entityChangeDialog.close();
        this.entitySelect.close();

        this._entityNewValue = null;
        this.innerQueryNewExpressionTree = null;

        this.initExpressionTree(this._selectedEntity.name, this.selectedReturnFields);
    }

    /**
     * @hidden @internal
     */
    public set selectedReturnFields(value: string[]) {
        if (this._selectedReturnFields !== value) {
            this._selectedReturnFields = value;

            if (this._expressionTree && !this.parentExpression) {
                this._expressionTree.returnFields = value;
                this.expressionTreeChange.emit(this._expressionTree);
            }
        }
    }

    /**
     * @hidden @internal
     */
    public get selectedReturnFields(): string[] {
        if (typeof this._selectedReturnFields == 'string') {
            return [this._selectedReturnFields];
        }
        return this._selectedReturnFields;
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
                this.searchValue.value = null;
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
        return !this.groupContextMenuDropDown.collapsed;
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
    public addCondition(parent: ExpressionGroupItem, afterExpression?: ExpressionOperandItem, target?: HTMLElement) {
        this.cancelOperandAdd();

        const operandItem = new ExpressionOperandItem({
            fieldName: null,
            condition: null,
            conditionName: null,
            ignoreCase: true,
            searchVal: null
        }, parent);

        const groupItem = new ExpressionGroupItem(FilteringLogic.And, parent);

        this._lastFocusedChipIndex =  this._lastFocusedChipIndex == undefined ? -1 : this._lastFocusedChipIndex;

        if (parent) {
            if (afterExpression) {
                const index = parent.children.indexOf(afterExpression);
                parent.children.splice(index + 1, 0, operandItem);
            } else {
                parent.children.push(operandItem);
            }
            this._lastFocusedChipIndex++;
        } else {
            this.rootGroup = groupItem;
            this.rootGroup.children.push(operandItem);
            this._lastFocusedChipIndex = 0;
        }

        this._focusDelay = 250;

        if (target && !afterExpression) {
            this._lastFocusedChipIndex = this.expressionsChips.length; 
            this._focusDelay = DEFAULT_CHIP_FOCUS_DELAY;           
        }

        this.enterExpressionEdit(operandItem);
    }

    /**
     * @hidden @internal
     */
    public addReverseGroup(parent?: ExpressionGroupItem, afterExpression?: ExpressionItem) {
        parent = parent ?? this.rootGroup;

        if (parent.operator === FilteringLogic.And) {
            this.addGroup(FilteringLogic.Or, parent, afterExpression);
        } else {
            this.addGroup(FilteringLogic.And, parent, afterExpression);
        }
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
    public commitExpression() {
        this.commitOperandEdit();
        this.focusEditedExpressionChip();
    }
    
    /**
     * @hidden @internal
     */
    public discardExpression(expressionItem?: ExpressionOperandItem) {
        this.cancelOperandEdit();
        if (expressionItem && expressionItem.expression.fieldName) {
            this.focusEditedExpressionChip();
        }
    }

    /**
     * @hidden @internal
     */
    public commitOperandEdit() {
        const actualSearchValue = this.searchValue.value;
        if (this._editedExpression) {
            this._editedExpression.expression.fieldName = this.selectedField.field;
            this._editedExpression.expression.condition = this.selectedField.filters.condition(this.selectedCondition);
            this._editedExpression.expression.conditionName = this.selectedCondition;
            this._editedExpression.expression.searchVal = DataUtil.parseValue(this.selectedField.dataType, actualSearchValue) || actualSearchValue;
            this._editedExpression.fieldLabel = this.selectedField.label
                ? this.selectedField.label
                : this.selectedField.header
                    ? this.selectedField.header
                    : this.selectedField.field;

            const innerQuery = this.innerQueries.filter(q => q.isInEditMode())[0]
            if (innerQuery && this.selectedField?.filters?.condition(this.selectedCondition)?.isNestedQuery) {
                this._editedExpression.expression.searchTree = this.getExpressionTreeCopy(innerQuery.expressionTree);
                this._editedExpression.expression.searchTree.returnFields = innerQuery.selectedReturnFields;
            } else {
                this._editedExpression.expression.searchTree = null;
            }
            this.innerQueryNewExpressionTree = null;

            if (this.selectedField.filters.condition(this.selectedCondition)?.isUnary || this.selectedField.filters.condition(this.selectedCondition)?.isNestedQuery) {
                this._editedExpression.expression.searchVal = null;
            }

            this._editedExpression.inEditMode = false;
            this._editedExpression = null;
        }

        this._expressionTree = this.createExpressionTreeFromGroupItem(this.rootGroup, this.selectedEntity?.name, this.selectedReturnFields);
        if (!this.parentExpression) {
            this.expressionTreeChange.emit(this._expressionTree);
        }
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
        if (this.innerQueries) {
            const innerQuery = this.innerQueries.filter(q => q.isInEditMode())[0];
            if (innerQuery) {
                if (innerQuery._editedExpression) {
                    innerQuery.cancelOperandEdit();
                }

                innerQuery.expressionTree = this.getExpressionTreeCopy(this._editedExpression.expression.searchTree);
                this.innerQueryNewExpressionTree = null;
            }
        }

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
        const innerQuery = this.innerQueries.filter(q => q.isInEditMode())[0];

        return this.selectedField && this.selectedCondition &&
            (
                (
                    ((!Array.isArray(this.searchValue.value) && !!this.searchValue.value) || (Array.isArray(this.searchValue.value) && this.searchValue.value.length !== 0)) &&
                    !(this.selectedField?.filters?.condition(this.selectedCondition)?.isNestedQuery)
                ) ||
                (
                    this.selectedField?.filters?.condition(this.selectedCondition)?.isNestedQuery && innerQuery && !!innerQuery.expressionTree && innerQuery._editedExpression == undefined && innerQuery.selectedReturnFields?.length > 0
                ) ||
                this.selectedField.filters.condition(this.selectedCondition)?.isUnary
            );
    }

    /**
     * @hidden @internal
     */
    public canCommitCurrentState(): boolean {
        const innerQuery = this.innerQueries.filter(q => q.isInEditMode())[0];
        if (innerQuery) {
            return this.selectedReturnFields?.length > 0 && innerQuery.canCommitCurrentState();
        } else {
            return this.selectedReturnFields?.length > 0 &&
                (
                    (!this._editedExpression) || // no edited expr
                    (this._editedExpression && !this.selectedField) || // empty edited expr
                    (this._editedExpression && this.operandCanBeCommitted() === true) // valid edited expr
                );
        }
    }

    /**
     * @hidden @internal
     */
    public commitCurrentState(): void {
        const innerQuery = this.innerQueries.filter(q => q.isInEditMode())[0];
        if (innerQuery) {
            innerQuery.commitCurrentState();
        }

        if (this._editedExpression) {
            if (this.selectedField) {
                this.commitOperandEdit();
            } else {
                this.deleteItem(this._editedExpression);
                this._editedExpression = null;
            }
        }
    }

    /**
     * @hidden @internal
     */
    public exitEditAddMode(shouldPreventInit = false) {
        if (!this._editedExpression) {
            return;
        }

        this.exitOperandEdit();
        this.cancelOperandAdd();

        if (shouldPreventInit) {
            this._preventInit = true;
        }
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
    public onExpressionFocus(expressionItem: ExpressionOperandItem) {
        if (this.prevFocusedExpression) {
            this.prevFocusedExpression.focused = false;
        }
        expressionItem.focused = true;
        this.prevFocusedExpression = expressionItem;
    }

    /**
     * @hidden @internal
     */
    public onExpressionBlur(event, expressionItem: ExpressionOperandItem) {
        if (this._prevFocusedContainer && this._prevFocusedContainer !== event.target.closest('.igx-filter-tree__expression-item')) {
            expressionItem.focused = false;
        }
        this._prevFocusedContainer = event.target.closest('.igx-filter-tree__expression-item');
    }

    /**
     * @hidden @internal
     */
    public onChipRemove(expressionItem: ExpressionItem) {
        this.exitEditAddMode();
        this.deleteItem(expressionItem);
    }

    /* DRAG AND DROP START*/
    public sourceExpressionItem: ExpressionItem;
    public sourceElement: HTMLElement;
    public targetExpressionItem: ExpressionItem;
    public targetElement: HTMLElement;
    public dropUnder: boolean;
    public dropGhostChipNode: Node;
    private ghostChipMousemoveSubscription$: Subscription;
    private keyboardSubscription$: Subscription;
    private keyDragOffsetIndex: number = 0;
    private keyDragFirstMove: boolean = true;
    private isKeyboardDrag: boolean;
    private dropZonesList: HTMLElement[];   //stores a flat ordered list of all chips, including +Condition button, while performing the keyboard drag&drop
    private expressionsList: ExpressionItem[]; //stores a flat ordered list of all expressions, including +Condition button, while performing the keyboard drag&drop
    private dropGhostClass = 'igx-filter-tree__expression-item-drop-ghost';

    //Get the dragged ghost as a HTMLElement
    private get dragGhostElement(): HTMLElement {
        return (document.querySelector('.igx-chip__ghost[ghostclass="igx-chip__ghost"]') as HTMLElement);
    }

    //Get the drop ghost as a HTMLElement
    private get dropGhostElement(): HTMLElement {
        return (document.querySelector(`.${this.dropGhostClass}`) as HTMLElement);
    }

    private get mainExpressionTree(): HTMLElement {
        return this.el.nativeElement.firstElementChild.firstElementChild.nextElementSibling;
    }

    //Chip can be dragged if it's tree is in edit mode and there is no inner query that's been edited
    public canBeDragged(): boolean {
        return this.isInEditMode && (!this.innerQueries || this.innerQueries.length == 0 || !this.innerQueries?.some(q => q.isInEditMode()))
    }

    //When we pick up a chip
    public onMoveStart(sourceDragElement: HTMLElement, sourceExpressionItem: ExpressionItem, isKeyboardDrag: boolean, shouldExitEdit = false): void {
        //console.log('Picked up:', event, sourceDragElement);
        if (shouldExitEdit) {
            this.exitEditAddMode();
        }
        this.resetDragAndDrop(true);
        this.isKeyboardDrag = isKeyboardDrag;
        this.sourceExpressionItem = sourceExpressionItem;
        this.sourceElement = sourceDragElement;

        this.listenToKeyboard();

        if (!this.isKeyboardDrag) {
            this.sourceElement.style.display = 'none';
        }
    }

    //When we let go a chip outside a proper drop zone
    public onMoveEnd(): void {
        // console.log('Let go:');
        if (!this.sourceElement || !this.sourceExpressionItem) return;

        if (this.dropGhostChipNode) {
            //If there is a ghost chip presented to the user, execute drop
            this.onChipDropped();
        } else {
            this.resetDragAndDrop(true);
        }

        this.ghostChipMousemoveSubscription$?.unsubscribe();
        this.keyboardSubscription$?.unsubscribe();
    }

    //On entering a drop area of another chip 
    public onDivEnter(targetDragElement: HTMLElement, targetExpressionItem: ExpressionItem) {
        this.onChipEnter(targetDragElement, targetExpressionItem, true)
    }

    //TODO remove fromDiv: boolean -> targetDragElement is always the div
    public onChipEnter(targetDragElement: HTMLElement, targetExpressionItem: ExpressionItem, fromDiv: boolean) {
        // console.log('Entering:', targetDragElement, targetExpressionItem, 'from div:', fromDiv);
        if (!this.sourceElement || !this.sourceExpressionItem) return;

        //If entering the one that's been picked up
        if (targetDragElement == this.sourceElement) return;

        //Simulate leaving the last entered chip in case of no Leave event triggered due to the artificial drop zone of a north positioned ghost chip 
        if (this.targetElement) {
            this.resetDragAndDrop(false);
        }

        this.targetElement = targetDragElement;
        this.targetExpressionItem = targetExpressionItem;

        //Determine the middle point of the chip. (fromDiv - get the div's chip) 
        const appendUnder = fromDiv ? this.ghostInLowerPart(targetDragElement.children[0] as HTMLElement) : this.ghostInLowerPart(targetDragElement);

        this.renderDropGhostChip(targetDragElement, appendUnder);
    }

    //On moving the dragged chip in a drop area
    public onDivOver(targetDragElement: HTMLElement, targetExpressionItem: ExpressionItem) {
        if (this.targetExpressionItem === targetExpressionItem) {
            this.onChipOver(targetDragElement, true)
        } else {
            this.onChipEnter(targetDragElement, targetExpressionItem, true);
        }
    }

    //TODO remove fromDiv: boolean -> targetDragElement is always the div
    public onChipOver(targetDragElement: HTMLElement, fromDiv: boolean): void {
        //console.log('Over:', targetDragElement, 'type: ', typeof event);
        if (!this.sourceElement || !this.sourceExpressionItem) return;

        //Determine the middle point of the chip. (fromDiv - get the div's chip) 
        const appendUnder = fromDiv ? this.ghostInLowerPart(targetDragElement.children[0] as HTMLElement) : this.ghostInLowerPart(targetDragElement);

        this.renderDropGhostChip(targetDragElement, appendUnder);
    }

    public onChipLeave() {
        if (!this.sourceElement || !this.sourceExpressionItem || !this.targetElement) return;
        //console.log('Leaving:', targetDragElement.textContent.trim());

        //if the drag ghost is on the drop ghost row don't trigger leave
        if (this.dragGhostIsOnDropGhostRow(this.dragGhostElement, this.dropGhostChipNode?.firstChild as HTMLElement)) {
            return;
        }

        if (this.targetElement) {
            this.resetDragAndDrop(false)
        }
    }

    //On dropped in a drop area of another chip
    public onDivDropped(targetExpressionItem: ExpressionItem) {
        if (targetExpressionItem != this.sourceExpressionItem) {
            this.onChipDropped();
        }
    }

    public onChipDropped() {
        if (!this.sourceElement || !this.sourceExpressionItem || !this.targetElement) return;

        //console.log('Move: [', this.sourceElement.children[0].textContent.trim(), (this.dropUnder ? '] under: [' : '] over:'), this.targetExpressionItem)
        this.moveDraggedChipToNewLocation(this.targetExpressionItem)
        this.resetDragAndDrop(true);
    }


    public onGroupRootOver(targetDragElement: HTMLElement, targetExpressionItem: ExpressionGroupItem) {
        //console.log('Entering:', targetDragElement, targetExpressionItem);
        if (!this.sourceElement || !this.sourceExpressionItem) return;

        let newTargetElement, newTargetExpressionItem;

        if (this.ghostInLowerPart(targetDragElement) || !targetExpressionItem.parent) {
            //if ghost in upper part of the AND/OR, drop before the group starts
            newTargetElement = targetDragElement.nextElementSibling;
            newTargetElement = (newTargetElement.className.indexOf(this.dropGhostClass) !== -1) ? newTargetElement.nextElementSibling : newTargetElement;
            newTargetExpressionItem = targetExpressionItem.children[0];
        } else {
            //if ghost in lower part or it's the root group, drop as first child of that group
            newTargetElement = targetDragElement.parentElement.parentElement;
            newTargetExpressionItem = targetExpressionItem;
        }

        if (newTargetElement && (this.targetElement !== newTargetElement || this.targetExpressionItem !== newTargetExpressionItem)) {
            this.resetDragAndDrop(false);
            this.targetElement = newTargetElement;
            this.targetExpressionItem = newTargetExpressionItem;
            this.renderDropGhostChip(this.targetElement, false);
        }
    }

    public onAddConditionEnter(addConditionElement: HTMLElement, rootGroup: ExpressionGroupItem) {
        //console.log('onAddConditionEnter', targetDragElement);
        if (!this.sourceElement || !this.sourceExpressionItem) return;

        const lastElement = this.getPreviousChip(addConditionElement.parentElement);
        if (lastElement == this.dropGhostChipNode) return;

        //simulate entering in the lower part of the last chip/group
        this.onChipEnter(lastElement as HTMLElement,
            rootGroup.children[rootGroup.children.length - 1],
            false);
    }

    public onAddConditionLeave() {
        this.onChipLeave();
    }

    //Checks if the dragged ghost is horizontally on the same line with the drop ghost
    private dragGhostIsOnDropGhostRow(dragGhost: HTMLElement, dropGhost: HTMLElement) {
        const dragGhostBounds = dragGhost.getBoundingClientRect();
        const dropGhostBounds = dropGhost.getBoundingClientRect();

        if (!dragGhostBounds || !dropGhostBounds) return false;

        const ghostHeight = dragGhostBounds.bottom - dragGhostBounds.top;

        return !(dragGhostBounds.bottom < dropGhostBounds.top - ghostHeight || dragGhostBounds.top > dropGhostBounds.bottom + ghostHeight);
    }

    //Checks if the dragged ghost is north or south of a target element's center
    private ghostInLowerPart(ofElement: HTMLElement) {
        //if (event == null) return true;
        const ghostBounds = this.dragGhostElement.getBoundingClientRect();
        const targetBounds = ofElement.getBoundingClientRect();

        return ((ghostBounds.top + ghostBounds.bottom) / 2) >= ((targetBounds.top + targetBounds.bottom) / 2);
    }

    //Create the drop ghost node based on the base chip that's been dragged
    //TODO refactor this using angular and css?
    private createDropGhost(keyboardMode?: boolean) {
        const dragCopy = this.sourceElement.cloneNode(true);
        (dragCopy as HTMLElement).classList.add(this.dropGhostClass);
        (dragCopy as HTMLElement).style.display = '';
        (dragCopy.firstChild as HTMLElement).style.visibility = 'visible';
        (dragCopy.firstChild as HTMLElement).style.opacity = '0.5';
        dragCopy.removeChild(dragCopy.childNodes[3]);

        if (!keyboardMode) {
            var span = document.createElement('span')
            //TODO Localize string
            span.innerHTML = "DROP CONDITION HERE";

            dragCopy.firstChild.firstChild.removeChild(dragCopy.firstChild.firstChild.childNodes[1]);
            dragCopy.firstChild.firstChild.removeChild(dragCopy.firstChild.firstChild.childNodes[1]);
            (dragCopy.firstChild.firstChild.firstChild as HTMLElement).replaceChildren(span);
            (dragCopy.firstChild.firstChild as HTMLElement).style.border = '1px';
            (dragCopy.firstChild.firstChild as HTMLElement).style.borderStyle = 'dashed';
        }
        return dragCopy;
    }

    //Make a copy of the drag chip and place it in the DOM north or south of the drop chip
    private renderDropGhostChip(appendToElement: HTMLElement, appendUnder: boolean, keyboardMode?: boolean, overrideDropUnder?: boolean): void {
        const dragCopy = this.createDropGhost(keyboardMode);

        //Append the ghost
        if ((!appendUnder && this.dropUnder !== false) || //mouse mode
            (keyboardMode && !appendUnder)) {
            //over
            (this.dropGhostChipNode as HTMLElement)?.remove();
            this.dropGhostChipNode = dragCopy;
            this.dropUnder = false;
            appendToElement.parentNode.insertBefore(this.dropGhostChipNode, appendToElement);
        } else if ((appendUnder && this.dropUnder !== true) || //mouse mode
            (keyboardMode && appendUnder)) {
            //under
            (this.dropGhostChipNode as HTMLElement)?.remove();
            this.dropGhostChipNode = dragCopy;
            this.dropUnder = true;
            appendToElement.parentNode.insertBefore(this.dropGhostChipNode, appendToElement.nextSibling);
        }

        this.dropUnder = overrideDropUnder == null ? this.dropUnder : overrideDropUnder;

        //Put focus on the drag icon of the ghost while performing keyboard drag
        if (this.isKeyboardDrag) {
            ((this.dropGhostChipNode as HTMLElement).querySelector('.igx-drag-indicator') as HTMLElement).focus();
        }

        //Attach a mousemove event listener (if not already in place) to the dragged ghost (if present)
        if (this.dragGhostElement && (!this.ghostChipMousemoveSubscription$ || this.ghostChipMousemoveSubscription$?.closed === true)) {
            const mouseMoves = fromEvent<MouseEvent>(this.dragGhostElement, 'mousemove');

            this.ghostChipMousemoveSubscription$ = mouseMoves.pipe(sampleTime(100)).subscribe(() => {
                this.onChipLeave();
            });
        }

        this.setDragCursor('grab');
    }

    //Set the cursor when dragging a ghost
    private setDragCursor(cursor: string) {
        if (this.dragGhostElement) {
            this.dragGhostElement.style.cursor = cursor;
        }
    }

    //Execute the drop
    private moveDraggedChipToNewLocation(appendToExpressionItem: ExpressionItem, fromAddConditionBtn?: boolean) {
        //Copy dragged chip
        const dragCopy = { ...this.sourceExpressionItem };
        dragCopy.parent = appendToExpressionItem.parent;

        //Paste on new place
        const index = appendToExpressionItem.parent.children.indexOf(appendToExpressionItem);
        appendToExpressionItem.parent.children.splice(index + (fromAddConditionBtn || this.dropUnder ? 1 : 0), 0, dragCopy);

        //Delete from old place
        this.deleteItem(this.sourceExpressionItem);
    }

    //Reset Drag&Drop vars. Optionally the drag source vars too 
    private resetDragAndDrop(clearDragged: boolean) {
        this.targetExpressionItem = null;
        this.targetElement = null;
        this.dropUnder = null;
        (this.dropGhostChipNode as HTMLElement)?.remove();
        this.dropGhostChipNode = null;
        this.keyDragOffsetIndex = 0;
        this.keyDragFirstMove = true;
        this.setDragCursor('no-drop');

        if ((clearDragged || this.isKeyboardDrag) && this.sourceElement) {
            this.sourceElement.style.display = '';
        }

        if (clearDragged) {
            this.sourceExpressionItem = null;
            this.sourceElement = null;
            this.dropZonesList = null;
            this.expressionsList = null;
        }
    }

    private listenToKeyboard() {
        this.keyboardSubscription$?.unsubscribe();
        this.keyboardSubscription$ = fromEvent<KeyboardEvent>(this.mainExpressionTree, 'keydown')
            .pipe(filter(key => ['ArrowUp', 'ArrowDown', 'Enter', 'Space', 'Escape', 'Tab'].includes(key.code)))
            .pipe(tap(e => {
                //Inhibit Tabs if keyboard drag is underway
                if (e.key !== 'Tab' || this.dropGhostElement) e.preventDefault();
            }))
            .pipe(filter(event => !event.repeat))
            .subscribe(key => {
                if (key.code == 'Escape') {
                    //TODO cancel mouse drag
                    this.resetDragAndDrop(false);
                    //Regain focus on the drag icon after keyboard drag cancel
                    if (this.isKeyboardDrag) {
                        (this.sourceElement.firstElementChild.firstElementChild.firstElementChild.firstElementChild as HTMLElement).focus();
                    }
                } else if (key.code == 'ArrowUp' || key.code == 'ArrowDown') {
                    this.arrowDrag(key);
                } else if (key.code == 'Enter' || key.code == 'Space') {
                    //this.platform.isActivationKey(eventArgs) Maybe use this rather that Enter/Space?
                    this.onChipDropped();
                    this.keyboardSubscription$.unsubscribe();
                }
            });
    }

    //Perform up/down movement of drop ghost along the expression tree
    private arrowDrag(key: KeyboardEvent) {
        if (!this.sourceElement || !this.sourceExpressionItem) return;

        if (this.keyDragFirstMove) {
            this.expressionsList = this.getListedExpressions(this.rootGroup);
            this.dropZonesList = this.getListedDropZones();
            this.sourceElement.style.display = 'none';
        }

        //const index = this.expressionsList.indexOf(this.sourceExpressionItem);
        const index = this.dropZonesList.indexOf(this.sourceElement);

        if (index === -1) console.error("Dragged expression not found");

        let newKeyIndexOffset = 0;
        if (key.code == 'ArrowUp') {
            //decrease index offset capped at top of tree 
            newKeyIndexOffset = this.keyDragOffsetIndex - 1 >= index * -2 - 1 ? this.keyDragOffsetIndex - 1 : this.keyDragOffsetIndex;
        } else if (key.code == 'ArrowDown') {
            //increase index offset capped at bottom of tree
            newKeyIndexOffset = this.keyDragOffsetIndex + 1 <= (this.dropZonesList.length - 2 - index) * 2 + 2 ? this.keyDragOffsetIndex + 1 : this.keyDragOffsetIndex;
        }

        //if up/down limits not reached
        if (newKeyIndexOffset != this.keyDragOffsetIndex) {
            this.keyDragOffsetIndex = newKeyIndexOffset;
            const indexOffset = ~~(this.keyDragOffsetIndex / 2);

            //If not the last drop zone (the +Condition button)
            if (index + indexOffset <= this.dropZonesList.length - 2) {
                const groupsTillCurrent = this.dropZonesList.filter((x, ix) => ix < index + indexOffset && x.className.indexOf('igx-filter-tree-group-context-menu') !== -1).length;

                let under = this.keyDragOffsetIndex < 0 ? this.keyDragOffsetIndex % 2 == 0 ? true : false : this.keyDragOffsetIndex % 2 == 0 ? false : true;
                let overrideDropUnder;

                //if the current drop zone is a condition chip
                if (this.dropZonesList[index + indexOffset].className.indexOf('igx-filter-tree-group-context-menu') === -1) {
                    this.targetElement = this.dropZonesList[index + indexOffset]
                    this.targetExpressionItem = this.expressionsList[index + indexOffset - groupsTillCurrent];
                } else {
                    //if the current drop zone is a group root (AND/OR)
                    if ((index + indexOffset === 0)) {
                        //If the root group's AND/OR 
                        this.targetElement = this.dropZonesList[0]
                        this.targetExpressionItem = this.rootGroup.children[0];
                        under = true;
                        overrideDropUnder = false;
                    } else if (under || (index + indexOffset === 0)) {
                        //If under AND/OR
                        this.targetElement = this.dropZonesList[index + indexOffset]
                        this.targetExpressionItem = this.expressionsList[index + indexOffset - groupsTillCurrent];
                        overrideDropUnder = false;
                    } else {
                        //if over AND/OR
                        this.targetElement = this.dropZonesList[index + indexOffset].parentElement.parentElement;
                        const targetEx = this.expressionsList[index + indexOffset - groupsTillCurrent];
                        this.targetExpressionItem = targetEx.parent ? targetEx.parent : targetEx;
                    }
                }

                const before = this.getPreviousChip(this.dropGhostElement);
                const after = this.getNextChip(this.dropGhostElement);

                this.renderDropGhostChip(this.targetElement, under, true, overrideDropUnder);

                //If it's the first arrow hit OR drop ghost is not displayed OR hasn't actually moved => move one more step in the same direction
                if (this.keyDragFirstMove ||
                    !this.dropGhostElement ||
                    (this.getPreviousChip(this.dropGhostElement) === before && this.getNextChip(this.dropGhostElement) === after)) {
                    this.keyDragFirstMove = false;
                    this.arrowDrag(key);
                }
            } else {
                //Dropping on '+ Condition button' => drop as last condition in the root group
                let lastElement = this.getPreviousChip(this.dropZonesList[this.dropZonesList.length - 1].parentElement);
                lastElement = lastElement === this.dropGhostChipNode ? this.getPreviousChip(lastElement as HTMLElement) : lastElement;

                const getParentExpression = (expression: ExpressionItem) => {
                    return expression.parent ? getParentExpression(expression.parent) : expression
                };
                const rootGroup = getParentExpression(this.expressionsList[this.expressionsList.length - 1]);

                this.targetElement = lastElement as HTMLElement;
                this.targetExpressionItem = rootGroup.children[rootGroup.children.length - 1];

                this.renderDropGhostChip(lastElement as HTMLElement, true, true);
            }
        }

        return;
    }

    //Get previous chip area taking into account a possible hidden sub-tree or collapsed base chip
    private getPreviousChip(chipSubject: HTMLElement) {
        //TODO optimize
        let prevElement = chipSubject?.previousElementSibling;
        prevElement = prevElement?.classList?.contains('igx-query-builder-tree') || (prevElement as HTMLElement)?.style?.display === 'none' ? prevElement?.previousElementSibling : prevElement;
        prevElement = prevElement?.classList?.contains('igx-query-builder-tree') || (prevElement as HTMLElement)?.style?.display === 'none' ? prevElement?.previousElementSibling : prevElement;

        return prevElement;
    }

    //Get next chip area taking into account a possible hidden sub-tree or collapsed base chip
    private getNextChip(chipSubject: HTMLElement) {
        //Get next and prev chip area taking into account a possible hidden sub-tree
        let nextElement = chipSubject?.nextElementSibling;
        nextElement = nextElement?.classList?.contains('igx-query-builder-tree') || (nextElement as HTMLElement)?.style?.display === 'none' ? nextElement?.nextElementSibling : nextElement;
        nextElement = nextElement?.classList?.contains('igx-query-builder-tree') || (nextElement as HTMLElement)?.style?.display === 'none' ? nextElement?.nextElementSibling : nextElement;

        return nextElement;
    }

    //Get all expressions from the tree flatten out as a list
    private getListedExpressions(group: ExpressionGroupItem): ExpressionItem[] {
        const expressions: ExpressionItem[] = [];

        group.children.forEach(child => {
            if (child instanceof ExpressionGroupItem) {
                expressions.push(...this.getListedExpressions(child));
            } else {
                expressions.push(child);
            }
        });

        return expressions;
    }

    //Gets all chip elements owned by this tree (discard child trees), AND/OR group roots and '+condition' button, flatten out as a list of HTML elements
    private getListedDropZones(): HTMLElement[] {
        const viableDropAreaSelector = `.igx-filter-tree__expression-item:not([style*="display:none"]):not(.${this.dropGhostClass}),
        .igx-filter-tree__inputs:not(.igx-query-builder__main > .igx-filter-tree__inputs),
        .igx-filter-tree__buttons > .igx-button:first-of-type,
        .igx-filter-tree-group-context-menu`;

        const expressionElementList = (this.el.nativeElement as HTMLElement).querySelectorAll(viableDropAreaSelector);
        const ownChipElements = [];

        expressionElementList.forEach(element => {
            if (isNotFromThisTree(this.el.nativeElement, element))
                return;
            ownChipElements.push(element);
        });

        function isNotFromThisTree(qb, parent) {
            if (parent == qb) return false;
            else if (parent?.style?.display === "none" || parent.classList.contains('igx-query-builder-tree')) return true;
            else if (parent.parentElement) return isNotFromThisTree(qb, parent.parentElement);
            else return false;
        }

        return ownChipElements;
    }

    public onChipDragIndicatorFocus(sourceDragElement: HTMLElement, sourceExpressionItem: ExpressionItem) {
        (sourceDragElement.querySelector('.igx-drag-indicator') as HTMLElement).setAttribute('aria-hidden', 'false'); //Temp solution for aria-hidden bug #35759
        this.onMoveStart(sourceDragElement, sourceExpressionItem, true);
    }

    public onChipDragIndicatorFocusOut() {
        if (this.sourceElement?.style?.display !== 'none') {
            this.resetDragAndDrop(true);
            this.keyboardSubscription$?.unsubscribe();
        }
    }

    //Upon blurring the tree, if Keyboard drag is underway and the next active item is not the drop ghost's drag indicator icon, cancel the drag&drop procedure
    public onDragFocusOut() {
        if (this.isKeyboardDrag && this.dropGhostElement) {
            //have to wait a tick because upon blur, the next activeElement is always body, right before the next element gains focus
            setTimeout(() => {
                if (document.activeElement.className.indexOf("igx-drag-indicator") === -1) {
                    this.resetDragAndDrop(true);
                    this.keyboardSubscription$?.unsubscribe();
                }
            }, 0);
        }
    }

    /* DRAG AND DROP END*/

    /**
     * @hidden @internal
     */
    public addExpressionBlur() {
        if (this.prevFocusedExpression) {
            this.prevFocusedExpression.focused = false;
        }
        if (this.addExpressionItemDropDown && !this.addExpressionItemDropDown.collapsed) {
            this.addExpressionItemDropDown.close();
        }
    }

    /**
     * @hidden @internal
     */
    public onChipClick(expressionItem: ExpressionOperandItem, chip: IgxChipComponent) {
        this.enterExpressionEdit(expressionItem, chip);
    }

    /**
     * @hidden @internal
     */
    public enterExpressionEdit(expressionItem: ExpressionOperandItem, chip?: IgxChipComponent) {
        if (this.shouldPreventExitEdit(expressionItem)) {
            this.focusLastEditedExpressionInput();
            return;
        }
        this.exitEditAddMode(true);
        this.cdr.detectChanges();
        this._lastFocusedChipIndex = chip ? this.expressionsChips.toArray().findIndex(expr => expr === chip) : this._lastFocusedChipIndex;
        this.enterEditMode(expressionItem);
    }


    /**
     * @hidden @internal
     */
    public clickExpressionAdd(expressionItem: ExpressionOperandItem, targetButton: HTMLElement, chip: IgxChipComponent) {
        if (this.shouldPreventExitEdit(expressionItem)) {
            this.focusLastEditedExpressionInput();
            return;
        }
        this.exitEditAddMode(true);
        this.cdr.detectChanges();
        this._lastFocusedChipIndex = this.expressionsChips.toArray().findIndex(expr => expr === chip);
        this.openExpressionAddDialog(targetButton);
    }

    /**
     * @hidden @internal
     */
    public openExpressionAddDialog(targetButton: HTMLElement) {
        this.addExpressionDropDownOverlaySettings.target = targetButton;
        this.addExpressionDropDownOverlaySettings.positionStrategy = new ConnectedPositioningStrategy({
            horizontalDirection: HorizontalAlignment.Right,
            horizontalStartPoint: HorizontalAlignment.Left,
            verticalStartPoint: VerticalAlignment.Bottom
        });

        this.addExpressionItemDropDown.open(this.addExpressionDropDownOverlaySettings);
    }

    /**
     * @hidden @internal
     */
    public enterExpressionAdd(event: ISelectionEventArgs, expressionItem: ExpressionOperandItem) {
        if (this._addModeExpression) {
            this._addModeExpression.inAddMode = false;
        }

        if (this.parentExpression) {
            this.inEditModeChange.emit(this.parentExpression);
        }

        const parent = expressionItem.parent ?? this.rootGroup;
        requestAnimationFrame(() => {
            if (event.newSelection.value === 'addCondition') {
                this.addCondition(parent, expressionItem);
            } else if (event.newSelection.value === 'addGroup') {
                this.addReverseGroup(parent, expressionItem);
            }
            expressionItem.inAddMode = true;
            this._addModeExpression = expressionItem;
        })
    }

    /**
     * @hidden @internal
     */
    public enterEditMode(expressionItem: ExpressionOperandItem) {
        if (this._editedExpression) {
            this._editedExpression.inEditMode = false;
        }

        if (this.parentExpression) {
            this.inEditModeChange.emit(this.parentExpression);
        }

        expressionItem.hovered = false;
        this.fields = this.selectedEntity ? this.selectedEntity.fields : null;
        this.selectedField =
            expressionItem.expression.fieldName ?
                this.fields?.find(field => field.field === expressionItem.expression.fieldName)
                : null;
        this.selectedCondition =
            expressionItem.expression.condition ?
                expressionItem.expression.condition.name :
                null;
        this.searchValue.value = expressionItem.expression.searchVal;

        expressionItem.inEditMode = true;
        this._editedExpression = expressionItem;
        this.cdr.detectChanges();

        this.entitySelectOverlaySettings.target = this.entitySelect.element;
        this.entitySelectOverlaySettings.excludeFromOutsideClick = [this.entitySelect.element as HTMLElement];
        this.entitySelectOverlaySettings.positionStrategy = new AutoPositionStrategy();

        if (this.returnFieldSelect) {
            this.returnFieldSelectOverlaySettings.target = this.returnFieldSelect.element;
            this.returnFieldSelectOverlaySettings.excludeFromOutsideClick = [this.returnFieldSelect.element as HTMLElement];
            this.returnFieldSelectOverlaySettings.positionStrategy = new AutoPositionStrategy();
        }
        if (this.fieldSelect) {
            this.fieldSelectOverlaySettings.target = this.fieldSelect.element;
            this.fieldSelectOverlaySettings.excludeFromOutsideClick = [this.fieldSelect.element as HTMLElement];
            this.fieldSelectOverlaySettings.positionStrategy = new AutoPositionStrategy();
        }
        if (this.conditionSelect) {
            this.conditionSelectOverlaySettings.target = this.conditionSelect.element;
            this.conditionSelectOverlaySettings.excludeFromOutsideClick = [this.conditionSelect.element as HTMLElement];
            this.conditionSelectOverlaySettings.positionStrategy = new AutoPositionStrategy();
        }

        if (!this.selectedField) {
            this.fieldSelect.input.nativeElement.focus();
        } else if (this.selectedField.filters.condition(this.selectedCondition)?.isUnary) {
            this.conditionSelect.input.nativeElement.focus();
        } else {
            const input = this.searchValueInput?.nativeElement || this.picker?.getEditElement();
            input?.focus();
        }
    }

    /**
     * @hidden @internal
     */
    public onKeyDown(eventArgs: KeyboardEvent) {
        eventArgs.stopPropagation();
    }

    /**
     * @hidden @internal
     */
    public onGroupClick(groupContextMenuDropDown: any, targetButton: HTMLButtonElement, groupItem: ExpressionGroupItem) {
        this.exitEditAddMode();
        this.cdr.detectChanges();

        this.groupContextMenuDropDown = groupContextMenuDropDown;
        this.groupContextMenuDropDownOverlaySettings.target = targetButton;
        this.groupContextMenuDropDownOverlaySettings.positionStrategy = new ConnectedPositioningStrategy({
            horizontalDirection: HorizontalAlignment.Right,
            horizontalStartPoint: HorizontalAlignment.Left,
            verticalStartPoint: VerticalAlignment.Bottom
        });

        if (groupContextMenuDropDown.collapsed) {
            this.contextualGroup = groupItem;
            groupContextMenuDropDown.open(this.groupContextMenuDropDownOverlaySettings);
        } else {
            groupContextMenuDropDown.close();
        }
    }

    /**
     * @hidden @internal
     */
    public getSwitchGroupText(operator: FilteringLogic) {
        const condition = operator === FilteringLogic.Or ? this.resourceStrings.igx_query_builder_and_label : this.resourceStrings.igx_query_builder_or_label
        return this.resourceStrings.igx_query_builder_switch_group.replace('{0}', condition.toUpperCase());
    }

    /**
     * @hidden @internal
     */
    public onGroupContextMenuDropDownSelectionChanging(event: ISelectionEventArgs) {
        event.cancel = true;

        if (event.newSelection.value === 'switchCondition') {
            this.selectFilteringLogic(this.contextualGroup?.operator === 0 ? 1 : 0)
        } else if (event.newSelection.value === 'ungroup') {
            this.ungroup();
        }

        this.groupContextMenuDropDown.close();
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
        this.commitOperandEdit();
    }

    /**
     * @hidden @internal
     */
    public selectFilteringLogic(index: number) {
        this.contextualGroup.operator = index as FilteringLogic;
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
    public invokeClick(eventArgs: KeyboardEvent) {
        if (!this.dropGhostChipNode && this.platform.isActivationKey(eventArgs)) {
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
        if (!this.selectedField) return [];

        if (this.entities?.length === 1 && !this.entities[0].name) {
            return this.selectedField.filters.conditionList();
        }

        return this.selectedField.filters.extendedConditionList();
    }

    /**
     * @hidden @internal
     */
    public getFormatter(field: string) {
        return this.fields?.find(el => el.field === field)?.formatter;
    }

    /**
     * @hidden @internal
     */
    public getFormat(field: string) {
        return this.fields?.find(el => el.field === field).pipeArgs.format;
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

    public formatReturnFields(innerTree: IFilteringExpressionsTree) {
        const returnFields = innerTree.returnFields;
        let text = returnFields.join(', ');
        const innerTreeEntity = this.entities?.find(el => el.name === innerTree.entity);
        if (returnFields.length === innerTreeEntity?.fields.length) {
            text = this.resourceStrings.igx_query_builder_all_fields;
        } else {
            text = returnFields.join(', ');
            text = text.length > 25 ? text.substring(0, 25) + ' ...' : text;
        }
        return text;
    }

    public isInEditMode(): boolean {
        return !this.parentExpression || (this.parentExpression && this.parentExpression.inEditMode);
    }

    public onInEditModeChanged(expressionItem: ExpressionOperandItem) {
        if (!expressionItem.inEditMode) {
            this.enterExpressionEdit(expressionItem);
        }
    }

    public getExpressionTreeCopy(expressionTree: IExpressionTree, shouldAssignInnerQueryExprTree?: boolean): IExpressionTree {
        if (!expressionTree) {
            return null;
        }

        const exprTreeCopy =
        {
            filteringOperands: [],
            operator: expressionTree.operator,
            fieldName: expressionTree.fieldName,
            entity: expressionTree.entity,
            returnFields: expressionTree.returnFields
        };
        expressionTree.filteringOperands.forEach(o => o instanceof FilteringExpressionsTree ? exprTreeCopy.filteringOperands.push(this.getExpressionTreeCopy(o)) : exprTreeCopy.filteringOperands.push(o));

        if (!this.innerQueryNewExpressionTree && shouldAssignInnerQueryExprTree) {
            this.innerQueryNewExpressionTree = exprTreeCopy;
        }

        return exprTreeCopy;
    }

    public onSelectAllClicked(_event) {
        if (
            (this._selectedReturnFields.length > 0 && this._selectedReturnFields.length < this._selectedEntity.fields.length) ||
            this._selectedReturnFields.length == this._selectedEntity.fields.length
        ) {
            this.returnFieldsCombo.deselectAllItems();
        } else {
            this.returnFieldsCombo.selectAllItems();
        }
    }

    public onReturnFieldSelectChanging(event: IComboSelectionChangingEventArgs | ISelectionEventArgs) {
        let newSelection = [];
        if (event.newSelection instanceof Array) {
            newSelection = event.newSelection.map(item => item.field)
        } else {
            newSelection.push(event.newSelection.value);
            this._selectedReturnFields = newSelection;
        }

        this.initExpressionTree(this.selectedEntity.name, newSelection);
    }

    public initExpressionTree(selectedEntityName: string, selectedReturnFields: string[]) {
        if (!this._expressionTree) {
            this._expressionTree = this.createExpressionTreeFromGroupItem(new ExpressionGroupItem(FilteringLogic.And, this.rootGroup), selectedEntityName, selectedReturnFields);
        }

        if (!this.parentExpression) {
            this.expressionTreeChange.emit(this._expressionTree);
        }
    }

    public getSearchValueTemplateContext(defaultSearchValueTemplate): any {
        const ctx = {
            $implicit: this.searchValue,
            selectedField: this.selectedField,
            selectedCondition: this.selectedCondition,
            defaultSearchValueTemplate: defaultSearchValueTemplate
        };
        return ctx;
    }

    private shouldPreventExitEdit(expressionItem: ExpressionOperandItem): boolean {
        const innerQuery = this.innerQueries.filter(q => q.isInEditMode())[0]
        return this._editedExpression &&
            innerQuery && innerQuery.hasEditedExpression &&
            this._editedExpression.expression.searchTree != expressionItem.expression.searchTree;
    }

    private focusLastEditedExpressionInput() {
        const innerQuery = this.innerQueries.filter(q => q.isInEditMode())[0];
        const expressionToScroll = innerQuery._editingInputsContainer?.nativeElement as Element;
        const itemToFocus = Array.from(expressionToScroll.children).filter(input => input.querySelector('input') && !input.querySelector('input').disabled).pop().querySelector('input') as HTMLElement;
        expressionToScroll.scrollIntoView();
        itemToFocus.focus();
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

    private createExpressionGroupItem(expressionTree: IExpressionTree, parent?: ExpressionGroupItem, entityName?: string): ExpressionGroupItem {
        let groupItem: ExpressionGroupItem;
        if (expressionTree) {
            groupItem = new ExpressionGroupItem(expressionTree.operator, parent);
            if (!expressionTree.filteringOperands) {
                return groupItem;
            }

            for (const expr of expressionTree.filteringOperands) {
                if (expr instanceof FilteringExpressionsTree) {
                    groupItem.children.push(this.createExpressionGroupItem(expr, groupItem, expressionTree.entity));
                } else {
                    const filteringExpr = expr as IFilteringExpression;
                    const exprCopy: IFilteringExpression = {
                        fieldName: filteringExpr.fieldName,
                        condition: filteringExpr.condition,
                        conditionName: filteringExpr.condition.name,
                        searchVal: filteringExpr.searchVal,
                        searchTree: filteringExpr.searchTree,
                        ignoreCase: filteringExpr.ignoreCase
                    };
                    const operandItem = new ExpressionOperandItem(exprCopy, groupItem);
                    const field = this.fields?.find(el => el.field === filteringExpr.fieldName);
                    operandItem.fieldLabel = field?.label || field?.header || field?.field;
                    if (this._expandedExpressions.filter(e => e.searchTree == operandItem.expression.searchTree).length > 0) {
                        operandItem.expanded = true;
                    }
                    groupItem.children.push(operandItem);
                }
            }


            if (expressionTree.entity) {
                entityName = expressionTree.entity;
            }
            const entity = this.entities?.find(el => el.name === entityName);
            if (entity) {
                this.fields = entity.fields;
            }

            this._selectedEntity = this.entities?.find(el => el.name === entityName);
            this._selectedReturnFields =
                !expressionTree.returnFields || expressionTree.returnFields.includes('*') || expressionTree.returnFields.includes('All') || expressionTree.returnFields.length === 0
                    ? this.fields?.map(f => f.field)
                    : this.fields?.filter(f => expressionTree.returnFields.indexOf(f.field) >= 0).map(f => f.field);
        }
        return groupItem;
    }

    private createExpressionTreeFromGroupItem(groupItem: ExpressionGroupItem, entity?: string, returnFields?: string[]): FilteringExpressionsTree {
        if (!groupItem) {
            return null;
        }

        const expressionTree = new FilteringExpressionsTree(groupItem.operator, undefined, entity, returnFields);

        for (const item of groupItem.children) {
            if (item instanceof ExpressionGroupItem) {
                const subTree = this.createExpressionTreeFromGroupItem((item as ExpressionGroupItem), entity, returnFields);
                expressionTree.filteringOperands.push(subTree);
            } else {
                expressionTree.filteringOperands.push((item as ExpressionOperandItem).expression);
            }
        }

        return expressionTree;
    }

    private deleteItem(expressionItem: ExpressionItem) {
        //console.log('deleteItem', expressionItem)
        if (!expressionItem.parent) {
            this.rootGroup = null;
            this.currentGroup = null;
            //this._expressionTree = null;
            return;
        }

        if (expressionItem === this.currentGroup) {
            this.currentGroup = this.currentGroup.parent;
        }

        const children = expressionItem.parent.children;
        const index = children.indexOf(expressionItem);
        children.splice(index, 1);
        const entity = this.expressionTree ? this.expressionTree.entity : null;
        const returnFields = this.expressionTree ? this.expressionTree.returnFields : null;
        this._expressionTree = this.createExpressionTreeFromGroupItem(this.rootGroup, entity, returnFields); // TODO: don't recreate if not necessary

        if (!children.length) {
            this.deleteItem(expressionItem.parent);
        }

        if (!this.parentExpression) {
            this.expressionTreeChange.emit(this._expressionTree);
        }
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

    private focusEditedExpressionChip() {
        setTimeout(() => {
            if (this._lastFocusedChipIndex != -1) {
                const chipElement = this.expressionsChips.toArray()[this._lastFocusedChipIndex].nativeElement;
                chipElement.focus();
                this._lastFocusedChipIndex = -1;
                this._focusDelay = DEFAULT_CHIP_FOCUS_DELAY;
            }
        }, this._focusDelay);
    }

    private init() {
        this.cancelOperandAdd();
        this.cancelOperandEdit();

        // Ignore values of certain properties for the comparison
        const propsToIgnore = ['parent', 'hovered', 'ignoreCase', 'inEditMode', 'inAddMode'];
        const propsReplacer = function replacer(key, value) {
            if (propsToIgnore.indexOf(key) >= 0) {
                return undefined;
            } else {
                return value;
            }
        };

        // Skip root being recreated if the same
        const newRootGroup = this.createExpressionGroupItem(this.expressionTree);
        if (JSON.stringify(this.rootGroup, propsReplacer) !== JSON.stringify(newRootGroup, propsReplacer)) {
            this.rootGroup = this.createExpressionGroupItem(this.expressionTree);
            this.currentGroup = this.rootGroup;
        }

        if (this.rootGroup?.children?.length == 0) {
            this.rootGroup = null;
            this.currentGroup = null;
        }
    }
}
