import { Directive, ElementRef, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { IgxDragDirective } from './dragdrop.directive';

export interface IDragGhostBaseEventArgs {
    owner: IgxDragGhostDirective;
    dragDirective: IgxDragDirective;
    offsetX: number;
    offsetY: number;
}

@Directive({
    selector: '[igxDragGhost]'
})
export class IgxDragGhostDirective {

    @Input('igxDragGhost')
    public host: ElementRef;

    @Input()
    public offsetX = 0;

    @Input()
    public offsetY = 0;

    @Output()
    public onCreate = new EventEmitter<IDragGhostBaseEventArgs>();

    @Output()
    public onDestroy = new EventEmitter<IDragGhostBaseEventArgs>();

    constructor(public template: TemplateRef<any>) {}
}
