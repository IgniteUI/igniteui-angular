import { Component, ViewChild, Pipe, PipeTransform, ElementRef } from '@angular/core';
import { async, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxAutocompleteModule, IgxAutocompleteDirective, AutocompleteOverlaySettings } from './autocomplete.directive';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { IgxInputDirective } from '../input/input.directive';
import { IgxInputGroupModule, IgxInputGroupComponent } from '../../input-group';
import { IgxDropDownModule, IgxDropDownComponent } from '../../drop-down';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { IgxIconModule } from '../../icon';
import { ConnectedPositioningStrategy, VerticalAlignment } from '../../services';

const CSS_CLASS_DROPDOWNLIST = 'igx-drop-down__list';

describe('IgxAutocomplete', () => {
    let fixture;
    let autocomplete: IgxAutocompleteDirective;
    let group: IgxInputGroupComponent;
    let input: IgxInputDirective;
    let dropDown: IgxDropDownComponent;
    configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                AutocompleteComponent,
                AutocompleteInputComponent,
                AutocompleteFormComponent,
                IgxAutocompletePipeStartsWith
            ],
            imports: [
                IgxInputGroupModule,
                IgxDropDownModule,
                IgxAutocompleteModule,
                FormsModule,
                ReactiveFormsModule,
                NoopAnimationsModule,
                IgxIconModule
            ]
        })
            .compileComponents();
    }));
    describe('General tests: ', () => {
        beforeEach(async(() => {
            fixture = TestBed.createComponent(AutocompleteComponent);
            fixture.detectChanges();
            autocomplete = fixture.componentInstance.autocomplete;
            group = fixture.componentInstance.group;
            input = fixture.componentInstance.input;
            dropDown = fixture.componentInstance.dropDown;
            input.nativeElement.click();
            expect(dropDown.collapsed).toBeTruthy();
        }));
        it('Should open/close dropdown properly', fakeAsync(() => {
            UIInteractions.sendInput(input, 's', fixture);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeFalsy();

            UIInteractions.triggerKeyDownEvtUponElem('escape', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();

            input.nativeElement.click();
            UIInteractions.sendInput(input, 'a', fixture);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeFalsy();

            autocomplete.onBlur();
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();

            autocomplete.open();
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeFalsy();

            autocomplete.close();
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
        }));
        it('Should close the dropdown when disabled dynamically', fakeAsync(() => {
            UIInteractions.sendInput(input, 's', fixture);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeFalsy();

            autocomplete.disabled = true;
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
            UIInteractions.sendInput(input, 's', fixture);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
        }));
        it('Should select item and close dropdown with ENTER/SPACE key', fakeAsync(() => {
            let startsWith = 's';
            let filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            UIInteractions.sendInput(input, startsWith, fixture);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeFalsy();

            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
            expect(fixture.componentInstance.townSelected).toBe(filteredTowns[0]);
            expect(input.value).toBe(filteredTowns[0]);

            startsWith = 'bu';
            filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            UIInteractions.sendInput(input, startsWith, fixture);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeFalsy();

            UIInteractions.triggerKeyDownEvtUponElem('space', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
            expect(fixture.componentInstance.townSelected).toBe(filteredTowns[0]);
            expect(input.value).toBe(filteredTowns[0]);
        }));
        it('Should not open dropdown on input focusing', () => {
            input.nativeElement.focused = true;
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
            const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST));
            expect(dropdownList.nativeElement.attributes['aria-hidden'].value).toEqual('true');
            expect(dropdownList.children.length).toEqual(0);
        });
        it('Should not open dropdown on input clicking', () => {
            input.nativeElement.click();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
            const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST));
            expect(dropdownList.nativeElement.attributes['aria-hidden'].value).toEqual('true');
            expect(dropdownList.children.length).toEqual(0);
        });
        it('Should not open dropdown when disabled', fakeAsync(() => {
            autocomplete.disabled = true;
            tick();
            fixture.detectChanges();
            UIInteractions.sendInput(input, 's', fixture);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
        }));
        it('Should not populate dropdown list on non-matching values typing', fakeAsync(() => {
            let startsWith = ' ';
            const dropdownListElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST));
            UIInteractions.sendInput(input, startsWith, fixture);
            tick();
            fixture.detectChanges();
            expect(dropdownListElement.children.length).toEqual(0);

            startsWith = '  ';
            UIInteractions.sendInput(input, startsWith, fixture);
            tick();
            fixture.detectChanges();
            expect(dropdownListElement.children.length).toEqual(0);

            startsWith = 'w';
            UIInteractions.sendInput(input, startsWith, fixture);
            tick();
            fixture.detectChanges();
            expect(dropdownListElement.children.length).toEqual(0);

            startsWith = 't';
            const filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            UIInteractions.sendInput(input, startsWith, fixture);
            tick();
            fixture.detectChanges();
            expect(dropdownListElement.children.length).toEqual(filteredTowns.length);

            startsWith = 'tp';
            UIInteractions.sendInput(input, startsWith, fixture);
            tick();
            fixture.detectChanges();
            expect(dropdownListElement.children.length).toEqual(0);
        }));
        it('Should auto-highlight first suggestion', fakeAsync(() => {
            let startsWith = 's';
            let filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            UIInteractions.sendInput(input, startsWith, fixture);
            tick();
            fixture.detectChanges();
            expect(dropDown.children.first.focused).toBeTruthy();
            expect(dropDown.items[0].focused).toBeTruthy();
            expect(dropDown.items[0].value).toBe(filteredTowns[0]);

            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(fixture.componentInstance.townSelected).toBe(filteredTowns[0]);

            startsWith = 'st';
            filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            UIInteractions.sendInput(input, startsWith, fixture);
            tick();
            fixture.detectChanges();
            expect(dropDown.children.first.focused).toBeTruthy();
            expect(dropDown.items[0].focused).toBeTruthy();
            expect(dropDown.items[0].value).toBe(filteredTowns[0]);

            startsWith = 's';
            filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            UIInteractions.sendInput(input, startsWith, fixture);
            tick();
            fixture.detectChanges();
            expect(dropDown.children.first.focused).toBeTruthy();
            expect(dropDown.items[0].focused).toBeTruthy();
            expect(dropDown.items[0].value).toBe(filteredTowns[0]);
            expect(dropDown.items[1].focused).toBeFalsy();
            expect(dropDown.items[1].value).toBe(filteredTowns[1]);
        }));
        it('Should trigger onItemSelected event on item selection', fakeAsync(() => {
            let startsWith = 'st';
            let filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            spyOn(autocomplete.onItemSelected, 'emit');
            UIInteractions.sendInput(input, startsWith, fixture);
            tick();
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(fixture.componentInstance.townSelected).toBe(filteredTowns[0]);
            expect(autocomplete.onItemSelected.emit).toHaveBeenCalledTimes(1);

            startsWith = 't';
            filteredTowns = fixture.componentInstance.filterTowns(startsWith);
            UIInteractions.sendInput(input, startsWith, fixture);
            tick();
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(fixture.componentInstance.townSelected).toBe(filteredTowns[0]);
            expect(autocomplete.onItemSelected.emit).toHaveBeenCalledTimes(2);
            expect(autocomplete.onItemSelected.emit).toHaveBeenCalledWith({ value: 'Stara Zagora', cancel: false });

            fixture.componentInstance.onItemSelected = function(args) { args.cancel = true; };
            UIInteractions.sendInput(input, 's', fixture);
            fixture.detectChanges();
            tick();
            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            expect(fixture.componentInstance.townSelected).toBe('s');
        }));
        it('Should navigate through dropdown items with arrow up/down keys', fakeAsync(() => {
            UIInteractions.sendInput(input, 'a', fixture);
            tick();
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.items[1].focused).toBeTruthy();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.items[0].focused).toBeTruthy();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.items[0].focused).toBeTruthy();
        }));
        it('Should navigate to first/last item with Home/End keys', fakeAsync (() => {
            UIInteractions.sendInput(input, 'r', fixture);
            tick();
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('end', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.items[dropDown.items.length - 1].focused).toBeTruthy();

            UIInteractions.triggerKeyDownEvtUponElem('home', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.items[0].focused).toBeTruthy();
            expect(dropDown.items[dropDown.items.length - 1].focused).toBeFalsy();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.items[2].focused).toBeTruthy();
            expect(dropDown.items[0].focused).toBeFalsy();

            UIInteractions.triggerKeyDownEvtUponElem('end', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.items[dropDown.items.length - 1].focused).toBeTruthy();
            expect(dropDown.items[2].focused).toBeFalsy();

            // Select last item
            input.nativeElement.onkeydown = () => console.log('fired');
            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(fixture.componentInstance.townSelected).toBe(dropDown.items[dropDown.items.length - 1].value);
            expect(dropDown.collapsed).toBeTruthy();

            // Check that dropdown does not preserve focus on last item
            UIInteractions.sendInput(input, 'r', fixture);
            tick();
            fixture.detectChanges();
            expect(dropDown.items[0].focused).toBeTruthy();
            // expect(dropDown.items[dropDown.items.length - 1].focused).toBeFalsy();
        }));
        it('Should apply default width to both input and dropdown list elements', fakeAsync(() => {
            UIInteractions.sendInput(input, 's', fixture);
            tick();
            fixture.detectChanges();
            const dropDownAny = dropDown as any;
            expect(dropDownAny.scrollContainer.getBoundingClientRect().width)
                .toEqual(group.element.nativeElement.getBoundingClientRect().width);
        }));
        it('Should render aria attributes properly', fakeAsync(() => {
            expect(input.nativeElement.attributes['autocomplete'].value).toEqual('off');
            expect(input.nativeElement.attributes['role'].value).toEqual('combobox');
            expect(input.nativeElement.attributes['aria-haspopup'].value).toEqual('listbox');
            expect(input.nativeElement.attributes['aria-owns'].value).toEqual(dropDown.id);
            expect(input.nativeElement.attributes['aria-expanded'].value).toEqual('false');
            UIInteractions.sendInput(input, 's', fixture);
            tick();
            fixture.detectChanges();
            expect(input.nativeElement.attributes['aria-expanded'].value).toEqual('true');
            dropDown.close();
        }));
    });
    describe('Positioning settings tests', () => {
        it('Panel settings', fakeAsync(() => {
            fixture = TestBed.createComponent(AutocompleteComponent);
            fixture.componentInstance.settings = {
                positionStrategy: new ConnectedPositioningStrategy({
                    closeAnimation: null,
                    openAnimation: null,
                    verticalDirection: VerticalAlignment.Top,
                    verticalStartPoint: VerticalAlignment.Top
                })
            };
            fixture.detectChanges();
            autocomplete = fixture.componentInstance.autocomplete;
            group = fixture.componentInstance.group;
            input = fixture.componentInstance.input;
            dropDown = fixture.componentInstance.dropDown;
            input.nativeElement.click();

            // TODO UI test to check that drop down is shown above the input when this works
        }));
    });
    describe('Other elements integration tests', () => {
        it('Should be instantiated properly on HTML input', fakeAsync(() => {
            fixture = TestBed.createComponent(AutocompleteInputComponent);
            fixture.detectChanges();
            autocomplete = fixture.componentInstance.autocomplete;
            const plainInput = fixture.componentInstance.plainInput;
            dropDown = fixture.componentInstance.dropDown;
            plainInput.nativeElement.click();
            UIInteractions.sendInput(plainInput, 's', fixture);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeFalsy();
            expect(dropDown.children.first.focused).toBeTruthy();
            expect(dropDown.items[0].focused).toBeTruthy();
            expect(dropDown.items[0].value).toBe('Sofia');

            UIInteractions.triggerKeyDownEvtUponElem('enter', plainInput.nativeElement, true);
            tick();
            fixture.detectChanges();
            expect(dropDown.collapsed).toBeTruthy();
            expect(plainInput.nativeElement.value).toBe('Sofia');
        }));
        it('Should be instantiated properly on HTML textarea', fakeAsync(() => { }));
        it('Should be instantiated properly on ReactiveForm', fakeAsync(() => { }));
    });
    describe('Reactive Form', () => {
        it('Reactive Form', fakeAsync(() => {
            fixture = TestBed.createComponent(AutocompleteFormComponent);
            fixture.detectChanges();

            autocomplete = fixture.componentInstance.autocomplete;
            input = fixture.componentInstance.input;
            dropDown = fixture.componentInstance.dropDown;
            input.nativeElement.click();
            UIInteractions.sendInput(input, 's', fixture);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeFalsy();
            expect(dropDown.children.first.focused).toBeTruthy();
            expect(dropDown.items[0].focused).toBeTruthy();
            expect(dropDown.items[0].value).toBe('Sofia');

            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeTruthy();
            expect(input.nativeElement.value).toBe('Sofia');
        }));
    });
});

