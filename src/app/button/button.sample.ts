import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { DisplayDensity, IgxButtonDirective, IgxButtonGroupComponent, IgxIconButtonDirective, IgxIconComponent, IgxIconService, IgxRippleDirective } from 'igniteui-angular';

@Component({
    selector: 'app-button-sample',
    styleUrls: ['button.sample.scss'],
    templateUrl: 'button.sample.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [IgxButtonDirective, IgxIconComponent, IgxButtonGroupComponent, IgxIconButtonDirective, IgxRippleDirective]
})
export class ButtonSampleComponent implements OnInit {
    @ViewChild('inactive', { read: IgxIconButtonDirective, static: true })
    public inactiveBtn: IgxIconButtonDirective;

    public density: DisplayDensity = 'comfortable';
    public displayDensities;

    constructor(private _iconService: IgxIconService, public router: Router) {}

    public ngOnInit(): void {
        this.inactiveBtn.disabled = true;
        this._iconService.addSvgIcon('copy', '/assets/svg/filtering/copy.svg', '', true);

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
