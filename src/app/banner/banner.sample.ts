import { Component, ViewChild } from '@angular/core';
import { useAnimation } from '@angular/animations';
import { IgxLayoutDirective, IgxFlexDirective } from '../../../projects/igniteui-angular/src/lib/directives/layout/layout.directive';
import { IgxRippleDirective } from '../../../projects/igniteui-angular/src/lib/directives/ripple/ripple.directive';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { IgxBannerActionsDirective } from '../../../projects/igniteui-angular/src/lib/banner/banner.directives';
import { IgxIconComponent } from '../../../projects/igniteui-angular/src/lib/icon/icon.component';
import { IgxBannerComponent } from '../../../projects/igniteui-angular/src/lib/banner/banner.component';
import { growVerIn, growVerOut } from '../../../projects/igniteui-angular/src/lib/animations/grow';

@Component({
    selector: 'app-banner-sample',
    templateUrl: `banner.sample.html`,
    styleUrls: [`banner.sample.css`],
    standalone: true,
    imports: [IgxBannerComponent, IgxIconComponent, IgxBannerActionsDirective, IgxButtonDirective, IgxRippleDirective, IgxLayoutDirective, IgxFlexDirective]
})
export class BannerSampleComponent {
    @ViewChild('bannerNoSafeConnection', { static: true })
    private bannerNoSafeConnection: IgxBannerComponent;
    @ViewChild('bannerCookies', { static: true })
    private bannerCookies: IgxBannerComponent;

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

    public accept(event) {
        this.bannerCookies.close(event);
    }

    public moreInfo(event) {
        this.bannerCookies.close(event);
    }

    public toggleCustomBanner(event?) {
        this.bannerCookies.toggle(event);
    }
}
