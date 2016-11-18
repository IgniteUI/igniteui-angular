export class CodeHandler {
    markup: string;
    typescriptCode: string;

    getCode(widgetName: string) {
        switch (widgetName) {
            case "carousel":
                this.markup = 
`<ig-carousel [interval]="interval" [pause]="pause" [loop]="loop">
    <ig-slide *ngFor="let slide of slides;" [active]="slide.active">
        <img [src]="slide.image">
    </ig-slide>
</ig-carousel>`
this.typescriptCode = `import { Component } from "@angular/core";
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
            case "avatar":
                this.markup = 
`<ig-avatar 
    src="http://lorempixel.com/300/300/people/6/" 
    roundShape="false">
    <ig-badge 
        type="error" 
        icon="favorite" 
        position="bottom-right">
    </ig-badge>
</ig-avatar>

<ig-avatar 
    src="http://lorempixel.com/300/300/people/9/" 
    roundShape="true">
    <ig-badge 
        type="error" 
        icon="done" 
        type="success">
    </ig-badge>
</ig-avatar>

<ig-avatar 
    initials="RK"  
    bgColor="#fbb13c">
</ig-avatar>

<ig-avatar 
    initials="ZK"
    bgColor="#731963"
    roundShape="true">
</ig-avatar>

<ig-avatar 
    roundShape="true"
    icon="person"
    bgColor="#0375be"
    data-init="SS">
</ig-avatar>

<ig-avatar color="gray"></ig-avatar>

<ig-avatar 
    initials="HA" 
    width="100" 
    size="potatos" 
    bgColor="#340068">
    <ig-badge 
        type="info" 
        icon="camera">
    </ig-badge>
</ig-avatar>

<ig-avatar 
    initials="PP" 
    width="100" 
    color="black" 
    icon="person" 
    roundShape="false" 
    bgColor="#94feed">
    <ig-badge 
        iconBdg="person" 
        value="7281" 
        position="bottom-left">
    </ig-badge>
</ig-avatar>

<ig-avatar 
    src="http://66.media.tumblr.com/avatar_af166f12c520_128.png" 
    size="medium" 
    roundShape="true" 
    bgColor="#e41c77">
    <ig-badge 
        position="top-left" 
        type="error" 
        icon="build">
    </ig-badge>
</ig-avatar>

<ig-avatar 
    src="http://fotouser.miarroba.st/99545357/300/sonic-kun.jpg"
    size="medium"
    roundShape="true" 
    bgColor="#484848">
    <ig-badge 
        position="bottom-right" 
        type="info" 
        icon="timer">
    </ig-badge>
</ig-avatar>`

                this.typescriptCode = 
`import { Component, ViewChild, QueryList, ViewChildren } from "@angular/core";
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

    // Not used in example
    setImageSource() {
        this.src = "http://lorempixel.com/300/300/people/" + Math.floor((Math.random() * 10) + 1);
    }

    // Not used in example
    public changeLink() {
        for (let each of this.avatar.toArray()) {
            if(each.src) {
                each.srcImage = "http://lorempixel.com/300/300/people/" + Math.floor((Math.random() * 10) + 1);
            }
        }
    }
}`
                break;
            case "tabbar":
                this.markup = 
`<ig-tab-bar igRipple igRippleTarget="ul" alignment="bottom">
    <ig-tab label="Tab 1" icon="library_music">                        
        <span class="componentDesc">IgTabBar allow you to tabulate your content. 
        It provides flexible ways to manage and navigate through your tabularized data.</span>
    </ig-tab>
    <ig-tab label="Tab 2" icon="video_library">
        <p>You can style each tab with a material icon as demosntrated below.
    </ig-tab>
    <ig-tab label="Tab 3" icon="library_books">
        <p>Attaching to click events allow you to customize the way your TabBar is working.
    </ig-tab>
</ig-tab-bar>`
                this.typescriptCode = 
`import { Component } from "@angular/core";

@Component({
    selector: "tabbar-sample",
    templateUrl: 'tabbarsample.component.html'
})

export class TabBarSampleComponent { }`
                break;
            case "list":
                this.markup = 
`<div class="ig-form-group">
    <input class="ig-form-group__input--search" placeholder="Search List" />
</div>
<ig-list #declarativeList>
    <ig-list-item [options]="{}">Red Delicious</ig-list-item>
    <ig-list-item>Ambrosia</ig-list-item>
    <ig-list-item>Rome</ig-list-item>
    <ig-list-item>Golden Delicious</ig-list-item>
    <ig-list-item>Cosmic Crisp</ig-list-item>
</ig-list>`
                this.typescriptCode = 
`import { Component, ViewChild, ElementRef } from "@angular/core";
import { ListModule, List } from "../../src/list/list";
import { IgRippleModule } from '../../src/directives/ripple';

@Component({
    selector: "list-sample",
    templateUrl: 'demos/list/listsample.component.html'
})

export class ListSampleComponent {
    @ViewChild("checkbox") checkbox: any;
    @ViewChild("declarativeList") declarativeList: any;

    private navItems: Array<Object> = [
            { key:"1", text: "Nav1", link: "#" },
            { key:"2", text: "Nav2", link: "#" },
            { key:"3", text: "Nav3", link: "#" },
            { key:"4", text: "Nav4", link: "#" }
        ];
}`
                break;
            case "buttons":
                this.markup = 
`<span igButton="flat" igRipple>Flat</span>
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
</span>`
this.typescriptCode = `import { Component } from "@angular/core";
import { ButtonModule } from "../../src/button/button";

@Component({
    selector: "button-sample",
    templateUrl: 'demos/button/buttonssample.component.html'
})

export class ButtonsSampleComponent { }`
                break;
            case "switch":
                this.markup = 
`<ig-switch [(ngModel)]="user.subscribed"></ig-switch>
<ig-switch [(ngModel)]="!user.subscribed"></ig-switch>
<span>Selected value = {{ user.subscribed }}</span>`
                this.typescriptCode = 
`import { Component } from "@angular/core";

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
            case "inputs":
                this.markup = 
`<!--Text Input-->
<div class="ig-form-group">
    <input type="text" igInput [(ngModel)]="user.name" />
    <label igLabel>Username</label>
</div>
<span>value = {{ user.name || ''}}</span>

<!--Password Input-->
<div class="ig-form-group">
    <input type="password" igInput placeholder="{{placeholder}}" [(ngModel)]="user.password" />
    <label igLabel>Password</label>
</div>
<span>value = {{ user.password || ''}}</span>

<!--Textarea Input-->
<div class="ig-form-group">
    <textarea placeholder="{{placeholder}}" igInput [(ngModel)]="user.comment"></textarea>
    <label igLabel>Textarea</label>
</div>
<span>value = {{ user.comment || ''}}</span>

<!--Checkbox-->
<ig-checkbox [(ngModel)]="user.registered">Registered</ig-checkbox>
<span>value = {{ user.registered }}</span>

<!--Label-->
<label igLabel>Sample Label!</label>`

                this.typescriptCode = 
`import { Component } from "@angular/core";

@Component({
    selector: "inputs-sample",
    templateUrl: "demos/inputs/inputssample.component.html"
})
export class InputsSampleComponent {
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
            case "radio":
                this.markup = 
`<ig-radio *ngFor="let item of ['Foo', 'Bar', 'Baz']" 
    value="{{item}}" name="group" 
    [(ngModel)]="user.favouriteVarName">
    {{item}}
</ig-radio>
<span>Selected value = {{ user.favouriteVarName || ''}}</span>`

                this.typescriptCode = 
`import { Component } from "@angular/core";
import { IgRadioModule } from "../../src/radio/radio";

@Component({
    selector: "radio-sample",
    templateUrl: "demos/radio/radiosample.component.html"
})
export class RadioSampleComponent {
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
            case "ripple":
                this.markup = 
`<ig-tab-bar igRipple igRippleTarget="ul" alignment="bottom">
    <ig-tab label="Tab 1" icon="library_music">                        
        <span class="componentDesc">Ripple directive can be applied basically to every element, <span igRipple>even this span !</span> to enable glamourous ripple effect on click, like the tabs below. Explore the other tabs as well.</span>
    </ig-tab>
    <ig-tab label="Tab 2" icon="video_library">
        <ig-list #declarativeList>
            <ig-list-header>Mildly Sweet</ig-list-header>
            <ig-list-item igRipple igRippleTarget="div.ig-list__item">Red Delicious</ig-list-item>
            <ig-list-item igRipple igRippleTarget="div.ig-list__item">Ambrosia</ig-list-item>
            <ig-list-item igRipple igRippleTarget="div.ig-list__item">Rome</ig-list-item>
            <ig-list-item igRipple igRippleTarget="div.ig-list__item">Golden Delicious</ig-list-item>
            <ig-list-item igRipple igRippleTarget="div.ig-list__item">Cosmic Crisp</ig-list-item>
        </ig-list>
    </ig-tab>
</ig-tab-bar>`

                this.typescriptCode = 
`import { Component } from "@angular/core";

@Component({
    templateUrl: 'demos/ripple/ripplesample.component.html'
})
export class RippleSampleComponent { }`
                break;

            case "filter":
                this.markup = 
`<div class="ig-form-group">
    <input class="ig-form-group__input--search" placeholder="Search List" [(ngModel)]="search1" />
</div>
<ig-list>
    <ig-list-item igRipple="pink" igRippleTarget=".ig-list__item" *ngFor="let item of navItems | filter: fo1">
        {{item.text}}
    </ig-list-item>
</ig-list>`

                this.typescriptCode = 
`import { Component, ViewChild, ElementRef } from "@angular/core";
import { ListModule, List } from "../../src/list/list";
import { FilterModule, FilterOptions } from '../../src/directives/filter';
import { IgRippleModule } from '../../src/directives/ripple';

@Component({
    templateUrl: 'demos/filter/filtersample.component.html'
})

export class FilterSampleComponent {
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
            default:
                this.markup = ``;
                this.typescriptCode = ``;
        }

        return {
            "markup": this.markup,
            "ts": this.typescriptCode
        };
    }
}