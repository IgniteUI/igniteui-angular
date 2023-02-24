import { Component } from '@angular/core';
import { SAMPLE_DATA } from '../shared/sample-data';
import { IgxGridComponent } from '../../../projects/igniteui-angular/src/lib/grids/grid/grid.component';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { IgxSwitchComponent } from '../../../projects/igniteui-angular/src/lib/switch/switch.component';
import { IgxLayoutDirective } from '../../../projects/igniteui-angular/src/lib/directives/layout/layout.directive';
import { IgxHintDirective } from '../../../projects/igniteui-angular/src/lib/directives/hint/hint.directive';
import { IgxIconComponent } from '../../../projects/igniteui-angular/src/lib/icon/icon.component';
import { IgxSuffixDirective } from '../../../projects/igniteui-angular/src/lib/directives/suffix/suffix.directive';
import { IgxInputDirective } from '../../../projects/igniteui-angular/src/lib/directives/input/input.directive';
import { FormsModule } from '@angular/forms';
import { IgxLabelDirective } from '../../../projects/igniteui-angular/src/lib/directives/label/label.directive';
import { IgxInputGroupComponent } from '../../../projects/igniteui-angular/src/lib/input-group/input-group.component';

@Component({
    selector: 'app-grid-clipboard-sample',
    templateUrl: './grid-clipboard.sample.html',
    standalone: true,
    imports: [IgxInputGroupComponent, IgxLabelDirective, FormsModule, IgxInputDirective, IgxSuffixDirective, IgxIconComponent, IgxHintDirective, IgxLayoutDirective, IgxSwitchComponent, IgxButtonDirective, IgxGridComponent]
})
export class GridClipboardSampleComponent {
    public data: any[];

    public options = {
        enabled: true,
        copyHeaders: true,
        copyFormatters: true,
        separator: '\t'
    };

    constructor() {
        this.data = SAMPLE_DATA.slice(0);
    }

    public formatter = (value: any) => `** ${value} **`;

    public initColumn(column) {
        column.formatter = this.formatter;
        column.header = `🐱‍👤 ${column.field} 🐱‍🏍`;
    }
}