@Component({
    template: `<igx-input-group>
        <igx-prefix igxRipple><igx-icon fontSet="material">home</igx-icon> </igx-prefix>
        <input igxInput name="towns" type="text" [(ngModel)]="townSelected" required
            [igxAutocomplete]='townsPanel'
            [igxAutocomplete]='settings' />
        <label igxLabel for="towns">Towns</label>
        <igx-suffix igxRipple><igx-icon fontSet="material">clear</igx-icon> </igx-suffix>
    </igx-input-group>
    <igx-drop-down #townsPanel>
        <igx-drop-down-item *ngFor="let town of towns | startsWith:townSelected" [value]="town">
            {{town}}
        </igx-drop-down-item>
    </igx-drop-down>`
})
class AutocompleteComponent {
    @ViewChild(IgxAutocompleteDirective) public autocomplete: IgxAutocompleteDirective;
    @ViewChild(IgxInputGroupComponent) public group: IgxInputGroupComponent;
    @ViewChild(IgxInputDirective) public input: IgxInputDirective;
    @ViewChild(IgxDropDownComponent) public dropDown: IgxDropDownComponent;
    townSelected;
    public towns;
    settings: AutocompleteOverlaySettings = null;
    onItemSelected;

    constructor() {
        this.towns = [
            // tslint:disable-next-line:max-line-length
            'Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora', 'Pleven', 'Dobrich', 'Sliven', 'Shumen', 'Pernik', 'Haskovo', 'Yambol', 'Pazardzhik', 'Blagoevgrad', 'Veliko Tarnovo', 'Vratsa', 'Gabrovo', 'Asenovgrad', 'Vidin', 'Kazanlak', 'Kyustendil', 'Kardzhali', 'Montana', 'Dimitrovgrad', 'Targovishte', 'Lovech', 'Silistra', 'Dupnitsa', 'Svishtov', 'Razgrad', 'Gorna Oryahovitsa', 'Smolyan', 'Petrich', 'Sandanski', 'Samokov', 'Sevlievo', 'Lom', 'Karlovo', 'Velingrad', 'Nova Zagora', 'Troyan', 'Aytos', 'Botevgrad', 'Gotse Delchev', 'Peshtera', 'Harmanli', 'Karnobat', 'Svilengrad', 'Panagyurishte', 'Chirpan', 'Popovo', 'Rakovski', 'Radomir', 'Novi Iskar', 'Kozloduy', 'Parvomay', 'Berkovitsa', 'Cherven Bryag', 'Pomorie', 'Ihtiman', 'Radnevo', 'Provadiya', 'Novi Pazar', 'Razlog', 'Byala Slatina', 'Nesebar', 'Balchik', 'Kostinbrod', 'Stamboliyski', 'Kavarna', 'Knezha', 'Pavlikeni', 'Mezdra', 'Etropole', 'Levski', 'Teteven', 'Elhovo', 'Bankya', 'Tryavna', 'Lukovit', 'Tutrakan', 'Sredets', 'Sopot', 'Byala', 'Veliki Preslav', 'Isperih', 'Belene', 'Omurtag', 'Bansko', 'Krichim', 'Galabovo', 'Devnya', 'Septemvri', 'Rakitovo', 'Lyaskovets', 'Svoge', 'Aksakovo', 'Kubrat', 'Dryanovo', 'Beloslav', 'Pirdop', 'Lyubimets', 'Momchilgrad', 'Slivnitsa', 'Hisarya', 'Zlatograd', 'Kostenets', 'Devin', 'General Toshevo', 'Simeonovgrad', 'Simitli', 'Elin Pelin', 'Dolni Chiflik', 'Tervel', 'Dulovo', 'Varshets', 'Kotel', 'Madan', 'Straldzha', 'Saedinenie', 'Bobov Dol', 'Tsarevo', 'Kuklen', 'Tvarditsa', 'Yakoruda', 'Elena', 'Topolovgrad', 'Bozhurishte', 'Chepelare', 'Oryahovo', 'Sozopol', 'Belogradchik', 'Perushtitsa', 'Zlatitsa', 'Strazhitsa', 'Krumovgrad', 'Kameno', 'Dalgopol', 'Vetovo', 'Suvorovo', 'Dolni Dabnik', 'Dolna Banya', 'Pravets', 'Nedelino', 'Polski Trambesh', 'Trastenik', 'Bratsigovo', 'Koynare', 'Godech', 'Slavyanovo', 'Dve Mogili', 'Kostandovo', 'Debelets', 'Strelcha', 'Sapareva Banya', 'Ignatievo', 'Smyadovo', 'Breznik', 'Sveti Vlas', 'Nikopol', 'Shivachevo', 'Belovo', 'Tsar Kaloyan', 'Ivaylovgrad', 'Valchedram', 'Marten', 'Glodzhevo', 'Sarnitsa', 'Letnitsa', 'Varbitsa', 'Iskar', 'Ardino', 'Shabla', 'Rudozem', 'Vetren', 'Kresna', 'Banya', 'Batak', 'Maglizh', 'Valchi Dol', 'Gulyantsi', 'Dragoman', 'Zavet', 'Kran', 'Miziya', 'Primorsko', 'Sungurlare', 'Dolna Mitropoliya', 'Krivodol', 'Kula', 'Kalofer', 'Slivo Pole', 'Kaspichan', 'Apriltsi', 'Belitsa', 'Roman', 'Dzhebel', 'Dolna Oryahovitsa', 'Buhovo', 'Gurkovo', 'Pavel Banya', 'Nikolaevo', 'Yablanitsa', 'Kableshkovo', 'Opaka', 'Rila', 'Ugarchin', 'Dunavtsi', 'Dobrinishte', 'Hadzhidimovo', 'Bregovo', 'Byala Cherkva', 'Zlataritsa', 'Kocherinovo', 'Dospat', 'Tran', 'Sadovo', 'Laki', 'Koprivshtitsa', 'Malko Tarnovo', 'Loznitsa', 'Obzor', 'Kilifarevo', 'Borovo', 'Batanovtsi', 'Chernomorets', 'Aheloy', 'Byala', 'Pordim', 'Suhindol', 'Merichleri', 'Glavinitsa', 'Chiprovtsi', 'Kermen', 'Brezovo', 'Plachkovtsi', 'Zemen', 'Balgarovo', 'Alfatar', 'Boychinovtsi', 'Gramada', 'Senovo', 'Momin Prohod', 'Kaolinovo', 'Shipka', 'Antonovo', 'Ahtopol', 'Boboshevo', 'Bolyarovo', 'Brusartsi', 'Klisura', 'Dimovo', 'Kiten', 'Pliska', 'Madzharovo', 'Melnik'
        ];
    }

