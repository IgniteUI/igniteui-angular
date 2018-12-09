import { Component, ViewChild } from '@angular/core';
import { IgxBannerComponent, growVerIn, growVerOut } from 'igniteui-angular';
import { animate, useAnimation } from '@angular/animations';

@Component({
    selector: 'app-banner-sample',
    templateUrl: `banner.sample.html`,
    styleUrls: [`banner.sample.css`]
})
export class BannerSampleComponent {
    @ViewChild('bannerNoSafeConnection') bannerNoSafeConnection: IgxBannerComponent;
    @ViewChild('bannerCookies') bannerCookies: IgxBannerComponent;

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
