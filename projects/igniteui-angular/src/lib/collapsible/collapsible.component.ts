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
    selector: 'igx-collapsible',
    templateUrl: 'collapsible.component.html'
})
export class IgxCollapsibleComponent {
     //properties section

    @ViewChild('', { read: ElementRef })
    public textArea: ElementRef;

    @ViewChild('toggleBtn', { read: ElementRef })
    public toggleBtn: ElementRef;


    @Input()
    public collapsed;

    @Input()
    public disabled;

    @Input()
    public headerButtons;

    // @HostBinding('class.igx-chip--disabled')

    @Output()
    public onCollapsed = new EventEmitter<any>();

    @Output()
    public onCollapsing = new EventEmitter<any>();

    @Output()
    public onExpanding = new EventEmitter<any>();

    @Output()
    public onExpanded = new EventEmitter<any>();

    constructor(public cdr: ChangeDetectorRef, public elementRef: ElementRef, private renderer: Renderer2) { }

    collapse (params: any) {

    }

    expand (params: any) {

    }

    toggle (params: any) {

    }







}
