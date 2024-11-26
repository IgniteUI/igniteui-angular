export interface Country {
    Name: string;
}

export interface Region {
    Name: string;
    Countries: Country[];
}
export interface MockFinanceData {
    indGrou?: string;
    indSect?: string;
    indSubg?: string;
    secType?: string;
    cpnTyp?: string;
    issuerN?: string;
    moodys?: string;
    fitch?: string;
    dbrs?: string;
    collatT?: string;
    curncy?: string;
    security?: string;
    sector?: string;
    cusip?: string;
    ticker?: string;
    cpn?: string;
    maturity?: string;
    krD_3YR?: number;
    RISK_COUNTRY?: string;
    MUNI_SECTOR?: string;
    zV_SPREAD?: number;
    kRD_5YR?: number;
    kRD_1YR?: number;
    PD_WALA?: string | null;
}

export interface Stock extends MockFinanceData {
    id?: number;
    category: string;
    type: string;
    spread: number;
    openPrice: number;
    price: number;
    buy: number;
    sell: number;
    change: number;
    changeP: number;
    volume: number;
    highD: number;
    lowD: number;
    highY: number;
    lowY: number;
    startY: number;
    'change On Year(%)': number;
    categories?: Stock[];
    region?: string;
    country?: string;
    settlement?: string;
    contract?: string;
    lastUpdated?: Date;
    openPriceDiff?: number;
    buyDiff?: number;
    sellDiff?: number;
    startYDiff?: number;
    highYDiff?: number;
    lowYDiff?: number;
    highDDiff?: number;
    lowDDiff?: number;
}

export const REGIONS: Region[] = [
    {
        Name: 'North America',
        Countries: [
            { Name: 'Canada' },
            { Name: 'United States' },
            { Name: 'Mexico' }
        ]
    },
    {
        Name: 'Middle East',
        Countries: [
            { Name: 'Turkey' },
            { Name: 'Iraq' },
            { Name: 'Saudi Arabia' },
            { Name: 'Syria' },
            { Name: 'UAE' },
            { Name: 'Israel' },
            { Name: 'Jordan' },
            { Name: 'Lebanon' },
            { Name: 'Oman' },
            { Name: 'Kuwait' },
            { Name: 'Qatar' },
            { Name: 'Bahrain' },
            { Name: 'Iran' }
        ]
    },
    {
        Name: 'Europe',
        Countries: [
            { Name: 'Russia' },
            { Name: 'Germany' },
            { Name: 'France' },
            { Name: 'United Kingdom' },
            { Name: 'Italy' },
            { Name: 'Spain' },
            { Name: 'Poland' },
            { Name: 'Romania' },
            { Name: 'Netherlands' },
            { Name: 'Belgium' },
            { Name: 'Greece' },
            { Name: 'Portugal' },
            { Name: 'Czech Republic' },
            { Name: 'Hungary' },
            { Name: 'Sweden' },
            { Name: 'Austria' },
            { Name: 'Switzerland' },
            { Name: 'Bulgaria' },
            { Name: 'Denmark' },
            { Name: 'Finland' },
            { Name: 'Slovakia' },
            { Name: 'Norway' },
            { Name: 'Ireland' },
            { Name: 'Croatia' },
            { Name: 'Slovenia' },
            { Name: 'Estonia' },
            { Name: 'Iceland' }
        ]
    },
    {
        Name: 'Africa',
        Countries: [
            { Name: 'Nigeria' },
            { Name: 'Ethiopia' },
            { Name: 'Egypt' },
            { Name: 'South Africa' },
            { Name: 'Algeria' },
            { Name: 'Morocco' },
            { Name: 'Cameroon' },
            { Name: 'Niger' },
            { Name: 'Senegal' },
            { Name: 'Tunisia' },
            { Name: 'Libya' }
        ]
    },
    {
        Name: 'Asia Pacific',
        Countries: [
            { Name: 'Afghanistan' },
            { Name: 'Australia' },
            { Name: 'Azerbaijan' },
            { Name: 'China' },
            { Name: 'Hong Kong' },
            { Name: 'India' },
            { Name: 'Indonesia' },
            { Name: 'Japan' },
            { Name: 'Malaysia' },
            { Name: 'New Zealand' },
            { Name: 'Pakistan' },
            { Name: 'Philippines' },
            { Name: 'Korea' },
            { Name: 'Singapore' },
            { Name: 'Taiwan' },
            { Name: 'Thailand' }
        ]
    },
    {
        Name: 'South America',
        Countries: [
            { Name: 'Argentina' },
            { Name: 'Bolivia' },
            { Name: 'Brazil' },
            { Name: 'Chile' },
            { Name: 'Colombia' },
            { Name: 'Ecuador' },
            { Name: 'Guyana' },
            { Name: 'Paraguay' },
            { Name: 'Peru' },
            { Name: 'Suriname' },
            { Name: 'Uruguay' },
            { Name: 'Venezuela' }
        ]
    }
];

