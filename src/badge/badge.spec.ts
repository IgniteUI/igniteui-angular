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
        expect(fixture.elementRef.nativeElement.getElementsByTagName("svg")[0].classList.contains("ig-badge--error")).toBeTruthy();
        expect(fixture.elementRef.nativeElement.getElementsByTagName("text")[0].textContent === "z").toBeTruthy();
    });

    it('Initializes badge defaults', () => {
        let fixture = TestBed.createComponent(InitBadgeWithDefaults);
        fixture.detectChanges();
        let badge = fixture.componentInstance.badge;

        // Add to test some style checks
        expect(fixture.elementRef.nativeElement.getElementsByTagName("svg")[0].getAttributeNS(null, "height") === "18").toBeTruthy();
        expect(fixture.elementRef.nativeElement.getElementsByTagName("svg")[0].getAttributeNS(null, "width") === "18").toBeTruthy();
        expect(fixture.elementRef.nativeElement.getElementsByTagName("text")[0].textContent === "-").toBeTruthy();
        expect(fixture.elementRef.nativeElement.getElementsByTagName("span").length === 0).toBeTruthy();
    });

    it('Initializes badge with icon', () => {
        let fixture = TestBed.createComponent(InitBadgeWithIcon);
        fixture.detectChanges();
        let badge = fixture.componentInstance.badge;
        let spanElement = fixture.elementRef.nativeElement.getElementsByTagName("span");

        expect(badge.iconBdg === "person").toBeTruthy();
        expect(badge.type === "").toBeTruthy();
        expect(spanElement).toBeTruthy();
        expect(spanElement[0].classList.contains("ig-badge--icon")).toBeTruthy();
        expect(spanElement[0].style.backgroundColor === "green").toBeTruthy();
        expect(spanElement[0].style.color === "white").toBeTruthy();
    });
});

@Component({ template: `<ig-badge type="error" value="z"></ig-badge>` })
class InitBadge {
    @ViewChild(Badge) badge: Badge;
}

@Component({ template: `<ig-badge></ig-badge>` })
class InitBadgeWithDefaults {
    @ViewChild(Badge) badge: Badge;
}

@Component({ template: `<ig-badge iconBdg="person"></ig-badge>` })
class InitBadgeWithIcon {
    @ViewChild(Badge) badge: Badge;
}