import { Component, ViewChild } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxInputGroupComponent, IgxInputGroupModule } from './input-group.component';
import { DisplayDensityToken, DisplayDensity } from '../core/displayDensity';

const INPUT_GROUP_CSS_CLASS = 'igx-input-group';
const INPUT_GROUP_BOX_CSS_CLASS = 'igx-input-group--box';
const INPUT_GROUP_BORDER_CSS_CLASS = 'igx-input-group--border';
const INPUT_GROUP_SEARCH_CSS_CLASS = 'igx-input-group--search';
const INPUT_GROUP_COMFORTABLE_DENSITY_CSS_CLASS = 'igx-input-group--comfortable';
const INPUT_GROUP_COMPACT_DENSITY_CSS_CLASS = 'igx-input-group--compact';
const INPUT_GROUP_COSY_DENSITY_CSS_CLASS = 'igx-input-group--cosy';

describe('IgxInputGroup', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InputGroupComponent,
                InputGroupBoxComponent,
                InputGroupBorderComponent,
                InputGroupSearchComponent,
                InputGroupDisabledComponent,
                InputGroupDisabledByDefaultComponent,
                InputGroupCosyDisplayDensityComponent,
                InputGroupCompactDisplayDensityComponent
            ],
            imports: [
                IgxInputGroupModule
            ]
        })
        .compileComponents();
    }));

    it('Initializes an input group.', () => {
        const fixture = TestBed.createComponent(InputGroupComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_CSS_CLASS)).toBe(true);

        const igxInputGroup = fixture.componentInstance.igxInputGroup;
        expect(igxInputGroup.id).toContain('igx-input-group-');
        expect(inputGroupElement.id).toContain('igx-input-group-');
        // the default type should be line
        testInputGroupType('line', igxInputGroup, inputGroupElement);
    });

    it('Initializes an input group with type box.', () => {
        const fixture = TestBed.createComponent(InputGroupBoxComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_CSS_CLASS)).toBe(true);

        const igxInputGroup = fixture.componentInstance.igxInputGroup;
        testInputGroupType('box', igxInputGroup, inputGroupElement);
    });

    it('Initializes an input group with type border.', () => {
        const fixture = TestBed.createComponent(InputGroupBorderComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_CSS_CLASS)).toBe(true);

        const igxInputGroup = fixture.componentInstance.igxInputGroup;
        testInputGroupType('border', igxInputGroup, inputGroupElement);
    });

    it('Initializes an input group with type search.', () => {
        const fixture = TestBed.createComponent(InputGroupSearchComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_CSS_CLASS)).toBe(true);

        const igxInputGroup = fixture.componentInstance.igxInputGroup;
        testInputGroupType('search', igxInputGroup, inputGroupElement);
    });

    it('Should be able to change input group type programatically.', () => {
        const fixture = TestBed.createComponent(InputGroupComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css('igx-input-group')).nativeElement;
        const igxInputGroup = fixture.componentInstance.igxInputGroup;

        igxInputGroup.type = 'box';
        fixture.detectChanges();
        testInputGroupType('box', igxInputGroup, inputGroupElement);

        igxInputGroup.type = 'border';
        fixture.detectChanges();
        testInputGroupType('border', igxInputGroup, inputGroupElement);

        igxInputGroup.type = 'search';
        fixture.detectChanges();
        testInputGroupType('search', igxInputGroup, inputGroupElement);

        igxInputGroup.type = 'line';
        fixture.detectChanges();
        testInputGroupType('line', igxInputGroup, inputGroupElement);
    });

    it('disabled input should properly detect changes.', () => {
        const fixture = TestBed.createComponent(InputGroupDisabledComponent);
        fixture.detectChanges();

        const component = fixture.componentInstance;
        const igxInputGroup = component.igxInputGroup;
        expect(igxInputGroup.disabled).toBeFalsy();

        component.changeDisableState();
        fixture.detectChanges();
        expect(igxInputGroup.disabled).toBeTruthy();

        component.changeDisableState();
        fixture.detectChanges();
        expect(igxInputGroup.disabled).toBeFalsy();
    });

    it('disabled by default should properly work.', () => {
        const fixture = TestBed.createComponent(InputGroupDisabledByDefaultComponent);
        fixture.detectChanges();

        const component = fixture.componentInstance;
        const igxInputGroup = component.igxInputGroup;
        expect(igxInputGroup.disabled).toBeTruthy();
    });

    it('default Display Density applied', () => {
        const fixture = TestBed.createComponent(InputGroupDisabledByDefaultComponent);
        fixture.detectChanges();

        const inputGroup = fixture.componentInstance.igxInputGroup;
        const inputGroupElement = inputGroup.element.nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_COMFORTABLE_DENSITY_CSS_CLASS)).toBe(true);
    });

    it('cosy Display Density applied', () => {
        const fixture = TestBed.createComponent(InputGroupCosyDisplayDensityComponent);
        fixture.detectChanges();

        const inputGroup = fixture.componentInstance.igxInputGroup;
        const inputGroupElement = inputGroup.element.nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_COMFORTABLE_DENSITY_CSS_CLASS)).toBeFalsy();
        expect(inputGroupElement.classList.contains(INPUT_GROUP_COSY_DENSITY_CSS_CLASS)).toBeTruthy();
    });

    it('compact Display Density applied', () => {
        const fixture = TestBed.createComponent(InputGroupCompactDisplayDensityComponent);
        fixture.detectChanges();

        const inputGroup = fixture.componentInstance.igxInputGroup;
        const inputGroupElement = inputGroup.element.nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_COMFORTABLE_DENSITY_CSS_CLASS)).toBeFalsy();
        expect(inputGroupElement.classList.contains(INPUT_GROUP_COMPACT_DENSITY_CSS_CLASS)).toBeTruthy();
    });
});

