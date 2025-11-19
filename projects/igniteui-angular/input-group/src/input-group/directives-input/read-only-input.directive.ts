import { Directive, effect, inject, input } from '@angular/core';
import { IgxInputGroupComponent } from '../input-group.component';

@Directive({
    selector: '[igxReadOnlyInput]',
    exportAs: 'igxReadOnlyInput',
    standalone: true
})
export class IgxReadOnlyInputDirective {
    public igxReadOnlyInput = input<boolean>(false);

    private _inputGroup: IgxInputGroupComponent | null = inject(
        IgxInputGroupComponent,
        {
            optional: true
        }
    );

    constructor() {
        effect(() => {
            if (this._inputGroup) {
                this._inputGroup.readOnly = this.igxReadOnlyInput();
            }
        });
    }
}
