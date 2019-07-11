import { Directive, ElementRef, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { IgxDragDirective } from './dragdrop.directive';

export interface IDragGhostBaseEventArgs {
    owner: IgxDragGhostDirective;
    dragDirective: IgxDragDirective;
}

@Directive({
    selector: '[igxDragGhost]'
})
export class IgxDragGhostDirective {

    @Input()
    public igxDragGhost: ElementRef;

    @Input()
    public igxDragGhostOffsetX: number;

    @Input()
    public igxDragGhostOffsetY: number;

    @Output()
    public igxDragGhostOnCreate = new EventEmitter<IDragGhostBaseEventArgs>();

    @Output()
    public igxDragGhostOnDestroy = new EventEmitter<IDragGhostBaseEventArgs>();

    constructor(public template: TemplateRef<any>) {}
}
