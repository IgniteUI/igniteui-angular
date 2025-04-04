
/* eslint-disable id-blacklist */
/* eslint-disable @typescript-eslint/naming-convention */
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
    // Photo?: string;
    Debut: number;
    GrammyNominations: number;
    GrammyAwards: number;
    HasGrammyAward: boolean;
    Tours?: Tour[];
    Albums?: Album[];
}

// tslint:disable:object-literal-sort-keys
export const SINGERS: Singer[] = [
    {
        ID: 0,
        Artist: 'Naomí Yepes',
        // Photo: 'assets/images/hgrid/naomi.jpg',
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
                TouredBy: 'Naomí Yepes'
            },
            {
                Tour: 'City Jam Sessions',
                StartedOn: 'Aug 13',
                Location: 'North America',
                Headliner: 'YES',
                TouredBy: 'Naomí Yepes'
            },
            {
                Tour: 'Christmas NYC 2013',
                StartedOn: 'Dec 13',
                Location: 'United States',
                Headliner: 'NO',
                TouredBy: 'Naomí Yepes'
            },
            {
                Tour: 'Christmas NYC 2014',
                StartedOn: 'Dec 14',
                Location: 'North America',
                Headliner: 'NO',
                TouredBy: 'Naomí Yepes'
            },
            {
                Tour: 'Watermelon Tour',
                StartedOn: 'Feb 15',
                Location: 'Worldwide',
                Headliner: 'YES',
                TouredBy: 'Naomí Yepes'
            },
            {
                Tour: 'Christmas NYC 2016',
                StartedOn: 'Dec 16',
                Location: 'United States',
                Headliner: 'NO',
                TouredBy: 'Naomí Yepes'
            },
            {
                Tour: 'The Dragon Tour',
                StartedOn: 'Feb 17',
                Location: 'Worldwide',
                Headliner: 'NO',
                TouredBy: 'Naomí Yepes'
            },
            {
                Tour: 'Organic Sessions',
                StartedOn: 'Aug 18',
                Location: 'United States, England',
                Headliner: 'YES',
                TouredBy: 'Naomí Yepes'
            },
            {
                Tour: 'Hope World Tour',
                StartedOn: 'Mar 19',
                Location: 'Worldwide',
                Headliner: 'NO',
                TouredBy: 'Naomí Yepes'
            }
        ],
        Albums: [
            {
                Album: 'Initiation',
                LaunchDate: new Date('September 3, 2013'),
                BillboardReview: 86,
                USBillboard200: 1,
                Artist: 'Naomí Yepes',
                Songs: [{
                    Number: 1,
                    Title: 'Ambitious',
                    Released: new Date('28 Apr 2015'),
                    Genre: 'Dance-pop R&B',
                    Album: 'Initiation'
                },
                {
                    Number: 2,
                    Title: 'My heart will go on',
                    Released: new Date('24 May 2015'),
                    Genre: 'Dance-pop R&B',
                    Album: 'Initiation'
                },
                {
                    Number: 3,
                    Title: 'Sing to me',
                    Released: new Date('28 May 2015'),
                    Genre: 'Dance-pop R&B',
                    Album: 'Initiation'
                },
                {
                    Number: 4,
                    Title: 'Want to dance with somebody',
                    Released: new Date('03 Jun 2015'),
                    Genre: 'Dance-pop R&B',
                    Album: 'Initiation'
                }]
            },
            {
                Album: 'Dream Driven',
                LaunchDate: new Date('August 25, 2014'),
                BillboardReview: 81,
                USBillboard200: 1,
                Artist: 'Naomí Yepes',
                Songs: [{
                    Number: 1,
                    Title: 'Intro',
                    Released: null,
                    Genre: '*',
                    Album: 'Dream Driven'
                },
                {
                    Number: 2,
                    Title: 'Ferocious',
                    Released: new Date('28 Apr 2014'),
                    Genre: 'Dance-pop R&B',
                    Album: 'Dream Driven'
                },
                {
                    Number: 3,
                    Title: 'Going crazy',
                    Released: new Date('10 Feb 2015'),
                    Genre: 'Dance-pop EDM',
                    Album: 'Dream Driven'
                },
                {
                    Number: 4,
                    Title: 'Future past',
                    Released: null,
                    Genre: '*',
                    Album: 'Dream Driven'
                },
                {
                    Number: 5,
                    Title: 'Roaming like them',
                    Released: new Date('2 Jul 2014'),
                    Genre: 'Electro house Electropop',
                    Album: 'Dream Driven'
                },
                {
                    Number: 6,
                    Title: 'Last Wishes',
                    Released: new Date('12 Aug 2014'),
                    Genre: 'R&B',
                    Album: 'Dream Driven'
                },
                {
                    Number: 7,
                    Title: 'Stay where you are',
                    Released: null,
                    Genre: '*',
                    Album: 'Dream Driven'
                },
                {
                    Number: 8,
                    Title: 'Imaginarium',
                    Released: null,
                    Genre: '*',
                    Album: 'Dream Driven'
                },
                {
                    Number: 9,
                    Title: 'Tell me',
                    Released: new Date('30 Sep 2014'),
                    Genre: 'Synth-pop R&B',
                    Album: 'Dream Driven'
                },
                {
                    Number: 10,
                    Title: 'Shredded into pieces',
                    Released: null,
                    Genre: '*',
                    Album: 'Dream Driven'
                },
                {
                    Number: 11,
                    Title: 'Capture this moment',
                    Released: null,
                    Genre: '*',
                    Album: 'Dream Driven'
                },
                {
                    Number: 12,
                    Title: 'Dream Driven',
                    Released: null,
                    Genre: '*',
                    Album: 'Dream Driven'
                }]
            },
            {
                Album: 'The dragon journey',
                LaunchDate: new Date('May 20, 2016'),
                BillboardReview: 60,
                USBillboard200: 2,
                Artist: 'Naomí Yepes',
                Songs: [{
                    Number: 1,
                    Title: 'My dream',
                    Released: new Date('13 Jan 2017'),
                    Genre: 'Dance-pop EDM',
                    Album: 'The dragon journey'
                },
                {
                    Number: 2,
                    Title: 'My passion',
                    Released: new Date('23 Sep 2017'),
                    Genre: 'Crunk reggaeton',
                    Album: 'The dragon journey'
                },
                {
                    Number: 3,
                    Title: 'What is love',
                    Released: new Date('28 Nov 2018'),
                    Genre: 'Dance-pop R&B',
                    Album: 'The dragon journey'
                },
                {
                    Number: 4,
                    Title: 'Negative',
                    Released: new Date('01 Dec 2018'),
                    Genre: 'Dance-pop EDM',
                    Album: 'The dragon journey'
                }]
            },
            {
                Album: 'Organic me',
                LaunchDate: new Date('August 17, 2018'),
                BillboardReview: 82,
                USBillboard200: 1,
                Artist: 'Naomí Yepes',
                Songs: [{
                    Number: 1,
                    Title: 'I Love',
                    Released: new Date('11 May 2019'),
                    Genre: 'Crunk reggaeton',
                    Album: 'Organic me'
                },
                {
                    Number: 2,
                    Title: 'Early Morning Compass',
                    Released: new Date('15 Jan 2020'),
                    Genre: 'mystical parody-bap ',
                    Album: 'Organic me'
                },
                {
                    Number: 3,
                    Title: 'Key Fields Forever',
                    Released: new Date('2 Jan 2020'),
                    Genre: 'Dance-pop EDM',
                    Album: 'Organic me'
                },
                {
                    Number: 4,
                    Title: 'Stand by Your Goblins',
                    Released: new Date('20 Nov 2019'),
                    Genre: '*',
                    Album: 'Organic me'
                },
                {
                    Number: 5,
                    Title: 'Mad to Walk',
                    Released: new Date('12 May 2019'),
                    Genre: 'Electro house Electropop',
                    Album: 'Organic me'
                },
                {
                    Number: 6,
                    Title: 'Alice\'s Waiting',
                    Released: new Date('28 Jan 2020'),
                    Genre: 'R&B',
                    Album: 'Organic me'
                },
                {
                    Number: 7,
                    Title: 'We Shall Kiss',
                    Released: new Date('30 Oct 2019'),
                    Genre: '*',
                    Album: 'Organic me'
                },
                {
                    Number: 8,
                    Title: 'Behind Single Ants',
                    Released: new Date('2 Oct 2019'),
                    Genre: '*',
                    Album: 'Organic me'
                },
                {
                    Number: 9,
                    Title: 'Soap Autopsy',
                    Released: new Date('8 Aug 2019'),
                    Genre: 'Synth-pop R&B',
                    Album: 'Organic me'
                },
                {
                    Number: 10,
                    Title: 'Have You Met Rich?',
                    Released: new Date('1 Jul 2019'),
                    Genre: 'ethno-tunes',
                    Album: 'Organic me'
                },
                {
                    Number: 11,
                    Title: 'Livin\' on a Banana',
                    Released: new Date('22 Nov 2019'),
                    Genre: 'Crunk reggaeton',
                    Album: 'Organic me'
                }]
            },
            {
                Album: 'Curiosity',
                LaunchDate: new Date('December 7, 2019'),
                BillboardReview: 75,
                USBillboard200: 12,
                Artist: 'Naomí Yepes',
                Songs: [{
                    Number: 1,
                    Title: 'Goals',
                    Released: new Date('07 Dec 2019'),
                    Genre: '*',
                    Album: 'Curiosity'
                },
                {
                    Number: 2,
                    Title: 'Explorer',
                    Released: new Date('08 Dec 2019'),
                    Genre: 'Crunk reggaeton',
                    Album: 'Curiosity'
                },
                {
                    Number: 3,
                    Title: 'I need to know',
                    Released: new Date('09 Dec 2019'),
                    Genre: 'Dance-pop R&B',
                    Album: 'Curiosity'
                },
                {
                    Number: 4,
                    Title: 'Finding my purpose',
                    Released: new Date('10 Dec 2019'),
                    Genre: 'Heavy metal',
                    Album: 'Curiosity'
                },
                {
                    Number: 5,
                    Title: 'Faster than the speed of love',
                    Released: new Date('21 Dec 2019'),
                    Genre: 'Dance-pop EDM',
                    Album: 'Curiosity'
                },
                {
                    Number: 6,
                    Title: 'I like it',
                    Released: new Date('01 Jan 2020'),
                    Genre: 'Dance-pop EDM',
                    Album: 'Curiosity'
                }]
            }
        ]
    },
    {
        ID: 1,
        Artist: 'Babila Ebwélé',
        // Photo: 'assets/images/hgrid/babila.jpg',
        Debut: 2009,
        GrammyNominations: 0,
        GrammyAwards: 11,
        HasGrammyAward: true,
        Tours: [
            {
                Tour: 'The last straw',
                StartedOn: 'May 09',
                Location: 'Europe, Asia',
                Headliner: 'NO',
                TouredBy: 'Babila Ebwélé'
            },
            {
                Tour: 'No foundations',
                StartedOn: 'Jun 04',
                Location: 'United States, Europe',
                Headliner: 'YES',
                TouredBy: 'Babila Ebwélé'
            },
            {
                Tour: 'Crazy eyes',
                StartedOn: 'Jun 08',
                Location: 'North America',
                Headliner: 'NO',
                TouredBy: 'Babila Ebwélé'
            },
            {
                Tour: 'Zero gravity',
                StartedOn: 'Apr 19',
                Location: 'United States',
                Headliner: 'NO',
                TouredBy: 'Babila Ebwélé'
            },
            {
                Tour: 'Battle with myself',
                StartedOn: 'Mar 08',
                Location: 'North America',
                Headliner: 'YES',
                TouredBy: 'Babila Ebwélé'
            }],
        Albums: [
            {
                Album: 'Pushing up daisies',
                LaunchDate: new Date('May 31, 2000'),
                BillboardReview: 86,
                USBillboard200: 42,
                Artist: 'Babila Ebwélé',
                Songs: [{
                    Number: 1,
                    Title: 'Wood Shavings Forever',
                    Released: new Date('9 Jun 2019'),
                    Genre: '*',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 2,
                    Title: 'Early Morning Drive',
                    Released: new Date('20 May 2019'),
                    Genre: '*',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 3,
                    Title: 'Don\'t Natter',
                    Released: new Date('10 Jun 2019'),
                    Genre: 'adult calypso-industrial',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 4,
                    Title: 'Stairway to Balloons',
                    Released: new Date('18 Jun 2019'),
                    Genre: 'calypso and mariachi',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 5,
                    Title: 'The Number of your Apple',
                    Released: new Date('29 Oct 2019'),
                    Genre: '*',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 6,
                    Title: 'Your Delightful Heart',
                    Released: new Date('24 Feb 2019'),
                    Genre: '*',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 7,
                    Title: 'Nice Weather For Balloons',
                    Released: new Date('1 Aug 2019'),
                    Genre: 'rap-hop',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 8,
                    Title: 'The Girl From Cornwall',
                    Released: new Date('4 May 2019'),
                    Genre: 'enigmatic rock-and-roll',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 9,
                    Title: 'Here Without Jack',
                    Released: new Date('24 Oct 2019'),
                    Genre: '*',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 10,
                    Title: 'Born Rancid',
                    Released: new Date('19 Mar 2019'),
                    Genre: '*',
                    Album: 'Pushing up daisies'
                }]
            },
            {
                Album: 'Death\'s dead',
                LaunchDate: new Date('June 8, 2016'),
                BillboardReview: 85,
                USBillboard200: 95,
                Artist: 'Babila Ebwélé',
                Songs: [{
                    Number: 1,
                    Title: 'Men Sound Better With You',
                    Released: new Date('20 Oct 2016'),
                    Genre: 'rap-hop',
                    Album: 'Death\'s dead'
                },
                {
                    Number: 2,
                    Title: 'Ghost in My Rod',
                    Released: new Date('5 Oct 2016'),
                    Genre: 'enigmatic rock-and-roll',
                    Album: 'Death\'s dead'
                },
                {
                    Number: 3,
                    Title: 'Bed of Men',
                    Released: new Date('14 Nov 2016'),
                    Genre: 'whimsical comedy-grass ',
                    Album: 'Death\'s dead'
                },
                {
                    Number: 4,
                    Title: 'Don\'t Push',
                    Released: new Date('2 Jan 2017'),
                    Genre: 'unblack electronic-trip-hop',
                    Album: 'Death\'s dead'
                },
                {
                    Number: 5,
                    Title: 'Nice Weather For Men',
                    Released: new Date('18 Dec 2017'),
                    Genre: '*',
                    Album: 'Death\'s dead'
                },
                {
                    Number: 6,
                    Title: 'Rancid Rhapsody',
                    Released: new Date('10 Mar 2017'),
                    Genre: '*',
                    Album: 'Death\'s dead'
                },
                {
                    Number: 7,
                    Title: 'Push, Push, Push!',
                    Released: new Date('21 Feb 2017'),
                    Genre: '*',
                    Album: 'Death\'s dead'
                },
                {
                    Number: 8,
                    Title: 'My Name is Sarah',
                    Released: new Date('15 Nov 2017'),
                    Genre: '*',
                    Album: 'Death\'s dead'
                },
                {
                    Number: 9,
                    Title: 'The Girl From My Hotel',
                    Released: new Date('6 Nov 2017'),
                    Genre: '*',
                    Album: 'Death\'s dead'
                },
                {
                    Number: 10,
                    Title: 'Free Box',
                    Released: new Date('18 Apr 2017'),
                    Genre: 'splitter-funk',
                    Album: 'Death\'s dead'
                },
                {
                    Number: 11,
                    Title: 'Hotel Cardiff',
                    Released: new Date('30 Dec 2017'),
                    Genre: 'guilty pleasure ebm',
                    Album: 'Death\'s dead'
                }]
            }]
    },
    {
        ID: 2,
        Artist: 'Ahmad Nazeri',
        // Photo: 'assets/images/hgrid/ahmad.jpg',
        Debut: 2004,
        GrammyNominations: 3,
        GrammyAwards: 1,
        HasGrammyAward: true,
        Tours: [],
        Albums: [
            {
                Album: 'Emergency',
                LaunchDate: new Date('March 6, 2004'),
                BillboardReview: 98,
                USBillboard200: 69,
                Artist: 'Ahmad Nazeri',
                Songs: [{
                    Number: 1,
                    Title: 'I am machine',
                    Released: new Date('20 Oct 2004'),
                    Genre: 'Heavy metal',
                    Album: 'Emergency'
                },
                {
                    Number: 2,
                    Title: 'I wish I knew',
                    Released: new Date('21 Oct 2004'),
                    Genre: 'rap-hop',
                    Album: 'Emergency'
                },
                {
                    Number: 3,
                    Title: 'How I feel',
                    Released: new Date('22 Oct 2004'),
                    Genre: 'Heavy metal',
                    Album: 'Emergency'
                },
                {
                    Number: 4,
                    Title: 'I am machine',
                    Released: new Date('30 Oct 2004'),
                    Genre: 'Heavy metal',
                    Album: 'Emergency'
                },
                {
                    Number: 5,
                    Title: 'Monsters under my bed',
                    Released: new Date('01 Nov 2004'),
                    Genre: 'rap-hop',
                    Album: 'Emergency'
                },
                {
                    Number: 6,
                    Title: 'I know what you want',
                    Released: new Date('20 Nov 2004'),
                    Genre: 'rap-hop',
                    Album: 'Emergency'
                },
                {
                    Number: 7,
                    Title: 'Lies',
                    Released: new Date('21 Nov 2004'),
                    Genre: 'Heavy metal',
                    Album: 'Emergency'
                },
                {
                    Number: 8,
                    Title: 'I did it for you',
                    Released: new Date('22 Nov 2004'),
                    Genre: 'rap-hop',
                    Album: 'Emergency'
                }]
            },
            {
                Album: 'Bursting bubbles',
                LaunchDate: new Date('April 17, 2006'),
                BillboardReview: 69,
                USBillboard200: 39,
                Artist: 'Ahmad Nazeri',
                Songs: [{
                    Number: 1,
                    Title: 'Ghosts',
                    Released: new Date('20 Apr 2006'),
                    Genre: 'Hip-hop',
                    Album: 'Bursting bubbles'
                },
                {
                    Number: 2,
                    Title: 'What goes around comes around',
                    Released: new Date('20 Apr 2006'),
                    Genre: 'Heavy metal',
                    Album: 'Bursting bubbles'
                },
                {
                    Number: 3,
                    Title: 'I want nothing',
                    Released: new Date('21 Apr 2006'),
                    Genre: 'Heavy metal',
                    Album: 'Bursting bubbles'
                },
                {
                    Number: 4,
                    Title: 'Me and you',
                    Released: new Date('22 Apr 2006'),
                    Genre: 'Rock',
                    Album: 'Bursting bubbles'
                }]
            }
        ]
    },
    {
        ID: 3,
        Artist: 'Kimmy McIlmorie',
        // Photo: 'assets/images/hgrid/kimmy.jpg',
        Debut: 2007,
        GrammyNominations: 21,
        GrammyAwards: 3,
        HasGrammyAward: true,
        Albums: [
            {
                Album: 'Here we go again',
                LaunchDate: new Date('November 18, 2017'),
                BillboardReview: 68,
                USBillboard200: 1,
                Artist: 'Kimmy McIlmorie',
                Songs: [{
                    Number: 1,
                    Title: 'Same old love',
                    Released: new Date('20 Nov 2017'),
                    Genre: 'Hip-hop',
                    Album: 'Here we go again'
                },
                {
                    Number: 2,
                    Title: 'Sick of it',
                    Released: new Date('20 Nov 2017'),
                    Genre: 'Hip-hop',
                    Album: 'Here we go again'
                },
                {
                    Number: 3,
                    Title: 'No one',
                    Released: new Date('21 Nov 2017'),
                    Genre: 'Metal',
                    Album: 'Here we go again'
                },
                {
                    Number: 4,
                    Title: 'Circles',
                    Released: new Date('22 Nov 2017'),
                    Genre: 'Heavy metal',
                    Album: 'Here we go again'
                },
                {
                    Number: 5,
                    Title: 'Coming for you',
                    Released: new Date('30 Nov 2017'),
                    Genre: 'Hip-hop',
                    Album: 'Here we go again'
                }]
            }
        ]
    },
    {
        ID: 4,
        Artist: 'Mar Rueda',
        // Photo: 'assets/images/hgrid/mar.jpg',
        Debut: 1996,
        GrammyNominations: 14,
        GrammyAwards: 2,
        HasGrammyAward: true,
        Albums: [
            {
                Album: 'Trouble',
                LaunchDate: new Date('November 18, 2017'),
                BillboardReview: 65,
                USBillboard200: 2,
                Artist: 'Mar Rueda',
                Songs: [{
                    Number: 1,
                    Title: 'You knew I was trouble',
                    Released: new Date('20 Nov 2017'),
                    Genre: 'Pop',
                    Album: 'Trouble'
                },
                {
                    Number: 2,
                    Title: 'Cannot live without you',
                    Released: new Date('20 Nov 2017'),
                    Genre: 'Pop',
                    Album: 'Trouble'
                },
                {
                    Number: 3,
                    Title: 'Lost you',
                    Released: new Date('21 Nov 2017'),
                    Genre: 'Metal',
                    Album: 'Trouble'
                },
                {
                    Number: 4,
                    Title: 'Happiness starts with you',
                    Released: new Date('22 Nov 2017'),
                    Genre: '*',
                    Album: 'Trouble'
                },
                {
                    Number: 5,
                    Title: 'I saw it coming',
                    Released: new Date('30 Dec 2017'),
                    Genre: 'Hip-hop',
                    Album: 'Trouble'
                }]
            }
        ]
    },
    {
        ID: 5,
        Artist: 'Izabella Tabakova',
        // Photo: 'assets/images/hgrid/izabella.jpg',
        Debut: 2017,
        GrammyNominations: 7,
        GrammyAwards: 11,
        HasGrammyAward: true,
        Tours: [
            {
                Tour: 'Final breath',
                StartedOn: 'Jun 13',
                Location: 'Europe',
                Headliner: 'YES',
                TouredBy: 'Izabella Tabakova'
            },
            {
                Tour: 'Once bitten',
                StartedOn: 'Dec 18',
                Location: 'Australia, United States',
                Headliner: 'NO',
                TouredBy: 'Izabella Tabakova'
            },
            {
                Tour: 'Code word',
                StartedOn: 'Sep 19',
                Location: 'United States, Europe',
                Headliner: 'NO',
                TouredBy: 'Izabella Tabakova'
            },
            {
                Tour: 'Final draft',
                StartedOn: 'Sep 17',
                Location: 'United States, Europe',
                Headliner: 'YES',
                TouredBy: 'Izabella Tabakova'
            }
        ],
        Albums: [
            {
                Album: 'Once bitten',
                LaunchDate: new Date('July 16, 2007'),
                BillboardReview: 79,
                USBillboard200: 53,
                Artist: 'Izabella Tabakova',
                Songs: [{
                    Number: 1,
                    Title: 'Whole Lotta Super Cats',
                    Released: new Date('21 May 2019'),
                    Genre: '*',
                    Album: 'Once bitten'
                },
                {
                    Number: 2,
                    Title: 'Enter Becky',
                    Released: new Date('16 Jan 2020'),
                    Genre: '*',
                    Album: 'Once bitten'
                },
                {
                    Number: 3,
                    Title: 'Your Cheatin\' Flamingo',
                    Released: new Date('14 Jan 2020'),
                    Genre: '*',
                    Album: 'Once bitten'
                },
                {
                    Number: 4,
                    Title: 'Mad to Kiss',
                    Released: new Date('6 Nov 2019'),
                    Genre: 'Synth-pop R&B',
                    Album: 'Once bitten'
                },
                {
                    Number: 5,
                    Title: 'Hotel Prague',
                    Released: new Date('20 Oct 2019'),
                    Genre: 'ethno-tunes',
                    Album: 'Once bitten'
                },
                {
                    Number: 6,
                    Title: 'Jail on My Mind',
                    Released: new Date('31 May 2019'),
                    Genre: 'Crunk reggaeton',
                    Album: 'Once bitten'
                },
                {
                    Number: 7,
                    Title: 'Amazing Blues',
                    Released: new Date('29 May 2019'),
                    Genre: 'mystical parody-bap ',
                    Album: 'Once bitten'
                },
                {
                    Number: 8,
                    Title: 'Goody Two Iron Filings',
                    Released: new Date('4 Jul 2019'),
                    Genre: 'Electro house Electropop',
                    Album: 'Once bitten'
                },
                {
                    Number: 9,
                    Title: 'I Love in Your Arms',
                    Released: new Date('7 Jun 2019'),
                    Genre: 'R&B',
                    Album: 'Once bitten'
                },
                {
                    Number: 10,
                    Title: 'Truly Madly Amazing',
                    Released: new Date('12 Sep 2019'),
                    Genre: 'ethno-tunes',
                    Album: 'Once bitten'
                }
                ]
            },
            {
                Album: 'Your graciousness',
                LaunchDate: new Date('November 17, 2004'),
                BillboardReview: 69,
                USBillboard200: 30,
                Artist: 'Izabella Tabakova',
                Songs: [
                    {
                        Number: 1,
                        Title: 'We Shall Tickle',
                        Released: new Date('31 Aug 2019'),
                        Genre: 'old emo-garage ',
                        Album: 'Your graciousness'
                    },
                    {
                        Number: 2,
                        Title: 'Snail Boogie',
                        Released: new Date('14 Jun 2019'),
                        Genre: '*',
                        Album: 'Your graciousness'
                    },
                    {
                        Number: 3,
                        Title: 'Amazing Liz',
                        Released: new Date('15 Oct 2019'),
                        Genre: '*',
                        Album: 'Your graciousness'
                    },
                    {
                        Number: 4,
                        Title: 'When Sexy Aardvarks Cry',
                        Released: new Date('1 Oct 2019'),
                        Genre: 'whimsical comedy-grass ',
                        Album: 'Your graciousness'
                    },
                    {
                        Number: 5,
                        Title: 'Stand By Dave',
                        Released: new Date('18 Aug 2019'),
                        Genre: 'unblack electronic-trip-hop',
                        Album: 'Your graciousness'
                    },
                    {
                        Number: 6,
                        Title: 'The Golf Course is Your Land',
                        Released: new Date('2 Apr 2019'),
                        Genre: '*',
                        Album: 'Your graciousness'
                    },
                    {
                        Number: 7,
                        Title: 'Where Have All the Men Gone?',
                        Released: new Date('29 Apr 2019'),
                        Genre: '*',
                        Album: 'Your graciousness'
                    },
                    {
                        Number: 8,
                        Title: 'Rhythm of the Leg',
                        Released: new Date('5 Aug 2019'),
                        Genre: 'ethno-tunes',
                        Album: 'Your graciousness'
                    },
                    {
                        Number: 9,
                        Title: 'Baby, I Need Your Hats',
                        Released: new Date('5 Dec 2019'),
                        Genre: 'neuro-tunes',
                        Album: 'Your graciousness'
                    },
                    {
                        Number: 10,
                        Title: 'Stand by Your Cat',
                        Released: new Date('25 Jul 2019'),
                        Genre: '*',
                        Album: 'Your graciousness'
                    }]
            },
            {
                Album: 'Dark matters',
                LaunchDate: new Date('November 3, 2002'),
                BillboardReview: 79,
                USBillboard200: 85,
                Artist: 'Izabella Tabakova',
                Songs: [{
                    Number: 1,
                    Title: 'The Sun',
                    Released: new Date('31 Oct 2002'),
                    Genre: 'old emo-garage ',
                    Album: 'Dark matters'
                },
                {
                    Number: 2,
                    Title: 'I will survive',
                    Released: new Date('03 Nov 2002'),
                    Genre: 'old emo-garage ',
                    Album: 'Dark matters'
                },
                {
                    Number: 3,
                    Title: 'Try',
                    Released: new Date('04 Nov 2002'),
                    Genre: 'old emo-garage ',
                    Album: 'Dark matters'
                },
                {
                    Number: 4,
                    Title: 'Miracle',
                    Released: new Date('05 Nov 2002'),
                    Genre: 'old emo-garage ',
                    Album: 'Dark matters'
                }]
            }
        ]
    },
    {
        ID: 6,
        Artist: 'Nguyễn Diệp Chi',
        // Photo: 'assets/images/hgrid/nguyen.jpg',
        Debut: 1992,
        GrammyNominations: 4,
        GrammyAwards: 2,
        HasGrammyAward: true,
        Albums: [
            {
                Album: 'Library of liberty',
                LaunchDate: new Date('December 22, 2003'),
                BillboardReview: 93,
                USBillboard200: 5,
                Artist: 'Nguyễn Diệp Chi',
                Songs: [{
                    Number: 1,
                    Title: 'Book of love',
                    Released: new Date('31 Dec 2003'),
                    Genre: 'Hip-hop',
                    Album: 'Library of liberty'
                },
                {
                    Number: 2,
                    Title: 'Commitment',
                    Released: new Date('01 Jan 2004'),
                    Genre: 'Hip-hop',
                    Album: 'Library of liberty'
                },
                {
                    Number: 3,
                    Title: 'Satisfaction',
                    Released: new Date('01 Jan 2004'),
                    Genre: 'Hip-hop',
                    Album: 'Library of liberty'
                },
                {
                    Number: 4,
                    Title: 'Obsession',
                    Released: new Date('01 Jan 2004'),
                    Genre: 'Hip-hop',
                    Album: 'Library of liberty'
                },
                {
                    Number: 5,
                    Title: 'Oblivion',
                    Released: new Date('02 Jan 2004'),
                    Genre: 'Hip-hop',
                    Album: 'Library of liberty'
                },
                {
                    Number: 6,
                    Title: 'Energy',
                    Released: new Date('03 Jan 2004'),
                    Genre: 'Hip-hop',
                    Album: 'Library of liberty'
                }]
            }
        ]
    },
    {
        ID: 7,
        Artist: 'Eva Lee',
        // Photo: 'assets/images/hgrid/eva.jpg',
        Debut: 2008,
        GrammyNominations: 2,
        GrammyAwards: 0,
        HasGrammyAward: false,
        Albums: [
            {
                Album: 'Just a tease',
                LaunchDate: new Date('May 3, 2001'),
                BillboardReview: 91,
                USBillboard200: 29,
                Artist: 'Eva Lee',
                Songs: [{
                    Number: 1,
                    Title: 'We shall see',
                    Released: new Date('03 May 2001'),
                    Genre: 'rap-hop',
                    Album: 'Just a tease'
                },
                {
                    Number: 2,
                    Title: 'Hopeless',
                    Released: new Date('04 May 2001'),
                    Genre: 'rap-hop',
                    Album: 'Just a tease'
                },
                {
                    Number: 3,
                    Title: 'Ignorant',
                    Released: new Date('04 May 2001'),
                    Genre: 'rap-hop',
                    Album: 'Just a tease'
                },
                {
                    Number: 4,
                    Title: 'Dance',
                    Released: new Date('05 May 2019'),
                    Genre: 'Metal',
                    Album: 'Just a tease'
                },
                {
                    Number: 5,
                    Title: 'Fire',
                    Released: new Date('06 May 2019'),
                    Genre: 'Metal',
                    Album: 'Just a tease'
                }]
            }
        ]
    },
    {
        ID: 8,
        Artist: 'Siri Jakobsson',
        // Photo: 'assets/images/hgrid/siri.jpg',
        Debut: 1990,
        GrammyNominations: 2,
        GrammyAwards: 8,
        HasGrammyAward: true,
        Tours: [
            {
                Tour: 'Basket case',
                StartedOn: 'Jan 07',
                Location: 'Europe, Asia',
                Headliner: 'NO',
                TouredBy: 'Siri Jakobsson'
            },
            {
                Tour: 'The bigger fish',
                StartedOn: 'Dec 07',
                Location: 'United States, Europe',
                Headliner: 'YES',
                TouredBy: 'Siri Jakobsson'
            },
            {
                Tour: 'Missed the boat',
                StartedOn: 'Jun 09',
                Location: 'Europe, Asia',
                Headliner: 'NO',
                TouredBy: 'Siri Jakobsson'
            },
            {
                Tour: 'Equivalent exchange',
                StartedOn: 'Feb 06',
                Location: 'United States, Europe',
                Headliner: 'YES',
                TouredBy: 'Siri Jakobsson'
            },
            {
                Tour: 'Damage control',
                StartedOn: 'Oct 11',
                Location: 'Australia, United States',
                Headliner: 'NO',
                TouredBy: 'Siri Jakobsson'
            }
        ],
        Albums: [
            {
                Album: 'Under the bus',
                LaunchDate: new Date('May 14, 2000'),
                BillboardReview: 67,
                USBillboard200: 67,
                Artist: 'Siri Jakobsson',
                Songs: [
                    {
                        Number: 1,
                        Title: 'Jack Broke My Heart At Tesco\'s',
                        Released: new Date('19 Jan 2020'),
                        Genre: '*',
                        Album: 'Under the bus'
                    },
                    {
                        Number: 2,
                        Title: 'Cat Deep, Hats High',
                        Released: new Date('5 Dec 2019'),
                        Genre: '*',
                        Album: 'Under the bus'
                    },
                    {
                        Number: 3,
                        Title: 'In Snail We Trust',
                        Released: new Date('31 May 2019'),
                        Genre: 'hardcore opera',
                        Album: 'Under the bus'
                    },
                    {
                        Number: 4,
                        Title: 'Liz\'s Waiting',
                        Released: new Date('22 Jul 2019'),
                        Genre: 'emotional C-jam ',
                        Album: 'Under the bus'
                    },
                    {
                        Number: 5,
                        Title: 'Lifeless Blues',
                        Released: new Date('14 Jun 2019'),
                        Genre: '*',
                        Album: 'Under the bus'
                    },
                    {
                        Number: 6,
                        Title: 'I Spin',
                        Released: new Date('26 Mar 2019'),
                        Genre: '*',
                        Album: 'Under the bus'
                    },
                    {
                        Number: 7,
                        Title: 'Ring of Rock',
                        Released: new Date('12 Dec 2019'),
                        Genre: '*',
                        Album: 'Under the bus'
                    },
                    {
                        Number: 8,
                        Title: 'Livin\' on a Rock',
                        Released: new Date('17 Apr 2019'),
                        Genre: '*',
                        Album: 'Under the bus'
                    },
                    {
                        Number: 9,
                        Title: 'Your Lifeless Heart',
                        Released: new Date('15 Sep 2019'),
                        Genre: 'adult calypso-industrial',
                        Album: 'Under the bus'
                    },
                    {
                        Number: 10,
                        Title: 'The High Street on My Mind',
                        Released: new Date('11 Nov 2019'),
                        Genre: 'calypso and mariachi',
                        Album: 'Under the bus'
                    },
                    {
                        Number: 11,
                        Title: 'Behind Ugly Curtains',
                        Released: new Date('8 May 2019'),
                        Genre: '*',
                        Album: 'Under the bus'
                    },
                    {
                        Number: 12,
                        Title: 'Where Have All the Curtains Gone?',
                        Released: new Date('28 Jun 2019'),
                        Genre: '*',
                        Album: 'Under the bus'
                    },
                    {
                        Number: 13,
                        Title: 'Ghost in My Apple',
                        Released: new Date('14 Dec 2019'),
                        Genre: '*',
                        Album: 'Under the bus'
                    },
                    {
                        Number: 14,
                        Title: 'I Chatter',
                        Released: new Date('30 Nov 2019'),
                        Genre: '*',
                        Album: 'Under the bus'
                    }
                ]
            }
        ]
    },
    {
        ID: 9,
        Artist: 'Pablo Cambeiro',
        // Photo: 'assets/images/hgrid/pablo.jpg',
        Debut: 2011,
        GrammyNominations: 5,
        GrammyAwards: 0,
        HasGrammyAward: false,
        Tours: [
            {
                Tour: 'Beads',
                StartedOn: 'May 11',
                Location: 'Worldwide',
                Headliner: 'NO',
                TouredBy: 'Pablo Cambeiro'
            },
            {
                Tour: 'Concept art',
                StartedOn: 'Dec 18',
                Location: 'United States',
                Headliner: 'YES',
                TouredBy: 'Pablo Cambeiro'
            },
            {
                Tour: 'Glass shoe',
                StartedOn: 'Jan 20',
                Location: 'Worldwide',
                Headliner: 'YES',
                TouredBy: 'Pablo Cambeiro'
            },
            {
                Tour: 'Pushing buttons',
                StartedOn: 'Feb 15',
                Location: 'Europe, Asia',
                Headliner: 'NO',
                TouredBy: 'Pablo Cambeiro'
            },
            {
                Tour: 'Dark matters',
                StartedOn: 'Jan 04',
                Location: 'Australia, United States',
                Headliner: 'YES',
                TouredBy: 'Pablo Cambeiro'
            },
            {
                Tour: 'Greener grass',
                StartedOn: 'Sep 09',
                Location: 'United States, Europe',
                Headliner: 'NO',
                TouredBy: 'Pablo Cambeiro'
            },
            {
                Tour: 'Apparatus',
                StartedOn: 'Nov 16',
                Location: 'Europe',
                Headliner: 'NO',
                TouredBy: 'Pablo Cambeiro'
            }
        ],
        Albums: [
            {
                Album: 'Fluke',
                LaunchDate: new Date('August 4, 2017'),
                BillboardReview: 93,
                USBillboard200: 98,
                Artist: 'Pablo Cambeiro',
                Songs: [{
                    Number: 1,
                    Title: 'Silence',
                    Released: new Date('25 Aug 2017'),
                    Genre: 'rap-hop',
                    Album: 'Fluke'
                },
                {
                    Number: 2,
                    Title: 'Nothing matters anymore',
                    Released: new Date('25 Aug 2017'),
                    Genre: '*',
                    Album: 'Fluke'
                },
                {
                    Number: 3,
                    Title: 'Everything wrong with me',
                    Released: new Date('25 Aug 2017'),
                    Genre: '*',
                    Album: 'Fluke'
                }]
            },
            {
                Album: 'Crowd control',
                LaunchDate: new Date('August 26, 2003'),
                BillboardReview: 68,
                USBillboard200: 84,
                Artist: 'Pablo Cambeiro',
                Songs: [{
                    Number: 1,
                    Title: 'My Bed on My Mind',
                    Released: new Date('25 Mar 2019'),
                    Genre: 'ethno-tunes',
                    Album: 'Crowd control'
                },
                {
                    Number: 2,
                    Title: 'Bright Blues',
                    Released: new Date('28 Sep 2019'),
                    Genre: 'neuro-tunes',
                    Album: 'Crowd control'
                },
                {
                    Number: 3,
                    Title: 'Sail, Sail, Sail!',
                    Released: new Date('5 Mar 2019'),
                    Genre: '*',
                    Album: 'Crowd control'
                },
                {
                    Number: 4,
                    Title: 'Hotel My Bed',
                    Released: new Date('22 Mar 2019'),
                    Genre: '*',
                    Album: 'Crowd control'
                },
                {
                    Number: 5,
                    Title: 'Gonna Make You Mash',
                    Released: new Date('18 May 2019'),
                    Genre: '*',
                    Album: 'Crowd control'
                },
                {
                    Number: 6,
                    Title: 'Straight Outta America',
                    Released: new Date('16 Jan 2020'),
                    Genre: 'hardcore opera',
                    Album: 'Crowd control'
                },
                {
                    Number: 7,
                    Title: 'I Drive',
                    Released: new Date('23 Feb 2019'),
                    Genre: 'emotional C-jam ',
                    Album: 'Crowd control'
                },
                {
                    Number: 8,
                    Title: 'Like a Teddy',
                    Released: new Date('31 Aug 2019'),
                    Genre: '*',
                    Album: 'Crowd control'
                },
                {
                    Number: 9,
                    Title: 'Teddy Boogie',
                    Released: new Date('30 Nov 2019'),
                    Genre: '*',
                    Album: 'Crowd control'
                }]
            }]
    },
    {
        ID: 10,
        Artist: 'Athar Malakooti',
        // Photo: 'assets/images/hgrid/athar.jpg',
        Debut: 2017,
        GrammyNominations: 0,
        GrammyAwards: 0,
        HasGrammyAward: false,
        Albums: [
            {
                Album: 'Pushing up daisies',
                LaunchDate: new Date('February 24, 2016'),
                BillboardReview: 74,
                USBillboard200: 77,
                Artist: 'Athar Malakooti',
                Songs: [{
                    Number: 1,
                    Title: 'Actions',
                    Released: new Date('25 Feb 2016'),
                    Genre: 'ethno-tunes',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 2,
                    Title: 'Blinding lights',
                    Released: new Date('28 Feb 2016'),
                    Genre: 'neuro-tunes',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 3,
                    Title: 'I want more',
                    Released: new Date('5 Mar 2016'),
                    Genre: '*',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 4,
                    Title: 'House by the lake',
                    Released: new Date('22 Mar 2016'),
                    Genre: '*',
                    Album: 'Pushing up daisies'
                }]
            }
        ]
    },
    {
        ID: 11,
        Artist: 'Marti Valencia',
        // Photo: 'assets/images/hgrid/marti.jpg',
        Debut: 2004,
        GrammyNominations: 1,
        GrammyAwards: 1,
        HasGrammyAward: true,
        Tours: [
            {
                Tour: 'Cat eat cat world',
                StartedOn: 'Sep 00',
                Location: 'Worldwide',
                Headliner: 'YES',
                TouredBy: 'Marti Valencia'
            },
            {
                Tour: 'Final straw',
                StartedOn: 'Sep 06',
                Location: 'United States, Europe',
                Headliner: 'NO',
                TouredBy: 'Marti Valencia'
            }],
        Albums: [
            {
                Album: 'Nemesis',
                LaunchDate: new Date('June 30, 2004'),
                BillboardReview: 94,
                USBillboard200: 9,
                Artist: 'Marti Valencia',
                Songs: [{
                    Number: 1,
                    Title: 'Love in motion',
                    Released: new Date('25 Jun 2004'),
                    Genre: 'ethno-tunes',
                    Album: 'Nemesis'
                },
                {
                    Number: 2,
                    Title: 'The picture',
                    Released: new Date('28 Jun 2004'),
                    Genre: 'neuro-tunes',
                    Album: 'Nemesis'
                },
                {
                    Number: 3,
                    Title: 'Flowers',
                    Released: new Date('5 Jul 2004'),
                    Genre: '*',
                    Album: 'Nemesis'
                },
                {
                    Number: 4,
                    Title: 'Regret',
                    Released: new Date('22 Aug 2004'),
                    Genre: 'Heavy metal',
                    Album: 'Nemesis'
                }]
            },
            {
                Album: 'First chance',
                LaunchDate: new Date('January 7, 2019'),
                BillboardReview: 96,
                USBillboard200: 19,
                Artist: 'Marti Valencia',
                Songs: [{
                    Number: 1,
                    Title: 'My Name is Jason',
                    Released: new Date('12 Jul 2019'),
                    Genre: '*',
                    Album: 'First chance'
                },
                {
                    Number: 2,
                    Title: 'Amazing Andy',
                    Released: new Date('5 Mar 2019'),
                    Genre: '*',
                    Album: 'First chance'
                },
                {
                    Number: 3,
                    Title: 'The Number of your Knight',
                    Released: new Date('4 Dec 2019'),
                    Genre: '*',
                    Album: 'First chance'
                },
                {
                    Number: 4,
                    Title: 'I Sail',
                    Released: new Date('3 Mar 2019'),
                    Genre: '*',
                    Album: 'First chance'
                },
                {
                    Number: 5,
                    Title: 'Goody Two Hands',
                    Released: new Date('11 Oct 2019'),
                    Genre: 'Electro house Electropop',
                    Album: 'First chance'
                },
                {
                    Number: 6,
                    Title: 'Careful With That Knife',
                    Released: new Date('18 Dec 2019'),
                    Genre: 'R&B',
                    Album: 'First chance'
                },
                {
                    Number: 7,
                    Title: 'Four Single Ants',
                    Released: new Date('18 Jan 2020'),
                    Genre: '*',
                    Album: 'First chance'
                },
                {
                    Number: 8,
                    Title: 'Kiss Forever',
                    Released: new Date('10 Aug 2019'),
                    Genre: '*',
                    Album: 'First chance'
                },
                {
                    Number: 9,
                    Title: 'Rich\'s Waiting',
                    Released: new Date('15 Mar 2019'),
                    Genre: 'Synth-pop R&B',
                    Album: 'First chance'
                },
                {
                    Number: 10,
                    Title: 'Japan is Your Land',
                    Released: new Date('7 Mar 2019'),
                    Genre: 'ethno-tunes',
                    Album: 'First chance'
                },
                {
                    Number: 11,
                    Title: 'Pencils in My Banana',
                    Released: new Date('21 Jun 2019'),
                    Genre: 'Crunk reggaeton',
                    Album: 'First chance'
                },
                {
                    Number: 12,
                    Title: 'I Sail in Your Arms',
                    Released: new Date('30 Apr 2019'),
                    Genre: 'Synth-pop R&B',
                    Album: 'First chance'
                }]
            },
            {
                Album: 'God\'s advocate',
                LaunchDate: new Date('April 29, 2007'),
                BillboardReview: 66,
                USBillboard200: 37,
                Artist: 'Marti Valencia',
                Songs: [{
                    Number: 1,
                    Title: 'Destiny',
                    Released: new Date('07 May 2007'),
                    Genre: '*',
                    Album: 'God\'s advocate'
                },
                {
                    Number: 2,
                    Title: 'I am the chosen one',
                    Released: new Date('08 May 2007'),
                    Genre: 'Heavy metal',
                    Album: 'God\'s advocate'
                },
                {
                    Number: 3,
                    Title: 'New me',
                    Released: new Date('09 May 2007'),
                    Genre: 'Dance-pop R&B',
                    Album: 'God\'s advocate'
                },
                {
                    Number: 4,
                    Title: 'Miss you',
                    Released: new Date('10 May 2007'),
                    Genre: 'Heavy metal',
                    Album: 'God\'s advocate'
                },
                {
                    Number: 5,
                    Title: 'Turn back the time',
                    Released: new Date('21 May 2007'),
                    Genre: 'Dance-pop EDM',
                    Album: 'God\'s advocate'
                },
                {
                    Number: 6,
                    Title: 'Let us have fun',
                    Released: new Date('01 Jun 2007'),
                    Genre: 'Dance-pop EDM',
                    Album: 'God\'s advocate'
                }]
            }
        ]
    },
    {
        ID: 12,
        Artist: 'Alicia Stanger',
        // Photo: 'assets/images/hgrid/alicia.jpg',
        Debut: 2010,
        GrammyNominations: 1,
        GrammyAwards: 0,
        HasGrammyAward: false,
        Albums: [
            {
                Album: 'Forever alone',
                LaunchDate: new Date('November 3, 2005'),
                BillboardReview: 82,
                USBillboard200: 7,
                Artist: 'Alicia Stanger',
                Songs: [{
                    Number: 1,
                    Title: 'Brothers',
                    Released: new Date('25 Oct 2005'),
                    Genre: 'Hip-hop',
                    Album: 'Forever alone'
                },
                {
                    Number: 2,
                    Title: 'Alone',
                    Released: new Date('28 Oct 2005'),
                    Genre: 'Heavy metal',
                    Album: 'Forever alone'
                },
                {
                    Number: 3,
                    Title: 'I will go on',
                    Released: new Date('5 Nov 2005'),
                    Genre: 'Heavy metal',
                    Album: 'Forever alone'
                },
                {
                    Number: 4,
                    Title: 'Horses',
                    Released: new Date('22 Dec 2005'),
                    Genre: '*',
                    Album: 'Forever alone'
                }]
            }
        ]
    },
    {
        ID: 13,
        Artist: 'Peter Taylor',
        // Photo: 'assets/images/hgrid/peter.jpg',
        Debut: 2005,
        GrammyNominations: 0,
        GrammyAwards: 2,
        HasGrammyAward: true,
        Tours: [
            {
                Tour: 'Love',
                StartedOn: 'Jun 04',
                Location: 'Europe, Asia',
                Headliner: 'YES',
                TouredBy: 'Peter Taylor'
            },
            {
                Tour: 'Fault of treasures',
                StartedOn: 'Oct 13',
                Location: 'North America',
                Headliner: 'NO',
                TouredBy: 'Peter Taylor'
            },
            {
                Tour: 'For eternity',
                StartedOn: 'Mar 05',
                Location: 'United States',
                Headliner: 'YES',
                TouredBy: 'Peter Taylor'
            },
            {
                Tour: 'Time flies',
                StartedOn: 'Jun 03',
                Location: 'North America',
                Headliner: 'NO',
                TouredBy: 'Peter Taylor'
            },
            {
                Tour: 'Highest difficulty',
                StartedOn: 'Nov 01',
                Location: 'Worldwide',
                Headliner: 'YES',
                TouredBy: 'Peter Taylor'
            },
            {
                Tour: 'Sleeping dogs',
                StartedOn: 'May 04',
                Location: 'United States, Europe',
                Headliner: 'NO',
                TouredBy: 'Peter Taylor'
            }
        ],
        Albums: [
            {
                Album: 'Decisions decisions',
                LaunchDate: new Date('April 10, 2008'),
                BillboardReview: 85,
                USBillboard200: 35,
                Artist: 'Peter Taylor',
                Songs: [{
                    Number: 1,
                    Title: 'Now that I am alone',
                    Released: new Date('25 Apr 2008'),
                    Genre: '*',
                    Album: 'Decisions decisions'
                },
                {
                    Number: 2,
                    Title: 'Hopefully',
                    Released: new Date('26 Apr 2008'),
                    Genre: '*',
                    Album: 'Decisions decisions'
                },
                {
                    Number: 3,
                    Title: 'Wonderful life',
                    Released: new Date('5 May 2008'),
                    Genre: '*',
                    Album: 'Decisions decisions'
                },
                {
                    Number: 4,
                    Title: 'Amazing world',
                    Released: new Date('22 Dec 2008'),
                    Genre: '*',
                    Album: 'Decisions decisions'
                }]
            },
            {
                Album: 'Climate changed',
                LaunchDate: new Date('June 20, 2015'),
                BillboardReview: 66,
                USBillboard200: 89,
                Artist: 'Peter Taylor',
                Songs: [{
                    Number: 1,
                    Title: 'This is how I am now',
                    Released: new Date('22 Jun 2015'),
                    Genre: 'Hip-hop',
                    Album: 'Climate changed'
                },
                {
                    Number: 2,
                    Title: 'I feel',
                    Released: new Date('26 Jun 2015'),
                    Genre: 'rap-hop',
                    Album: 'Climate changed'
                },
                {
                    Number: 3,
                    Title: 'Do I want to know',
                    Released: new Date('5 Jul 2015'),
                    Genre: 'rap-hop',
                    Album: 'Climate changed'
                },
                {
                    Number: 4,
                    Title: 'Natural love',
                    Released: new Date('22 Jul 2015'),
                    Genre: '*',
                    Album: 'Climate changed'
                },
                {
                    Number: 5,
                    Title: 'I will help',
                    Released: new Date('22 Jul 2015'),
                    Genre: '*',
                    Album: 'Climate changed'
                },
                {
                    Number: 6,
                    Title: 'No matter what',
                    Released: new Date('22 Jul 2015'),
                    Genre: 'hip-hop',
                    Album: 'Climate changed'
                }]
            }
        ]
    }
];
