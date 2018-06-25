import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    ViewChild,
} from '@angular/core';
import { IgxSelectionAPIService } from '../core/selection';
import { IGroupByRecord } from '../data-operations/groupby-record.interface';
import { IgxGridAPIService } from './api.service';
import { IgxGridComponent } from './grid.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-groupby-row',
    templateUrl: './groupby-row.component.html'
})
export class IgxGridGroupByRowComponent {

    constructor(public gridAPI: IgxGridAPIService,
                private selectionAPI: IgxSelectionAPIService,
                public element: ElementRef,
                public cdr: ChangeDetectorRef) { }

    protected defaultCssClass = 'igx-grid__group-row';
    protected paddingIndentationCssClass = 'igx-grid__group-row--padding-level';
    protected isFocused = false;

    get focused(): boolean {
        return this.isFocused;
    }
    @Input()
    public index: number;

    @Input()
    public gridID: string;

    @Input()
    public groupRow: IGroupByRecord;

    @ViewChild('groupContent')
    public groupContent: ElementRef;

    @HostBinding('attr.aria-expanded')
    get expanded(): boolean {
        return this.grid.isExpandedGroup(this.groupRow);
    }

    public tabindex = 0;

    @HostBinding('attr.aria-describedby')
    get describedBy(): string {
        return this.gridID + '_' + this.groupRow.expression.fieldName;
    }

    @HostBinding('class')
    get styleClasses(): string {
        return `${this.defaultCssClass} ` + `${this.paddingIndentationCssClass}-` + this.groupRow.level;
    }

    @HostListener('keydown.enter')
    @HostListener('keydown.space')
    public toggle() {
        this.grid.toggleGroup(this.groupRow);
    }

    get grid(): IgxGridComponent {
        return this.gridAPI.get(this.gridID);
    }

    @HostListener('keydown.arrowdown', ['$event'])
    public onKeydownArrowDown(event) {
        const colIndex = this._getSelectedColIndex() || this._getPrevSelectedColIndex();
        const visibleColumnIndex = colIndex ? this.grid.columnList.toArray()[colIndex].visibleIndex : 0;
        event.preventDefault();
        const rowIndex = this.index + 1;
        this.grid.navigateDown(rowIndex, visibleColumnIndex);
    }

    @HostListener('keydown.arrowup', ['$event'])
    public onKeydownArrowUp(event) {
        const colIndex = this._getSelectedColIndex() || this._getPrevSelectedColIndex();
        const visibleColumnIndex = colIndex ? this.grid.columnList.toArray()[colIndex].visibleIndex : 0;
        event.preventDefault();
        if (this.index === 0) {
            return;
        }
        const rowIndex = this.index - 1;
        this.grid.navigateUp(rowIndex, visibleColumnIndex);
    }

    public onFocus() {
        this.isFocused = true;
    }

    public onBlur() {
        this.isFocused = false;
    }

    private _getSelectedColIndex() {
        const selection = this.selectionAPI.get_selection(this.gridID + '-cells');
        if (selection && selection.length > 0) {
             return selection[0].columnID;
        }
    }

    private _getPrevSelectedColIndex() {
        const selection = this.selectionAPI.get_prev_selection(this.gridID + '-cells');
        if (selection && selection.length > 0) {
            return selection[0].columnID;
        }
    }
}
