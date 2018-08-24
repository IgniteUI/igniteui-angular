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
    Output,
    ContentChild,
    TemplateRef
} from '@angular/core';
import { IgxCollapsibleComponent } from './collapsible.component';
import { IgxCollapsibleButtonDirective } from './collapsible.directives';

export interface ICollapsibleEventArgs {
    event: Event;
}

export enum BUTTON_POSITION {
    LEFT = 'left',
    NONE = 'none',
    RIGHT = 'right'
}

@Component({
    selector: 'igx-collapsible-header',
    templateUrl: 'collapsible-header.component.html'
})
export class IgxCollapsibleHeaderComponent {
     // properties section

     private _iconTemplate = false;

    @ContentChild(IgxCollapsibleButtonDirective)
    public set iconTemplate(val: any) {
        this._iconTemplate = <boolean>val;
    }

    public get iconTemplate(): any {
        return this._iconTemplate;
    }

    @Input()
    public buttonPosition: BUTTON_POSITION = BUTTON_POSITION.LEFT;

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
        this.onInterraction.emit({ event: evt });
         this.collapsible.toggle(evt);
         evt.preventDefault();
     }
}
