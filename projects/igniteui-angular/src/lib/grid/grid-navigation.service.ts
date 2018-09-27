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
       return this.grid.pinnedColumns.length ? this.grid.unpinnedColumns.indexOf(column) : visibleColumnIndex;

    }

    public isColumnFullyVisible(visibleColumnIndex) {
        const horizontalScroll = this.grid.dataRowList.first.virtDirRow.getHorizontalScroll();
        if (!horizontalScroll.clientWidth ||
            this.grid.columnList.filter(c => !c.columnGroup).find((column) => column.visibleIndex === visibleColumnIndex).pinned) {
            return true;
        }
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex);
        return this.displayContainerWidth >=
            parseInt(this.grid.unpinnedColumns.find((column) => !column.columnGroup &&
            column.visibleIndex === visibleColumnIndex).width, 10) +
            parseInt(this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(index), 10) -
            this.displayContainerScrollLeft;
    }

    public isColumnPartiallyVisible(visibleColumnIndex) {
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex);
        return (this.displayContainerWidth >
            parseInt(this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(index), 10) -
            this.displayContainerScrollLeft) &&
            (this.displayContainerWidth <  parseInt(this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(index), 10) -
            this.displayContainerScrollLeft +
            parseInt(this.grid.unpinnedColumns.find((column) => !column.columnGroup &&
            column.visibleIndex === visibleColumnIndex).width, 10));
    }

    public isColumnLeftFullyVisible(visibleColumnIndex) {
        const horizontalScroll = this.grid.dataRowList.first.virtDirRow.getHorizontalScroll();
        if (!horizontalScroll.clientWidth ||
            this.grid.columnList.filter(c => !c.columnGroup).find((column) => column.visibleIndex === visibleColumnIndex).pinned ) {
            return true;
        }
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex);
        return this.displayContainerScrollLeft <=
            parseInt(this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(index), 10);
    }

    public isColumnLeftPartiallyVisible(visibleColumnIndex) {
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex + 1);
        return (!this.isColumnLeftFullyVisible(visibleColumnIndex)) && this.displayContainerScrollLeft <
            parseInt(this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(index), 10);
    }
    public onKeydownArrowRight(element, rowIndex, visibleColumnIndex) {
        const currentStartIndex = this.horizontalScroll(rowIndex).state.startIndex;
        // if next column is fully visible
        if (this.isColumnFullyVisible(visibleColumnIndex + 1)) {
            console.log('FullyVisible');
            if (element.classList.contains('igx-grid__th--pinned-last')) {
                if (this.isColumnLeftFullyVisible(visibleColumnIndex + 1)) {
                    element.nextElementSibling.firstElementChild.focus();
                } else {
                    this.horizontalScroll(rowIndex).getHorizontalScroll().scrollLeft = 0;
                    this.horizontalScroll(rowIndex).onChunkLoad
                    .pipe(first())
                    .subscribe((state) => {
                        element.nextElementSibling.firstElementChild.focus();
                    });
                }
            } else {
                element.nextElementSibling.focus();
            }
        } else {
            let scrollAmount = 0;
            // if next column is partially visible
            if (this.isColumnPartiallyVisible(visibleColumnIndex + 1)) {
                console.log('PartiallyVisible');
                scrollAmount = this.calcPartialScroll(rowIndex, visibleColumnIndex + 1);
                this.horizontalScroll(rowIndex).getHorizontalScroll().scrollLeft += scrollAmount;
                this.horizontalScroll(rowIndex).onChunkLoad
                .pipe(first())
                .subscribe((state) => {
                    const currentCell = this.grid.nativeElement.querySelector(
                        `igx-grid-cell[data-rowindex="${rowIndex}"][data-visibleIndex="${visibleColumnIndex}"]`);
                    currentCell.nextElementSibling.dispatchEvent(new FocusEvent('focus'));
                });
            } else {
                // if current column is partially visible
                if (this.isColumnPartiallyVisible(visibleColumnIndex)) {
                    console.log('CurrPartiallyVisible');
                    scrollAmount = this.calcPartialScroll(rowIndex, visibleColumnIndex) +
                    parseInt(this.grid.columnList.filter(c => !c.columnGroup)
                    .find((column) => column.visibleIndex === visibleColumnIndex + 1).width, 10);
                } else {
                    console.log('NotVisible');
                    scrollAmount =
                    parseInt(this.grid.columnList.filter(c => !c.columnGroup)
                    .find((column) => column.visibleIndex === visibleColumnIndex + 1).width, 10);
                }
                this.horizontalScroll(rowIndex).getHorizontalScroll().scrollLeft += scrollAmount;
                this.horizontalScroll(rowIndex).onChunkLoad
                .pipe(first())
                .subscribe((state) => {
/*                     console.log(currentStartIndex, state);
                    if (currentStartIndex === state.startIndex ||
                        this.grid.unpinnedColumns[this.grid.unpinnedColumns.length - 2].visibleIndex === visibleColumnIndex) {
                        console.log('same startIndex');
                        element.nextElementSibling.focus();
                    } else {
                        element.dispatchEvent(new FocusEvent('focus'));
                    } */
                    console.log(state, visibleColumnIndex);
                    const currentCell = this.grid.nativeElement.querySelector(
                        `igx-grid-cell[data-rowindex="${rowIndex}"][data-visibleIndex="${visibleColumnIndex}"]`);
                    currentCell.nextElementSibling.dispatchEvent(new FocusEvent('focus'));
                });
            }
        }
    }

    public onKeydownArrowLeft(element, rowIndex, visibleColumnIndex) {
        const currentStartIndex = this.horizontalScroll(rowIndex).state.startIndex;
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex - 1);
        if (!element.previousElementSibling && this.grid.pinnedColumns.length && index === - 1) {
            element.parentNode.previousElementSibling.focus();
        } else if (!this.isColumnLeftFullyVisible(visibleColumnIndex - 1)) {
            this.horizontalScroll(rowIndex).getHorizontalScroll().scrollLeft =
                parseInt(this.grid.dataRowList.first.virtDirRow.getColumnScrollLeft(index), 10);
            this.horizontalScroll(rowIndex).onChunkLoad
            .pipe(first())
            .subscribe((state) => {
                if (currentStartIndex === state.startIndex ||
                    this.isColumnLeftPartiallyVisible(visibleColumnIndex - 1) ||
                    this.grid.unpinnedColumns[1].visibleIndex === visibleColumnIndex) {
                    element.previousElementSibling.focus();
                } else {
                    element.dispatchEvent(new FocusEvent('focus'));
                }
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
            this.horizontalScroll(rowIndex).onChunkLoad
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
            this.horizontalScroll(rowIndex).onChunkLoad
            .pipe(first())
            .subscribe(() => {
                lastCell.focus();
            });
        }

    }


    navigateDown(element, currentRowIndex, visibleColumnIndex) {
        if (!element.nextElementSibling) {
            return;
        }
        const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : null;
        const targetEndTopOffset = element.nextElementSibling.offsetTop + this.grid.rowHeight +
        parseInt(this.verticalDisplayContainerElement.style.top, 10);
        if (containerHeight && containerHeight < targetEndTopOffset) {
            const scrollAmount = targetEndTopOffset - containerHeight;
            this.grid.verticalScrollContainer.addScrollTop(scrollAmount);
            this.grid.verticalScrollContainer.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                (document.activeElement as any).blur();
                const currentCell = this.grid.nativeElement.querySelector(
                    `igx-grid-cell[data-rowindex="${currentRowIndex}"][data-visibleIndex="${visibleColumnIndex}"]`);
                element = currentCell.classList.contains('igx-grid__th--pinned') ?
                currentCell.parentElement : currentCell.parentElement.parentElement;
                this.focusNextElement(element, visibleColumnIndex);
            });
        } else {
            this.focusNextElement(element, visibleColumnIndex);
        }
    }

    private focusNextElement(element, visibleColumnIndex) {
        if (element.tagName.toLowerCase() === 'igx-grid-row') {
            if (element.nextElementSibling.tagName.toLowerCase() === 'igx-grid-groupby-row') {
                element.nextElementSibling.querySelector('.igx-grid__group-content').focus();
            } else {
                element.nextElementSibling.querySelector(`igx-grid-cell[data-visibleIndex="${visibleColumnIndex}"]`).focus();
            }

        // } else if (element.tagName.toLowerCase() === 'igx-grid-groupby-row') {
        //     if (element.nextElementSibling.tagName.toLowerCase() === 'igx-grid-groupby-row') {
        //         element.nextElementSibling.querySelector('.igx-grid__group-content').focus();
        //     } else {

        //     }
        // }
        }
    }

    private calcPartialScroll(rowIndex, visibleColumnIndex) {
        const index = this.getColumnUnpinnedIndex(visibleColumnIndex);
        return parseInt(this.horizontalScroll(rowIndex).getColumnScrollLeft(index), 10) +
        parseInt(this.grid.columnList.filter(c => !c.columnGroup).find((column) => column.visibleIndex === visibleColumnIndex).width, 10) -
        this.displayContainerWidth - this.horizontalScroll(rowIndex).getHorizontalScroll().scrollLeft;

    }
}
