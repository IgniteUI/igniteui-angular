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
    public readonly data = input<any>([]);

    public readonly autoGenerate = input<boolean>(true);

    // public readonly columns = input<
    //#endregion

    /**
     * @internal
     */
    public ngOnInit(): void {
        IgcGridLite.register();
    }
}
