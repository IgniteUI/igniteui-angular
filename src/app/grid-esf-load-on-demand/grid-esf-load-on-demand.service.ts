const COLUMNS_DATA = [
    {
        field: 'ID',
        values: [
            'ALFKI', 'ANATR', 'ANTON', 'AROUT', 'BERGS', 'BLAUS', 'BLONP', 'BOLID', 'BONAP', 'BOTTM', 'BSBEV',
            'CACTU', 'CENTC', 'CHOPS', 'COMMI', 'CONSH', 'DRACD', 'DUMON', 'EASTC', 'ERNSH', 'FAMIA', 'FISSA',
            'FOLIG', 'FOLKO', 'FRANK', 'FRANR', 'FRANS'
        ]
    },
    {
        field: 'CompanyName',
        values: [
            'Alfreds Futterkiste', 'Ana Trujillo Emparedados y helados', 'Antonio Moreno Taquería', 'Around the Horn',
            'Berglunds snabbköp', 'Blauer See Delikatessen', 'Blondesddsl père et fils', 'Bólido Comidas preparadas',
            'Bon app', 'Bottom-Dollar Markets', 'Beverages', 'Cactus Comidas para llevar', 'Centro comercial Moctezuma',
            'Chop-suey Chinese', 'Comércio Mineiro', 'Consolidated Holdings', 'Drachenblut Delikatessen', 'Du monde entier',
            'Eastern Connection', 'Ernst Handel', 'Familia Arquibaldo', 'FISSA Fabrica Inter. Salchichas S.A.', 'Folies gourmandes',
            'Folk och fä HB', 'Frankenversand', 'France restauration', 'Franchi S.p.A.',
        ]
    },
    {
        field: 'Employees',
        values: [ 68, 47, 16, 71,213, 347, 34, 54, 68, 107, 197, 33, 18, 380,
                  137, 150, 265, 24, 123, 9, 67, 87, 37, 42, 17, 20, 5 ]
    },
    {
        field: 'DateCreated',
        values: [ new Date(2018, 8, 17), new Date(2015, 10, 1), new Date(2016, 5, 5), new Date(2010, 2, 15), new Date(2015, 2, 5),
                  new Date(2016, 7, 1), new Date(2016, 10, 5), new Date(2016, 4, 20), new Date(2018, 3, 5), new Date(2017, 6, 10),
                  new Date(2017, 10, 4), new Date(2014, 5, 12), new Date(2015, 6, 27), new Date(2011, 8, 6), new Date(2012, 6, 10),
                  new Date(2014, 9, 11), new Date(2015, 8, 4), new Date(2013, 4, 18), new Date(2013, 7, 9), new Date(2015, 6, 17),
                  new Date(2017, 3, 15), new Date(2014, 5, 14), new Date(2011, 3, 21), new Date(2010, 7, 24), new Date(2011, 7, 14),
                  new Date(2012, 8, 3),
                  null, undefined
        ]
    },
    {
        field: 'Contract',
        values: [ true, false, null, undefined ]
    }
];

export class GridESFLoadOnDemandService {
    public getData(columnField: string, done: (colVals: any[]) => void) {
        setTimeout(() => {
            const columnData = COLUMNS_DATA.find(c => c.field === columnField);
            const columnValues = columnData ? columnData.values : [];
            done(columnValues);
        }, 1000);
    }
}