export const Dealtype: string[] = [
    'buy', 'sell'
];

export const Contract: string[] = [
    'Forwards', 'Futures', 'Options', 'Swap', 'CFD'
];

export const Settlement: string[] = [
    'Deliverable', 'Cash'
];

export const MOCKFINANCEDATA: MockFinanceData[] = [
    {
        indGrou: 'Airlines',
        indSect: 'Consumer, Cyclical',
        indSubg: 'Airlines',
        secType: 'PUBLIC',
        // tslint:disable-next-line:object-literal-sort-keys
        cpnTyp: 'FIXED',
        issuerN: 'AMERICAN AIRLINES GROUP',
        moodys: 'WR',
        fitch: 'N.A.',
        dbrs: 'N.A.',
        collatT: 'NEW MONEY',
        curncy: 'USD',
        security: '001765866 Pfd',
        sector: 'Pfd',
        cusip: '1765866',
        ticker: 'AAL',
        cpn: '7.875',
        maturity: '7/13/1939',
        krD_3YR: 0.00006,
        RISK_COUNTRY: '',
        MUNI_SECTOR: '',
        zV_SPREAD: 28.302,
        kRD_5YR: 0,
        kRD_1YR: -0.00187,
        PD_WALA: null
    }
];

export const DATA: Stock[] = [
    {
        category: 'Metal',
        type: 'Gold',
        spread: 0.01,
        openPrice: 1281.10,
        price: 1280.7317,
        buy: 1280.7267,
        sell: 1280.7367,
        change: -0.3683,
        changeP: -0.0287,
        volume: 48387,
        highD: 1289.50,
        lowD: 1279.10,
        highY: 1306,
        lowY: 1047.20,
        startY: 1176.60,
        'change On Year(%)': 8.8502
    },
    {
        category: 'Metal',
        type: 'Silver',
        spread: 0.01,
        openPrice: 17.43,
        price: 17.42,
        buy: 17.43,
        sell: 17.43,
        change: -0.01,
        changeP: -0.0574,
        volume: 11720,
        highD: 17.51,
        lowD: 17.37,
        highY: 18.06,
        lowY: 13.73,
        startY: 15.895,
        'change On Year(%)': 9.5942
    },
    {
        category: 'Metal',
        type: 'Copper',
        spread: 0.02,
        openPrice: 2.123,
        price: 2.113,
        buy: 2.123,
        sell: 2.123,
        change: -0.01,
        changeP: -0.471,
        volume: 28819,
        highD: 2.16,
        lowD: 2.11,
        highY: 2.94,
        lowY: 1.96,
        startY: 2.45,
        'change On Year(%)': -13.7551
    },
    {
        category: 'Metal',
        type: 'Platinum',
        spread: 0.01,
        openPrice: 1071.60,
        price: 1071.0993,
        buy: 1071.0943,
        sell: 1071.1043,
        change: -0.5007,
        changeP: -0.0467,
        volume: 3039,
        highD: 1081.20,
        lowD: 1070.50,
        highY: 1120.60,
        lowY: 812.40,
        startY: 966.50,
        'change On Year(%)': 10.8225
    },
    {
        category: 'Metal',
        type: 'Palladium',
        spread: 0.01,
        openPrice: 600.55,
        price: 601.0005,
        buy: 600.9955,
        sell: 601.0055,
        change: 0.4505,
        changeP: 0.075,
        volume: 651,
        highD: 607.20,
        lowD: 598.40,
        highY: 690,
        lowY: 458.6,
        startY: 574.3,
        'change On Year(%)': 4.6492
    },
    {
        category: 'Oil',
        type: 'Oil',
        spread: 0.015,
        openPrice: 45.54,
        price: 45.7899,
        buy: 45.7824,
        sell: 45.7974,
        change: 0.2499,
        changeP: 0.5487,
        volume: 107196,
        highD: 45.94,
        lowD: 45.00,
        highY: 65.28,
        lowY: 30.79,
        startY: 48.035,
        'change On Year(%)': -4.6739
    },
    {
        category: 'Oil',
        type: 'Brent',
        spread: 0.01,
        openPrice: 46.06,
        price: 46.05,
        buy: 46.06,
        sell: 46.06,
        change: -0.01,
        changeP: -0.0217,
        volume: 59818,
        highD: 46.48,
        lowD: 45.60,
        highY: 71.14,
        lowY: 30.02,
        startY: 50.58,
        'change On Year(%)': -8.9561
    },
    {
        category: 'Oil',
        type: 'Natural Gas',
        spread: 0.02,
        openPrice: 2.094,
        price: 2.104,
        buy: 2.094,
        sell: 2.094,
        change: 0.01,
        changeP: 0.4776,
        volume: 2783,
        highD: 2.11,
        lowD: 2.09,
        highY: 3.20,
        lowY: 1.84,
        startY: 2.52,
        'change On Year(%)': -16.5079
    },
    {
        category: 'Oil',
        type: 'RBOB Gas',
        spread: 0.015,
        openPrice: 1.5086,
        price: 1.9532,
        buy: 1.9457,
        sell: 1.9607,
        change: 0.4446,
        changeP: 29.4686,
        volume: 2646,
        highD: 1.9532,
        lowD: 1.50,
        highY: 2.05,
        lowY: 1.15,
        startY: 1.60,
        'change On Year(%)': 22.0727
    },
    {
        category: 'Oil',
        type: 'Diesel',
        spread: 0.015,
        openPrice: 1.3474,
        price: 1.3574,
        buy: 1.3474,
        sell: 1.3474,
        change: 0.01,
        changeP: 0.7422,
        volume: 2971,
        highD: 1.36,
        lowD: 1.34,
        highY: 2.11,
        lowY: 0.92,
        startY: 1.515,
        'change On Year(%)': -10.4026
    },
    {
        category: 'Oil',
        type: 'Ethanol',
        spread: 0.01,
        openPrice: 1.512,
        price: 2.7538,
        buy: 2.7488,
        sell: 2.7588,
        change: 1.2418,
        changeP: 82.1323,
        volume: 14,
        highD: 2.7538,
        lowD: 1.1168,
        highY: 2.7538,
        lowY: 1.1168,
        startY: 1.475,
        'change On Year(%)': 86.7011
    },
    {
        category: 'Oil',
        type: 'Uranium',
        spread: 0.02,
        openPrice: 27.55,
        price: 27.58,
        buy: 27.55,
        sell: 27.55,
        change: 0.03,
        changeP: 0.1089,
        volume: 12,
        highD: 27.55,
        lowD: 27.55,
        highY: 29.32,
        lowY: 21.28,
        startY: 25.30,
        'change On Year(%)': 9.0119
    },
    {
        category: 'Oil',
        type: 'Coal',
        spread: 0.015,
        openPrice: 0.4363,
        price: 0.4163,
        buy: 0.4363,
        sell: 0.4363,
        change: -0.02,
        changeP: -4.584,
        volume: 3,
        highD: 0.4363,
        lowD: 0.4363,
        highY: 0.4841,
        lowY: 0.3954,
        startY: 0.4398,
        'change On Year(%)': -5.3326
    },
    {
        category: 'Agriculture',
        type: 'Wheat',
        spread: 0.01,
        openPrice: 465.50,
        price: 465.52,
        buy: 465.50,
        sell: 465.50,
        change: 0.02,
        changeP: 0.0043,
        volume: 4318,
        highD: 467.00,
        lowD: 463.25,
        highY: 628.50,
        lowY: 449.50,
        startY: 539.00,
        'change On Year(%)': -13.6327
    },
    {
        category: 'Agriculture',
        type: 'Corn',
        spread: 0.01,
        openPrice: 379.50,
        price: 379.8026,
        buy: 379.7976,
        sell: 379.8076,
        change: 0.3026,
        changeP: 0.0797,
        volume: 11266,
        highD: 381.00,
        lowD: 377.75,
        highY: 471.25,
        lowY: 351.25,
        startY: 411.25,
        'change On Year(%)': -7.6468
    },
    {
        category: 'Agriculture',
        type: 'Sugar',
        spread: 0.01,
        openPrice: 15.68,
        price: 14.6742,
        buy: 14.6692,
        sell: 14.6792,
        change: -1.0058,
        changeP: -6.4146,
        volume: 4949,
        highD: 15.70,
        lowD: 14.6742,
        highY: 16.87,
        lowY: 11.37,
        startY: 14.12,
        'change On Year(%)': 3.9249
    },
    {
        category: 'Agriculture',
        type: 'Soybean',
        spread: 0.01,
        openPrice: 1038.00,
        price: 1038.6171,
        buy: 1038.6121,
        sell: 1038.6221,
        change: 0.6171,
        changeP: 0.0595,
        volume: 20356,
        highD: 1044.00,
        lowD: 1031.75,
        highY: 1057.00,
        lowY: 859.50,
        startY: 958.25,
        'change On Year(%)': 8.3869
    },
    {
        category: 'Agriculture',
        type: 'Soy oil',
        spread: 0.01,
        openPrice: 33.26,
        price: 33.7712,
        buy: 33.7662,
        sell: 33.7762,
        change: 0.5112,
        changeP: 1.5371,
        volume: 10592,
        highD: 33.7712,
        lowD: 33.06,
        highY: 35.43,
        lowY: 26.61,
        startY: 31.02,
        'change On Year(%)': 8.8692
    },
    {
        category: 'Agriculture',
        type: 'Soy Meat',
        spread: 0.01,
        openPrice: 342.60,
        price: 342.62,
        buy: 342.60,
        sell: 342.60,
        change: 0.02,
        changeP: 0.0058,
        volume: 5646,
        highD: 345.40,
        lowD: 340.30,
        highY: 353.40,
        lowY: 261.70,
        startY: 307.55,
        'change On Year(%)': 11.403
    },
    {
        category: 'Agriculture',
        type: 'OJ Future',
        spread: 0.01,
        openPrice: 140.60,
        price: 140.1893,
        buy: 140.1843,
        sell: 140.1943,
        change: -0.4107,
        changeP: -0.2921,
        volume: 7,
        highD: 140.1893,
        lowD: 0.00,
        highY: 155.95,
        lowY: 113.00,
        startY: 134.475,
        'change On Year(%)': 4.2493
    },
    {
        category: 'Agriculture',
        type: 'Coffee',
        spread: 0.01,
        openPrice: 125.70,
        price: 125.69,
        buy: 125.70,
        sell: 125.70,
        change: -0.01,
        changeP: -0.008,
        volume: 1654,
        highD: 125.80,
        lowD: 125.00,
        highY: 155.75,
        lowY: 115.35,
        startY: 135.55,
        'change On Year(%)': -7.2741
    },
    {
        category: 'Agriculture',
        type: 'Cocoa',
        spread: 0.01,
        openPrice: 3076.00,
        price: 3076.03,
        buy: 3076.00,
        sell: 3076.00,
        change: 0.03,
        changeP: 0.001,
        volume: 978,
        highD: 3078.00,
        lowD: 3066.00,
        highY: 3406.00,
        lowY: 2746.00,
        startY: 3076.00,
        'change On Year(%)': 0.001
    },
    {
        category: 'Agriculture',
        type: 'Rice',
        spread: 0.01,
        openPrice: 11.245,
        price: 10.4154,
        buy: 10.4104,
        sell: 10.4204,
        change: -0.8296,
        changeP: -7.3779,
        volume: 220,
        highD: 11.38,
        lowD: 10.4154,
        highY: 14.14,
        lowY: 9.70,
        startY: 11.92,
        'change On Year(%)': -12.6228
    },
    {
        category: 'Agriculture',
        type: 'Oats',
        spread: 0.01,
        openPrice: 194.50,
        price: 194.2178,
        buy: 194.2128,
        sell: 194.2228,
        change: -0.2822,
        changeP: -0.1451,
        volume: 64,
        highD: 195.75,
        lowD: 194.00,
        highY: 241.25,
        lowY: 183.75,
        startY: 212.50,
        'change On Year(%)': -8.6034
    },
    {
        category: 'Agriculture',
        type: 'Milk',
        spread: 0.01,
        openPrice: 12.87,
        price: 12.86,
        buy: 12.87,
        sell: 12.87,
        change: -0.01,
        changeP: -0.0777,
        volume: 7,
        highD: 12.89,
        lowD: 12.81,
        highY: 16.96,
        lowY: 12.81,
        startY: 14.885,
        'change On Year(%)': -13.6043
    },
    {
        category: 'Agriculture',
        type: 'Cotton',
        spread: 0.01,
        openPrice: 61.77,
        price: 61.76,
        buy: 61.77,
        sell: 61.77,
        change: -0.01,
        changeP: -0.0162,
        volume: 3612,
        highD: 62.06,
        lowD: 61.32,
        highY: 67.59,
        lowY: 54.33,
        startY: 60.96,
        'change On Year(%)': 1.3123
    },
    {
        category: 'Agriculture',
        type: 'Lumber',
        spread: 0.01,
        openPrice: 303.90,
        price: 304.5994,
        buy: 304.5944,
        sell: 304.6044,
        change: 0.6994,
        changeP: 0.2302,
        volume: 2,
        highD: 304.5994,
        lowD: 303.90,
        highY: 317.10,
        lowY: 236.00,
        startY: 276.55,
        'change On Year(%)': 10.1426
    },
    {
        category: 'Livestock',
        type: 'LV Cattle',
        spread: 0.01,
        openPrice: 120.725,
        price: 120.705,
        buy: 120.725,
        sell: 120.725,
        change: -0.02,
        changeP: -0.0166,
        volume: 4,
        highD: 120.725,
        lowD: 120.725,
        highY: 147.98,
        lowY: 113.90,
        startY: 130.94,
        'change On Year(%)': -7.8166
    },
    {
        category: 'Livestock',
        type: 'FD Cattle',
        spread: 0.01,
        openPrice: 147.175,
        price: 148.6065,
        buy: 148.6015,
        sell: 148.6115,
        change: 1.4315,
        changeP: 0.9727,
        volume: 5,
        highD: 148.6065,
        lowD: 147.175,
        highY: 190.00,
        lowY: 138.10,
        startY: 164.05,
        'change On Year(%)': -9.4139
    },
    {
        category: 'Livestock',
        type: 'Lean Hogs',
        spread: 0.01,
        openPrice: 81.275,
        price: 81.8146,
        buy: 81.8096,
        sell: 81.8196,
        change: 0.5396,
        changeP: 0.664,
        volume: 1,
        highD: 81.8146,
        lowD: 81.275,
        highY: 83.98,
        lowY: 70.25,
        startY: 77.115,
        'change On Year(%)': 6.0943
    },
    {
        category: 'Currencies',
        type: 'USD IDX Future',
        spread: 0.02,
        openPrice: 93.88,
        price: 93.7719,
        buy: 93.7619,
        sell: 93.7819,
        change: -0.1081,
        changeP: -0.1151,
        volume: 5788,
        highD: 94.05,
        lowD: 93.7534,
        highY: 100.70,
        lowY: 91.88,
        startY: 96.29,
        'change On Year(%)': -2.6151
    },
    {
        category: 'Currencies',
        type: 'USD/JPY Future',
        spread: 0.02,
        openPrice: 9275.50,
        price: 9277.3342,
        buy: 9277.3242,
        sell: 9277.3442,
        change: 1.8342,
        changeP: 0.0198,
        volume: 47734,
        highD: 9277.3342,
        lowD: 0.93,
        highY: 9483.00,
        lowY: 0.93,
        startY: 4741.965,
        'change On Year(%)': 95.6432
    },
    {
        category: 'Currencies',
        type: 'GBP/USD Future',
        spread: 0.02,
        openPrice: 1.4464,
        price: 1.1941,
        buy: 1.1841,
        sell: 1.2041,
        change: -0.2523,
        changeP: -17.4441,
        volume: 29450,
        highD: 1.45,
        lowD: 1.1941,
        highY: 1.59,
        lowY: 1.1941,
        startY: 1.485,
        'change On Year(%)': -19.59
    },
    {
        category: 'Currencies',
        type: 'AUD/USD Future',
        spread: 0.02,
        openPrice: 0.7344,
        price: 0.7444,
        buy: 0.7344,
        sell: 0.7344,
        change: 0.01,
        changeP: 1.3617,
        volume: 36764,
        highD: 0.74,
        lowD: 0.73,
        highY: 0.79,
        lowY: 0.68,
        startY: 0.735,
        'change On Year(%)': 1.2789
    },
    {
        category: 'Currencies',
        type: 'USD/CAD Future',
        spread: 0.02,
        openPrice: 0.7744,
        price: 0.9545,
        buy: 0.9445,
        sell: 0.9645,
        change: 0.1801,
        changeP: 23.2622,
        volume: 13669,
        highD: 0.9545,
        lowD: 0.77,
        highY: 0.9545,
        lowY: 0.68,
        startY: 0.755,
        'change On Year(%)': 26.4295
    },
    {
        category: 'Currencies',
        type: 'USD/CHF Future',
        spread: 0.02,
        openPrice: 1.0337,
        price: 1.0437,
        buy: 1.0337,
        sell: 1.0337,
        change: 0.01,
        changeP: 0.9674,
        volume: 5550,
        highD: 1.03,
        lowD: 1.03,
        highY: 1.11,
        lowY: 0.98,
        startY: 1.045,
        'change On Year(%)': -0.1244
    },
    {
        category: 'Index',
        type: 'DOW Future',
        spread: 0.01,
        openPrice: 17711.00,
        price: 17712.1515,
        buy: 17712.1465,
        sell: 17712.1565,
        change: 1.1515,
        changeP: 0.0065,
        volume: 22236,
        highD: 17727.00,
        lowD: 17642.00,
        highY: 18083.00,
        lowY: 15299.00,
        startY: 16691.00,
        'change On Year(%)': 6.118
    },
    {
        category: 'Index',
        type: 'S&P Future',
        spread: 0.01,
        openPrice: 2057.50,
        price: 2056.6018,
        buy: 2056.5968,
        sell: 2056.6068,
        change: -0.8982,
        changeP: -0.0437,
        volume: 142780,
        highD: 2059.50,
        lowD: 2049.00,
        highY: 2105.50,
        lowY: 1794.50,
        startY: 1950.00,
        'change On Year(%)': 5.4668
    },
    {
        category: 'Index',
        type: 'NAS Future',
        spread: 0.01,
        openPrice: 4341.25,
        price: 4341.28,
        buy: 4341.25,
        sell: 4341.25,
        change: 0.03,
        changeP: 0.0007,
        volume: 18259,
        highD: 4347.00,
        lowD: 4318.00,
        highY: 4719.75,
        lowY: 3867.75,
        startY: 4293.75,
        'change On Year(%)': 1.107
    },
    {
        category: 'Index',
        type: 'S&P MID MINI',
        spread: 0.01,
        openPrice: 1454.30,
        price: 1455.7812,
        buy: 1455.7762,
        sell: 1455.7862,
        change: 1.4812,
        changeP: 0.1018,
        volume: 338,
        highD: 1455.7812,
        lowD: 1448.00,
        highY: 1527.30,
        lowY: 1236.00,
        startY: 1381.65,
        'change On Year(%)': 5.3654
    },
    {
        category: 'Index',
        type: 'S&P 600 MINI',
        spread: 0.01,
        openPrice: 687.90,
        price: 687.88,
        buy: 687.90,
        sell: 687.90,
        change: -0.02,
        changeP: -0.0029,
        volume: 0,
        highD: 0.00,
        lowD: 0.00,
        highY: 620.32,
        lowY: 595.90,
        startY: 608.11,
        'change On Year(%)': 13.1177
    },
    {
        category: 'Interest Rate',
        type: 'US 30YR Future',
        spread: 0.01,
        openPrice: 164.875,
        price: 164.1582,
        buy: 164.1532,
        sell: 164.1632,
        change: -0.7168,
        changeP: -0.4347,
        volume: 28012,
        highD: 165.25,
        lowD: 164.0385,
        highY: 169.38,
        lowY: 151.47,
        startY: 160.425,
        'change On Year(%)': 2.3271
    },
    {
        category: 'Interest Rate',
        type: 'US 2Y Future',
        spread: 0.01,
        openPrice: 109.3984,
        price: 109.3884,
        buy: 109.3984,
        sell: 109.3984,
        change: -0.01,
        changeP: -0.0091,
        volume: 17742,
        highD: 109.41,
        lowD: 109.38,
        highY: 109.80,
        lowY: 108.62,
        startY: 109.21,
        'change On Year(%)': 0.1634
    },
    {
        category: 'Interest Rate',
        type: 'US 10YR Future',
        spread: 0.01,
        openPrice: 130.5625,
        price: 130.5825,
        buy: 130.5625,
        sell: 130.5625,
        change: 0.02,
        changeP: 0.0153,
        volume: 189310,
        highD: 130.63,
        lowD: 130.44,
        highY: 132.64,
        lowY: 125.48,
        startY: 129.06,
        'change On Year(%)': 1.1797
    },
    {
        category: 'Interest Rate',
        type: 'Euro$ 3M',
        spread: 0.01,
        openPrice: 99.18,
        price: 99.17,
        buy: 99.18,
        sell: 99.18,
        change: -0.01,
        changeP: -0.0101,
        volume: 29509,
        highD: 99.18,
        lowD: 99.17,
        highY: 99.38,
        lowY: 98.41,
        startY: 98.895,
        'change On Year(%)': 0.2781
    }
];
export class FinancialData {
    public static generateData(count: number): Stock[] {
        const currData: Stock[] = [];
        for (let i = 0; i < count; i++) {
            const rand = Math.floor(Math.random() * Math.floor(DATA.length));
            const dataObj: Stock = Object.assign({}, DATA[rand]);

            dataObj.settlement = Settlement[this.generateRandomNumber(0, 1)];
            dataObj.contract = Contract[this.generateRandomNumber(0, 4)];
            dataObj.lastUpdated = this.randomizeDate();
            dataObj.openPriceDiff = (((dataObj['openPrice'] - dataObj['price']) / dataObj['price']) * 100) * 150;
            dataObj.buyDiff = (((dataObj.buy - dataObj.price) / dataObj.price) * 100) * 150;
            dataObj.sellDiff = (((dataObj.sell - dataObj.price) / dataObj.price) * 100) * 150;
            dataObj.startYDiff = (((dataObj.startY - dataObj.price) / dataObj.price) * 100) * 150;
            dataObj.highYDiff = (((dataObj.highY - dataObj.price) / dataObj.price) * 100) * 150;
            dataObj.lowYDiff = (((dataObj.lowY - dataObj.price) / dataObj.price) * 100) * 150;
            dataObj.highDDiff = (((dataObj.highD - dataObj.price) / dataObj.price) * 100) * 150;
            dataObj.lowDDiff = (((dataObj.lowD - dataObj.price) / dataObj.price) * 100) * 150;

            const region: Region = REGIONS[this.generateRandomNumber(0, 5)];
            dataObj.region = region.Name;
            dataObj.country = this.randomizeCountry(region).Name;

            for (const mockData of MOCKFINANCEDATA) {
                Object.assign(dataObj, mockData);
            }

            dataObj.id = i;
            this.randomizeObjectData(dataObj);
            currData.push(dataObj);
        }
        return currData;
    }

