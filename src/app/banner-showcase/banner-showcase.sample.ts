import { Component, ViewChild } from '@angular/core';
import { useAnimation } from '@angular/animations';
import { IgxBannerActionsDirective, IgxBannerComponent, IgxFlexDirective, IgxIconComponent, IgxLayoutDirective, IgxRippleDirective, IgxNavbarModule, IgxButtonModule } from 'igniteui-angular';
import { growVerIn, growVerOut } from 'igniteui-angular/animations';
import { defineComponents, IgcBannerComponent } from "igniteui-webcomponents";

defineComponents(IgcBannerComponent);

@Component({
    selector: 'app-banner-showcase-sample',
    templateUrl: `banner-showcase.sample.html`,
    styleUrls: [`banner-showcase.sample.scss`],
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
