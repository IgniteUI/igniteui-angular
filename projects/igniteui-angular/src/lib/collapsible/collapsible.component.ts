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
    Directive,
    TemplateRef,
    ContentChild
} from '@angular/core';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-collapsible-title'
})
export class IgxCollapsibleTitleDirective {

    constructor( template: ElementRef<any>) { }
}

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-collapsible-description'
})
export class IgxCollapsibleDescriptionDirective {

    constructor( template: ElementRef<any>) { }
}

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-collapsible-body'
})
export class IgxCollapsibleBodyDirective {

    constructor( template: ElementRef<any>) { }
}

@Component({
    selector: 'igx-collapsible',
    templateUrl: 'collapsible.component.html'
})
export class IgxCollapsibleComponent {
     // properties section

    @ContentChild(IgxCollapsibleBodyDirective, { read: IgxCollapsibleBodyDirective })
    public textArea: IgxCollapsibleBodyDirective;

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

    // @Output()
    // public onCollapsing = new EventEmitter<any>();

    // @Output()
    // public onExpanding = new EventEmitter<any>();

    @Output()
    public onExpanded = new EventEmitter<any>();

    constructor(public cdr: ChangeDetectorRef, public elementRef: ElementRef, private renderer: Renderer2) { }

    collapse () {
        this.onCollapsed.emit();
        this.collapsed = true;
    }

    expand () {
        this.onExpanded.emit();
        this.collapsed = false;
    }

    toggle () {
        if (this.collapsed) {
            this.expand();
        } else  {
            this.collapse();
        }
    }
}

