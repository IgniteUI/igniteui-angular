import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IgxGridComponent } from 'igniteui-angular/grids/grid';

@Component({
    selector: 'app-grid',
    standalone: true,
    imports: [
        IgxGridComponent,
    ],
    templateUrl: './grid.component.html',
    styleUrl: './grid.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent { }
