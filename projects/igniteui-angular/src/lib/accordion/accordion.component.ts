import { AfterContentInit, Component, ContentChildren, HostBinding, Input, QueryList } from '@angular/core';
import { IgxExpansionPanelComponent } from '../expansion-panel/expansion-panel.component';
import { ToggleAnimationSettings } from '../expansion-panel/toggle-animation-component';

let NEXT_ID = 0;

@Component({
    selector: 'igx-accordion',
    templateUrl: 'accordion.component.html'
})
export class IgxAccordionComponent implements AfterContentInit{
    /**
     * Sets/gets the `id` of the accordion component.
     * If not set, `id` will have value `"igx-accordion-0"`;
     * ```html
     * <igx-accordion id = "my-first-accordion"></igx-expansion-panel>
     * ```
     * ```typescript
     * const accordionId =  this.accordion.id;
     * ```
     *
     * @memberof IgxAccordionComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-accordion-${NEXT_ID++}`;

    /** Get/Set the animation settings that panels should use when expanding/collpasing.
     *
     * ```html
     * <igx-accordion [animationSettings]="customAnimationSettings"></igx-accordion>
     * ```
     *
     * ```typescript
     * const animationSettings: ToggleAnimationSettings = {
     *      openAnimation: growVerIn,
     *      closeAnimation: growVerOut
     * };
     *
     * this.accordion.animationSettings = animationSettings;
     * ```
     */
    @Input()
    public get animationSettings(): ToggleAnimationSettings {
        return this._animationSettings;
    }
    public set animationSettings(value: ToggleAnimationSettings) {
        this._animationSettings = value;
        this.updatePanelsAnimation();
    }

    /** @hidden @internal */
    @ContentChildren(IgxExpansionPanelComponent, { descendants: false })
    public _panels: QueryList<IgxExpansionPanelComponent>;

    /**
     * Returns all panels
     *
     * ```typescript
     * const panels: IgxExpansionPanelComponent[] = this.accordion.panels;
     * ```
     */
    public get panels(): IgxExpansionPanelComponent[] {
        return this._panels?.toArray();
    }

    private _animationSettings: ToggleAnimationSettings;

    public ngAfterContentInit() {
        this.updatePanelsAnimation();
    }

    public handleKeydown(ev) {

    }

    private updatePanelsAnimation() {
        if (this.animationSettings !== undefined) {
            this.panels?.forEach(panel => panel.animationSettings = this.animationSettings);
        }
    }

}
