import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { IgxButtonDirective, IgxButtonGroupComponent, IgxIconButtonDirective, IgxIconComponent, IgxIconService, IgxRippleDirective } from 'igniteui-angular';
import { SizeSelectorComponent } from '../size-selector/size-selector.component';

@Component({
    selector: 'app-button-sample',
    styleUrls: ['button.sample.scss'],
    templateUrl: 'button.sample.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [IgxButtonDirective, IgxIconComponent, IgxButtonGroupComponent, IgxIconButtonDirective, IgxRippleDirective, SizeSelectorComponent]
})
export class ButtonSampleComponent implements OnInit {
    @ViewChild('inactive', { read: IgxIconButtonDirective, static: true })
    public inactiveBtn: IgxIconButtonDirective;

    constructor(private _iconService: IgxIconService, public router: Router) {}

    public ngOnInit(): void {
        this.inactiveBtn.disabled = true;
        this._iconService.addSvgIcon('copy', '/assets/svg/filtering/copy.svg', '', true);
    }
}
