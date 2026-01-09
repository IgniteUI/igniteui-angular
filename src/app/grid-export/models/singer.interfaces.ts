export interface ITourPerformance {
    country: string;
    ticketsSold: number;
    attendants: number;
}

export interface ISong {
    number: number;
    title: string;
    released: Date;
    genre: string;
    album: string;
}

export interface ITour {
    tour: string;
    startedOn: Date; 
    location: string;
    headliner: string;
    touredBy: string;
    tourData?: ITourPerformance[]; 
}

export interface IAlbum {
    album: string;
    launchDate: Date;
    billboardReview: number;
    usBillboard200: number;
    artist: string;
    songs?: ISong[];
}

export interface ISinger {
    id: number;
    artist: string;
    photo?: string;
    debut: number;
    grammyNominations: number;
    grammyAwards: number;
    hasGrammyAward: boolean;
    tours?: ITour[];
    albums?: IAlbum[];
}