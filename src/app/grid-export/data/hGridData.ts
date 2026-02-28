import { ISinger } from '../models/singer.interfaces';

export const HGRID_DATA: ISinger[] = [
    {
        id: 1,
        artist: 'Naomí Yepes',
        debut: 2011,
        grammyNominations: 6,
        grammyAwards: 0,
        hasGrammyAward: false,
        tours: [
            {
                tour: 'Faithful Tour',
                startedOn: new Date('2025-09-12'),
                location: 'Worldwide',
                headliner: 'NO',
                touredBy: 'Naomí Yepes',
                tourData: [
                    { country: 'Belgium', ticketsSold: 10000, attendants: 10000 },
                    { country: 'USA', ticketsSold: 192300, attendants: 186523 }
                ]
            }
        ],
        albums: [
            {
                album: 'Pushing up daisies',
                launchDate: new Date('2000-05-31'),
                billboardReview: 86,
                usBillboard200: 42,
                artist: 'Naomí Yepes',
                songs: [
                    {
                        number: 1,
                        title: 'Wood Shavings Forever',
                        released: new Date('2019-06-09'),
                        genre: 'Alternative',
                        album: 'Pushing up daisies'
                    }
                ]
            }
        ]
    },
    {
        id: 2,
        artist: 'Babila Ebwélé',
        debut: 2009,
        grammyNominations: 0,
        grammyAwards: 11,
        hasGrammyAward: true,
        tours: [
            {
                tour: 'Astroworld',
                startedOn: new Date('2021-07-21'),
                location: 'Worldwide',
                headliner: 'NO',
                touredBy: 'Babila Ebwélé',
                tourData: [
                    { country: 'Bulgaria', ticketsSold: 25000, attendants: 19822 }
                ]
            }
        ],
        albums: [
            {
                album: 'Fahrenheit',
                launchDate: new Date('2000-05-31'),
                billboardReview: 86,
                usBillboard200: 42,
                artist: 'Babila Ebwélé',
                songs: [
                    { number: 1, title: 'Show Out', released: new Date('2020-07-17'), genre: 'Hip-Hop', album: 'Fahrenheit' }
                ]
            }
        ]
    }
];