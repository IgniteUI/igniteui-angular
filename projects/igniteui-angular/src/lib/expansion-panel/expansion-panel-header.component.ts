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
    Inject,
    forwardRef
} from '@angular/core';
import { IgxExpansionPanelComponent } from './expansion-panel.component';
import { IgxExpansionPanelIconDirective, IgxExpansionPanelTitleDirective } from './expansion-panel.directives';

export interface IExpansionPanelEventArgs {
    event: Event;
    panel: IgxExpansionPanelComponent;
}

/**
 * @hidden
 */
export enum ICON_POSITION {
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
    public id = '';

    @ContentChild(IgxExpansionPanelIconDirective)
    public set iconTemplate(val: any) {
        this._iconTemplate = <boolean>val;
    }

    public get iconTemplate(): any {
        return this._iconTemplate;
    }

    @HostBinding('attr.aria-level')
    @Input()
    public lv = '3';

    @HostBinding('attr.role')
    @Input()
    public role = 'heading';

    public get controls (): string {
        return this.panel.id;
    }

    @Input()
    public iconPosition: ICON_POSITION = ICON_POSITION.LEFT;

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

    constructor(@Inject(forwardRef(() => IgxExpansionPanelComponent)) public panel: IgxExpansionPanelComponent,
     public cdr: ChangeDetectorRef,
     public elementRef: ElementRef) {
         this.id = `${this.panel.id}-header`;
     }

     @HostListener('keydown.Enter', ['$event'])
     @HostListener('keydown.Space', ['$event'])
     @HostListener('keydown.Spacebar', ['$event'])
     @HostListener('click', ['$event'])
     public onAction(evt?: Event) {
         if (this.disabled) {
            evt.stopPropagation();
            return;
         }
         this.onInteraction.emit({ event: evt, panel: this.panel });
         this.panel.toggle(evt);
         evt.preventDefault();
     }

     public get iconPositionClass(): string {
        switch (this.iconPosition) {
            case (ICON_POSITION.LEFT):
                return `igx-expansion-panel__header-icon--start`;
            case (ICON_POSITION.RIGHT):
                return `igx-expansion-panel__header-icon--end`;
            case (ICON_POSITION.NONE):
                return `igx-expansion-panel__header-icon--none`;
            default:
                return '';
        }
     }
}
