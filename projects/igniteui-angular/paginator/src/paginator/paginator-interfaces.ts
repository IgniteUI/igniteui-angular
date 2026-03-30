import { Directive, TemplateRef, inject } from '@angular/core';
import { CancelableEventArgs, IBaseEventArgs } from 'igniteui-angular/core';

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
