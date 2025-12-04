import { Directive, HostBinding } from '@angular/core';

/**
 * @hidden
 */
@Directive({
    selector: 'igx-dialog-title,[igxDialogTitle]',
    standalone: true
})
export class IgxDialogTitleDirective {

    @HostBinding('class.igx-dialog__window-title')
    public defaultStyle = true;
 }

/**
 * @hidden
 */
@Directive({
    selector: 'igx-dialog-actions,[igxDialogActions]',
    standalone: true
})
export class IgxDialogActionsDirective {

    @HostBinding('class.igx-dialog__window-actions')
    public defaultClass = true;
 }
