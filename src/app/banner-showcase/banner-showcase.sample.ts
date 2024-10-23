import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { useAnimation } from '@angular/animations';
import { IgxBannerActionsDirective, IgxBannerComponent, IgxFlexDirective, IgxIconComponent, IgxLayoutDirective, IgxRippleDirective, IgxNavbarModule, IgxButtonModule } from 'igniteui-angular';
import { growVerIn, growVerOut } from 'igniteui-angular/animations';
import { defineComponents, IgcBannerComponent, IgcIconComponent, registerIconFromText } from "igniteui-webcomponents";

defineComponents(IgcBannerComponent, IgcIconComponent);

const lock = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>'
registerIconFromText("lock", lock);

@Component({
    selector: 'app-banner-showcase-sample',
    templateUrl: `banner-showcase.sample.html`,
    styleUrls: [`banner-showcase.sample.scss`],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxBannerComponent, IgxIconComponent, IgxBannerActionsDirective, IgxRippleDirective, IgxLayoutDirective, IgxFlexDirective, IgxNavbarModule, IgxButtonModule]
})
export class BannerShowcaseSampleComponent {
    @ViewChild('bannerNoSafeConnection', { static: true })
    private bannerNoSafeConnection: IgxBannerComponent;

    public animationSettings = { openAnimation: useAnimation(growVerIn, {
        params: {
            duration: '2000ms'
        }
    }), closeAnimation:  useAnimation(growVerOut)};
    public toggle() {
        if (this.bannerNoSafeConnection.collapsed) {
            this.bannerNoSafeConnection.open();
        } else {
            this.bannerNoSafeConnection.close();
        }
    }

    public onOpen(ev) {
        console.log('Open', ev);
    }

    public onClose(ev) {
        console.log('Close', ev);
    }

    public onButtonClick(ev) {
        console.log('Button click', ev);
    }
}
