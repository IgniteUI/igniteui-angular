import {
    Component,
    ChangeDetectorRef,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    Renderer2,
    Host
} from '@angular/core';
import { IgxCollapsibleComponent } from './collapsible.component';

@Component({
    selector: 'igx-collapsible-header',
    templateUrl: 'collapsible-header.component.html'
})
export class IgxCollapsibleHeaderComponent {
     // properties section

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

    constructor(@Host() public collapsible: IgxCollapsibleComponent, public cdr: ChangeDetectorRef,
     public elementRef: ElementRef, private renderer: Renderer2) { }

     @HostListener('keydown.Enter', ['$event'])
     @HostListener('keydown.Space', ['$event'])
     @HostListener('click', ['$event'])
     public onAction(evt: Event) {
         this.collapsible.toggle();
         evt.preventDefault();
     }
}
