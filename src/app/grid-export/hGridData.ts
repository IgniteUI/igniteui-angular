export interface Song {
    Number: number;
    Title: string;
    Released: Date;
    Genre: string;
    Album: string;
}
export interface Tour {
    Tour: string;
    StartedOn: string;
    Location: string;
    Headliner: string;
    TouredBy: string;
}
export interface Album {
    Album: string;
    LaunchDate: Date;
    BillboardReview: number;
    USBillboard200: number;
    Artist: string;
    Songs?: Song[];
}
export interface Singer {
    ID: number;
    Artist: string;
    Photo?: string;
    Debut: number;
    GrammyNominations: number;
    GrammyAwards: number;
    HasGrammyAward: boolean;
    Tours?: Tour[];
    Albums?: Album[];
}

export const HGRID_DATA = [
    {
        Artist: 'Naomí Yepes',
        Debut: 2011,
        GrammyNominations: 6,
        GrammyAwards: 0,
        HasGrammyAward: false,
        Tours: [
            {
                Tour: 'Faithful Tour',
                StartedOn: 'Sep 12',
                Location: 'Worldwide',
                Headliner: 'NO',
                TouredBy: 'Naomí Yepes',
                TourData: [
                    {
                        Country: 'Belgium',
                        TicketsSold: 10000,
                        Attendants: 10000,
                    },
                    {
                        Country: 'USA',
                        TicketsSold: 192300,
                        Attendants: 186523,
                    }
                ]
            },
            {
                Tour: 'Faithful Tour',
                StartedOn: 'Sep 12',
                Location: 'Worldwide',
                Headliner: 'NO',
                TouredBy: 'Naomí Yepes'
            },
            {
                Tour: 'Faithful Tour',
                StartedOn: 'Sep 12',
                Location: 'Worldwide',
                Headliner: 'NO',
                TouredBy: 'Naomí Yepes'
            },
            {
                Tour: 'Faithful Tour',
                StartedOn: 'Sep 12',
                Location: 'Worldwide',
                Headliner: 'NO',
                TouredBy: 'Naomí Yepes'
            }
        ],
        Albums: [
            {
                Album: 'Pushing up daisies',
                LaunchDate: new Date('May 31, 2000'),
                BillboardReview: 86,
                USBillboard200: 42,
                Artist: 'Naomí Yepes',
                Songs: [
                    {
                        Number: 1,
                        Title: 'Wood Shavifdsafdsafsangs Forever',
                        Released: new Date('9 Jun 2019'),
                        Genre: '*fdasfsa',
                        Album: 'Pushing up daisies'
                    },
                    {
                        Number: 2,
                        Title: 'Wood Shavifdsafdsafsavngs Forever',
                        Released: new Date('9 Jun 2019'),
                        Genre: '*vxzvczx',
                        Album: 'Pushing up daisies'
                    },
                    {
                        Number: 3,
                        Title: 'Wfdsafsaings Forever',
                        Released: new Date('9 Jun 2019'),
                        Genre: '*fdsacewwwqwq',
                        Album: 'Pushing up daisies'
                    },
                    {
                        Number: 4,
                        Title: 'Wood Shavings Forever',
                        Released: new Date('9 Jun 2019'),
                        Genre: '*rewqrqcxz',
                        Album: 'Pushing up daisies'
                    },
                ]
            },
            {
                Album: 'Pushing up daisies - Deluxe',
                LaunchDate: new Date('May 31, 2001'),
                BillboardReview: 12,
                USBillboard200: 2,
                Artist: 'Naomí Yepes',
                Songs: [
                    {
                        Number: 1,
                        Title: 'Wood Shavings Forever - Remix',
                        Released: new Date('9 Jun 2020'),
                        Genre: 'Punk',
                        Album: 'Pushing up daisies'
                    },
                ]
            },
            {
                Album: 'Utopia',
                LaunchDate: new Date('Dec 19, 2021'),
                BillboardReview: 1,
                USBillboard200: 1,
                Artist: 'Naomí Yepes',
                Songs: [
                    {
                        Number: 1,
                        Title: 'SANTORINI',
                        Released: new Date('19 Dec 2021'),
                        Genre: 'Hip-Hop',
                        Album: 'Utopia'
                    },
                    {
                        Number: 2,
                        Title: 'HEARTBEAT',
                        Released: new Date('19 Dec 2021'),
                        Genre: 'Hip-Hop',
                        Album: 'Utopia'
                    },
                    {
                        Number: 3,
                        Title: 'OVERSEAS',
                        Released: new Date('19 Dec 2021'),
                        Genre: 'Hip-Hop',
                        Album: 'Utopia'
                    },
                ]
            },
            {
                Album: 'Wish You Were Here',
                LaunchDate: new Date('Jul 17, 2020'),
                BillboardReview: 5,
                USBillboard200: 3,
                Artist: 'Naomí Yepes',
                Songs: [
                    {
                        Number: 1,
                        Title: 'Zoom',
                        Released: new Date('17 Jul 2020'),
                        Genre: 'Hip-Hop',
                        Album: 'Wish You Were Here'
                    },
                    {
                        Number: 2,
                        Title: 'Do You?',
                        Released: new Date('17 Jul 2020'),
                        Genre: 'Hip-Hop',
                        Album: 'Wish You Were Here'
                    },
                    {
                        Number: 3,
                        Title: 'No Photos',
                        Released: new Date('17 Jul 2020'),
                        Genre: 'Hip-Hop',
                        Album: 'Wish You Were Here'
                    },
                ]
            }
        ]
    },
    {
        Artist: 'Babila Ebwélé',
        Debut: 2009,
        GrammyNominations: 0,
        GrammyAwards: 11,
        HasGrammyAward: true,
        Albums: [
            {
                Album: 'Fahrenheit',
                LaunchDate: new Date('May 31, 2000'),
                BillboardReview: 86,
                USBillboard200: 42,
                Artist: 'Babila Ebwélé',
                Songs: [
                    {
                        Number: 1,
                        Title: 'Show Out',
                        Released: new Date('17 Jul 2020'),
                        Genre: 'Hip-Hop',
                        Album: 'Fahrenheit'
                    },
                    {
                        Number: 2,
                        Title: 'Mood Swings',
                        Released: new Date('17 Jul 2020'),
                        Genre: 'Hip-Hop',
                        Album: 'Fahrenheit'
                    },
                    {
                        Number: 3,
                        Title: 'Scenario',
                        Released: new Date('17 Jul 2020'),
                        Genre: 'Hip-Hop',
                        Album: 'Fahrenheit'
                    },
                ]
            }
        ],
        Tours: [
            {
                Tour: 'Astroworld',
                StartedOn: 'Jul 21',
                Location: 'Worldwide',
                Headliner: 'NO',
                TouredBy: 'Babila Ebwélé',
                TourData: [
                    {
                        Country: 'Bulgaria',
                        TicketsSold: 25000,
                        Attendants: 19822,
                    },
                    {
                        Country: 'Romania',
                        TicketsSold: 65021,
                        Attendants: 63320,
                    }
                ]
            },
        ]
    },
    {
        Artist: 'Chloe',
        Debut: 2015,
        GrammyNominations: 3,
        GrammyAwards: 1,
        HasGrammyAward: true,
    }
]
