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
import { IgxExpansionPanelButtonDirective, IgxExpansionPanelTitleDirective } from './expansion-panel.directives';

export interface IExpansionPanelEventArgs {
    event: Event;
}

export enum BUTTON_POSITION {
    LEFT = 'left',
    NONE = 'none',
    RIGHT = 'right'
}

//let NEXT_ID = 0;

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

    @ContentChild(IgxExpansionPanelTitleDirective)
    public title: IgxExpansionPanelTitleDirective;

    @HostBinding('attr.aria-labelledby')
    @Input()
    public labelledby = this.title ? this.title.id : null; //?? TODO reference to title directive text

    // @HostBinding('attr.id')
    // @Input()
    // public id = `igx-expansion-panel-header-${NEXT_ID++}`; //May not be needed

    @HostBinding('attr.aria-level')//OK
    @Input()
    public lv = '3';

    @HostBinding('attr.aria-role')//OK
    @Input()
    public role = 'heading';

    @HostBinding('attr.aria-controls')//OK
    @Input()
    public controls = this.panel.id;

    @Input()
    public buttonPosition: BUTTON_POSITION = BUTTON_POSITION.LEFT;

    @Output()
    public onInteraction = new EventEmitter<IExpansionPanelEventArgs>();

     @HostBinding('class.igx-expansion-panel__header')
     public cssClass = 'igx-expansion-panel__header';

     @HostBinding('attr.aria-expanded')//OK
     @HostBinding('class.igx-expansion-panel__header--expanded')
     public get isExpanded () {
            return !this.panel.collapsed;
         }

    @Input()
    @HostBinding('attr.aria-disabled')
    @HostBinding('class.igx-expansion-panel--disabled')
    public disabled = false;

    constructor(@Host() public panel: IgxExpansionPanelComponent, public cdr: ChangeDetectorRef,
     public elementRef: ElementRef, private renderer: Renderer2) { }

     @HostListener('keydown.Enter', ['$event'])
     @HostListener('keydown.Space', ['$event'])
     @HostListener('click', ['$event'])
     public onAction(evt?: Event) {
         if (this.disabled) {
            evt.stopPropagation();
            return;
         }
         this.onInteraction.emit({ event: evt });
         this.panel.toggle(evt);
         evt.preventDefault();
     }
}
