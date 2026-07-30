import { Component, HostBinding, ChangeDetectionStrategy } from '@angular/core';
import { IgxTabContentBase, IgxTabContentDirective } from 'igniteui-angular/tabs';

@Component({
    selector: 'igx-bottom-nav-content',
    templateUrl: 'bottom-nav-content.component.html',
    providers: [{ provide: IgxTabContentBase, useExisting: IgxBottomNavContentComponent }],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: []
})
export class IgxBottomNavContentComponent extends IgxTabContentDirective {
    /** @hidden */
    @HostBinding('class.igx-bottom-nav__panel')
    public defaultClass = true;
}
