import { Component, PipeTransform, Pipe } from '@angular/core';
import { OverlaySettings, ConnectedPositioningStrategy, VerticalAlignment } from 'projects/igniteui-angular/src/lib/services';

@Component({
    selector: 'app-autocomplete-sample',
    styleUrls: ['autocomplete.sample.css'],
    templateUrl: `autocomplete.sample.html`
})
export class AutocompleteSampleComponent {
    townSelected;
    towns;
    townsDetailed;
    townsGrouped;
    enabled;
    settings: OverlaySettings;

    constructor() {
        this.towns = [
            // tslint:disable-next-line:max-line-length
            'Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora', 'Pleven', 'Dobrich', 'Sliven', 'Shumen', 'Pernik', 'Haskovo', 'Yambol', 'Pazardzhik', 'Blagoevgrad', 'Veliko Tarnovo', 'Vratsa', 'Gabrovo', 'Asenovgrad', 'Vidin', 'Kazanlak', 'Kyustendil', 'Kardzhali', 'Montana', 'Dimitrovgrad', 'Targovishte', 'Lovech', 'Silistra', 'Dupnitsa', 'Svishtov', 'Razgrad', 'Gorna Oryahovitsa', 'Smolyan', 'Petrich', 'Sandanski', 'Samokov', 'Sevlievo', 'Lom', 'Karlovo', 'Velingrad', 'Nova Zagora', 'Troyan', 'Aytos', 'Botevgrad', 'Gotse Delchev', 'Peshtera', 'Harmanli', 'Karnobat', 'Svilengrad', 'Panagyurishte', 'Chirpan', 'Popovo', 'Rakovski', 'Radomir', 'Novi Iskar', 'Kozloduy', 'Parvomay', 'Berkovitsa', 'Cherven Bryag', 'Pomorie', 'Ihtiman', 'Radnevo', 'Provadiya', 'Novi Pazar', 'Razlog', 'Byala Slatina', 'Nesebar', 'Balchik', 'Kostinbrod', 'Stamboliyski', 'Kavarna', 'Knezha', 'Pavlikeni', 'Mezdra', 'Etropole', 'Levski', 'Teteven', 'Elhovo', 'Bankya', 'Tryavna', 'Lukovit', 'Tutrakan', 'Sredets', 'Sopot', 'Byala', 'Veliki Preslav', 'Isperih', 'Belene', 'Omurtag', 'Bansko', 'Krichim', 'Galabovo', 'Devnya', 'Septemvri', 'Rakitovo', 'Lyaskovets', 'Svoge', 'Aksakovo', 'Kubrat', 'Dryanovo', 'Beloslav', 'Pirdop', 'Lyubimets', 'Momchilgrad', 'Slivnitsa', 'Hisarya', 'Zlatograd', 'Kostenets', 'Devin', 'General Toshevo', 'Simeonovgrad', 'Simitli', 'Elin Pelin', 'Dolni Chiflik', 'Tervel', 'Dulovo', 'Varshets', 'Kotel', 'Madan', 'Straldzha', 'Saedinenie', 'Bobov Dol', 'Tsarevo', 'Kuklen', 'Tvarditsa', 'Yakoruda', 'Elena', 'Topolovgrad', 'Bozhurishte', 'Chepelare', 'Oryahovo', 'Sozopol', 'Belogradchik', 'Perushtitsa', 'Zlatitsa', 'Strazhitsa', 'Krumovgrad', 'Kameno', 'Dalgopol', 'Vetovo', 'Suvorovo', 'Dolni Dabnik', 'Dolna Banya', 'Pravets', 'Nedelino', 'Polski Trambesh', 'Trastenik', 'Bratsigovo', 'Koynare', 'Godech', 'Slavyanovo', 'Dve Mogili', 'Kostandovo', 'Debelets', 'Strelcha', 'Sapareva Banya', 'Ignatievo', 'Smyadovo', 'Breznik', 'Sveti Vlas', 'Nikopol', 'Shivachevo', 'Belovo', 'Tsar Kaloyan', 'Ivaylovgrad', 'Valchedram', 'Marten', 'Glodzhevo', 'Sarnitsa', 'Letnitsa', 'Varbitsa', 'Iskar', 'Ardino', 'Shabla', 'Rudozem', 'Vetren', 'Kresna', 'Banya', 'Batak', 'Maglizh', 'Valchi Dol', 'Gulyantsi', 'Dragoman', 'Zavet', 'Kran', 'Miziya', 'Primorsko', 'Sungurlare', 'Dolna Mitropoliya', 'Krivodol', 'Kula', 'Kalofer', 'Slivo Pole', 'Kaspichan', 'Apriltsi', 'Belitsa', 'Roman', 'Dzhebel', 'Dolna Oryahovitsa', 'Buhovo', 'Gurkovo', 'Pavel Banya', 'Nikolaevo', 'Yablanitsa', 'Kableshkovo', 'Opaka', 'Rila', 'Ugarchin', 'Dunavtsi', 'Dobrinishte', 'Hadzhidimovo', 'Bregovo', 'Byala Cherkva', 'Zlataritsa', 'Kocherinovo', 'Dospat', 'Tran', 'Sadovo', 'Laki', 'Koprivshtitsa', 'Malko Tarnovo', 'Loznitsa', 'Obzor', 'Kilifarevo', 'Borovo', 'Batanovtsi', 'Chernomorets', 'Aheloy', 'Byala', 'Pordim', 'Suhindol', 'Merichleri', 'Glavinitsa', 'Chiprovtsi', 'Kermen', 'Brezovo', 'Plachkovtsi', 'Zemen', 'Balgarovo', 'Alfatar', 'Boychinovtsi', 'Gramada', 'Senovo', 'Momin Prohod', 'Kaolinovo', 'Shipka', 'Antonovo', 'Ahtopol', 'Boboshevo', 'Bolyarovo', 'Brusartsi', 'Klisura', 'Dimovo', 'Kiten', 'Pliska', 'Madzharovo', 'Melnik'
        ];

        this.townsDetailed = [
            { id: 1, name: 'Bolqrovo', image: 'https://goo.gl/JqNm5T'},
            { id: 2, name: 'Elhovo', image: 'https://goo.gl/H5SwT3'},
            { id: 3, name: 'Jambol', image: 'https://goo.gl/xxKw77'},
            { id: 4, name: 'Straldja', image: 'https://goo.gl/9XiRZb'},
            { id: 5, name: 'Topolovgrad', image: 'https://goo.gl/UmhvYF'},
            { id: 6, name: 'Dimitrovgrad', image: 'https://goo.gl/rEhYyK'},
            { id: 7, name: 'Simeonovgrad', image: 'https://goo.gl/JqNm5T'},
            { id: 8, name: 'Harmanli', image: 'https://goo.gl/JqNm5T'},
            { id: 9, name: 'Karnobat', image: 'https://goo.gl/VuWHvR'},
            { id: 10, name: 'Aitos', image: 'https://goo.gl/JqNm5T'},
            { id: 11, name: 'Sredets', image: 'https://goo.gl/JqNm5T'},
            { id: 12, name: 'Nesebar', image: 'https://goo.gl/ZeR9h5'},
            { id: 13, name: 'Sungurlare', image: 'https://goo.gl/JqNm5T'},
        ];

        this.settings = {
            positionStrategy: new ConnectedPositioningStrategy({
                closeAnimation: null,
                openAnimation: null,
                verticalDirection: VerticalAlignment.Top,
                verticalStartPoint: VerticalAlignment.Top
            })
        };
        this.enabled = false;
    }

    onSubmit() {}
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
