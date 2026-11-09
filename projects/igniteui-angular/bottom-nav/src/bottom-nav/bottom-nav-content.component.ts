import { Component, HostBinding, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { IgxTabContentBase, IgxTabContentDirective } from 'igniteui-angular/tabs';

@Component({
    selector: 'igx-bottom-nav-content',
    templateUrl: 'bottom-nav-content.component.html',
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: IgxTabContentBase, useExisting: IgxBottomNavContentComponent }],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: []
})
export class IgxBottomNavContentComponent extends IgxTabContentDirective {
    /** @hidden */
    @HostBinding('class.igx-bottom-nav__panel')
    public defaultClass = true;
}