    public filterTowns(startsWith: string) {
        return this.towns.filter(function (city) {
            return city.toString().toLowerCase().startsWith(startsWith.toLowerCase());
        });
    }
}

@Component({
    template: `
    <input name="towns" type="text" [(ngModel)]="townSelected" required
        [igxAutocomplete]='townsPanel' #plainInput/>
    <textarea [(ngModel)]="townSelected" required
        [igxAutocomplete]='townsPanel' #textarea></textarea>
    <label igxLabel for="towns">Towns</label>
    <igx-drop-down #townsPanel>
        <igx-drop-down-item *ngFor="let town of towns | startsWith:townSelected" [value]="town">
            {{town}}
        </igx-drop-down-item>
    </igx-drop-down>`
})
class AutocompleteInputComponent extends AutocompleteComponent {
    @ViewChild('plainInput') public plainInput: ElementRef<HTMLInputElement>;
    @ViewChild('textarea') public textarea: ElementRef<HTMLTextAreaElement>;
}

@Component({
    template: `
<form [formGroup]="reactiveForm" (ngSubmit)="onSubmitReactive()">
<igx-input-group>
        <igx-prefix igxRipple><igx-icon fontSet="material">home</igx-icon> </igx-prefix>
        <input igxInput name="towns" formControlName="towns" type="text" required
            [igxAutocomplete]='townsPanel'
            [igxAutocomplete]='settings' />
        <label igxLabel for="towns">Towns</label>
        <igx-suffix igxRipple><igx-icon fontSet="material">clear</igx-icon> </igx-suffix>
    </igx-input-group>
    <igx-drop-down #townsPanel>
        <igx-drop-down-item *ngFor="let town of towns | startsWith:townSelected" [value]="town">
            {{town}}
        </igx-drop-down-item>
    </igx-drop-down>
    <button type="submit" [disabled]="!reactiveForm.valid">Submit</button>
</form>
`
})

