import { Directive, HostBinding } from '@angular/core';

/**
 * @hidden
 */
@Directive({
    selector: '[igxDialogTitle],igx-dialog-title',
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
    selector: '[igxDialogActions],igx-dialog-actions',
    standalone: true
})
export class IgxDialogActionsDirective {

    @HostBinding('class.igx-dialog__window-actions')
    public defaultClass = true;
 }
