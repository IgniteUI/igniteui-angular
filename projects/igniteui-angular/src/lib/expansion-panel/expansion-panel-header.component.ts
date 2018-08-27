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
import { IgxExpansionPanelComponent } from './expansion-panel.component';
import { IgxExpansionPanelButtonDirective } from './expansion-panel.directives';

export interface IExpansionPanelEventArgs {
    event: Event;
}

export enum BUTTON_POSITION {
    LEFT = 'left',
    NONE = 'none',
    RIGHT = 'right'
}

@Component({
    selector: 'igx-expansion-panel-header',
    templateUrl: 'expansion-panel-header.component.html'
})
export class IgxExpansionPanelHeaderComponent {
     // properties section

     private _iconTemplate = false;

    @ContentChild(IgxExpansionPanelButtonDirective)
    public set iconTemplate(val: any) {
        this._iconTemplate = <boolean>val;
    }

    public get iconTemplate(): any {
        return this._iconTemplate;
    }

    @HostBinding('attr.aria-role')
    @Input()
    public role = 'heading';

    @HostBinding('attr.aria-controls')
    @Input()
    public controls = this.panel.id;

    @Input()
    public buttonPosition: BUTTON_POSITION = BUTTON_POSITION.LEFT;

    @Input()
    @HostBinding('attr.tabindex')
    public tabIndex = 0;

    @Output()
    public onInterraction = new EventEmitter<IExpansionPanelEventArgs>();

     @HostBinding('class.igx-expansion-panel__header')
     public cssClass = 'igx-expansion-panel__header';


     @Input()
     @HostBinding('class.igx-expansion-panel__header--collapsed')
     public get isCollapsed () {
        return this.panel.collapsed;
     }

     @Input()
     @HostBinding('attr.aria-expanded')
     @HostBinding('class.igx-expansion-panel__header--expanded')
     public get isExpanded () {
            return !this.panel.collapsed;
         }

    constructor(@Host() public panel: IgxExpansionPanelComponent, public cdr: ChangeDetectorRef,
     public elementRef: ElementRef, private renderer: Renderer2) { }

     @HostListener('keydown.Enter', ['$event'])
     @HostListener('keydown.Space', ['$event'])
     @HostListener('click', ['$event'])
     public onAction(evt?: Event) {
         if (this.panel.disabled) {
            evt.stopPropagation();
            return;
         }
         this.onInterraction.emit({ event: evt });
         this.panel.toggle(evt);
         evt.preventDefault();
     }
}
