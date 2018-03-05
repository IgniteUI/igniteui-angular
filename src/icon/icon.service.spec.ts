import { Component, ViewChild } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { IgxIconService } from "./icon.service";

describe("Icon Service", () => {
    const MY_FONT = "my-awesome-icons";
    const ALIAS = "awesome";

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [IgxIconService]
        }).compileComponents();
    });

    it("should set the default icon set", () => {
        const iconService = TestBed.get(IgxIconService);

        expect(() => {
            iconService.defaultFontSet = MY_FONT;
        }).not.toThrow();
    });

    it("should get the default icon set", () => {
        const iconService = TestBed.get(IgxIconService);
        iconService.defaultFontSet = MY_FONT;

        expect(iconService.defaultFontSet).toBe(MY_FONT);
    });

    it("should associate alias name with icon set name", () => {
        const iconService = TestBed.get(IgxIconService);

        expect(() => {
            iconService.registerFontSetAlias(ALIAS, MY_FONT);
        }).not.toThrow();
    });

    it("should get icon set name from alias name", () => {
        const iconService = TestBed.get(IgxIconService);
        iconService.registerFontSetAlias(ALIAS, MY_FONT);

        expect(iconService.fontSetClassName(ALIAS)).toBe(MY_FONT);
    });
});
