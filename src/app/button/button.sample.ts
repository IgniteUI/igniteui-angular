import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DisplayDensity, IgxButtonDirective, IgxButtonGroupComponent, IgxIconButtonDirective, IgxIconComponent } from 'igniteui-angular';

@Component({
    selector: 'app-button-sample',
    styleUrls: ['button.sample.scss'],
    templateUrl: 'button.sample.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [IgxButtonDirective, IgxIconComponent, IgxButtonGroupComponent, IgxIconButtonDirective]
})
export class ButtonSampleComponent implements OnInit {
    public density: DisplayDensity = 'comfortable';
    public displayDensities;

    public ngOnInit(): void {
        this.displayDensities = [
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'compact', selected: this.density === 'compact', togglable: true }
        ];
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }
}
