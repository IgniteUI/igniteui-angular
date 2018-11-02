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
import { IFilteringExpression } from '../../data-operations/filtering-expression.interface';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IBaseChipEventArgs, IgxChipsAreaComponent, IgxChipComponent } from '../../chips';
import { IgxFilteringService, ExpressionUI } from './grid-filtering.service';
import { KEYS, cloneArray } from '../../core/utils';
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

    private rootExpressionsTree: FilteringExpressionsTree;
    private expressionsList: ExpressionUI[];
    private baseClass = 'igx-grid__filtering-cell-indicator';
    private currentTemplate = null;

    public visibleExpressionsList: ExpressionUI[];
    public moreFiltersCount = 0;

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

    @HostBinding('style.min-width')
    @HostBinding('style.max-width')
    @HostBinding('style.flex-basis')
    get width() {
        // HACK - think of a better solution
        const colWidth = this.column.width;
        const isPercentageWidth = colWidth && typeof colWidth === 'string' && colWidth.indexOf('%') !== -1;

        if (isPercentageWidth) {
            const firstContentCell = this.column.cells[0];
            if (firstContentCell) {
                return firstContentCell.nativeElement.getBoundingClientRect().width + 'px';
            }
        } else {
            return this.column.width;
        }
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

    constructor(public cdr: ChangeDetectorRef, public filteringService: IgxFilteringService, public navService: IgxGridNavigationService) {
        this.filteringService.subscribeToEvents();
    }

    ngOnInit(): void {
        this.filteringService.columnToChipToFocus.set(this.column.field, false);
        this.filteringService.columnToMoreIconHidden.set(this.column.field, true);
    }

    ngAfterViewInit(): void {
        this.updateFilterCellArea();
    }

    @HostListener('keydown.shift.tab', ['$event'])
    @HostListener('keydown.tab', ['$event'])
    public onTabKeyDown(eventArgs) {
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
                    if (this.isMoreIconVisible() === false) {
                        if (this.moreIcon.nativeElement === document.activeElement) {
                            this.navService.goToFirstCell();
                        }
                    } else if (this.chipsArea.chipsList.last.elementRef.nativeElement.querySelector(`.igx-chip__item`) ===
                               document.activeElement) {
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

    /**
     * Returns the chip to be focused.
     */
    public getChipToFocus() {
        return this.filteringService.columnToChipToFocus.get(this.column.field);
    }

    /**
     * Updates the filtering cell area.
     */
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

    /**
     * Chip clicked event handler.
     */
    public onChipClicked(expression?: IFilteringExpression) {
        if (expression) {
            this.expressionsList.forEach((item) => {
                item.isSelected = (item.expression === expression);
            });
        } else if (this.expressionsList.length > 0) {
            this.expressionsList.forEach((item) => {
                item.isSelected = false;
            });
            this.expressionsList[0].isSelected = true;
        }

        this.filteringService.filteredColumn = this.column;
        this.filteringService.isFilterRowVisible = true;
        this.filteringService.selectedExpression = expression;
    }

    /**
     * Chip removed event handler.
     */
    public onChipRemoved(eventArgs: IBaseChipEventArgs, item: ExpressionUI): void {
        const indexToRemove = this.expressionsList.indexOf(item);
        this.removeExpression(indexToRemove);
    }

    /**
     * Clears the filtering.
     */
    public clearFiltering(): void {
        this.filteringService.clearFilter(this.column.field);
        this.cdr.detectChanges();
    }

    /**
     * Chip keydown event handler.
     */
    public onChipKeyDown(eventArgs: KeyboardEvent, expression?: IFilteringExpression) {
        if (eventArgs.key === KEYS.ENTER) {
            eventArgs.preventDefault();
            this.onChipClicked(expression);
        }
    }

    /**
     * Returns the filtering indicator class.
     */
    public filteringIndicatorClass() {
        return {
            [this.baseClass]: !this.isMoreIconVisible(),
            [`${this.baseClass}--hidden`]: this.isMoreIconVisible()
        };
    }

    /**
     * Focus a chip depending on the current visible template.
     */
    public focusChip() {
        if (this.currentTemplate === this.defaultFilter) {
            if (this.isMoreIconVisible() === false) {
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

    private removeExpression(indexToRemove: number) {
        if (indexToRemove === 0 && this.expressionsList.length === 1) {
            this.clearFiltering();
            return;
        }

        this.filteringService.removeExpression(this.column.field, indexToRemove);

        this.updateVisibleFilters();
        this.filter();
    }

    private filter(): void {
        this.rootExpressionsTree = this.filteringService.createSimpleFilteringTree(this.column.field);

        this.filteringService.filter(this.column.field, this.rootExpressionsTree);
    }

    private isMoreIconVisible(): boolean {
        return this.filteringService.columnToMoreIconHidden.get(this.column.field);
    }

    private updateVisibleFilters() {
        this.visibleExpressionsList = cloneArray(this.expressionsList);

        // TODO: revise the usage of this.cdr.detectChanges() here
        this.cdr.detectChanges();

        if (this.moreIcon) {
            this.filteringService.columnToMoreIconHidden.set(this.column.field, true);
        }
        if (this.chipsArea && this.expressionsList.length > 1) {
            const areaWidth = this.chipsArea.element.nativeElement.offsetWidth;
            let viewWidth = 0;
            const chipsAreaElements = this.chipsArea.element.nativeElement.children;
            let visibleChipsCount = 0;
            const moreIconWidth = this.moreIcon.nativeElement.offsetWidth -
            parseInt(document.defaultView.getComputedStyle(this.moreIcon.nativeElement)['margin-left'], 10);

            for (let index = 0; index < chipsAreaElements.length - 1; index++) {
                if (viewWidth + chipsAreaElements[index].offsetWidth < areaWidth) {
                    viewWidth += chipsAreaElements[index].offsetWidth;
                    if (index % 2 === 0) {
                        visibleChipsCount++;
                    } else {
                        viewWidth += parseInt(document.defaultView.getComputedStyle(chipsAreaElements[index])['margin-left'], 10);
                        viewWidth += parseInt(document.defaultView.getComputedStyle(chipsAreaElements[index])['margin-right'], 10);
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
}
