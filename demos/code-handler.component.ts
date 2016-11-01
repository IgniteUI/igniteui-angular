import {} from "@angular/core";

export class CodeHandler {
    markup: string;
    typescriptCode: string;

    getCode(widgetName: string)
    {
        switch (widgetName)
        {
        case "carousel" :
            this.markup = `
<ig-carousel [interval]="interval" [pause]="pause" [loop]="loop">
    <ig-slide *ngFor="let slide of slides;" [active]="slide.active">
        <img [src]="slide.image">
    </ig-slide>
</ig-carousel>
            `
            this.typescriptCode = `
import { Component } from "@angular/core";
import { CarouselModule } from "../../src/carousel/carousel";

@Component({
    selector: "carousel-sample",
    templateUrl: 'carouselsample.component.html'
})
export class CarouselSampleComponent {
    slides: Array<any> = [];
    interval = 3000;
    pause = true;
    loop = true;

    constructor() {
        this.addNewSlide();
    }

    addNewSlide() {
        this.slides.push(
            {image: "https://unsplash.it/g/1170/300"},
            {image: "https://unsplash.it/g/1171/300"},
            {image: "https://unsplash.it/g/1172/300"},
            {image: "https://unsplash.it/g/1173/300"}
        );
    }
}`
            break;
        case "avatar" :
           this.markup = `
<ig-avatar [src]="src" [roundShape]="roundShape">
</ig-avatar>
<ig-avatar [src]="src">
</ig-avatar>
<ig-avatar src="https://unsplash.it/60/60?image=55">
</ig-avatar>
<ig-avatar src="https://unsplash.it/60/60?image=55" [initials]="initials"
    [bgColor]="bgColor" [roundShape]="roundShape">
</ig-avatar>
<ig-avatar initials="RK" bgColor="#fbb13c">
</ig-avatar>
<ig-avatar initials="AA" bgColor="#731963" roundShape="true">
</ig-avatar>
<ig-avatar roundShape="true" icon="person" bgColor="#0375be" data-init="SS">
</ig-avatar>
<ig-avatar initials="ZK" width="100" roundShape="true"
    bgColor="#ff6978">
    <ig-badge type="error" value="z"></ig-badge>
</ig-avatar>
<ig-avatar initials="HA" width="100" size="potatos"
    bgColor="#340068">
    <ig-badge type="info"></ig-badge>
</ig-avatar>
<ig-avatar initials="PP" width="100" color="black" icon="person"
    roundShape="false" bgColor="#94feed">
    <ig-badge iconBdg="person"></ig-badge>
</ig-avatar>
<ig-avatar initials="PP" size="medium" roundShape="false"
    bgColor="#e41c77">
    <ig-badge></ig-badge>
</ig-avatar>
<ig-avatar initials="ZK" size="large" roundShape="true"
    bgColor="#484848">
</ig-avatar>
<ig-avatar color="gray">
</ig-avatar>
<span igButton="raised" (click)="changeLink()">Change Image</span>`
      
      this.typescriptCode = `
import { Component, ViewChild, QueryList, ViewChildren } from "@angular/core";
import { AvatarModule, Avatar } from "../../src/avatar/avatar";
import { BadgeModule, Badge } from "../../src/badge/badge";

@Component({
    selector: "avatar-sample",
    templateUrl: 'avatarsample.component.html'
})
export class AvatarSampleComponent {
    @ViewChildren(Avatar) avatar;
    initials: string = 'ZK';
    bgColor: string = '#0375be';
    src: string = '';
    roundShape: string = "true";

    constructor() {
        this.setImageSource();
    }

    setImageSource() {
        this.src = "https://unsplash.it/60/60?image=" + Math.floor((Math.random() * 50) + 1);
    }

    public changeLink() {
        // for more avatars
        for (let each of this.avatar.toArray()) {
            each.srcImage = "https://unsplash.it/60/60?image=" + Math.floor((Math.random() * 50) + 1);
        }
    }
}`
            break;
        case "tabbar":
            this.markup = `
<ig-tab-bar igRipple igRippleTarget="ul" alignment="bottom">
    <ig-tab label="Tab 1" icon="library_music">                        
        <span class="componentDesc">IgTabBar allow you to tabulate your content. It provides flexible ways to manage and navigate through your tabularized data. </span><br>
        </ig-tab>
    <ig-tab label="Tab 2" icon="video_library">
        <p>You can style each tab with a material icon as demosntrated below.</ig-tab>
    <ig-tab label="Tab 3" icon="library_books">
        <p>Attaching to click events allow you to customize the way your TabBar is working.
    </ig-tab>
</ig-tab-bar>`
            this.typescriptCode = `
import { Component } from "@angular/core";

@Component({
    selector: "tabbar-sample",
    templateUrl: 'tabbarsample.component.html'
})
export class TabBarSampleComponent { }`
            break;
        case "list":
        this.markup = `
<div class="ig-form-group">
    <input class="ig-form-group__input--search" placeholder="Search List" [(ngModel)]="search1" />
</div>
<ig-list>
    <ig-list-item igRipple="pink" igRippleTarget=".ig-list__item" *ngFor="let item of navItems | filter: fo1">
        {{item.text}}
    </ig-list-item>
</ig-list>     
            `
            this.typescriptCode = `
import { Component, ViewChild, ElementRef } from "@angular/core";
import { ListModule, List } from "../../src/list/list";
import { FilterModule, FilterOptions } from '../../src/directives/filter';
import { IgRippleModule } from '../../src/directives/ripple';

@Component({
    selector: "list-sample",
    templateUrl: 'listsample.component.html'
})

export class ListSampleComponent {
    @ViewChild("checkbox") checkbox: any;
    @ViewChild("declarativeList") declarativeList: any;

    search1: string;
    search2: string;

    private navItems: Array<Object> = [
            { key:"1", text: "Nav1", link: "#" },
            { key:"2", text: "Nav2", link: "#" },
            { key:"3", text: "Nav3", link: "#" },
            { key:"4", text: "Nav4", link: "#" }
        ];

    get fo1() {
        var _fo = new FilterOptions();
        _fo.key = "text";
        _fo.inputValue = this.search1;
        return _fo;
    }

    get fo2() {
        var _fo = new FilterOptions();

        _fo.items = this.declarativeList.items;
        _fo.inputValue = this.search2;

        _fo.get_value = function (item: any) {
            return item.element.nativeElement.textContent.trim();
        };

        _fo.metConditionFn = function (item: any) {
             item.hidden = false;
         };

        _fo.overdueConditionFn = function (item: any) {
             item.hidden = true;
         };    

        return _fo;
    }

    private filteringHandler = function(args) {
        args.cancel = !this.checkbox.checked;
        console.log(args);
    }

    private filteredHandler = function(args) {
        console.log(args);
    }

 }`
            break;
        case "buttons":
            this.markup = `
<span igButton="flat" igRipple>Flat</span><br>
<span igButton="raised" igRipple="white">Raised</span>  
<span igButton="raised" igButtonColor="#FBB13C" igButtonBackground="#340068" igRipple="white">Raised Custom</span> 
<span igButton="raised" igButtonColor="yellow" igButtonBackground="black" igRipple="yellow">Raised Custom</span> 
<span igButton="gradient" igRipple="white">Gradient</span>
<span igButton="raised" disabled>Disabled</span>
<span igButton="fab" igRipple="white"><i class="material-icons">add</i></span>
<span igButton="fab" igButtonColor="#484848" igButtonBackground="white" igRipple="#484848">
    <i class="material-icons">edit</i>
</span>
<span igButton="icon" igRipple igRippleCentered="true">
    <i class="material-icons">search</i>
</span>
<span igButton="icon" igRipple igButtonColor="#E41C77" igRippleCentered="true">
    <i class="material-icons">favorite</i>
</span>
<span igButton="icon" igRipple igRippleCentered="true">
    <i class="material-icons">more_vert</i>
</span>  
            `
            this.typescriptCode = `
import { Component } from "@angular/core";
import { ButtonModule } from "../../src/button/button";

@Component({
    selector: "button-sample",
    templateUrl: 'demos/button/buttonssample.component.html'
})

export class ButtonsSampleComponent { }`
            break;
        case "switch":
        this.markup = `
<span class="componentTitle">Switch</span><br>
<span class="componentDesc">A component that lets the user toggle between checked and unchecked states.</span><br><br>
<ig-switch [(ngModel)]="user.subscribed"></ig-switch>
<ig-switch [(ngModel)]="!user.subscribed"></ig-switch>
            `
        this.typescriptCode = `
import { Component } from "@angular/core";

@Component({
    selector: "switch-sample",
    templateUrl: "demos/inputs/switchsample.component.html"
})
export class SwitchSampleComponent {
    placeholder = "Please enter a value";

    user = {
        name: 'John Doe',
        password: '1337s3cr3t',
        comment: "N/A",
        registered: true,
        subscribed: false,
        favouriteVarName: 'Foo'
    };
    
}`
            break;
        default :
            this.markup = ``;
            this.typescriptCode = ``;
        }    

        return {
            "markup": this.markup,
            "ts": this.typescriptCode
        };
    }

}
