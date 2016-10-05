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

@Component({ template: `<ig-avatar></ig-avatar>`})
class InitAvatar {

}

@Component({ template: `<ig-avatar [source]="source"
    [roundShape]="roundShape"></ig-avatar>`})
class AvatarWithAttribs {
    initials: string = 'ZK';
    bgColor: string = 'lightblue';
    source: string = 'https://unsplash.it/60/60?image=55';
    roundShape: string = "false";
}