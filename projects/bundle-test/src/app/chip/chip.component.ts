import { Component } from '@angular/core';
import { ChipResourceStringsBG } from 'igniteui-angular-i18n';
import { IgxChipComponent } from 'igniteui-angular';

@Component({
    selector: 'app-chip',
    imports: [IgxChipComponent],
    templateUrl: './chip.component.html',
    styleUrls: ['./chip.component.scss']
})
export class ChipComponent {
    protected chipStrings = ChipResourceStringsBG;
}
