import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    Input,
    QueryList,
    forwardRef,
    HostBinding
} from '@angular/core';
import { IgxColumnComponent } from '.././column.component';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxGridBaseComponent } from '../grid';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: IgxColumnComponent, useExisting: forwardRef(() => IgxChildLayoutComponent) }],
    selector: 'igx-layout',
    template: `<ng-content></ng-content>`
})
export class IgxChildLayoutComponent {
    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent })
    children = new QueryList<IgxColumnComponent>();

    @Input() public key: string;
}


