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
    public labelledby = this.title ? this.title.id : null;

    @HostBinding('attr.aria-level')
    @Input()
    public lv = '3';

    @HostBinding('attr.role')
    @Input()
    public role = 'heading';

    @Input()
    public controls = this.panel.id;

    @Input()
    public buttonPosition: BUTTON_POSITION = BUTTON_POSITION.LEFT;

    @Output()
    public onInteraction = new EventEmitter<IExpansionPanelEventArgs>();

     @HostBinding('class.igx-expansion-panel__header')
     public cssClass = 'igx-expansion-panel__header';

     @HostBinding('class.igx-expansion-panel__header--expanded')
     public get isExpanded () {
            return !this.panel.collapsed;
         }

    @Input()
    @HostBinding('class.igx-expansion-panel--disabled')
    public disabled = false;

    constructor(@Host() public panel: IgxExpansionPanelComponent, public cdr: ChangeDetectorRef,
     public elementRef: ElementRef, private renderer: Renderer2) { }

     @HostListener('keydown.Enter', ['$event'])
     @HostListener('keydown.Space', ['$event'])
     @HostListener('keydown.Spacebar', ['$event'])
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
