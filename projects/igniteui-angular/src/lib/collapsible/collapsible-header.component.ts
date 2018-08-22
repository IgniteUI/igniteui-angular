import {
    Component,
    ChangeDetectorRef,
    EventEmitter,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    Inject,
    Output,
    ViewChild,
    OnInit,
    AfterContentInit,
    AfterViewInit,
    Renderer2,
    Host
} from '@angular/core';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxCollapsibleComponent } from './collapsible.component';

@Component({
    selector: 'igx-collapsible-header',
    templateUrl: 'collapsible-header.component.html'
})
export class IgxCollapsibleHeaderComponent {
     // properties section

     @Input()
     @HostBinding('class.igx-collapsible__header--collapsed')
     public collapsedHeight;

     @Input()
     @HostBinding('class.igx-collapsible__header--expanded')
     public expandedHeight;

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
