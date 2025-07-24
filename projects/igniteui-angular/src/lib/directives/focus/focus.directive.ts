import { Directive, ElementRef, Input, booleanAttribute, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { EditorProvider, EDITOR_PROVIDER } from '../../core/edit-provider';

@Directive({
    exportAs: 'igxFocus',
    selector: '[igxFocus]',
    standalone: true
})
export class IgxFocusDirective {
    private element = inject(ElementRef);
    private comp = inject<any[]>(NG_VALUE_ACCESSOR, { self: true, optional: true });
    private control = inject(EDITOR_PROVIDER, { self: true, optional: true });


    private focusState = true;

    /**
     * Returns the state of the igxFocus.
     * ```typescript
     * @ViewChild('focusContainer', {read: IgxFocusDirective})
     * public igxFocus: IgxFocusDirective;
     * let isFocusOn = this.igxFocus.focused;
     * ```
     *
     * @memberof IgxFocusDirective
     */
    @Input({ alias: 'igxFocus', transform: booleanAttribute })
    public get focused(): boolean {
        return this.focusState;
    }

    /**
     * Sets the state of the igxFocus.
     * ```html
     * <igx-input-group >
     *  <input #focusContainer igxInput [igxFocus]="true"/>
     * </igx-input-group>
     * ```
     *
     * @memberof IgxFocusDirective
     */
    public set focused(val: boolean) {
        this.focusState = val;
        this.trigger();
    }

    /**
     * Gets the native element of the igxFocus.
     * ```typescript
     * @ViewChild('focusContainer', {read: IgxFocusDirective})
     * public igxFocus: IgxFocusDirective;
     * let igxFocusNativeElement = this.igxFocus.nativeElement;
     * ```
     *
     * @memberof IgxFocusDirective
     */
    public get nativeElement() {
        if (this.comp && this.comp[0] && this.comp[0].getEditElement) {
            return (this.comp[0] as EditorProvider).getEditElement();
        }

        if (this.control && this.control[0] && this.control[0].getEditElement) {
            return this.control[0].getEditElement();
        }

        return this.element.nativeElement;
    }

    /**
     * Triggers the igxFocus state.
     * ```typescript
     * @ViewChild('focusContainer', {read: IgxFocusDirective})
     * public igxFocus: IgxFocusDirective;
     * this.igxFocus.trigger();
     * ```
     *
     * @memberof IgxFocusDirective
     */
    public trigger() {
        if (this.focusState) {
            requestAnimationFrame(() => this.nativeElement.focus({ preventScroll: true }));
        }
    }
}
