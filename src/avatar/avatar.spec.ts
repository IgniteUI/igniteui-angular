import{
    async,
    TestBed
} from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AvatarModule, Avatar } from './avatar';


describe('Avatar', function(){
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitAvatar,
                AvatarWithAttribs,
                Avatar
            ]
        })
        .compileComponents();
    }));

    it('Initializes an empty avatar', () => {
        let fixture = TestBed.createComponent(InitAvatar);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('img'))).toBeTruthy();
    });
});

@Component({ template: `<ig-avatar initials="PP" size="medium" roundShape="false"
                            bgColor="paleturquoise">
                        </ig-avatar>`})
class InitAvatar {

}

@Component({ template: `<ig-avatar [initials]="initials" [bgColor]="bgColor"
    [roundShape]="roundShape"></ig-avatar>`})
class AvatarWithAttribs {
    initials: string = 'ZK';
    bgColor: string = 'lightblue';
    roundShape: string = "false";
}