class AutocompleteFormComponent {
    @ViewChild(IgxAutocompleteDirective) public autocomplete: IgxAutocompleteDirective;
    @ViewChild(IgxInputGroupComponent) public group: IgxInputGroupComponent;
    @ViewChild(IgxInputDirective) public input: IgxInputDirective;
    @ViewChild(IgxDropDownComponent) public dropDown: IgxDropDownComponent;
    towns;

    reactiveForm: FormGroup;

    constructor(fb: FormBuilder) {

        this.towns = [
            // tslint:disable-next-line:max-line-length
            'Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora', 'Pleven', 'Dobrich', 'Sliven', 'Shumen', 'Pernik', 'Haskovo', 'Yambol', 'Pazardzhik', 'Blagoevgrad', 'Veliko Tarnovo', 'Vratsa', 'Gabrovo', 'Asenovgrad', 'Vidin', 'Kazanlak', 'Kyustendil', 'Kardzhali', 'Montana', 'Dimitrovgrad', 'Targovishte', 'Lovech', 'Silistra', 'Dupnitsa', 'Svishtov', 'Razgrad', 'Gorna Oryahovitsa', 'Smolyan', 'Petrich', 'Sandanski', 'Samokov', 'Sevlievo', 'Lom', 'Karlovo', 'Velingrad', 'Nova Zagora', 'Troyan', 'Aytos', 'Botevgrad', 'Gotse Delchev', 'Peshtera', 'Harmanli', 'Karnobat', 'Svilengrad', 'Panagyurishte', 'Chirpan', 'Popovo', 'Rakovski', 'Radomir', 'Novi Iskar', 'Kozloduy', 'Parvomay', 'Berkovitsa', 'Cherven Bryag', 'Pomorie', 'Ihtiman', 'Radnevo', 'Provadiya', 'Novi Pazar', 'Razlog', 'Byala Slatina', 'Nesebar', 'Balchik', 'Kostinbrod', 'Stamboliyski', 'Kavarna', 'Knezha', 'Pavlikeni', 'Mezdra', 'Etropole', 'Levski', 'Teteven', 'Elhovo', 'Bankya', 'Tryavna', 'Lukovit', 'Tutrakan', 'Sredets', 'Sopot', 'Byala', 'Veliki Preslav', 'Isperih', 'Belene', 'Omurtag', 'Bansko', 'Krichim', 'Galabovo', 'Devnya', 'Septemvri', 'Rakitovo', 'Lyaskovets', 'Svoge', 'Aksakovo', 'Kubrat', 'Dryanovo', 'Beloslav', 'Pirdop', 'Lyubimets', 'Momchilgrad', 'Slivnitsa', 'Hisarya', 'Zlatograd', 'Kostenets', 'Devin', 'General Toshevo', 'Simeonovgrad', 'Simitli', 'Elin Pelin', 'Dolni Chiflik', 'Tervel', 'Dulovo', 'Varshets', 'Kotel', 'Madan', 'Straldzha', 'Saedinenie', 'Bobov Dol', 'Tsarevo', 'Kuklen', 'Tvarditsa', 'Yakoruda', 'Elena', 'Topolovgrad', 'Bozhurishte', 'Chepelare', 'Oryahovo', 'Sozopol', 'Belogradchik', 'Perushtitsa', 'Zlatitsa', 'Strazhitsa', 'Krumovgrad', 'Kameno', 'Dalgopol', 'Vetovo', 'Suvorovo', 'Dolni Dabnik', 'Dolna Banya', 'Pravets', 'Nedelino', 'Polski Trambesh', 'Trastenik', 'Bratsigovo', 'Koynare', 'Godech', 'Slavyanovo', 'Dve Mogili', 'Kostandovo', 'Debelets', 'Strelcha', 'Sapareva Banya', 'Ignatievo', 'Smyadovo', 'Breznik', 'Sveti Vlas', 'Nikopol', 'Shivachevo', 'Belovo', 'Tsar Kaloyan', 'Ivaylovgrad', 'Valchedram', 'Marten', 'Glodzhevo', 'Sarnitsa', 'Letnitsa', 'Varbitsa', 'Iskar', 'Ardino', 'Shabla', 'Rudozem', 'Vetren', 'Kresna', 'Banya', 'Batak', 'Maglizh', 'Valchi Dol', 'Gulyantsi', 'Dragoman', 'Zavet', 'Kran', 'Miziya', 'Primorsko', 'Sungurlare', 'Dolna Mitropoliya', 'Krivodol', 'Kula', 'Kalofer', 'Slivo Pole', 'Kaspichan', 'Apriltsi', 'Belitsa', 'Roman', 'Dzhebel', 'Dolna Oryahovitsa', 'Buhovo', 'Gurkovo', 'Pavel Banya', 'Nikolaevo', 'Yablanitsa', 'Kableshkovo', 'Opaka', 'Rila', 'Ugarchin', 'Dunavtsi', 'Dobrinishte', 'Hadzhidimovo', 'Bregovo', 'Byala Cherkva', 'Zlataritsa', 'Kocherinovo', 'Dospat', 'Tran', 'Sadovo', 'Laki', 'Koprivshtitsa', 'Malko Tarnovo', 'Loznitsa', 'Obzor', 'Kilifarevo', 'Borovo', 'Batanovtsi', 'Chernomorets', 'Aheloy', 'Byala', 'Pordim', 'Suhindol', 'Merichleri', 'Glavinitsa', 'Chiprovtsi', 'Kermen', 'Brezovo', 'Plachkovtsi', 'Zemen', 'Balgarovo', 'Alfatar', 'Boychinovtsi', 'Gramada', 'Senovo', 'Momin Prohod', 'Kaolinovo', 'Shipka', 'Antonovo', 'Ahtopol', 'Boboshevo', 'Bolyarovo', 'Brusartsi', 'Klisura', 'Dimovo', 'Kiten', 'Pliska', 'Madzharovo', 'Melnik'
        ];
        this.reactiveForm = fb.group({
            'towns': ['', Validators.required]
        });

    }
    onSubmitReactive() { }
}

@Pipe({ name: 'startsWith' })
export class IgxAutocompletePipeStartsWith implements PipeTransform {
    public transform(collection: any[], term = '', key?: string) {
        return collection.filter(item => {
            const currItem = key ? item[key] : item;
            return currItem.toString().toLowerCase().startsWith(term.toString().toLowerCase());
        });
    }
}
