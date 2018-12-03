import { IgxGridNavigationService } from '../grid-navigation.service';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { first } from 'rxjs/operators';

export class IgxHierarchicalGridNavigationService extends IgxGridNavigationService {
    public grid: IgxHierarchicalGridComponent;
    protected getCellSelector(visibleIndex?: number) {
       return 'igx-hierarchical-grid-cell';
    }

    protected getRowSelector() {
        return 'igx-hierarchical-grid-row';
    }

    private isChildGrid() {
        return this.grid.parent !== null;
    }

    private getChildContainer() {
        return this.grid.nativeElement.parentNode.parentNode.parentNode;
    }

    public navigateUp(rowElement, currentRowIndex, visibleColumnIndex) {
        if (currentRowIndex !== 0) {
            super.navigateUp(rowElement, currentRowIndex, visibleColumnIndex);
        } else if (this.isChildGrid()) {
            // navigate up into parent grid
            const containerTopOffset = parseInt(this.parentVerticalDisplayContainerElement.style.top, 10);
            const container = this.getChildContainer();
            if (!container || container.offsetTop < Math.abs(containerTopOffset)) {
                this.grid.parent.nativeElement.focus({ preventScroll: true });
                const parentIndex = this.grid.parent.verticalScrollContainer.state.startIndex - 1;
                this.grid.parent.verticalScrollContainer.scrollTo(parentIndex);
                this.grid.parent.verticalScrollContainer.onChunkLoad
                    .pipe(first())
                    .subscribe(() => {
                        rowElement = this.getRowByIndex(parentIndex);
                        this.focusPreviousElement(container, visibleColumnIndex);
                    });
            } else {
                this.focusPreviousElement(container, visibleColumnIndex);
            }

        }
    }

    public navigateDown(rowElement, currentRowIndex, visibleColumnIndex) {
        const nextElem = rowElement.nextElementSibling;
        const isNextElemChildGrid = nextElem ?
        rowElement.nextElementSibling.children[0].nodeName.toLowerCase() === 'igx-child-grid-row' :
        false;
        if (currentRowIndex !== this.grid.verticalScrollContainer.igxForOf.length - 1 && nextElem && !isNextElemChildGrid) {
            return super.navigateDown(rowElement, currentRowIndex, visibleColumnIndex);
        }
        if (isNextElemChildGrid ) {
            // next elem is child grid and it is in DOM
            this.focusChildCell(rowElement, visibleColumnIndex);
        } else if (!nextElem) {
            // element is not in view, scroll it in view and try again
            this.grid.verticalScrollContainer.scrollTo(currentRowIndex + 1);
            this.grid.verticalScrollContainer.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    rowElement = this.getRowByIndex(currentRowIndex);
                    super.focusNextElement(rowElement, visibleColumnIndex);
            });
        }
    }

    get parentVerticalDisplayContainerElement() {
        return this.grid.parent ? this.grid.parent.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement : null;
    }

    private isElementInView(el, container) {
        const rect = el.getBoundingClientRect();
        return (
            rect.bottom <= (container.offsetHeight) &&
            rect.right <= (container.offsetWidth)
        );
    }

    private focusChildCell(rowElement, visibleColumnIndex) {
        const cellSelector = this.getCellSelector(visibleColumnIndex);
        const cell =
        rowElement.nextElementSibling.querySelector(`${cellSelector}[data-visibleIndex="${visibleColumnIndex}"]`);

        const inView = this.isElementInView(cell, this.grid.nativeElement);
        if (!inView) {
            this.grid.verticalScrollContainer.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    cell.focus();
            });
        }
        cell.focus();
    }
}
