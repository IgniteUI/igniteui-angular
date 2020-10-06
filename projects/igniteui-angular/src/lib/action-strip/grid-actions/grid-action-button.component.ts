import { Component, Input, TemplateRef, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
@Component({
    selector: 'igx-grid-action-button',
    templateUrl: 'grid-action-button.component.html'
})

export class IgxGridActionButtonComponent {

    @ViewChild('container')
    public container: ElementRef;

    /**
     * Event emitted when action button is clicked.
     * @example
     * ```html
     *  <igx-grid-action-button (onActionClick)="startEdit($event)"></igx-grid-action-button>
     * ```
     */
    @Output()
    onActionClick = new EventEmitter<Event>();

    /**
     * Reference to the current template.
     * @hidden
     * @internal
     */
    @ViewChild(TemplateRef)
    public templateRef: TemplateRef<any>;

    /**
     * Whether button action is rendered in menu and should container text label.
     */
    @Input()
    public asMenuItem = false;

    /**
     * Name of the icon to display in the button.
     */
    @Input()
    public iconName: string;

    /**
     * Additional Menu item container element classes.
     */
    @Input()
    public classNames: string;

    /** @hidden @internal */
    get containerClass(): string {
        return 'igx-action-strip__menu-button ' + (this.classNames || '');
    }

    /**
     * The name of the icon set. Used in case the icon is from a different icon set.
     */
    @Input()
    public iconSet: string;

    /**
     * The text of the label.
     */
    @Input()
    public labelText: string;

    /**
     * @hidden
     * @internal
     */
    public handleClick(event) {
       this.onActionClick.emit(event);
    }
}
