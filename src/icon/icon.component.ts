import { CommonModule } from "@angular/common";
import { Component, ElementRef, HostBinding, Input, NgModule, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { IgxIconService } from "./icon.service";

@Component({
    selector: "igx-icon",
    templateUrl: "icon.component.html"
})

export class IgxIconComponent implements OnInit {
    @ViewChild("noLigature", { read: TemplateRef })
    private noLigature: TemplateRef<HTMLElement>;

    @ViewChild("implicitLigature", { read: TemplateRef })
    private implicitLigature: TemplateRef<HTMLElement>;

    @ViewChild("explicitLigature", { read: TemplateRef })
    private explicitLigature: TemplateRef<HTMLElement>;

    @HostBinding("class.igx-icon")
    public cssClass = "igx-icon";

    @HostBinding("attr.aria-hidden")
    public ariaHidden = true;

    @Input("fontSet")
    public font = "material";

    @Input("isActive")
    public active = true;

    @Input("color")
    public iconColor: string;

    @Input("name")
    public iconName: string;

    @Input("iconName")
    public glyphName: string;

    constructor(public el: ElementRef, private iconService: IgxIconService) {
        this.iconService.registerFontSetAlias("material", "material-icons");
    }

    ngOnInit() {
        this.checkInputProps();
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

    get template(): TemplateRef<HTMLElement> {
        if (this.glyphName) {
            return this.noLigature;
        }

        if (this.iconName) {
            return this.implicitLigature;
        }

        return this.explicitLigature;
    }

    private checkInputProps() {
        if (this.iconName && this.glyphName) {
            throw new Error(
                "You can provide either ligature `name` or glyph `iconName`, but not both at the same time."
            );
        }
    }

    private updateIconClass() {
        const className = this.iconService.fontSetClassName(this.font);
        this.el.nativeElement.classList.add(className);

        if (this.glyphName) {
            this.el.nativeElement.classList.add(this.glyphName);
        }
    }
}
