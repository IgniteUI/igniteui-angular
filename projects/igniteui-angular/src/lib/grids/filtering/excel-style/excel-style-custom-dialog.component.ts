import {
    Component,
    ChangeDetectionStrategy,
    Input,
    ChangeDetectorRef,
    ViewChild,
    AfterViewInit,
    TemplateRef,
    ViewChildren,
    QueryList
} from '@angular/core';
import { IgxColumnComponent } from '../../column.component';
import { IgxFilteringService, ExpressionUI } from '../grid-filtering.service';
import { FilteringLogic } from '../../../data-operations/filtering-expression.interface';
import { DataType } from '../../../data-operations/data-util';
import { IgxStringFilteringOperand, IgxBooleanFilteringOperand, IgxNumberFilteringOperand, IgxDateFilteringOperand, IFilteringOperation } from '../../../data-operations/filtering-condition';
import { IgxToggleDirective } from '../../../directives/toggle/toggle.directive';
import { ConnectedPositioningStrategy, CloseScrollStrategy, OverlaySettings, VerticalAlignment, PositionSettings, HorizontalAlignment } from '../../../services';
import { ILogicOperatorChangedArgs, IgxExcelStyleDefaultExpressionComponent } from './excel-style-default-expression.component';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-excel-style-custom-dialog',
    templateUrl: './excel-style-custom-dialog.component.html'
})
export class IgxExcelStyleCustomDialogComponent implements AfterViewInit {

    @Input()
    public expressionsList = new Array<ExpressionUI>();

    private _customDialogPositionSettings: PositionSettings = {
        verticalDirection: VerticalAlignment.Middle,
        horizontalDirection: HorizontalAlignment.Center,
        horizontalStartPoint: HorizontalAlignment.Center,
        verticalStartPoint: VerticalAlignment.Middle
    };

    private _customDialogOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        positionStrategy: new ConnectedPositioningStrategy(this._customDialogPositionSettings),
        scrollStrategy: new CloseScrollStrategy()
    };

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public selectedOperator: string;

    @Input()
    public columnData: any[];

    @ViewChildren(IgxExcelStyleDefaultExpressionComponent)
    private expressionComponents: QueryList<IgxExcelStyleDefaultExpressionComponent>;

    constructor(private cdr:ChangeDetectorRef, private filteringService: IgxFilteringService) {}

    ngAfterViewInit(): void {
        this._customDialogOverlaySettings.outlet = this.column.grid.outletDirective;
    }

    get template(): TemplateRef<any> {
        if (this.column.dataType === DataType.Date) {
            return this.dateExpressionTemplate;
        }

        return this.defaultExpressionTemplate;
    }

    public onCustomDialogOpening() {
        if (!this.column.filteringExpressionsTree) {
            this.createInitialExpressionUIElement();
        } else {
            //TODO
            // check fitlers and populate expressionsList
        }
    }

    public open() {
        this._customDialogOverlaySettings.positionStrategy.settings.target = this.column.grid.nativeElement;
        this.toggle.open(this._customDialogOverlaySettings);
    }

    public onClearButtonClick() {
        this.filteringService.grid.clearFilter(this.column.field);
        this.createInitialExpressionUIElement();
        this.cdr.detectChanges();
    }

    public onCancelButtonClick() {
        this.toggle.close();
    }

    public onApplyButtonClick() {
        this.expressionsList = this.expressionsList.filter(
            element => element.expression.condition && (element.expression.searchVal || element.expression.condition.isUnary));
        this.filteringService.filter(this.column.field, this.expressionsList);
        this.toggle.close();
    }

    public onAddButtonClick() {
        const exprUI = new ExpressionUI();
        exprUI.expression = {
            condition: null,
            fieldName: this.column.field,
            ignoreCase: this.column.filteringIgnoreCase,
            searchVal: null
        };

        this.expressionsList[this.expressionsList.length - 1].afterOperator = FilteringLogic.And;
        exprUI.beforeOperator = this.expressionsList[this.expressionsList.length - 1].afterOperator;

        this.expressionsList.push(exprUI);

        this.markChildrenForCheck();
    }

    public onExpressionRemoved(event: ExpressionUI) {
        const indexToRemove = this.expressionsList.indexOf(event);

        if (indexToRemove === 0 && this.expressionsList.length > 1) {
            this.expressionsList[1].beforeOperator = null;
        } else if (indexToRemove === this.expressionsList.length - 1) {
            this.expressionsList[indexToRemove - 1].afterOperator = null;
        } else {
            this.expressionsList[indexToRemove - 1].afterOperator = this.expressionsList[indexToRemove + 1].beforeOperator;
            this.expressionsList[0].beforeOperator = null;
            this.expressionsList[this.expressionsList.length - 1].afterOperator = null;
        }

        this.expressionsList.splice(indexToRemove, 1);

        this.markChildrenForCheck();
    }

    public onLogicOperatorChanged(event: ILogicOperatorChangedArgs) {
        const index = this.expressionsList.indexOf(event.target);
        event.target.afterOperator = event.newValue;
        if (index + 1 < this.expressionsList.length) {
            this.expressionsList[index + 1].beforeOperator = event.newValue;
        }
    }

    private createCondition(conditionName: string) {
        switch (this.column.dataType) {
            case DataType.String:
                return IgxStringFilteringOperand.instance().condition(conditionName);
            case DataType.Boolean:
                return IgxBooleanFilteringOperand.instance().condition(conditionName);
            case DataType.Number:
                return IgxNumberFilteringOperand.instance().condition(conditionName);
            case DataType.Date:
                return IgxDateFilteringOperand.instance().condition(conditionName);
        }
    }

    private markChildrenForCheck() {
        this.expressionComponents.forEach(x => x.cdr.markForCheck());
    }

    private createInitialExpressionUIElement() {
        this.expressionsList = [];
        const firstExprUI = new ExpressionUI();
        
        firstExprUI.expression = {
            condition: this.createCondition(this.selectedOperator),
            fieldName: this.column.field,
            ignoreCase: this.column.filteringIgnoreCase,
            searchVal: null
        };
        firstExprUI.afterOperator = FilteringLogic.And;

        this.expressionsList.push(firstExprUI);

        const secondExprUI = new ExpressionUI();
        secondExprUI.expression = {
            condition: null,
            fieldName: this.column.field,
            ignoreCase: this.column.filteringIgnoreCase,
            searchVal: null
        };

        secondExprUI.beforeOperator = FilteringLogic.And;
        secondExprUI.afterOperator = FilteringLogic.And;

        this.expressionsList.push(secondExprUI);
    }

    @ViewChild('toggle', { read: IgxToggleDirective })
    public toggle: IgxToggleDirective;

    @ViewChild('defaultExpressionTemplate', { read: TemplateRef })
    protected defaultExpressionTemplate: TemplateRef<any>;

    @ViewChild('dateExpressionTemplate', { read: TemplateRef })
    protected dateExpressionTemplate: TemplateRef<any>;

}