    public static generateHierarchicalData(count: number): Stock[] {
        const currData = [];
        for (let i = 0; i < DATA.length; i++) {
            DATA[i].id = 10 + i;
        }

        for (let i = 0; i < Contract.length; i++) {
            const rand = Math.floor(Math.random() * Math.floor(DATA.length));
            const dataObj = Object.assign({}, DATA[rand]);
            dataObj.category = Contract[i];
            dataObj.categories = [];
            dataObj.id = i * count;

            // add second level of hierarchical data
            const childData = this.addHierarchicalData(count / 4, i, dataObj.id);
            for (const childDataObj of childData) {
                childDataObj.categories = this.addHierarchicalData(childData.length / 4, i, childDataObj.id, 4);
            }

            // add level of hierarchical data
            dataObj.categories = childData;

            this.addMockData(dataObj);
            currData.push(dataObj);
        }

        return currData;
    }

    public static updateAllPrices(data: Stock[]): Stock[] {
        for (const dataRow of data) {
            this.randomizeObjectData(dataRow);
        }
        return Array.from(data);
    }

    public static updateRandomPrices(data: Stock[]): Stock[] {
        const currData = data.slice(0, data.length + 1);
        for (let i = 0; i < 30; i++) {
            const random = Math.round(Math.random() * data.length);
            const dataObj = Object.assign({}, data[random]);
            this.randomizeObjectData(dataObj);
            currData[random] = dataObj;
        }
        // return {data: currData, recordsUpdated: y };
        return currData;
    }

