import {
    async,
    TestBed
} from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { IgxBadgeModule, IgxBadge } from './badge.component';


describe('Badge', function () {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitBadge,
                InitBadgeWithDefaults,
                InitBadgeWithIcon,
                IgxBadge,
                InitBadgeWithIconARIA
            ]
        })
            .compileComponents();
    }));

    it('Initializes badge ', () => {
        let fixture = TestBed.createComponent(InitBadge);
        fixture.detectChanges();
        let badge = fixture.componentInstance.badge;

        expect(badge.value).toBeTruthy();
        expect(badge.type).toBeTruthy();
        expect(fixture.elementRef.nativeElement.getElementsByTagName("div")[0].classList.contains("igx-badge--bottom-left")).toBeTruthy();
        expect(fixture.elementRef.nativeElement.getElementsByClassName("igx-badge__circle")[0].textContent == 22).toBeTruthy();
    });

    it('Initializes badge defaults', () => {
        let fixture = TestBed.createComponent(InitBadgeWithDefaults);
        fixture.detectChanges();
        let badge = fixture.componentInstance.badge;

        expect(fixture.elementRef.nativeElement.getElementsByTagName("div")[0].classList.contains("igx-badge--top-right")).toBeTruthy();
        expect(fixture.elementRef.nativeElement.getElementsByTagName("span")[0].textContent == "?").toBeTruthy();
        expect(fixture.elementRef.nativeElement.getElementsByTagName("i").length === 0).toBeTruthy();
    });

    it('Initializes badge with icon', () => {
        let fixture = TestBed.createComponent(InitBadgeWithIcon);
        fixture.detectChanges();
        let badge = fixture.componentInstance.badge;
        let divContainer = fixture.elementRef.nativeElement.querySelectorAll("div.igx-badge__circle");

        expect(divContainer).toBeTruthy();
        expect(badge.iconBdg === "person").toBeTruthy();
        expect(badge.type === "info").toBeTruthy();
        expect(badge.value === "?").toBeTruthy();
        expect(fixture.elementRef.nativeElement.getElementsByTagName("div")[0].classList.contains("igx-badge--top-left")).toBeTruthy();
        expect(divContainer[0].classList.contains("igx-badge__circle--info")).toBeTruthy();
    });

    it('Initializes badge with icon ARIA', () => {
        let fixture = TestBed.createComponent(InitBadgeWithIconARIA);
        fixture.detectChanges();
        let badge = fixture.componentInstance.badge;
        let divContainer = fixture.elementRef.nativeElement.querySelectorAll("div.igx-badge__circle");

        expect(badge.roleDescription === "success type badge with icon type person").toBeTruthy();
        expect(divContainer[0].getAttribute("aria-roledescription") === "success type badge with icon type person").toBeTruthy();
    });
});

@Component({ template: `<igx-badge type="error" value="22" position="bottom-left"></igx-badge>` })
class InitBadge {
    @ViewChild(IgxBadge) badge: IgxBadge;
}

@Component({ template: `<igx-badge></igx-badge>` })
class InitBadgeWithDefaults {
    @ViewChild(IgxBadge) badge: IgxBadge;
}

@Component({ template: `<igx-badge icon="person" type="info" position="top-left"></igx-badge>` })
class InitBadgeWithIcon {
    @ViewChild(IgxBadge) badge: IgxBadge;
}

@Component({ template: `<igx-badge icon="person" type="success"></igx-badge>` })
class InitBadgeWithIconARIA {
    @ViewChild(IgxBadge) badge: IgxBadge;
}