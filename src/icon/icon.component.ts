import { CommonModule } from "@angular/common";
import { Component, ElementRef, HostBinding, Input, NgModule, OnInit, ViewChild } from "@angular/core";

// only a temporary object holding aliases names
// until the icon registration service gets built
const fontAliases = {
    material: "material-icons"
};
@Component({
    selector: "igx-icon",
    templateUrl: "icon.component.html"
})

export class IgxIconComponent implements OnInit {
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

    ngOnInit() {
        this.updateIconClass();
    }

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

    private updateIconClass() {
        this.font = fontAliases[this.font] ? this.font : "material-icons";
        this.el.nativeElement.classList.add(fontAliases[this.font]);
    }
}

@NgModule({
    declarations: [IgxIconComponent],
    exports: [IgxIconComponent],
    imports: [CommonModule]
})
export class IgxIconModule { }
