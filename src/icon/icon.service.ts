import { Injectable } from "@angular/core";

@Injectable()
export class IgxIconService {
    private fontSet = "material-icons";
    private fontSetAliases = new Map<string, string>();

    get defaultFontSet(): string {
        return this.fontSet;
    }

    set defaultFontSet(className: string) {
        this.fontSet = className;
    }

    registerFontSetAlias(alias: string, className: string = alias): this {
        this.fontSetAliases.set(alias, className);
        return this;
    }

    fontSetClassName(alias: string): string {
        return this.fontSetAliases.get(alias) || alias;
    }
}
