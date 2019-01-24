import { Component, ViewChild, Pipe, PipeTransform } from '@angular/core';
import { async, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxAutocompleteModule, IgxAutocompleteDirective } from './autocomplete.directive';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxInputDirective } from '../input/input.directive';
import { IgxInputGroupModule, IgxInputGroupComponent } from '../../input-group';
import { IgxDropDownModule, IgxDropDownComponent } from '../../drop-down';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IgxIconModule } from '../../icon';

fdescribe('IgxAutocomplete', () => {
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
    describe('Binding to primitives', () => {
        configureTestSuite();

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
        it('Opening and closing.', fakeAsync(() => {
            UIInteractions.sendInput(input, 's', fixture);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeFalsy();

            UIInteractions.triggerKeyDownEvtUponElem('escape', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeTruthy();

            input.nativeElement.click();
            UIInteractions.sendInput(input, 'a', fixture);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeFalsy();

            autocomplete.onBlur();
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeTruthy();

            autocomplete.open();
            tick();
            expect(dropDown.collapsed).toBeFalsy();

            autocomplete.close();
            tick();
            expect(dropDown.collapsed).toBeTruthy();
        }));
        it('Auto-highlight first item', fakeAsync(() => {
            UIInteractions.sendInput(input, 's', fixture);
            fixture.detectChanges();
            tick();
            expect(dropDown.children.first.focused).toBeTruthy();
            expect(dropDown.items[0].focused).toBeTruthy();
            expect(dropDown.items[0].value).toBe('Sofia');

            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(fixture.componentInstance.townSelected).toBe('Sofia');

            UIInteractions.sendInput(input, 'st', fixture);
            fixture.detectChanges();
            tick();
            expect(dropDown.children.first.focused).toBeTruthy();
            expect(dropDown.items[0].focused).toBeTruthy();
            expect(dropDown.items[0].value).toBe('Stara Zagora');

            UIInteractions.sendInput(input, 's', fixture);
            fixture.detectChanges();
            tick();
            expect(dropDown.children.first.focused).toBeTruthy();
            expect(dropDown.items[0].focused).toBeTruthy();
            expect(dropDown.items[0].value).toBe('Sofia');
            expect(dropDown.items[1].focused).toBeFalsy();
            expect(dropDown.items[1].value).toBe('Stara Zagora');
        }));
        it('Disabled', fakeAsync(() => {
            UIInteractions.sendInput(input, 's', fixture);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeFalsy();

            autocomplete.disabled = true;
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeTruthy();
            UIInteractions.sendInput(input, 's', fixture);
            fixture.detectChanges();
            tick();
            expect(dropDown.collapsed).toBeTruthy();
        }));
        it('Selection and events', fakeAsync(() => {
            spyOn(autocomplete.onItemSelected, 'emit');
            UIInteractions.sendInput(input, 'st', fixture);
            fixture.detectChanges();
            tick();

            UIInteractions.triggerKeyDownEvtUponElem('enter', input.nativeElement, true);
            expect(fixture.componentInstance.townSelected).toBe('Stara Zagora');
            expect(autocomplete.onItemSelected.emit).toHaveBeenCalledTimes(1);
        }));
        it('Keyboard Navigation', fakeAsync(() => {
            UIInteractions.sendInput(input, 'a', fixture);
            fixture.detectChanges();
            tick();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(dropDown.items[1].focused).toBeTruthy();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(dropDown.items[0].focused).toBeTruthy();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, true);
            fixture.detectChanges();
            tick();
            expect(dropDown.items[0].focused).toBeTruthy();
        }));
        it('DropDown settings', fakeAsync(() => {}));
        it('DropDown default width', fakeAsync(() => {
            UIInteractions.sendInput(input, 's', fixture);
            fixture.detectChanges();
            tick();
            const dropDownAny = dropDown as any;
            expect(dropDownAny.scrollContainer.getBoundingClientRect().width)
                .toEqual(group.element.nativeElement.getBoundingClientRect().width);
        }));
        it('Aria', fakeAsync(() => {}));
        it('ReactiveForm', fakeAsync(() => {}));
        it('On HTML input', fakeAsync(() => {}));
        it('On textarea', fakeAsync(() => {}));
    });
});