    private static addMockData(dataObj: Stock): void {
        for (const mockData of MOCKFINANCEDATA) {
            Object.assign(dataObj, mockData);
        }
    }

    private static addHierarchicalData(count: number, i: number, parentRowId: number, toAdd?: number): Stock[] {
        const childData: Stock[] = [];
        const numberToAdd = toAdd ?? Math.round(count / Contract.length);
        for (let y = 0; y < numberToAdd; y++) {
            const rand = Math.floor(Math.random() * Math.floor(DATA.length));
            const childDataObj = Object.assign({}, DATA[rand]);
            childDataObj.id = parentRowId * 10 + y + 1;
            this.randomizeObjectData(childDataObj);
            this.addMockData(childDataObj);
            childData.push(childDataObj);
        }
        return childData;
    }

    private static randomizeObjectData(dataObj: Stock): void {
        const res = this.generateNewPrice(dataObj.price);
        dataObj.change = res.price - dataObj.price;
        dataObj.price = res.price;
        dataObj.changeP = res.changePercent;
    }

    private static generateNewPrice(oldPrice: number): { price: number; changePercent: number } {
        const rnd = parseFloat(Math.random().toFixed(2));
        const volatility = 2;
        let newPrice = 0;

        let changePercent = 2 * volatility * rnd;
        if (changePercent > volatility) {
            changePercent -= (2 * volatility);
        }

        const changeAmount = oldPrice * (changePercent / 100);
        newPrice = oldPrice + changeAmount;

        const result = { price: 0, changePercent: 0 };
        result.price = parseFloat(newPrice.toFixed(2));
        result.changePercent = parseFloat(changePercent.toFixed(2));

        return result;
    }

    private static generateRandomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private static randomizeCountry(region: Region): Country {
        let country!: Country;
        switch (region.Name) {
            case 'North America': {
                country = region.Countries[this.generateRandomNumber(0, 2)];
                break;
            }
            case 'South America': {
                country = region.Countries[this.generateRandomNumber(0, 11)];
                break;
            }
            case 'Europe': {
                country = region.Countries[this.generateRandomNumber(0, 26)];
                break;
            }
            case 'Asia Pacific': {
                country = region.Countries[this.generateRandomNumber(0, 15)];
                break;
            }
            case 'Africa': {
                country = region.Countries[this.generateRandomNumber(0, 10)];
                break;
            }
            case 'Middle East': {
                country = region.Countries[this.generateRandomNumber(0, 12)];
                break;
            }
        }
        return country;
    }

    private static randomizeDate(): Date {
        const date = new Date();
        date.setHours(this.generateRandomNumber(0, 23));
        date.setMonth(this.generateRandomNumber(0, date.getMonth()));
        date.setDate(this.generateRandomNumber(0, 23));
        return date;
    }
}
