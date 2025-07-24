import { Directive, TemplateRef, inject } from '@angular/core';
import { CancelableEventArgs, IBaseEventArgs } from '../core/utils';

export interface IPageEventArgs extends IBaseEventArgs {
    previous: number;
    current: number;
}

export interface IPageCancellableEventArgs extends CancelableEventArgs {
    current: number;
    next: number;
}

@Directive({
    selector: '[igxPaginator]',
    standalone: true
})
export class IgxPaginatorDirective {
    public template = inject<TemplateRef<any>>(TemplateRef);
}
