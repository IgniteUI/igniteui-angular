import {
    Component,
    ChangeDetectorRef,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    Renderer2,
    Host,
    EventEmitter,
    Output
} from '@angular/core';
import { IgxCollapsibleComponent } from './collapsible.component';

export interface ICollapsibleEventArgs {
    event: Event;
}
@Component({
    selector: 'igx-collapsible-header',
    templateUrl: 'collapsible-header.component.html'
})
export class IgxCollapsibleHeaderComponent {
     // properties section

     @Input()
     @HostBinding('attr.tabindex')
     public tabIndex = 0;

    @Output()
    public onInterraction = new EventEmitter<ICollapsibleEventArgs>();

     @HostBinding('class.igx-collapsible__header')
     public cssClass = 'igx-collapsible__header';


     @Input()
     @HostBinding('class.igx-collapsible__header--collapsed')
     public get isCollapsed () {
        return this.collapsible.collapsed;
     }

     @Input()
     @HostBinding('class.igx-collapsible__header--expanded')
     public get isExpanded () {
            return !this.collapsible.collapsed;
         }

    @Input()
    @HostBinding('attr.aria-labelledby')
    public ariaLabelledBy: string;

    constructor(@Host() public collapsible: IgxCollapsibleComponent, public cdr: ChangeDetectorRef,
     public elementRef: ElementRef, private renderer: Renderer2) { }

     @HostListener('keydown.Enter', ['$event'])
     @HostListener('keydown.Space', ['$event'])
     @HostListener('click', ['$event'])
     public onAction(evt?: Event) {
         if (this.collapsible.disabled) {
            evt.stopPropagation();
            return;
         }
         this.onInterraction.emit({ event: evt });
         this.collapsible.toggle(evt);
         evt.preventDefault();
     }
}