@Component({
    template: `<igx-input-group>
        <igx-prefix igxRipple><igx-icon fontSet="material">home</igx-icon> </igx-prefix>
        <input igxInput name="towns" type="text" [(ngModel)]="townSelected" required
            [igxAutocomplete]='townsPanel'/>
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
    towns;

    constructor() {
        this.towns = [
            // tslint:disable-next-line:max-line-length
            1, 'Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora', 'Pleven', 'Dobrich', 'Sliven', 'Shumen', 'Pernik', 'Haskovo', 'Yambol', 'Pazardzhik', 'Blagoevgrad', 'Veliko Tarnovo', 'Vratsa', 'Gabrovo', 'Asenovgrad', 'Vidin', 'Kazanlak', 'Kyustendil', 'Kardzhali', 'Montana', 'Dimitrovgrad', 'Targovishte', 'Lovech', 'Silistra', 'Dupnitsa', 'Svishtov', 'Razgrad', 'Gorna Oryahovitsa', 'Smolyan', 'Petrich', 'Sandanski', 'Samokov', 'Sevlievo', 'Lom', 'Karlovo', 'Velingrad', 'Nova Zagora', 'Troyan', 'Aytos', 'Botevgrad', 'Gotse Delchev', 'Peshtera', 'Harmanli', 'Karnobat', 'Svilengrad', 'Panagyurishte', 'Chirpan', 'Popovo', 'Rakovski', 'Radomir', 'Novi Iskar', 'Kozloduy', 'Parvomay', 'Berkovitsa', 'Cherven Bryag', 'Pomorie', 'Ihtiman', 'Radnevo', 'Provadiya', 'Novi Pazar', 'Razlog', 'Byala Slatina', 'Nesebar', 'Balchik', 'Kostinbrod', 'Stamboliyski', 'Kavarna', 'Knezha', 'Pavlikeni', 'Mezdra', 'Etropole', 'Levski', 'Teteven', 'Elhovo', 'Bankya', 'Tryavna', 'Lukovit', 'Tutrakan', 'Sredets', 'Sopot', 'Byala', 'Veliki Preslav', 'Isperih', 'Belene', 'Omurtag', 'Bansko', 'Krichim', 'Galabovo', 'Devnya', 'Septemvri', 'Rakitovo', 'Lyaskovets', 'Svoge', 'Aksakovo', 'Kubrat', 'Dryanovo', 'Beloslav', 'Pirdop', 'Lyubimets', 'Momchilgrad', 'Slivnitsa', 'Hisarya', 'Zlatograd', 'Kostenets', 'Devin', 'General Toshevo', 'Simeonovgrad', 'Simitli', 'Elin Pelin', 'Dolni Chiflik', 'Tervel', 'Dulovo', 'Varshets', 'Kotel', 'Madan', 'Straldzha', 'Saedinenie', 'Bobov Dol', 'Tsarevo', 'Kuklen', 'Tvarditsa', 'Yakoruda', 'Elena', 'Topolovgrad', 'Bozhurishte', 'Chepelare', 'Oryahovo', 'Sozopol', 'Belogradchik', 'Perushtitsa', 'Zlatitsa', 'Strazhitsa', 'Krumovgrad', 'Kameno', 'Dalgopol', 'Vetovo', 'Suvorovo', 'Dolni Dabnik', 'Dolna Banya', 'Pravets', 'Nedelino', 'Polski Trambesh', 'Trastenik', 'Bratsigovo', 'Koynare', 'Godech', 'Slavyanovo', 'Dve Mogili', 'Kostandovo', 'Debelets', 'Strelcha', 'Sapareva Banya', 'Ignatievo', 'Smyadovo', 'Breznik', 'Sveti Vlas', 'Nikopol', 'Shivachevo', 'Belovo', 'Tsar Kaloyan', 'Ivaylovgrad', 'Valchedram', 'Marten', 'Glodzhevo', 'Sarnitsa', 'Letnitsa', 'Varbitsa', 'Iskar', 'Ardino', 'Shabla', 'Rudozem', 'Vetren', 'Kresna', 'Banya', 'Batak', 'Maglizh', 'Valchi Dol', 'Gulyantsi', 'Dragoman', 'Zavet', 'Kran', 'Miziya', 'Primorsko', 'Sungurlare', 'Dolna Mitropoliya', 'Krivodol', 'Kula', 'Kalofer', 'Slivo Pole', 'Kaspichan', 'Apriltsi', 'Belitsa', 'Roman', 'Dzhebel', 'Dolna Oryahovitsa', 'Buhovo', 'Gurkovo', 'Pavel Banya', 'Nikolaevo', 'Yablanitsa', 'Kableshkovo', 'Opaka', 'Rila', 'Ugarchin', 'Dunavtsi', 'Dobrinishte', 'Hadzhidimovo', 'Bregovo', 'Byala Cherkva', 'Zlataritsa', 'Kocherinovo', 'Dospat', 'Tran', 'Sadovo', 'Laki', 'Koprivshtitsa', 'Malko Tarnovo', 'Loznitsa', 'Obzor', 'Kilifarevo', 'Borovo', 'Batanovtsi', 'Chernomorets', 'Aheloy', 'Byala', 'Pordim', 'Suhindol', 'Merichleri', 'Glavinitsa', 'Chiprovtsi', 'Kermen', 'Brezovo', 'Plachkovtsi', 'Zemen', 'Balgarovo', 'Alfatar', 'Boychinovtsi', 'Gramada', 'Senovo', 'Momin Prohod', 'Kaolinovo', 'Shipka', 'Antonovo', 'Ahtopol', 'Boboshevo', 'Bolyarovo', 'Brusartsi', 'Klisura', 'Dimovo', 'Kiten', 'Pliska', 'Madzharovo', 'Melnik'
        ];
    }
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
