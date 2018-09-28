import { Injectable } from '@angular/core';
import { IgxGridComponent } from './grid.component';
import { first } from 'rxjs/operators';

@Injectable()
export class IgxGridNavigationService {
    public grid: IgxGridComponent;

    get displayContainerWidth() {
        return parseInt(this.grid.parentVirtDir.dc.instance._viewContainer.element.nativeElement.offsetWidth, 10);
    }

    get displayContainerScrollLeft() {
        return parseInt(this.grid.parentVirtDir.getHorizontalScroll().scrollLeft, 10);
    }

    get verticalDisplayContainerElement() {
        return this.grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement;
    }

    public horizontalScroll(rowIndex) {
        return this.grid.dataRowList.find((row) => row.index === rowIndex).virtDirRow;
    }

    public getColumnUnpinnedIndex(visibleColumnIndex: number) {
       const column = this.grid.unpinnedColumns.find((col) => !col.columnGroup && col.visibleIndex === visibleColumnIndex);
       return this.grid.pinnedColumns.length ? this.grid.unpinnedColumns.filter((c) => !c.columnGroup).indexOf(column) : visibleColumnIndex;

    }

    public isColumnFullyVisible(visibleColumnIndex: number) {
        const horizontalScroll = this.grid.dataRowList.first.virtDirRow.getHorizontalScroll();
        if (!horizontalScroll.clientWidth ||
            this.grid.columnList.filter(c => !c.columnGroup).find((column) => column.visibleIndex === visibleColumnIndex).pinned) {
            return true;
        }
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex);
        return this.displayContainerWidth >=
            this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(index + 1) -
            this.displayContainerScrollLeft;
    }

    public isColumnPartiallyVisible(visibleColumnIndex) {
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex);
        // getColumnScrollLeft(index) gives the left border of the cell and getColumnScrollLeft(index + 1) gives the right border
        return (this.displayContainerWidth >
            this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(index) -
            this.displayContainerScrollLeft) &&
            (this.displayContainerWidth <  this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(index + 1) -
            this.displayContainerScrollLeft);
    }

    public isColumnLeftFullyVisible(visibleColumnIndex) {
        const horizontalScroll = this.grid.dataRowList.first.virtDirRow.getHorizontalScroll();
        if (!horizontalScroll.clientWidth ||
            this.grid.columnList.filter(c => !c.columnGroup).find((column) => column.visibleIndex === visibleColumnIndex).pinned ) {
            return true;
        }
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex);
        return this.displayContainerScrollLeft <=
            this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(index);
    }

    public isColumnLeftPartiallyVisible(visibleColumnIndex) {
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex + 1);
        return (!this.isColumnLeftFullyVisible(visibleColumnIndex)) && this.displayContainerScrollLeft <
            this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(index);
    }

    public onKeydownArrowRight(element, rowIndex, visibleColumnIndex) {
        if (!element.nextElementSibling) {
            return;
        }
        if (this.isColumnFullyVisible(visibleColumnIndex + 1)) { // if next column is fully visible or is pinned
            if (element.classList.contains('igx-grid__th--pinned-last')) {
                if (this.isColumnLeftFullyVisible(visibleColumnIndex + 1)) {
                    element.nextElementSibling.firstElementChild.focus();
                } else {
                this.horizontalScroll(rowIndex).getHorizontalScroll().scrollLeft = 0;
                this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    element.nextElementSibling.firstElementChild.focus();
                });
                }
            } else {
                element.nextElementSibling.focus();
            }
        } else {
            let scrollAmount = 0;
            (document.activeElement as any).blur();
            if (this.isColumnPartiallyVisible(visibleColumnIndex + 1)) { // if next column is not partially visible
                scrollAmount = this.calcPartialScroll(rowIndex, visibleColumnIndex + 1);
            } else if (this.isColumnPartiallyVisible(visibleColumnIndex)) { // if current column is partially visible
                scrollAmount = this.calcPartialScroll(rowIndex, visibleColumnIndex) +
                parseInt(this.grid.columnList.filter(c => !c.columnGroup)
                .find((column) => column.visibleIndex === visibleColumnIndex + 1).width, 10);
            } else { // If next column is not visible
                scrollAmount = parseInt(this.grid.columnList.filter(c => !c.columnGroup)
                .find((column) => column.visibleIndex === visibleColumnIndex + 1).width, 10);
            }
            this.grid.parentVirtDir.getHorizontalScroll().scrollLeft += scrollAmount;
            this.grid.parentVirtDir.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                const currentCell = this.grid.nativeElement.querySelector(
                    `igx-grid-cell[data-rowindex="${rowIndex}"][data-visibleIndex="${visibleColumnIndex}"]`);
                currentCell.nextElementSibling.focus();
            });
        }
    }

    public onKeydownArrowLeft(element, rowIndex, visibleColumnIndex) {
        if (visibleColumnIndex === 0) {
            return;
        }
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex - 1);
        if (!element.previousElementSibling && this.grid.pinnedColumns.length && index === - 1) {
            element.parentNode.previousElementSibling.focus();
        } else if (!this.isColumnLeftFullyVisible(visibleColumnIndex - 1)) {
            (document.activeElement as any).blur();
            this.horizontalScroll(rowIndex).getHorizontalScroll().scrollLeft =
                this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(index);
            this.grid.parentVirtDir.onChunkLoad
            .pipe(first())
            .subscribe((state) => {
                const currentCell = this.grid.nativeElement.querySelector(
                    `igx-grid-cell[data-rowindex="${rowIndex}"][data-visibleIndex="${visibleColumnIndex}"]`);
                    currentCell.previousElementSibling.focus();
            });
        } else {
            element.previousElementSibling.focus();
        }

    }

    onKeydownHome(rowIndex) {
        const rowElement = this.grid.dataRowList.find((row) => row.index === rowIndex).nativeElement;
        const firstCell = rowElement.querySelector('igx-grid-cell');
        if (this.grid.pinnedColumns.length || this.displayContainerScrollLeft === 0) {
            firstCell.focus();
        } else {
            this.horizontalScroll(rowIndex).scrollTo(0);
            this.grid.parentVirtDir.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                firstCell.focus();
            });
        }
    }

    onKeydownEnd(rowIndex) {
        const index = this.grid.unpinnedColumns[this.grid.unpinnedColumns.length - 1].visibleIndex;
        const rowElement = this.grid.dataRowList.find((row) => row.index === rowIndex).nativeElement;
        const allCells = rowElement.querySelectorAll('igx-grid-cell');
        const lastCell = allCells[allCells.length - 1];
        if (this.isColumnFullyVisible(index)) {
            lastCell.focus();
        } else {
            this.horizontalScroll(rowIndex).scrollTo(this.getColumnUnpinnedIndex(index));
            this.grid.parentVirtDir.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                lastCell.focus();
            });
        }

    }

    public navigateTop(visibleColumnIndex) {
        const verticalScroll = this.grid.verticalScrollContainer.getVerticalScroll();
        if (verticalScroll.scrollTop === 0) {
            const cells = this.grid.nativeElement.querySelectorAll(
                `igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`);
            cells[0].focus();
        } else {
            this.grid.verticalScrollContainer.scrollTo(0);
            this.grid.verticalScrollContainer.onChunkLoad
            .pipe(first()).subscribe(() => {
                const cells = this.grid.nativeElement.querySelectorAll(
                    `igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`);
                cells[0].focus();
            });
        }
    }

    public navigateBottom(visibleColumnIndex) {
        const verticalScroll = this.grid.verticalScrollContainer.getVerticalScroll();
        if (verticalScroll.scrollTop === verticalScroll.scrollHeight - this.grid.verticalScrollContainer.igxForContainerSize) {
                const cells = this.grid.nativeElement.querySelectorAll(
                    `igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`);
                cells[cells.length - 1].focus();
        } else {
            this.grid.verticalScrollContainer.scrollTo(this.grid.verticalScrollContainer.igxForOf.length - 1);
            this.grid.verticalScrollContainer.onChunkLoad
            .pipe(first()).subscribe(() => {
                const cells = this.grid.nativeElement.querySelectorAll(
                    `igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`);
                cells[cells.length - 1].focus();
            });
        }
    }

    navigateUp(rowElement, currentRowIndex, visibleColumnIndex) {
        if (currentRowIndex === 0) {
            return;
        }
        const containerTopOffset = parseInt(this.verticalDisplayContainerElement.style.top, 10);
        if ((!!Math.abs(containerTopOffset) && this.grid.rowList.first.index === currentRowIndex - 1) ||
            (!Math.abs(containerTopOffset) && this.grid.rowList.first.index > currentRowIndex - 1)) {
            (document.activeElement as any).blur();
            const scrollAmount = containerTopOffset < 0 ? containerTopOffset :
                    -this.grid.rowHeight + Math.abs(containerTopOffset);
            this.grid.verticalScrollContainer.addScrollTop(scrollAmount);
            this.grid.verticalScrollContainer.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                rowElement = this.grid.nativeElement.querySelector(
                    `igx-grid-row[data-rowindex="${currentRowIndex}"]`);
                this.focusPreviousElement(rowElement, visibleColumnIndex);
            });
        } else {
            this.focusPreviousElement(rowElement, visibleColumnIndex);
        }

    }

    private focusPreviousElement(currentRowEl, visibleColumnIndex) {
        if (currentRowEl.tagName.toLowerCase() === 'igx-grid-row') {
            if (currentRowEl.previousElementSibling.tagName.toLowerCase() === 'igx-grid-groupby-row') {
                currentRowEl.previousElementSibling.querySelector('.igx-grid__group-content').focus();
            } else {
                currentRowEl.previousElementSibling.querySelector(`igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`).focus();
            }
        }
    }

    navigateDown(rowElement, currentRowIndex, visibleColumnIndex) {
        if (!rowElement.nextElementSibling) {
            return;
        }
        const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : null;
        const targetEndTopOffset = rowElement.nextElementSibling.offsetTop + this.grid.rowHeight +
        parseInt(this.verticalDisplayContainerElement.style.top, 10);
        if (containerHeight && containerHeight < targetEndTopOffset) {
            (document.activeElement as any).blur();
            const scrollAmount = targetEndTopOffset - containerHeight;
            this.grid.verticalScrollContainer.addScrollTop(scrollAmount);
            this.grid.verticalScrollContainer.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                if (rowElement.tagName.toLowerCase() === 'igx-grid-row') {
                    rowElement = this.grid.nativeElement.querySelector(
                        `igx-grid-row[data-rowindex="${currentRowIndex}"]`);
                } else {
                    rowElement = rowElement = this.grid.nativeElement.querySelector(
                        `igx-grid-groupby-row[data-rowindex="${currentRowIndex}"]`);
                }
                this.focusNextElement(rowElement, visibleColumnIndex);
            });
        } else {
            this.focusNextElement(rowElement, visibleColumnIndex);
        }
    }

    private focusNextElement(rowElement, visibleColumnIndex) {
        if (rowElement.tagName.toLowerCase() === 'igx-grid-row') {
            if (rowElement.nextElementSibling.tagName.toLowerCase() === 'igx-grid-groupby-row') {
                rowElement.nextElementSibling.querySelector('.igx-grid__group-content').focus();
            } else {
                rowElement.nextElementSibling.querySelector(`igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`).focus();
            }
        } else if (rowElement.tagName.toLowerCase() === 'igx-grid-groupby-row') {
            if (rowElement.nextElementSibling.tagName.toLowerCase() === 'igx-grid-groupby-row') {
                rowElement.nextElementSibling.querySelector('.igx-grid__group-content').focus();
            } else {
                rowElement.nextElementSibling.querySelector(`igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`).focus();
            }
        }
    }

    public goToFirstCell() {
        const verticalScroll = this.grid.verticalScrollContainer.getVerticalScroll();
        const horizontalScroll = this.grid.dataRowList.first.virtDirRow.getHorizontalScroll();
        if (verticalScroll.scrollTop === 0) {
            this.onKeydownHome(0);
        } else {
            if (!horizontalScroll.clientWidth || parseInt(horizontalScroll.scrollLeft, 10) <= 1 || this.grid.pinnedColumns.length) {
                this.navigateTop(0);
            } else {
                this.horizontalScroll(this.grid.dataRowList.first.index).scrollTo(0);
                this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    this.navigateTop(0);
                });
            }
        }
    }

    public goToLastCell() {
        const verticalScroll = this.grid.verticalScrollContainer.getVerticalScroll();
        if (verticalScroll.scrollTop === verticalScroll.scrollHeight - this.grid.verticalScrollContainer.igxForContainerSize) {
            this.onKeydownEnd(this.grid.verticalScrollContainer.igxForOf.length - 1);
        } else {
            this.grid.verticalScrollContainer.scrollTo(this.grid.verticalScrollContainer.igxForOf.length - 1);
            this.grid.verticalScrollContainer.onChunkLoad
            .pipe(first()).subscribe(() => {
                const rows = this.grid.nativeElement.querySelectorAll('igx-grid-row');
                const rowIndex = parseInt(rows[rows.length - 1].getAttribute('data-rowIndex'), 10);
                this.onKeydownEnd(rowIndex);
            });
        }
     }

    private calcPartialScroll(rowIndex, visibleColumnIndex) {
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex);
        return this.horizontalScroll(rowIndex).getColumnScrollLeft(index) +
        parseInt(this.grid.columnList.filter(c => !c.columnGroup).find((column) => column.visibleIndex === visibleColumnIndex).width, 10) -
        this.displayContainerWidth - this.horizontalScroll(rowIndex).getHorizontalScroll().scrollLeft;

    }
}
