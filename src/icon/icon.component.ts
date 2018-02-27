import { CommonModule } from "@angular/common";
import { Component, ElementRef, HostBinding, Input, NgModule, ViewChild } from "@angular/core";

@Component({
    selector: "igx-icon",
    templateUrl: "icon.component.html"
})

export class IgxIconComponent {
    @ViewChild("icon")
    public themeIcon: ElementRef;

    @HostBinding("class.igx-icon")
    public cssClass = "igx-icon";

    @Input("fontSet")
    public font = "material";

    @Input("isActive")
    public active = true;

    @Input("color")
    public iconColor: string;

    @Input("name")
    private iconName: string;

    constructor(public el: ElementRef) { }

    get getFontSet(): string {
        return this.font;
    }

    get getActive(): boolean {
        return this.active;
    }

    @HostBinding("class.igx-icon--inactive")
    get getInactive(): boolean {
        return !this.active;
    }

    @HostBinding("style.color")
    get getIconColor(): string {
        return this.iconColor;
    }

    get getIconName(): string {
        return this.iconName;
    }
}

@NgModule({
    declarations: [IgxIconComponent],
    exports: [IgxIconComponent],
    imports: [CommonModule]
})
export class IgxIconModule { }
