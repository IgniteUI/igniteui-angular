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

import { IgxOverlayOutletDirective, IgxToggleActionDirective, IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { FieldType, EntityType } from '../grids/common/grid.interface';
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
import { IgxComboComponent } from "../combo/combo.component";
import { IgxLabelDirective } from '../input-group/public_api';
import { IgxQueryBuilderTreeComponent } from './query-builder-tree.component';

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
    standalone: true,
    imports: [NgIf, IgxQueryBuilderHeaderComponent, IgxQueryBuilderTreeComponent]
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

    @Input()
    public entities: EntityType[];

    // /**
    // * Returns the fields.
    // */
    // public get fields(): FieldType[] {
    //     return this._fields;
    // }

    // /**
    //  * Sets the fields.
    //  */
    // @Input()
    // public set fields(fields: FieldType[]) {
    //     this._fields = fields;

    //     if (this._fields) {
    //         this.registerSVGIcons();

    //         this._fields.forEach(field => {
    //             this.setFilters(field);
    //             this.setFormat(field);
    //         });
    //     }
    // }

    
    @Input()
    public expressionTree: IExpressionTree;

    /**
     * Gets the `locale` of the query builder.
     * If not set, defaults to application's locale.
     */
    @Input()
    public locale: string;

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

    /**
     * @hidden @internal
     */
    @ContentChild(IgxQueryBuilderHeaderComponent)
    public headerContent: IgxQueryBuilderHeaderComponent;
    
    /**
     * @hidden @internal
     */
    @ViewChild(IgxQueryBuilderTreeComponent)
    public queryTree: IgxQueryBuilderTreeComponent;
    
    private destroy$ = new Subject<any>();
    private _resourceStrings = getCurrentResourceStrings(QueryBuilderResourceStringsEN);

    /**
     * @hidden @internal
     */
    public ngAfterViewInit(): void {
        // this._overlaySettings.outlet = this.overlayOutlet;
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
     *
     * used by the grid
     */
    public setPickerOutlet(outlet?: IgxOverlayOutletDirective | ElementRef) {
        this.queryTree.setPickerOutlet(outlet);
    }

    /**
     * @hidden @internal
     *
     * used by the grid
     */
    public get isContextMenuVisible(): boolean {
        return this.queryTree.isContextMenuVisible;
    }

    /**
     * @hidden @internal
     */
    public clearSelection() {
        this.queryTree.clearSelection();
    }

    /**
     * @hidden @internal
     *
     * used by the grid
     */
    public exitOperandEdit() {
        this.queryTree.exitOperandEdit();
    }

    /**
     * @hidden @internal
     *
     * used by the grid
     */
    public setAddButtonFocus() {
        this.queryTree.setAddButtonFocus();
    }

    public onExpressionTreeChange(tree: IExpressionTree) {
        this.expressionTree = tree;
        this.expressionTreeChange.emit();
    }
}

