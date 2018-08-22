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
    Renderer2
} from '@angular/core';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';

@Component({
    selector: 'igx-collapsible-header',
    templateUrl: 'igx-collapsible-header.component.html'
})
export class IgxCollapsibleHeaderComponent {
     // properties section

    constructor(public cdr: ChangeDetectorRef, public elementRef: ElementRef, private renderer: Renderer2) { }

    click (params: any) {

    }
}
