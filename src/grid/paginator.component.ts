import { Component, EventEmitter, Input, Output } from "@angular/core";

export interface IgxPaginatorEvent {
    currentPage: number;
    perPage: number;
    totalPages: number;
}

@Component({
    moduleId: module.id,
    selector: "igx-paginator",
    styles: [
        `.igx-paginator {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            align-content: center;
            margin: 1rem auto;
            width: 100%;
        }
        .igx-paginator span {
            padding: 1rem;
        }
        `
    ],
    templateUrl: "./paginator.component.html"
})
export class IgxPaginatorComponent {

    @Input() public currentPage: number = 0;
    @Input() public totalPages: number;
    @Input() public perPage: number;
    @Output() public onPageChange = new EventEmitter<IgxPaginatorEvent>();

    get isLast(): boolean {
        return this.currentPage + 1 >= this.totalPages;
    }

    get isFirst(): boolean {
        return this.currentPage === 0;
    }

    public paginate(page: number): void {
        this.onPageChange.emit({
            currentPage: page,
            perPage: this.perPage,
            totalPages: this.totalPages
        } as IgxPaginatorEvent);
    }
}
