import {
    ChangeDetectorRef,
    Component,
    Input,
    TemplateRef,
    ViewChild,
    HostBinding,
    AfterViewInit,
    ElementRef,
    DoCheck
} from '@angular/core';
import { IgxColumnComponent } from '../column.component';
import { FilteringLogic, IFilteringExpression } from '../../data-operations/filtering-expression.interface';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IBaseChipEventArgs, IgxChipsAreaComponent } from '../../chips';
import { IgxGridFilterConditionPipe } from '../grid.pipes';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { IgxFilteringService, ExpressionUI } from './grid-filtering.service';
import { KEYCODES, cloneArray } from '../../core/utils';

/**
 * @hidden
 */
@Component({
    preserveWhitespaces: false,
    selector: 'igx-grid-filtering-cell',
    templateUrl: './grid-filtering-cell.component.html'
})
export class IgxGridFilteringCellComponent implements AfterViewInit, DoCheck {

    @Input()
    public column: IgxColumnComponent;

    @ViewChild('emptyFilter', { read: TemplateRef })
    protected emptyFilter: TemplateRef<any>;

    @ViewChild('defaultFilter', { read: TemplateRef })
    protected defaultFilter: TemplateRef<any>;

    @ViewChild('complexFilter', { read: TemplateRef })
    protected complexFilter: TemplateRef<any>;

    @ViewChild('chipsArea', { read: IgxChipsAreaComponent })
    protected chipsArea: IgxChipsAreaComponent;

    @ViewChild('moreIcon', { read: ElementRef })
    protected moreIcon: ElementRef;

    private rootExpressionsTree: FilteringExpressionsTree;
    private filterPipe = new IgxGridFilterConditionPipe();
    private titlecasePipe = new TitleCasePipe();
    private datePipe = new DatePipe(window.navigator.language);
    private isMoreIconHidden = true;
    private expressionsList: ExpressionUI[];
    private baseClass = 'igx-grid__filtering-cell-indicator';

    public visibleExpressionsList: ExpressionUI[];
    public moreFiltersCount = 0;

    @HostBinding('style.min-width')
    @HostBinding('style.max-width')
    @HostBinding('style.flex-basis')
    get width() {
        return this.column.width;
    }

    @HostBinding('class.igx-grid__filtering-cell')
    public cssClass = 'igx-grid__filtering-cell';

    @HostBinding('class.igx-grid__th--pinned-last')
    get isLastPinned() {
        const pinnedCols = this.filteringService.grid.pinnedColumns;
        if (pinnedCols.length === 0) {
            return false;
        } else {
            return pinnedCols.indexOf(this.column) === pinnedCols.length - 1;
        }
    }

    constructor(public cdr: ChangeDetectorRef, private filteringService: IgxFilteringService) {
        this.filteringService.subscribeToEvents();
    }

    ngAfterViewInit(): void {
        this.updateFilterCellArea();
    }

    ngDoCheck(): void {
        this.updateFilterCellArea();
        this.cdr.markForCheck;      // todo: should this be removed as it's called inside the method above
    }

    public updateFilterCellArea() {
        this.expressionsList = this.filteringService.getExpressions(this.column.field);
        this.updateVisibleFilters();
    }

    get template(): TemplateRef<any> {
        if (!this.column.filterable) {
            return null;
        }

        const expressionTree = this.column.filteringExpressionsTree;
        if (!expressionTree || expressionTree.filteringOperands.length === 0) {
            return this.emptyFilter;
        }

        if (this.filteringService.isFilterComplex(this.column.field)) {
            return this.complexFilter;
        }

        return this.defaultFilter;
    }

    private removeExpression(indexToRemove: number) {
        if (indexToRemove === 0 && this.expressionsList.length === 1) {
            this.clearFiltering();
            return;
        }

        this.filteringService.removeExpression(this.column.field, indexToRemove);

        this.updateVisibleFilters();
        this.filter();
    }

    public getOperator(operator: FilteringLogic): any {
        return FilteringLogic[operator];
    }

    public getChipLabel(expression: IFilteringExpression): any {
        if (expression.condition.isUnary) {
            return this.titlecasePipe.transform(this.filterPipe.transform(expression.condition.name));
        } else if (expression.searchVal instanceof Date) {
            return this.datePipe.transform(expression.searchVal);
        } else {
            return expression.searchVal;
        }
    }

    public onChipClicked(expression?: IFilteringExpression) {
        this.filteringService.filteredColumn = this.column;
        this.filteringService.isFilterRowVisible = true;
        this.filteringService.selectedExpression = expression;
    }

    public onChipRemoved(eventArgs: IBaseChipEventArgs, item: ExpressionUI): void {
        const indexToRemove = this.expressionsList.indexOf(item);
        this.removeExpression(indexToRemove);
    }

    private updateVisibleFilters() {
        this.visibleExpressionsList = cloneArray(this.expressionsList);

        this.cdr.detectChanges();

        if (this.moreIcon) {
            this.isMoreIconHidden = true;
        }
        if (this.chipsArea && this.expressionsList.length > 1) {
            const areaWidth = this.chipsArea.element.nativeElement.offsetWidth;
            let viewWidth = 0;
            const chipsAreaElements = this.chipsArea.element.nativeElement.children;
            let visibleChipsCount = 0;
            const moreIconWidth = this.moreIcon.nativeElement.offsetWidth;

            for (let index = 0; index < chipsAreaElements.length - 1; index++) {
                if (viewWidth + chipsAreaElements[index].offsetWidth < areaWidth) {
                    viewWidth += chipsAreaElements[index].offsetWidth;
                    if (index % 2 === 0) {
                        visibleChipsCount++;
                    }
                } else {
                    if (index % 2 !== 0 && viewWidth + moreIconWidth > areaWidth) {
                        visibleChipsCount--;
                    } else if (visibleChipsCount > 0 && viewWidth - chipsAreaElements[index - 1].offsetWidth + moreIconWidth > areaWidth) {
                        visibleChipsCount--;
                    }
                    this.moreFiltersCount = this.expressionsList.length - visibleChipsCount;
                    this.isMoreIconHidden = false;
                    this.visibleExpressionsList.splice(visibleChipsCount);
                    this.cdr.detectChanges();
                    break;
                }
            }
        }
    }

    public filter(): void {
        this.rootExpressionsTree = this.filteringService.createSimpleFilteringTree(this.column.field);

        this.filteringService.filter(this.column.field, this.rootExpressionsTree);
    }

    public clearFiltering(): void {
        this.filteringService.clearFilter(this.column.field);
        this.visibleExpressionsList = [];
    }

    public onKeyDown(eventArgs: KeyboardEvent, expression?: IFilteringExpression) {
        if (eventArgs.keyCode === KEYCODES.ENTER) {
            eventArgs.preventDefault();
            this.onChipClicked(expression);
        }
    }

    public filteringIndicatorClass() {
        return {
            [this.baseClass]: !this.isMoreIconHidden,
            [`${this.baseClass}--hidden`]: this.isMoreIconHidden
        }
    }
}
