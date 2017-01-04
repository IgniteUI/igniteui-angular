export class CodeHandler {
    markup: string;
    typescriptCode: string;

    getCode(widgetName: string) {
        switch (widgetName) {
            case "carousel":
                this.markup = 
`<igx-carousel [interval]="interval" [pause]="pause" [loop]="loop">
    <igx-slide *ngFor="let slide of slides;" [active]="slide.active">
        <img [src]="slide.image">
    </igx-slide>
</igx-carousel>`
this.typescriptCode = `import { Component } from "@angular/core";
import { IgxCarouselModule } from "../../src/carousel/carousel";

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
`<igx-avatar 
    src="http://lorempixel.com/300/300/people/6/" 
    roundShape="false">
    <igx-badge 
        type="error" 
        icon="favorite" 
        position="bottom-right">
    </igx-badge>
</igx-avatar>

<igx-avatar 
    src="http://lorempixel.com/300/300/people/9/" 
    roundShape="true">
    <igx-badge 
        type="error" 
        icon="done" 
        type="success">
    </igx-badge>
</igx-avatar>

<igx-avatar 
    initials="RK"  
    bgColor="#fbb13c">
</igx-avatar>

<igx-avatar 
    initials="ZK"
    bgColor="#731963"
    roundShape="true">
</igx-avatar>

<igx-avatar 
    roundShape="true"
    icon="person"
    bgColor="#0375be"
    data-init="SS">
</igx-avatar>

<igx-avatar color="gray"></igx-avatar>

<igx-avatar 
    initials="HA" 
    width="100" 
    size="potatos" 
    bgColor="#340068">
    <igx-badge 
        type="info" 
        icon="camera">
    </igx-badge>
</igx-avatar>

<igx-avatar 
    initials="PP" 
    width="100" 
    color="black" 
    icon="person" 
    roundShape="false" 
    bgColor="#94feed">
    <igx-badge 
        iconBdg="person" 
        value="7281" 
        position="bottom-left">
    </igx-badge>
</igx-avatar>

<igx-avatar 
    src="http://66.media.tumblr.com/avatar_af166f12c520_128.png" 
    size="medium" 
    roundShape="true" 
    bgColor="#e41c77">
    <igx-badge 
        position="top-left" 
        type="error" 
        icon="build">
    </igx-badge>
</igx-avatar>

<igx-avatar 
    src="http://fotouser.miarroba.st/99545357/300/sonic-kun.jpg"
    size="medium"
    roundShape="true" 
    bgColor="#484848">
    <igx-badge 
        position="bottom-right" 
        type="info" 
        icon="timer">
    </igx-badge>
</igx-avatar>`

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
`<igx-tab-bar igxRipple igxRippleTarget="ul" alignment="bottom">
    <igx-tab label="Tab 1" icon="library_music">                        
        <span class="componentDesc">IgTabBar allow you to tabulate your content. 
        It provides flexible ways to manage and navigate through your tabularized data.</span>
    </igx-tab>
    <igx-tab label="Tab 2" icon="video_library">
        <p>You can style each tab with a material icon as demosntrated below.
    </igx-tab>
    <igx-tab label="Tab 3" icon="library_books">
        <p>Attaching to click events allow you to customize the way your TabBar is working.
    </igx-tab>
</igx-tab-bar>`
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
`<div class="igx-form-group">
    <input class="igx-form-group__input--search" placeholder="Search List" />
</div>
<igx-list #declarativeList>
    <igx-list-item [options]="{}">Red Delicious</igx-list-item>
    <igx-list-item>Ambrosia</igx-list-item>
    <igx-list-item>Rome</igx-list-item>
    <igx-list-item>Golden Delicious</igx-list-item>
    <igx-list-item>Cosmic Crisp</igx-list-item>
</igx-list>`
                this.typescriptCode = 
`import { Component, ViewChild, ElementRef } from "@angular/core";
import { ListModule, List } from "../../src/list/list";
import { igxRippleModule } from '../../src/directives/ripple';

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
`<span igxButton="flat" igxRipple>Flat</span>
<span igxButton="raised" igxRipple="white">Raised</span>  
<span igxButton="raised" igxButtonColor="#FBB13C" igxButtonBackground="#340068" igxRipple="white">Raised Custom</span> 
<span igxButton="raised" igxButtonColor="yellow" igxButtonBackground="black" igxRipple="yellow">Raised Custom</span> 
<span igxButton="gradient" igxRipple="white">Gradient</span>
<span igxButton="raised" disabled>Disabled</span>
<span igxButton="fab" igxRipple="white"><i class="material-icons">add</i></span>
<span igxButton="fab" igxButtonColor="#484848" igxButtonBackground="white" igxRipple="#484848">
    <i class="material-icons">edit</i>
</span>
<span igxButton="icon" igxRipple igxRippleCentered="true">
    <i class="material-icons">search</i>
</span>
<span igxButton="icon" igxRipple igxButtonColor="#E41C77" igxRippleCentered="true">
    <i class="material-icons">favorite</i>
</span>
<span igxButton="icon" igxRipple igxRippleCentered="true">
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
`<igx-switch [(ngModel)]="user.subscribed"></igx-switch>
<igx-switch [(ngModel)]="!user.subscribed"></igx-switch>
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
<div class="igx-form-group">
    <input type="text" igInput [(ngModel)]="user.name" />
    <label igLabel>Username</label>
</div>
<span>value = {{ user.name || ''}}</span>

<!--Password Input-->
<div class="igx-form-group">
    <input type="password" igInput placeholder="{{placeholder}}" [(ngModel)]="user.password" />
    <label igLabel>Password</label>
</div>
<span>value = {{ user.password || ''}}</span>

<!--Textarea Input-->
<div class="igx-form-group">
    <textarea placeholder="{{placeholder}}" igInput [(ngModel)]="user.comment"></textarea>
    <label igLabel>Textarea</label>
</div>
<span>value = {{ user.comment || ''}}</span>

<!--Checkbox-->
<igx-checkbox [(ngModel)]="user.registered">Registered</igx-checkbox>
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
`<igx-radio *ngFor="let item of ['Foo', 'Bar', 'Baz']" 
    value="{{item}}" name="group" 
    [(ngModel)]="user.favouriteVarName">
    {{item}}
</igx-radio>
<span>Selected value = {{ user.favouriteVarName || ''}}</span>`

                this.typescriptCode = 
`import { Component } from "@angular/core";
import { IgxRadioModule } from "../../src/radio/radio";

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
`<igx-tab-bar igxRipple igxRippleTarget="ul" alignment="bottom">
    <igx-tab label="Tab 1" icon="library_music">                        
        <span class="componentDesc">Ripple directive can be applied basically to every element, <span igxRipple>even this span !</span> to enable glamourous ripple effect on click, like the tabs below. Explore the other tabs as well.</span>
    </igx-tab>
    <igx-tab label="Tab 2" icon="video_library">
        <igx-list #declarativeList>
            <igx-list-header>Mildly Sweet</igx-list-header>
            <igx-list-item igxRipple igxRippleTarget="div.igx-list__item">Red Delicious</igx-list-item>
            <igx-list-item igxRipple igxRippleTarget="div.igx-list__item">Ambrosia</igx-list-item>
            <igx-list-item igxRipple igxRippleTarget="div.igx-list__item">Rome</igx-list-item>
            <igx-list-item igxRipple igxRippleTarget="div.igx-list__item">Golden Delicious</igx-list-item>
            <igx-list-item igxRipple igxRippleTarget="div.igx-list__item">Cosmic Crisp</igx-list-item>
        </igx-list>
    </igx-tab>
</igx-tab-bar>`

                this.typescriptCode = 
`import { Component } from "@angular/core";

@Component({
    templateUrl: 'demos/ripple/ripplesample.component.html'
})
export class RippleSampleComponent { }`
                break;

            case "filter":
                this.markup = 
`<div class="igx-form-group">
    <input class="igx-form-group__input--search" placeholder="Search List" [(ngModel)]="search1" />
</div>
<igx-list>
    <igx-list-item igxRipple="pink" igxRippleTarget=".igx-list__item" *ngFor="let item of navItems | filter: fo1">
        {{item.text}}
    </igx-list-item>
</igx-list>`

                this.typescriptCode = 
`import { Component, ViewChild, ElementRef } from "@angular/core";
import { ListModule, List } from "../../src/list/list";
import { FilterModule, FilterOptions } from '../../src/directives/filter';
import { igxRippleModule } from '../../src/directives/ripple';

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
            case "navbar":
                this.markup = 
`<igx-navbar [title]="currentView" icon="arrow_back"></igx-navbar>`
                this.typescriptCode = 
`import { Component, OnInit } from "@angular/core";
import { IgxNavbarModule } from 'igniteui-js-blocks/main';

const CURRENT_VIEW: string = "Ignite UI JS Blocks";

@Component({
    selector: 'navbar-sample',
    templateUrl: 'demos/navbar/navbarsample.component.html'
})

export class NavbarSampleComponent implements OnInit {
    currentView: string;

    ngOnInit() {
        this.currentView = CURRENT_VIEW;
    }
}`
                break;

            case "dialog":
                this.markup = 
`<div class="dialog-sample">
    <h1 class="componentTitle">Dialog</h1>
    <p class="componentDesc">
        Alert with one action button and message
    </p>
    <button igxButton="raised" 
            igxButtonColor="white" 
            igxButtonBackground="#F44336" 
            igxRipple="white" (click)="alert.open()"
            >Alert
    </button>

    <igx-dialog #alert title="Notification" message="Your email has been sent successfully!"
        leftButtonLabel="OK" (onLeftButtonSelect)="alert.close()">
    </igx-dialog>
    <br>
    <br>
    <p class="componentDesc">
        Dialog with two action buttons and message
    </p>

    <button igxButton="raised" 
            igxButtonColor="white"
            igxButtonBackground="#4CAF50" 
            igxRipple="white" 
            (click)="dialog.open()"
            >Dialog
    </button>

    <igx-dialog #dialog title="Confirmation" 
        leftButtonLabel="Cancel"
        (onLeftButtonSelect)="dialog.close()"
        rightButtonLabel="OK" 
        rightButtonRipple="#4CAF50"
        (onRightButtonSelect)="onDialogOKSelected($event)"
        message="Are you sure you want to delete this email?">
    </igx-dialog>
    <br>
    <br>
    <p class="componentDesc">
        Form with two action buttons and custom message
    </p>

    <button igxButton="raised"
            igxButtonColor="white" 
            igxButtonBackground="#0375be" 
            igxRipple="white" 
            (click)="form.open()"
            >Form
    </button>

    <igx-dialog #form title="Sign In"
        leftButtonLabel="Cancel"
        (onLeftButtonSelect)="form.close()"
        rightButtonLabel="Sign In"
        rightButtonBackgroundColor="#0375be"
        rightButtonColor="white"
        backgroundClick="true"
        closeOnOutsideSelect="true">
        <div class="igx-form-group">
            <input type="text" igxInput />
            <label igxLabel>Username</label>
        </div>
        <div class="igx-form-group">
            <input type="password" igxInput />
            <label igxLabel>Password</label>
        </div>
    </igx-dialog>
</div>`
                this.typescriptCode = 
`import { Component } from "@angular/core";
import { IgxDialogModule } from "igniteui-js-blocks/main";

@Component({
    selector: "dialog-sample",
    templateUrl: "demos/dialog/dialogsample.component.html",
})
export class DialogSampleComponent {
    onDialogOKSelected(args) {
        args.dialog.close();
    };
}`
                break;

            case "progressbar":
                this.markup = 
`<div class="progress-container-linear">
    <igx-linear-bar [striped]="false" [value]="currentValue" [max]="200">
    </igx-linear-bar>
</div>

<div class="progress-container-linear">
    <igx-linear-bar type="danger" [striped]="false" [value]="currentValue">
    </igx-linear-bar>
</div>

<div class="progress-container-linear">
    <igx-linear-bar type="warning" [value]="20">
    </igx-linear-bar>
</div>

<div class="progress-container-linear">
    <igx-linear-bar type="success" striped="true" [value]="currentValue">
    </igx-linear-bar>
</div>

<div class="progress-container-circular">
    <igx-circular-bar (onProgressChanged)="f($event)" [value]="currentValue">
    </igx-circular-bar>
</div>`
                this.typescriptCode = 
`import { Component } from '@angular/core';
import { IgxProgressBarModule } from 'igniteui-js-blocks/main';

@Component({
    selector: 'progressbar-sample',
    templateUrl: 'demos/progressbar/progressbar.component.html'
})
export class ProgressbarSampleComponent {

    public currentValue: number;
    public type: string;

    constructor() {
        this.currentValue = 26;
    }

    private generateNewProgressValues() {
        let value = this.randomIntFromInterval(this.currentValue, 100);

        this.currentValue = value;
    }

    private randomIntFromInterval(min:number,max:number)
    {
        return Math.floor(Math.random()*(max-min+1)+min);
    }

    f(evt) {
        console.log(evt);
    }

    change(evt) {
        console.log(evt);
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