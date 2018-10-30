import {
    ChangeDetectorRef,
    Component,
    Input,
    TemplateRef,
    ViewChild,
    HostBinding,
    AfterViewInit,
    ElementRef,
    HostListener,
    OnInit
} from '@angular/core';
import { IgxColumnComponent } from '../column.component';
import { FilteringLogic, IFilteringExpression } from '../../data-operations/filtering-expression.interface';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IBaseChipEventArgs, IgxChipsAreaComponent, IgxChipComponent } from '../../chips';
import { IgxGridFilterConditionPipe } from '../grid-common.pipes';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { IgxFilteringService, ExpressionUI } from './grid-filtering.service';
import { KEYCODES, cloneArray } from '../../core/utils';
import { IgxGridNavigationService } from '../grid-navigation.service';

/**
 * @hidden
 */
@Component({
    preserveWhitespaces: false,
    selector: 'igx-grid-filtering-cell',
    templateUrl: './grid-filtering-cell.component.html'
})
export class IgxGridFilteringCellComponent implements AfterViewInit, OnInit {

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

    @ViewChild('ghostChip', { read: IgxChipComponent })
    protected ghostChip: IgxChipComponent;

    @ViewChild('complexChip', { read: IgxChipComponent })
    protected complexChip: IgxChipComponent;

    private rootExpressionsTree: FilteringExpressionsTree;
    private filterPipe = new IgxGridFilterConditionPipe();
    private titlecasePipe = new TitleCasePipe();
    private datePipe = new DatePipe(window.navigator.language);
    private expressionsList: ExpressionUI[];
    private baseClass = 'igx-grid__filtering-cell-indicator';
    private currentTemplate = null;

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

    constructor(public cdr: ChangeDetectorRef, private filteringService: IgxFilteringService, public navService: IgxGridNavigationService) {
        this.filteringService.subscribeToEvents();
    }

    ngOnInit(): void {
        this.filteringService.columnToChipToFocus.set(this.column.field, false);
        this.filteringService.columnToMoreIconHidden.set(this.column.field, true);
    }

    ngAfterViewInit(): void {
        this.updateFilterCellArea();
    }

    public getChipToFocus() {
        return this.filteringService.columnToChipToFocus.get(this.column.field);
    }

    public updateFilterCellArea() {
        this.expressionsList = this.filteringService.getExpressions(this.column.field);
        this.updateVisibleFilters();
    }

    get template(): TemplateRef<any> {
        if (!this.column.filterable) {
            this.currentTemplate = null;
            return null;
        }

        const expressionTree = this.column.filteringExpressionsTree;
        if (!expressionTree || expressionTree.filteringOperands.length === 0) {
            this.currentTemplate = this.emptyFilter;
            return this.emptyFilter;
        }

        if (this.filteringService.isFilterComplex(this.column.field)) {
            this.currentTemplate = this.complexFilter;
            return this.complexFilter;
        }

        this.currentTemplate = this.defaultFilter;
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

    private getIsMoreIconVisible(): boolean {
        return this.filteringService.columnToMoreIconHidden.get(this.column.field);
    }

    public onChipClicked(expression?: IFilteringExpression) {
        if (expression) {
            this.expressionsList.forEach((item)=> {
                if (item.expression === expression) {
                    item.isSelected = true;
                } else {
                    item.isSelected = false;
                }
            });
        } else if (this.expressionsList.length > 0) {
            this.expressionsList.forEach((item)=> {
                item.isSelected = false;
            });
            this.expressionsList[0].isSelected = true;
        }

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
            this.filteringService.columnToMoreIconHidden.set(this.column.field, true);
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
                    this.filteringService.columnToMoreIconHidden.set(this.column.field, false);
                    this.visibleExpressionsList.splice(visibleChipsCount);
                    break;
                }
            }
            this.cdr.detectChanges();
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

    @HostListener('keydown', ['$event'])
    public onTabKeyDown(eventArgs) {
        if (eventArgs.keyCode === KEYCODES.TAB) {
            if (eventArgs.shiftKey) {
                if (this.column.visibleIndex > 0 && !this.navService.isColumnLeftFullyVisible(this.column.visibleIndex - 1)) {
                    eventArgs.preventDefault();
                    this.filteringService.grid.headerContainer.scrollTo(this.column.visibleIndex - 1);
                } else if (this.column.visibleIndex === 0) {
                    eventArgs.preventDefault();
                }
            } else {
                if (this.column.visibleIndex === this.filteringService.grid.columnList.length - 1) {
                    if (this.currentTemplate === this.defaultFilter) {
                        if (this.getIsMoreIconVisible() === false) {
                            if (this.moreIcon.nativeElement === document.activeElement) {
                                this.navService.goToFirstCell();
                            }
                        } else if (this.chipsArea.chipsList.last.elementRef.nativeElement.querySelector(`.igx-chip__item`) === document.activeElement) {
                            this.navService.goToFirstCell();
                        }
                    } else {
                        this.navService.goToFirstCell();
                    }
                    
                } else if (!this.navService.isColumnFullyVisible(this.column.visibleIndex + 1)) {
                    eventArgs.preventDefault();
                    this.filteringService.grid.headerContainer.scrollTo(this.column.visibleIndex + 1);
                }
            }
            eventArgs.stopPropagation();
        }
    }

    public filteringIndicatorClass() {
        return {
            [this.baseClass]: !this.getIsMoreIconVisible(),
            [`${this.baseClass}--hidden`]: this.getIsMoreIconVisible()
        }
    }

    public focusChip() {
        if (this.currentTemplate === this.defaultFilter) {
            if(this.getIsMoreIconVisible() === false) {
                this.moreIcon.nativeElement.focus();
            } else {
                this.chipsArea.chipsList.last.elementRef.nativeElement.querySelector(`.igx-chip__item`).focus();
            }
        } else if (this.currentTemplate === this.emptyFilter) {
            this.ghostChip.elementRef.nativeElement.querySelector(`.igx-chip__item`).focus();
        } else if (this.currentTemplate === this.complexFilter) {
            this.complexChip.elementRef.nativeElement.querySelector(`.igx-chip__item`).focus();
        }
    }
}
