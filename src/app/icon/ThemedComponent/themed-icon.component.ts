import { Component, inject } from '@angular/core';
import {
    IgxButtonGroupComponent,
    IgxButtonDirective,
    IgxIconComponent,
    IgxIconService,
    type IgxTheme,
    THEME_TOKEN,
    ThemeTokenFactory
} from 'igniteui-angular';

@Component({
    selector: 'app-themed-icon',
    templateUrl: 'themed-icon.component.html',
    providers: [
        {
          provide: THEME_TOKEN,
          useFactory: ThemeTokenFactory,
        },
        IgxIconService, // Create New Icon Service Scoped to this component
    ],
    imports: [IgxIconComponent, IgxButtonDirective, IgxButtonGroupComponent]
})
export class ThemedIconComponent {
    protected themeToken = inject(THEME_TOKEN);
    protected themes: IgxTheme[] = ['material', 'bootstrap', 'indigo', 'fluent'];

    constructor(private iconService: IgxIconService) {
        this.iconService.setIconRef('expand_more', 'default', { family: 'material', name: 'home' });
        //this.themeToken.next({ theme: 'indigo'});
    }

    protected setTheme(theme: IgxTheme) {
        this.themeToken.next({ theme, preferToken: true });
    }
}