@Component({
    template: `<igx-input-group #igxInputGroup>
                    <input igxInput />
                </igx-input-group>`
})
class InputGroupComponent {
    @ViewChild('igxInputGroup') public igxInputGroup: IgxInputGroupComponent;
}

@Component({
    template: `<igx-input-group #igxInputGroup type="box">
                    <input igxInput />
                </igx-input-group>`
})
class InputGroupBoxComponent {
    @ViewChild('igxInputGroup') public igxInputGroup: IgxInputGroupComponent;
}

@Component({
    template: `<igx-input-group #igxInputGroup type="border">
                    <input igxInput />
                </igx-input-group>`
})
class InputGroupBorderComponent {
    @ViewChild('igxInputGroup') public igxInputGroup: IgxInputGroupComponent;
}

@Component({
    template: `<igx-input-group #igxInputGroup type="search">
                    <input igxInput />
                </igx-input-group>`
})
class InputGroupSearchComponent {
    @ViewChild('igxInputGroup') public igxInputGroup: IgxInputGroupComponent;
}

function testInputGroupType(type, component: IgxInputGroupComponent, nativeElement) {
    let isLine = false;
    let isBorder = false;
    let isBox = false;
    let isSearch = false;

    switch (type) {
        case 'line':
            isLine = true;
            break;
        case 'border':
            isBorder = true;
            break;
        case 'box':
            isBox = true;
            break;
        case 'search':
            isSearch = true;
            break;
        default: break;
    }

    expect(nativeElement.classList.contains(INPUT_GROUP_BOX_CSS_CLASS)).toBe(isBox);
    expect(nativeElement.classList.contains(INPUT_GROUP_BORDER_CSS_CLASS)).toBe(isBorder);
    expect(nativeElement.classList.contains(INPUT_GROUP_SEARCH_CSS_CLASS)).toBe(isSearch);

    expect(component.isTypeLine).toBe(isLine);
    expect(component.isTypeBorder).toBe(isBorder);
    expect(component.isTypeBox).toBe(isBox);
    expect(component.isTypeSearch).toBe(isSearch);
}

@Component({
    template: `<igx-input-group #igxInputGroup [disabled]="disabled">
                    <input igxInput />
                </igx-input-group>`
})
class InputGroupDisabledComponent {
    @ViewChild('igxInputGroup') public igxInputGroup: IgxInputGroupComponent;

    public disabled = false;

    public changeDisableState() {
        this.disabled = !this.disabled;
    }
}

@Component({
    template: `<igx-input-group #igxInputGroup [disabled]="disabled">
                    <input igxInput />
                </igx-input-group>`
})
class InputGroupDisabledByDefaultComponent {
    @ViewChild('igxInputGroup') public igxInputGroup: IgxInputGroupComponent;

    public disabled = true;
}

@Component({
    template: `<igx-input-group #igxInputGroup>
                    <input igxInput />
                </igx-input-group>`,
    providers: [{ provide: DisplayDensityToken, useValue: { displayDensity: DisplayDensity.cosy } }]
})
class InputGroupCosyDisplayDensityComponent {
    @ViewChild('igxInputGroup') public igxInputGroup: IgxInputGroupComponent;
}

@Component({
    template: `<igx-input-group #igxInputGroup>
                    <input igxInput />
                </igx-input-group>`,
    providers: [{ provide: DisplayDensityToken, useValue: { displayDensity: DisplayDensity.compact } }]
})
class InputGroupCompactDisplayDensityComponent {
    @ViewChild('igxInputGroup') public igxInputGroup: IgxInputGroupComponent;
}
