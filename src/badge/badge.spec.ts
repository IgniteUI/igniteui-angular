import {
    async,
    TestBed
} from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { BadgeModule, Badge } from './badge';


describe('Badge', function () {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitBadge,
                InitBadgeWithDefaults,
                InitBadgeWithIcon,
                Badge
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
        expect(fixture.elementRef.nativeElement.getElementsByTagName("div")[0].classList.contains("ig-badge__position--bottom-left")).toBeTruthy();
        expect(fixture.elementRef.nativeElement.getElementsByTagName("div")[0].classList.contains("ig-badge")).toBeTruthy();
        expect(fixture.elementRef.nativeElement.getElementsByClassName("ig-badge__circle")[0].textContent == 22).toBeTruthy();
    });

    it('Initializes badge defaults', () => {
        let fixture = TestBed.createComponent(InitBadgeWithDefaults);
        fixture.detectChanges();
        let badge = fixture.componentInstance.badge;

        expect(fixture.elementRef.nativeElement.getElementsByTagName("div")[0].classList.contains("ig-badge__position--bottom-right")).toBeTruthy();
        expect(fixture.elementRef.nativeElement.getElementsByTagName("span")[0].textContent == "?").toBeTruthy();
        expect(fixture.elementRef.nativeElement.getElementsByTagName("i").length === 0).toBeTruthy();
    });

    it('Initializes badge with icon', () => {
        let fixture = TestBed.createComponent(InitBadgeWithIcon);
        fixture.detectChanges();
        let badge = fixture.componentInstance.badge;
        let divContainer = fixture.elementRef.nativeElement.querySelectorAll("div.ig-badge__circle");

        expect(divContainer).toBeTruthy();
        expect(badge.iconBdg === "person").toBeTruthy();
        expect(badge.type === "info").toBeTruthy();
        expect(badge.value === "?").toBeTruthy();
        expect(fixture.elementRef.nativeElement.getElementsByTagName("div")[0].classList.contains("ig-badge__position--top-left")).toBeTruthy();
        expect(divContainer[0].classList.contains("ig-badge__circle--info")).toBeTruthy();
    });
});

@Component({ template: `<ig-badge type="error" value="22" position="bottom-left"></ig-badge>` })
class InitBadge {
    @ViewChild(Badge) badge: Badge;
}

@Component({ template: `<ig-badge></ig-badge>` })
class InitBadgeWithDefaults {
    @ViewChild(Badge) badge: Badge;
}

@Component({ template: `<ig-badge icon="person" type="info" position="top-left"></ig-badge>` })
class InitBadgeWithIcon {
    @ViewChild(Badge) badge: Badge;
}
