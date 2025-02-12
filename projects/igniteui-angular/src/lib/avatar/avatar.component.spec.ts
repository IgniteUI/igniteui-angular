import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxAvatarComponent, IgxAvatarType, IgxAvatarSize } from './avatar.component';

import { configureTestSuite } from '../test-utils/configure-suite';

describe('Avatar', () => {
    configureTestSuite();
    const baseClass = 'igx-avatar';

    const classes = {
        round: `${baseClass}--rounded`,
        circle: `${baseClass}--circle`,
        small: `${baseClass}--small`,
        medium: `${baseClass}--medium`,
        large: `${baseClass}--large`,
        image: `${baseClass}--image`,
        initials: `${baseClass}--initials`,
        icon: `${baseClass}--icon`
    };

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                InitAvatarComponent,
                AvatarWithAttribsComponent,
                IgxAvatarComponent,
                InitIconAvatarComponent,
                InitImageAvatarComponent
            ]
        }).compileComponents();
    }));

    it('Initializes avatar with auto-incremented id', () => {
        const fixture = TestBed.createComponent(InitAvatarComponent);
        fixture.detectChanges();
        const instance = fixture.componentInstance.avatar;
        const hostEl = fixture.debugElement.query(By.css(baseClass)).nativeElement;

        expect(instance.id).toContain('igx-avatar-');
        expect(hostEl.id).toContain('igx-avatar-');

        instance.id = 'customAvatar';
        fixture.detectChanges();

        expect(instance.id).toBe('customAvatar');
        expect(hostEl.id).toBe('customAvatar');
    });

    it('Initializes square and round avatar', () => {
        const fixture = TestBed.createComponent(AvatarWithAttribsComponent);
        fixture.detectChanges();
        const instance = fixture.componentInstance.avatar;
        const hostEl = fixture.debugElement.query(By.css(baseClass)).nativeElement;

        expect(instance.shape).toEqual('square');
        expect(hostEl.classList).not.toContain(classes.circle);
        expect(hostEl.classList).not.toContain(classes.round);

        instance.shape = "circle";

        fixture.detectChanges();
        expect(instance.shape).toEqual('circle');
        expect(hostEl.classList).toContain(classes.circle);
        expect(hostEl.classList).not.toContain(classes.round);

        instance.shape = "rounded";

        fixture.detectChanges();
        expect(instance.shape).toEqual('rounded');
        expect(hostEl.classList).toContain(classes.round);
        expect(hostEl.classList).not.toContain(classes.circle);
    });

    it('Can change its size', () => {
        const fixture = TestBed.createComponent(AvatarWithAttribsComponent);
        fixture.detectChanges();
        const instance = fixture.componentInstance.avatar;

        expect(instance.size).toEqual(IgxAvatarSize.SMALL);

        instance.size = IgxAvatarSize.MEDIUM;
        fixture.detectChanges();
        expect(instance.size).toEqual(IgxAvatarSize.MEDIUM);

        instance.size = IgxAvatarSize.LARGE;
        fixture.detectChanges();
        expect(instance.size).toEqual(IgxAvatarSize.LARGE);

        instance.size = 'nonsense' as any;
        fixture.detectChanges();
        expect(instance.size).toEqual(IgxAvatarSize.SMALL);
    });

    it('Initializes default avatar', () => {
        const fixture = TestBed.createComponent(InitAvatarComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance.avatar;
        const hostEl = fixture.debugElement.query(By.css(baseClass)).nativeElement;

        expect(instance.initials).toBeUndefined();
        expect(instance.src).toBeUndefined();
        expect(instance.icon).toBeUndefined();
        expect(instance.shape).toEqual('square');

        expect(hostEl.textContent).toEqual('TEST');
    });


    it('Initializes initials avatar', () => {
        const fixture = TestBed.createComponent(AvatarWithAttribsComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance.avatar;
        const hostEl = fixture.debugElement.query(By.css(baseClass)).nativeElement;

        expect(instance.type).toEqual(IgxAvatarType.INITIALS);
        expect(instance.initials).toEqual('ZK');
        expect(hostEl.querySelector('span').textContent).toEqual('ZK');
        expect(hostEl.classList).toContain(classes.initials);
    });

    it('Initializes icon avatar', () => {
        const fixture = TestBed.createComponent(InitIconAvatarComponent);
        fixture.detectChanges();
        const instance = fixture.componentInstance.avatar;
        const hostEl = fixture.debugElement.query(By.css(baseClass)).nativeElement;

        expect(instance.type).toEqual(IgxAvatarType.ICON);
        expect(instance.icon).toBeTruthy();
        expect(hostEl.classList).toContain(classes.icon);
    });

    it('Initializes image avatar', () => {
        const fixture = TestBed.createComponent(InitImageAvatarComponent);
        fixture.detectChanges();
        const instance = fixture.componentInstance.avatar;
        const hostEl = fixture.debugElement.query(By.css(baseClass)).nativeElement;

        expect(instance.type).toEqual(IgxAvatarType.IMAGE);
        const image = instance.elementRef.nativeElement.children[0];
        expect(image).toBeTruthy();
        expect(image.style.backgroundImage).toBeDefined();

        expect(image.classList).toContain(`${baseClass}__image`);
        expect(hostEl.classList).toContain(classes.image);
    });

    it('Sets ARIA attributes', () => {
        const fixture = TestBed.createComponent(InitImageAvatarComponent);
        fixture.detectChanges();
        const instance = fixture.componentInstance.avatar;
        const hostEl = fixture.debugElement.query(By.css(baseClass)).nativeElement;

        expect(instance.roleDescription).toEqual('image avatar');
        expect(hostEl.getAttribute('role')).toEqual('img');
        expect(hostEl.getAttribute('aria-roledescription')).toEqual('image avatar');
        expect(hostEl.getAttribute('aria-label')).toEqual('avatar');
    });

    it('Normalizes the value of the `src` input', () => {
        const fixture = TestBed.createComponent(InitImageAvatarComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance.avatar;
        instance.src = "/assets/Test - 17.jpg";
        fixture.detectChanges();

        expect(instance.src).toEqual("/assets/Test%20-%2017.jpg");
    });

    it('should not throw error if src is null', () => {
        const fixture = TestBed.createComponent(InitImageAvatarComponent);
        fixture.detectChanges();
        expect(() => {
            const instance = fixture.componentInstance.avatar;
            instance.src = null;
            fixture.detectChanges();
        }).not.toThrow();
    });

    it('avatar with [src] and fallback [initials] should not throw error if src is null', () => {
        const fixture = TestBed.createComponent(AvatarWithAttribsComponent);
        fixture.detectChanges();
        const instance = fixture.componentInstance.avatar;
        expect(instance.type).toEqual(IgxAvatarType.INITIALS);
        expect(instance.initials).toEqual('ZK');
        expect(() => {
            instance.src = null;
            fixture.detectChanges();
        }).not.toThrow();
    });
});

@Component({
    template: `<igx-avatar>TEST</igx-avatar>`,
    imports: [IgxAvatarComponent]
})
class InitAvatarComponent {
    @ViewChild(IgxAvatarComponent, { static: true }) public avatar: IgxAvatarComponent;
}

@Component({
    template: `
    <igx-avatar [initials]="initials" size="small"></igx-avatar>`,
    imports: [IgxAvatarComponent]
})
class AvatarWithAttribsComponent {
    @ViewChild(IgxAvatarComponent, { static: true }) public avatar: IgxAvatarComponent;

    public initials = 'ZK';
}

@Component({
    template: `<igx-avatar icon="person"></igx-avatar>`,
    imports: [IgxAvatarComponent]
})
class InitIconAvatarComponent {
    @ViewChild(IgxAvatarComponent, { static: true }) public avatar: IgxAvatarComponent;
}

@Component({
    template: `<igx-avatar [src]="source"></igx-avatar>`,
    imports: [IgxAvatarComponent]
})
class InitImageAvatarComponent {
    @ViewChild(IgxAvatarComponent, { static: true }) public avatar: IgxAvatarComponent;

    public source = 'data:image/jpeg;base64,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';
}
