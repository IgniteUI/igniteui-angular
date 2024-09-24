import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { IgxExpansionPanelBodyComponent, IgxExpansionPanelComponent, IgxExpansionPanelDescriptionDirective, IgxExpansionPanelHeaderComponent, IgxExpansionPanelIconDirective, IgxExpansionPanelTitleDirective } from 'igniteui-angular';
import { defineComponents, IgcExpansionPanelComponent} from "igniteui-webcomponents";

defineComponents(IgcExpansionPanelComponent);

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'expansion-panel-showcase-sample',
    templateUrl: './expansion-panel-showcase-sample.html',
    styleUrls: ['expansion-panel-showcase-sample.scss'],
    standalone: true,
    imports: [IgxExpansionPanelComponent, IgxExpansionPanelHeaderComponent, IgxExpansionPanelTitleDirective, IgxExpansionPanelDescriptionDirective, NgIf, IgxExpansionPanelIconDirective, IgxExpansionPanelBodyComponent]
})
export class ExpansionPanelShowcaseSampleComponent {}
