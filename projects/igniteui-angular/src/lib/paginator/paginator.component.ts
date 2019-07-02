import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Input, Output, OnInit, NgModule, Optional, Inject, EventEmitter, HostBinding } from '@angular/core';
import { CurrentResourceStrings } from '../core/i18n/resources';
import { IDisplayDensityOptions, DisplayDensityToken, DisplayDensityBase, DisplayDensity } from '../core/displayDensity';
import { IgxSelectModule } from '../select/index';
import { IgxIconModule } from '../icon/index';
import { IgxButtonModule  } from '../directives/button/button.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';


@Component({
    selector: 'igx-paginator',
    templateUrl: 'paginator.component.html',
})
export class IgxPaginatorComponent extends DisplayDensityBase implements OnInit {

    public page = 0;
    public totalPages: number;
    @Input() totalRecords: number;
    @Input() selectOptions = [5, 10, 15, 25, 50, 100, 500];
    @Input() public perPage = 15;
    @Input() public selectLabel = CurrentResourceStrings.GridResStrings.igx_grid_paginator_label;
    @Input() public displayDensity = DisplayDensity.comfortable;
    @Output() public selectChange = new EventEmitter<number>();
    @Output() public pageChange = new EventEmitter<number>();

    constructor(@Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
        super(_displayDensityOptions)
    }

    public ngOnInit(): void {
        if (!this.selectOptions.includes(this.perPage)) {
            this.selectOptions = this.sortUniqueOptions(this.selectOptions, this.perPage);
        }
        this.totalPages = Math.ceil(this.totalRecords / this.perPage);
    }

    public handleChange(): void {
        this.selectChange.emit(this.perPage);
        this.page = 0;
        this.totalPages = Math.ceil(this.totalRecords / this.perPage);
    }

    private sortUniqueOptions(values: Array<number>, newOption: number): number[] {
        return Array.from(new Set([...values, newOption])).sort((a, b) => a - b);
    }

    public paginatorSelectDisplayDensity(): string {
        if (this.displayDensity === DisplayDensity.comfortable) {
            return DisplayDensity.cosy;
        }
        return DisplayDensity.compact;
    }

    public nextPage(): void {
        if (!this.isLastPage) {
            this.page += 1;
        }
        this.pageChange.emit(this.page);
    }

    public previousPage(): void {
        if (!this.isFirstPage) {
            this.page -= 1;
        }
        this.pageChange.emit(this.page);
    }

    public paginate(val: number): void {
        if (val < 0 || val > this.totalPages - 1) {
            return;
        }

        this.page = val;
        this.pageChange.emit(this.page);
    }

    get isLastPage(): boolean {
        return this.page + 1 >= this.totalPages;
    }

    get isFirstPage(): boolean {
        return this.page === 0;
    }
}


@NgModule({
    declarations: [IgxPaginatorComponent],
    exports: [IgxPaginatorComponent],
    imports: [CommonModule, IgxSelectModule, FormsModule, IgxIconModule, IgxButtonModule, IgxRippleModule]
})
export class IgxPaginatorModule { }
