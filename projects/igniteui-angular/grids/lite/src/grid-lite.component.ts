import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, input, OnInit } from '@angular/core';
import { IgcGridLite } from 'igniteui-grid-lite';

@Component({
    selector: 'igx-grid-lite',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './grid-lite.component.html'
})

export class IgxGridLiteComponent implements OnInit {

    //#region Inputs

    /** The data source for the grid. */
    public readonly data = input<any>([]);

    /**
     * Whether the grid will try to "resolve" its column configuration based on the passed
     * data source.
     *
     * @remarks
     * This property is ignored if any existing column configuration already exists in the grid.
     */
    public readonly autoGenerate = input<boolean>(false);

    //#endregion

    /**
     * @internal
     */
    public ngOnInit(): void {
        IgcGridLite.register();
    }
}
