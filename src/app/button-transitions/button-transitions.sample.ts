import { Component, signal } from '@angular/core';
import { IgxButtonDirective, IgxRippleDirective } from 'igniteui-angular';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxInputGroupComponent, IgxInputDirective } from 'igniteui-angular/input-group';

// Regression demo for #16817: flat buttons must not animate their resting styles when
// mounted next to a freshly-rendered igx-input-group. Standalone so no other input-group
// on the page masks it.
@Component({
    selector: 'app-button-transitions',
    standalone: true,
    templateUrl: './button-transitions.sample.html',
    styleUrls: ['./button-transitions.sample.scss'],
    imports: [IgxButtonDirective, IgxRippleDirective, IgxIconComponent, IgxInputGroupComponent, IgxInputDirective]
})
export class ButtonTransitionsComponent {
    public viewState = signal<'state-a' | 'state-b'>('state-a');

    public toggleState(): void {
        this.viewState.update(current => (current === 'state-a' ? 'state-b' : 'state-a'));
    }
}
