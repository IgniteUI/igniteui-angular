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
     *
     * @example
     * ```html
     *  <igx-grid-action-button (actionClick)="startEdit($event)"></igx-grid-action-button>
     * ```
     */
    @Output()
    public actionClick = new EventEmitter<Event>();

    /**
     * Reference to the current template.
     *
     * @hidden
     * @internal
     */
    @ViewChild('menuItemTemplate')
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
    public get containerClass(): string {
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
       this.actionClick.emit(event);
    }

    /**
     * @hidden @internal
     */
    public preventEvent(event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
    }
}
