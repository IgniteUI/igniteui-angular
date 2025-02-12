import { Calendar } from '../calendar/calendar';
import { cloneValue } from '../core/utils';
import { ValueData } from '../services/excel/test-data.service.spec';

export class SampleTestData {

    public static timeGenerator: Calendar = new Calendar();
    public static today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
    public static todayFullDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 10,  15, 35);

    public static stringArray = () => ([
        'Terrance Orta',
        'Richard Mahoney LongerName',
        'Donna Price',
        'Lisa Landers',
        'Dorothy H. Spencer'
    ]);

    public static numbersArray = () => ([
        10,
        20,
        30
    ]);

    public static dateArray = () => ([
        new Date('2018'),
        new Date(2018, 3, 23),
        new Date(30),
        new Date('2018/03/23')
    ]);

    public static excelDateArray = () => ([
        new Date(2018, 3, 23),
        new Date('2018/03/23')
    ]);

    public static emptyObjectData = () => ([
        {},
        {},
        {}
    ]);

    public static noHeadersObjectArray = () => ([
        new ValueData('1'),
        new ValueData('2'),
        new ValueData('3')
    ]);

    public static oneItemNumberData = () => ([{ index: 1, value: 1 }]);

    /* Fields: index: number, value: number; 2 items. */
    public static numberDataTwoFields = () => ([
        { index: 1, value: 1 },
        { index: 2, value: 2 }
    ]);

    /* Fields: index: number, value: number, other: number, another: number; 2 items. */
    public static numberDataFourFields = () => ([
        { index: 1, value: 1, other: 1, another: 1 },
        { index: 2, value: 2, other: 2, another: 2 }
    ]);

    /* Fields: Number: number, String: string, Boolean: boolean; Date: date; 3 items. */
    public static differentTypesData = () => ([
        { Number: 1, String: '1', Boolean: true, Date: new Date(2018, 3, 3) },
        { Number: 2, String: '2', Boolean: false, Date: new Date(2018, 5, 6) },
        { Number: 3, String: '3', Boolean: true, Date: new Date(2018, 9, 22) }
    ]);

    /* Fields: Number: number; 3 items. */
    public static numericData = () => ([
        { Number: -1 },
        { Number: 2.5 },
        { Number: -0.5 }
    ]);

    /* Fields: Name: string, Avatar: string; 3 items. */
    public static personAvatarData = () => ([
        {
            Name: 'Person 1',
            Avatar: 'https://randomuser.me/api/portraits/men/43.jpg'
        },
        {
            Name: 'Person 2',
            Avatar: 'https://randomuser.me/api/portraits/women/66.jpg'
        },
        {
            Name: 'Person 3',
            Avatar: 'https://randomuser.me/api/portraits/men/92.jpg'
        }
    ]);

    /* Fields: name: string, phone: string; 5 items. */
    public static contactsData = () => ([
        {
            name: 'Terrance Orta',
            phone: '770-504-2217'
        }, {
            name: 'Richard Mahoney LongerName',
            phone: ''
        }, {
            name: 'Donna Price',
            phone: '859-496-2817'
        }, {
            name: '',
            phone: '901-747-3428'
        }, {
            name: 'Dorothy H. Spencer',
            phone: '573-394-9254'
        }
    ]);

    /* Fields: name: string, phone: string; 6 items. Remarks: Contains special and cyrilic characters. */
    public static contactsFunkyData = () => ([
        {
            name: 'Terrance Mc\'Orta',
            phone: '(+359)770-504-2217 | 2218'
        }, {
            name: 'Richard Mahoney /LongerName/',
            phone: ''
        }, {
            name: 'Donna, \/; Price',
            phone: '859 496 28**'
        }, {
            name: '\r\n',
            phone: '901-747-3428'
        }, {
            name: 'Dorothy "H." Spencer',
            phone: '573-394-9254[fax]'
        }, {
            name: 'Иван Иванов (1,2)',
            phone: '№ 573-394-9254'
        }
    ]);

    /* Fields: name: string, phone: string; 3 items. Remarks: Contains records without values for one of the fields. */
    public static contactsDataPartial = () => ([
        {
            name: 'Terrance Orta',
            phone: '770-504-2217'
        }, {
            name: 'Richard Mahoney LongerName'
        }, {
            phone: '780-555-1331'
        }
    ]);

    /* Data fields: ID: number, Name: string; 3 items. */
    public static personIDNameData = () => ([
        { ID: 1, IsEmployed: true, Name: 'Johny' },
        { ID: 2, IsEmployed: true, Name: 'Sally' },
        { ID: 3, IsEmployed: false, Name: 'Tim' },
    ]);

    /* Data fields: FirstName: string, LastName: string, age:number; 3 items. */
    public static personNameAgeData = () => ([
        { FirstName: 'John', LastName: 'Brown', age: 20 },
        { FirstName: 'Ben', LastName: 'Affleck', age: 30 },
        { FirstName: 'Tom', LastName: 'Riddle', age: 50 }
    ]);

    /* Data fields: ID: number, Name: string, LastName: string, Region: string; 7 items. */
    public static personIDNameRegionData = () => ([
        { ID: 2, Name: 'Jane', LastName: 'Brown', Region: 'AD' },
        { ID: 1, Name: 'Brad', LastName: 'Williams', Region: 'BD' },
        { ID: 6, Name: 'Rick', LastName: 'Jones', Region: 'ACD' },
        { ID: 7, Name: 'Rick', LastName: 'BRown', Region: 'DD' },
        { ID: 5, Name: 'ALex', LastName: 'Smith', Region: 'MlDs' },
        { ID: 4, Name: 'Alex', LastName: 'Wilson', Region: 'DC' },
        { ID: 3, Name: 'Connor', LastName: 'Walker', Region: 'OC' }
    ]);

    /* Data fields: ID: number, Name: string, JobTitle: string, HireDate: string; 10 items, sorted by ID. */
    public static personJobDataFull = () => ([
        { ID: 1, Name: 'Casey Houston', JobTitle: 'Vice President', HireDate: '2017-06-19T11:43:07.714Z' },
        { ID: 2, Name: 'Gilberto Todd', JobTitle: 'Director', HireDate: '2015-12-18T11:23:17.714Z' },
        { ID: 3, Name: 'Tanya Bennett', JobTitle: 'Director', HireDate: '2005-11-18T11:23:17.714Z' },
        { ID: 4, Name: 'Jack Simon', JobTitle: 'Software Developer', HireDate: '2008-12-18T11:23:17.714Z' },
        { ID: 5, Name: 'Celia Martinez', JobTitle: 'Senior Software Developer', HireDate: '2007-12-19T11:23:17.714Z' },
        { ID: 6, Name: 'Erma Walsh', JobTitle: 'CEO', HireDate: '2016-12-18T11:23:17.714Z' },
        { ID: 7, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', HireDate: '2005-11-19T11:23:17.714Z' },
        { ID: 8, Name: 'Erika Wells', JobTitle: 'Software Development Team Lead', HireDate: '2005-10-14T11:23:17.714Z' },
        { ID: 9, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', HireDate: '2013-10-10T11:23:17.714Z' },
        { ID: 10, Name: 'Eduardo Ramirez', JobTitle: 'Manager', HireDate: '2011-11-28T11:23:17.714Z' }
    ]);

    /* Data fields: ID: number, Name: string, JobTitle: string, WokingHours: number, HireDate: string, Performance: array;
       3 items, sorted by ID. */
    public static personJobHoursDataPerformance = () => ([
        { ID: 1, Name: 'Casey Houston', JobTitle: 'Vice President', WorkingHours: 4, HireDate: '2017-06-19T11:43:07.714Z', Performance:
            [
                {Points: 3, Week: 1},
                {Points: 6, Week: 2},
                {Points: 1, Week: 3},
                {Points: 12, Week: 4}
            ]
        },
        { ID: 2, Name: 'Gilberto Todd', JobTitle: 'Director', WorkingHours: 6, HireDate: '2015-12-18T11:23:17.714Z', Performance:
            [
                {Points: 8, Week: 1},
                {Points: 7, Week: 2},
                {Points: 4, Week: 3},
                {Points: 9, Week: 4}
            ]
        },
        { ID: 3, Name: 'Tanya Bennett', JobTitle: 'Director', WorkingHours: 8, HireDate: '2005-11-18T11:23:17.714Z', Performance:
            [
                {Points: 1, Week: 1},
                {Points: 3, Week: 2},
                {Points: 14, Week: 3},
                {Points: 29, Week: 4}
            ]
        }
    ]);

    public static hireDate = () => ([
        { ID: 1, HireDate: new Date(2008, 3, 20).toISOString() },
        { ID: 2, HireDate: new Date(2015, 11, 8) },
        { ID: 3, HireDate: new Date(2012, 6, 30).toISOString() },
        { ID: 4, HireDate: new Date(2010, 1, 5).toISOString() },
        { ID: 5, HireDate: new Date(2020, 4, 17).toISOString() },
    ]);

    /* Data fields: Name: string, BirthDate: date, LastLogin: dateTime, MeetingTime: time, AttendanceRate: percent; 5 items. */
    public static personMeetingData = () => ([
        { Name: 'Casey Houston', BirthDate: new Date(1990, 2, 14), LastLogin: new Date(2023, 3, 28).setHours(13, 12, 36), MeetingTime: new Date(2023, 6, 7).setHours(10, 30, 1), AttendanceRate: 0.78 },
        { Name: 'Gilberto Todd', BirthDate: new Date(1985, 4, 17), LastLogin: new Date(2023, 3, 14).setHours(14, 25, 23), MeetingTime: new Date(2023, 6, 7).setHours(9, 35, 31), AttendanceRate: 0.46 },
        { Name: 'Tanya Bennett', BirthDate: new Date(1987, 6, 19), LastLogin: new Date(2023, 2, 23).setHours(19, 7, 13), MeetingTime: new Date(2023, 6, 7).setHours(13, 10, 36), AttendanceRate: 0.289 },
        { Name: 'Jack Simon', BirthDate: new Date(1995, 8, 23), LastLogin: new Date(2023, 1, 27).setHours(17, 17, 41), MeetingTime: new Date(2023, 6, 7).setHours(14, 50, 47), AttendanceRate: 1 },
        { Name: 'Celia Martinez', BirthDate: new Date(1994, 10, 27), LastLogin: new Date(2023, 2, 14).setHours(1, 31, 49), MeetingTime: new Date(2023, 6, 7).setHours(7, 0, 17), AttendanceRate: 0.384}
    ]);

    /* Data fields: ID: number, Name: string, JobTitle: string; 10 items, sorted by ID. */
    public static personJobData = () => ([
        { ID: 1, Name: 'Casey Houston', JobTitle: 'Vice President' },
        { ID: 2, Name: 'Gilberto Todd', JobTitle: 'Director' },
        { ID: 3, Name: 'Tanya Bennett', JobTitle: 'Director' },
        { ID: 4, Name: 'Jack Simon', JobTitle: 'Software Developer' },
        { ID: 5, Name: 'Celia Martinez', JobTitle: 'Senior Software Developer' },
        { ID: 6, Name: 'Erma Walsh', JobTitle: 'CEO' },
        { ID: 7, Name: 'Debra Morton', JobTitle: 'Associate Software Developer' },
        { ID: 8, Name: 'Erika Wells', JobTitle: 'Software Development Team Lead' },
        { ID: 9, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer' },
        { ID: 10, Name: 'Eduardo Ramirez', JobTitle: 'Manager' }
    ]);

    /* Data fields: ID: number, Name: string, JobTitle: string, Company: string; 10 items, sorted by ID. */
    public static personIDNameJobCompany = () => ([
        { ID: 1, Name: 'Casey Houston', JobTitle: 'Vice President', Company: 'Company A' },
        { ID: 2, Name: 'Gilberto Todd', JobTitle: 'Director', Company: 'Company C' },
        { ID: 3, Name: 'Tanya Bennett', JobTitle: 'Director', Company: 'Company A' },
        { ID: 4, Name: 'Jack Simon', JobTitle: 'Software Developer', Company: 'Company D' },
        { ID: 5, Name: 'Celia Martinez', JobTitle: 'Senior Software DEVELOPER', Company: 'Company B' },
        { ID: 6, Name: 'Erma Walsh', JobTitle: 'CEO', Company: 'Company C' },
        { ID: 7, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', Company: 'Company B' },
        { ID: 8, Name: 'Erika Wells', JobTitle: 'Software Development Team Lead', Company: 'Company A' },
        { ID: 9, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', Company: 'Company D' },
        { ID: 10, Name: 'Eduardo Ramirez', JobTitle: 'Manager', Company: 'Company E' }
    ]);

    /* Data fields: ID: number, Name: Object{FirstName: string, LastName: string },
    JobTitle: string, Company: string; 10 items, sorted by ID. */
    public static personNameObjectJobCompany = () => ([
        { ID: 1, Name: { FirstName: 'Casey', LastName: 'Houston' }, JobTitle: 'Vice President', Company: 'Company A' },
        { ID: 2, Name: { FirstName: 'Gilberto', LastName: 'Todd' } , JobTitle: 'Director', Company: 'Company C' },
        { ID: 3, Name: { FirstName: 'Tanya', LastName: 'Bennett' } , JobTitle: 'Director', Company: 'Company A' },
        { ID: 4, Name: { FirstName: 'Jack', LastName: 'Simon' }, JobTitle: 'Software Developer', Company: 'Company D' },
        { ID: 5, Name: { FirstName: 'Celia', LastName: 'Martinez' }, JobTitle: 'Senior Software DEVELOPER', Company: 'Company B' },
        { ID: 6, Name: { FirstName: 'Erma', LastName: 'Walsh' }, JobTitle: 'CEO', Company: 'Company C' },
        { ID: 7, Name: { FirstName: 'Debra', LastName: 'Morton' } , JobTitle: 'Associate Software Developer', Company: 'Company B' },
        { ID: 8, Name: { FirstName: 'Erika', LastName: 'Wells' } , JobTitle: 'Software Development Team Lead', Company: 'Company A' },
        { ID: 9, Name: { FirstName: 'Leslie', LastName: 'Hansen' } , JobTitle: 'Associate Software Developer', Company: 'Company D' },
        { ID: 10, Name: { FirstName: 'Eduardo', LastName: 'Ramirez' }, JobTitle: 'Manager', Company: 'Company E' }
    ]);
    /* Data fields: ID: number, CompanyName: string, ContactName: string, ContactTitle: string, Address: string,
        City: string, Region: string, PostalCode: string, Country: string, Phone: string, Fax: string;
        11 items, sorted by ID. */
    public static contactInfoData = () => ([
        {
            ID: 'ALFKI',
            CompanyName: 'Alfreds Futterkiste',
            ContactName: 'Maria Anders',
            ContactTitle: 'Sales Representative',
            Address: 'Obere Str. 57',
            City: 'Berlin',
            Region: null,
            PostalCode: '12209',
            Country: 'Germany',
            Phone: '030-0074321',
            Fax: '030-0076545'
        },
        {
            ID: 'ANATR',
            CompanyName: 'Ana Trujillo Emparedados y helados',
            ContactName: 'Ana Trujillo',
            ContactTitle: 'Owner',
            Address: 'Avda. de la Constitución 2222',
            City: 'México D.F.',
            Region: null,
            PostalCode: '05021',
            Country: 'Mexico',
            Phone: '(5) 555-4729',
            Fax: '(5) 555-3745'
        },
        {
            ID: 'ANTON',
            CompanyName: 'Antonio Moreno Taquería',
            ContactName: 'Antonio Moreno',
            ContactTitle: 'Owner',
            Address: 'Mataderos 2312',
            City: 'México D.F.',
            Region: null,
            PostalCode: '05023',
            Country: 'Mexico',
            Phone: '(5) 555-3932',
            Fax: null
        },
        {
            ID: 'AROUT',
            CompanyName: 'Around the Horn',
            ContactName: 'Thomas Hardy',
            ContactTitle: 'Sales Representative',
            Address: '120 Hanover Sq.',
            City: 'London',
            Region: null,
            PostalCode: 'WA1 1DP',
            Country: 'UK',
            Phone: '(171) 555-7788',
            Fax: '(171) 555-6750'
        },
        {
            ID: 'BERGS',
            CompanyName: 'Berglunds snabbköp',
            ContactName: 'Christina Berglund',
            ContactTitle: 'Order Administrator',
            Address: 'Berguvsvägen 8',
            City: 'Luleå',
            Region: null,
            PostalCode: 'S-958 22',
            Country: 'Sweden',
            Phone: '0921-12 34 65',
            Fax: '0921-12 34 67'
        },
        {
            ID: 'BLAUS',
            CompanyName: 'Blauer See Delikatessen',
            ContactName: 'Hanna Moos',
            ContactTitle: 'Sales Representative',
            Address: 'Forsterstr. 57',
            City: 'Mannheim',
            Region: null,
            PostalCode: '68306',
            Country: 'Germany',
            Phone: '0621-08460',
            Fax: '0621-08924'
        },
        {
            ID: 'BLONP',
            CompanyName: 'Blondesddsl père et fils',
            ContactName: 'Frédérique Citeaux',
            ContactTitle: 'Marketing Manager',
            Address: '24, place Kléber',
            City: 'Strasbourg',
            Region: null,
            PostalCode: '67000',
            Country: 'France',
            Phone: '88.60.15.31',
            Fax: '88.60.15.32'
        },
        {
            ID: 'BOLID',
            CompanyName: 'Bólido Comidas preparadas',
            ContactName: 'Martín Sommer',
            ContactTitle: 'Owner',
            Address: 'C/ Araquil, 67',
            City: 'Madrid',
            Region: null,
            PostalCode: '28023',
            Country: 'Spain',
            Phone: '(91) 555 22 82',
            Fax: '(91) 555 91 99'
        },
        {
            ID: 'BONAP',
            CompanyName: 'Bon app\'',
            ContactName: 'Laurence Lebihan',
            ContactTitle: 'Owner',
            Address: '12, rue des Bouchers',
            City: 'Marseille',
            Region: null,
            PostalCode: '13008',
            Country: 'France',
            Phone: '91.24.45.40',
            Fax: '91.24.45.41'
        },
        {
            ID: 'BOTTM',
            CompanyName: 'Bottom-Dollar Markets',
            ContactName: 'Elizabeth Lincoln',
            ContactTitle: 'Accounting Manager',
            Address: '23 Tsawassen Blvd.',
            City: 'Tsawassen',
            Region: 'BC',
            PostalCode: 'T2F 8M4',
            Country: 'Canada',
            Phone: '(604) 555-4729',
            Fax: '(604) 555-3745'
        },
        {
            ID: 'BSBEV',
            CompanyName: 'B\'s Beverages',
            ContactName: 'Victoria Ashworth',
            ContactTitle: 'Sales Representative',
            Address: 'Fauntleroy Circus', City: 'London',
            Region: null, PostalCode: 'EC2 5NT',
            Country: 'UK',
            Phone: '(171) 555-1212',
            Fax: null
        }
    ]);

    /* Data fields: ID: number, CompanyName: string, ContactName: string, ContactTitle: string, Address: string,
        City: string, Region: string, PostalCode: string, Country: string, Phone: string, Fax: string;
        27 items, sorted by ID. */

    public static contactInfoDataFull = () => ([
        { ID: 'ALFKI', CompanyName: 'Alfreds Futterkiste', ContactName: 'Maria Anders', ContactTitle: 'Sales Representative', Address: 'Obere Str. 57', City: 'Berlin', Region: null, PostalCode: '12209', Country: 'Germany', Phone: '030-0074321', Fax: '030-0076545' },
        { ID: 'ANATR', CompanyName: 'Ana Trujillo Emparedados y helados', ContactName: 'Ana Trujillo', ContactTitle: 'Owner', Address: 'Avda. de la Constitución 2222', City: 'México D.F.', Region: null, PostalCode: '05021', Country: 'Mexico', Phone: '(5) 555-4729', Fax: '(5) 555-3745' },
        { ID: 'ANTON', CompanyName: 'Antonio Moreno Taquería', ContactName: 'Antonio Moreno', ContactTitle: 'Owner', Address: 'Mataderos 2312', City: 'México D.F.', Region: null, PostalCode: '05023', Country: 'Mexico', Phone: '(5) 555-3932', Fax: null },
        { ID: 'AROUT', CompanyName: 'Around the Horn', ContactName: 'Thomas Hardy', ContactTitle: 'Sales Representative', Address: '120 Hanover Sq.', City: 'London', Region: null, PostalCode: 'WA1 1DP', Country: 'UK', Phone: '(171) 555-7788', Fax: '(171) 555-6750' },
        { ID: 'BERGS', CompanyName: 'Berglunds snabbköp', ContactName: 'Christina Berglund', ContactTitle: 'Order Administrator', Address: 'Berguvsvägen 8', City: 'Luleå', Region: null, PostalCode: 'S-958 22', Country: 'Sweden', Phone: '0921-12 34 65', Fax: '0921-12 34 67' },
        { ID: 'BLAUS', CompanyName: 'Blauer See Delikatessen', ContactName: 'Hanna Moos', ContactTitle: 'Sales Representative', Address: 'Forsterstr. 57', City: 'Mannheim', Region: null, PostalCode: '68306', Country: 'Germany', Phone: '0621-08460', Fax: '0621-08924' },
        { ID: 'BLONP', CompanyName: 'Blondesddsl père et fils', ContactName: 'Frédérique Citeaux', ContactTitle: 'Marketing Manager', Address: '24, place Kléber', City: 'Strasbourg', Region: null, PostalCode: '67000', Country: 'France', Phone: '88.60.15.31', Fax: '88.60.15.32' },
        { ID: 'BOLID', CompanyName: 'Bólido Comidas preparadas', ContactName: 'Martín Sommer', ContactTitle: 'Owner', Address: 'C/ Araquil, 67', City: 'Madrid', Region: null, PostalCode: '28023', Country: 'Spain', Phone: '(91) 555 22 82', Fax: '(91) 555 91 99' },
        { ID: 'BONAP', CompanyName: 'Bon app\'', ContactName: 'Laurence Lebihan', ContactTitle: 'Owner', Address: '12, rue des Bouchers', City: 'Marseille', Region: null, PostalCode: '13008', Country: 'France', Phone: '91.24.45.40', Fax: '91.24.45.41' },
        { ID: 'BOTTM', CompanyName: 'Bottom-Dollar Markets', ContactName: 'Elizabeth Lincoln', ContactTitle: 'Accounting Manager', Address: '23 Tsawassen Blvd.', City: 'Tsawassen', Region: 'BC', PostalCode: 'T2F 8M4', Country: 'Canada', Phone: '(604) 555-4729', Fax: '(604) 555-3745' },
        { ID: 'BSBEV', CompanyName: 'B\'s Beverages', ContactName: 'Victoria Ashworth', ContactTitle: 'Sales Representative', Address: 'Fauntleroy Circus', City: 'London', Region: null, PostalCode: 'EC2 5NT', Country: 'UK', Phone: '(171) 555-1212', Fax: null },
        { ID: 'CACTU', CompanyName: 'Cactus Comidas para llevar', ContactName: 'Patricio Simpson', ContactTitle: 'Sales Agent', Address: 'Cerrito 333', City: 'Buenos Aires', Region: null, PostalCode: '1010', Country: 'Argentina', Phone: '(1) 135-5555', Fax: '(1) 135-4892' },
        { ID: 'CENTC', CompanyName: 'Centro comercial Moctezuma', ContactName: 'Francisco Chang', ContactTitle: 'Marketing Manager', Address: 'Sierras de Granada 9993', City: 'México D.F.', Region: null, PostalCode: '05022', Country: 'Mexico', Phone: '(5) 555-3392', Fax: '(5) 555-7293' },
        { ID: 'CHOPS', CompanyName: 'Chop-suey Chinese', ContactName: 'Yang Wang', ContactTitle: 'Owner', Address: 'Hauptstr. 29', City: 'Bern', Region: null, PostalCode: '3012', Country: 'Switzerland', Phone: '0452-076545', Fax: null },
        { ID: 'COMMI', CompanyName: 'Comércio Mineiro', ContactName: 'Pedro Afonso', ContactTitle: 'Sales Associate', Address: 'Av. dos Lusíadas, 23', City: 'Sao Paulo', Region: 'SP', PostalCode: '05432-043', Country: 'Brazil', Phone: '(11) 555-7647', Fax: null },
        { ID: 'CONSH', CompanyName: 'Consolidated Holdings', ContactName: 'Elizabeth Brown', ContactTitle: 'Sales Representative', Address: 'Berkeley Gardens 12 Brewery', City: 'London', Region: null, PostalCode: 'WX1 6LT', Country: 'UK', Phone: '(171) 555-2282', Fax: '(171) 555-9199' },
        { ID: 'DRACD', CompanyName: 'Drachenblut Delikatessen', ContactName: 'Sven Ottlieb', ContactTitle: 'Order Administrator', Address: 'Walserweg 21', City: 'Aachen', Region: null, PostalCode: '52066', Country: 'Germany', Phone: '0241-039123', Fax: '0241-059428' },
        { ID: 'DUMON', CompanyName: 'Du monde entier', ContactName: 'Janine Labrune', ContactTitle: 'Owner', Address: '67, rue des Cinquante Otages', City: 'Nantes', Region: null, PostalCode: '44000', Country: 'France', Phone: '40.67.88.88', Fax: '40.67.89.89' },
        { ID: 'EASTC', CompanyName: 'Eastern Connection', ContactName: 'Ann Devon', ContactTitle: 'Sales Agent', Address: '35 King George', City: 'London', Region: null, PostalCode: 'WX3 6FW', Country: 'UK', Phone: '(171) 555-0297', Fax: '(171) 555-3373' },
        { ID: 'ERNSH', CompanyName: 'Ernst Handel', ContactName: 'Roland Mendel', ContactTitle: 'Sales Manager', Address: 'Kirchgasse 6', City: 'Graz', Region: null, PostalCode: '8010', Country: 'Austria', Phone: '7675-3425', Fax: '7675-3426' },
        { ID: 'FAMIA', CompanyName: 'Familia Arquibaldo', ContactName: 'Aria Cruz', ContactTitle: 'Marketing Assistant', Address: 'Rua Orós, 92', City: 'Sao Paulo', Region: 'SP', PostalCode: '05442-030', Country: 'Brazil', Phone: '(11) 555-9857', Fax: null },
        { ID: 'FISSA', CompanyName: 'FISSA Fabrica Inter. Salchichas S.A.', ContactName: 'Diego Roel', ContactTitle: 'Accounting Manager', Address: 'C/ Moralzarzal, 86', City: 'Madrid', Region: null, PostalCode: '28034', Country: 'Spain', Phone: '(91) 555 94 44', Fax: '(91) 555 55 93' },
        { ID: 'FOLIG', CompanyName: 'Folies gourmandes', ContactName: 'Martine Rancé', ContactTitle: 'Assistant Sales Agent', Address: '184, chaussée de Tournai', City: 'Lille', Region: null, PostalCode: '59000', Country: 'France', Phone: '20.16.10.16', Fax: '20.16.10.17' },
        { ID: 'FOLKO', CompanyName: 'Folk och fä HB', ContactName: 'Maria Larsson', ContactTitle: 'Owner', Address: 'Åkergatan 24', City: 'Bräcke', Region: null, PostalCode: 'S-844 67', Country: 'Sweden', Phone: '0695-34 67 21', Fax: null },
        { ID: 'FRANK', CompanyName: 'Frankenversand', ContactName: 'Peter Franken', ContactTitle: 'Marketing Manager', Address: 'Berliner Platz 43', City: 'München', Region: null, PostalCode: '80805', Country: 'Germany', Phone: '089-0877310', Fax: '089-0877451' },
        { ID: 'FRANR', CompanyName: 'France restauration', ContactName: 'Carine Schmitt', ContactTitle: 'Marketing Manager', Address: '54, rue Royale', City: 'Nantes', Region: null, PostalCode: '44000', Country: 'France', Phone: '40.32.21.21', Fax: '40.32.21.20' },
        { ID: 'FRANS', CompanyName: 'Franchi S.p.A.', ContactName: 'Paolo Accorti', ContactTitle: 'Sales Representative', Address: 'Via Monte Bianco 34', City: 'Torino', Region: null, PostalCode: '10100', Country: 'Italy', Phone: '011-4988260', Fax: '011-4988261' }
    ]);


    /* Data fields: ID: number, PTODays: number, CompanyName: string, ContactName: string, ContactTitle: string, Address: string,
        City: string, Region: string, PostalCode: string, Country: string, Phone: string, Fax: string;
        27 items, sorted by ID. */

    public static contactInfoWithPTODaysData = () => ([
        { ID: 'ALFKI', PTODays: 20, CompanyName: 'Alfreds Futterkiste', ContactName: 'Maria Anders', ContactTitle: 'Sales Representative', Address: 'Obere Str. 57', City: 'Berlin', Region: null, PostalCode: '12209', Country: 'Germany', Phone: '030-0074321', Fax: '030-0076545' },
        { ID: 'ANATR', PTODays: 12, CompanyName: 'Ana Trujillo Emparedados y helados', ContactName: 'Ana Trujillo', ContactTitle: 'Owner', Address: 'Avda. de la Constitución 2222', City: 'México D.F.', Region: null, PostalCode: '05021', Country: 'Mexico', Phone: '(5) 555-4729', Fax: '(5) 555-3745' },
        { ID: 'ANTON', PTODays: 32, CompanyName: 'Antonio Moreno Taquería', ContactName: 'Antonio Moreno', ContactTitle: 'Owner', Address: 'Mataderos 2312', City: 'México D.F.', Region: null, PostalCode: '05023', Country: 'Mexico', Phone: '(5) 555-3932', Fax: null },
        { ID: 'AROUT', PTODays: 23, CompanyName: 'Around the Horn', ContactName: 'Thomas Hardy', ContactTitle: 'Sales Representative', Address: '120 Hanover Sq.', City: 'London', Region: null, PostalCode: 'WA1 1DP', Country: 'UK', Phone: '(171) 555-7788', Fax: '(171) 555-6750' },
        { ID: 'BERGS', PTODays: 15, CompanyName: 'Berglunds snabbköp', ContactName: 'Christina Berglund', ContactTitle: 'Order Administrator', Address: 'Berguvsvägen 8', City: 'Luleå', Region: null, PostalCode: 'S-958 22', Country: 'Sweden', Phone: '0921-12 34 65', Fax: '0921-12 34 67' },
        { ID: 'BLAUS', PTODays: 17, CompanyName: 'Blauer See Delikatessen', ContactName: 'Hanna Moos', ContactTitle: 'Sales Representative', Address: 'Forsterstr. 57', City: 'Mannheim', Region: null, PostalCode: '68306', Country: 'Germany', Phone: '0621-08460', Fax: '0621-08924' },
        { ID: 'BLONP', PTODays: 33, CompanyName: 'Blondesddsl père et fils', ContactName: 'Frédérique Citeaux', ContactTitle: 'Marketing Manager', Address: '24, place Kléber', City: 'Strasbourg', Region: null, PostalCode: '67000', Country: 'France', Phone: '88.60.15.31', Fax: '88.60.15.32' },
        { ID: 'BOLID', PTODays: 27, CompanyName: 'Bólido Comidas preparadas', ContactName: 'Martín Sommer', ContactTitle: 'Owner', Address: 'C/ Araquil, 67', City: 'Madrid', Region: null, PostalCode: '28023', Country: 'Spain', Phone: '(91) 555 22 82', Fax: '(91) 555 91 99' },
        { ID: 'BONAP', PTODays: 11, CompanyName: 'Bon app\'', ContactName: 'Laurence Lebihan', ContactTitle: 'Owner', Address: '12, rue des Bouchers', City: 'Marseille', Region: null, PostalCode: '13008', Country: 'France', Phone: '91.24.45.40', Fax: '91.24.45.41' },
        { ID: 'BOTTM', PTODays: 6, CompanyName: 'Bottom-Dollar Markets', ContactName: 'Elizabeth Lincoln', ContactTitle: 'Accounting Manager', Address: '23 Tsawassen Blvd.', City: 'Tsawassen', Region: 'BC', PostalCode: 'T2F 8M4', Country: 'Canada', Phone: '(604) 555-4729', Fax: '(604) 555-3745' },
        { ID: 'BSBEV', PTODays: 0, CompanyName: 'B\'s Beverages', ContactName: 'Victoria Ashworth', ContactTitle: 'Sales Representative', Address: 'Fauntleroy Circus', City: 'London', Region: null, PostalCode: 'EC2 5NT', Country: 'UK', Phone: '(171) 555-1212', Fax: null },
        { ID: 'CACTU', PTODays: 0, CompanyName: 'Cactus Comidas para llevar', ContactName: 'Patricio Simpson', ContactTitle: 'Sales Agent', Address: 'Cerrito 333', City: 'Buenos Aires', Region: null, PostalCode: '1010', Country: 'Argentina', Phone: '(1) 135-5555', Fax: '(1) 135-4892' },
        { ID: 'CENTC', PTODays: 25, CompanyName: 'Centro comercial Moctezuma', ContactName: 'Francisco Chang', ContactTitle: 'Marketing Manager', Address: 'Sierras de Granada 9993', City: 'México D.F.', Region: null, PostalCode: '05022', Country: 'Mexico', Phone: '(5) 555-3392', Fax: '(5) 555-7293' },
        { ID: 'CHOPS', PTODays: 27, CompanyName: 'Chop-suey Chinese', ContactName: 'Yang Wang', ContactTitle: 'Owner', Address: 'Hauptstr. 29', City: 'Bern', Region: null, PostalCode: '3012', Country: 'Switzerland', Phone: '0452-076545', Fax: null },
        { ID: 'COMMI', PTODays: 17, CompanyName: 'Comércio Mineiro', ContactName: 'Pedro Afonso', ContactTitle: 'Sales Associate', Address: 'Av. dos Lusíadas, 23', City: 'Sao Paulo', Region: 'SP', PostalCode: '05432-043', Country: 'Brazil', Phone: '(11) 555-7647', Fax: null },
        { ID: 'CONSH', PTODays: 2, CompanyName: 'Consolidated Holdings', ContactName: 'Elizabeth Brown', ContactTitle: 'Sales Representative', Address: 'Berkeley Gardens 12 Brewery', City: 'London', Region: null, PostalCode: 'WX1 6LT', Country: 'UK', Phone: '(171) 555-2282', Fax: '(171) 555-9199' },
        { ID: 'DRACD', PTODays: 6, CompanyName: 'Drachenblut Delikatessen', ContactName: 'Sven Ottlieb', ContactTitle: 'Order Administrator', Address: 'Walserweg 21', City: 'Aachen', Region: null, PostalCode: '52066', Country: 'Germany', Phone: '0241-039123', Fax: '0241-059428' },
        { ID: 'DUMON', PTODays: 16, CompanyName: 'Du monde entier', ContactName: 'Janine Labrune', ContactTitle: 'Owner', Address: '67, rue des Cinquante Otages', City: 'Nantes', Region: null, PostalCode: '44000', Country: 'France', Phone: '40.67.88.88', Fax: '40.67.89.89' },
        { ID: 'EASTC', PTODays: 9, CompanyName: 'Eastern Connection', ContactName: 'Ann Devon', ContactTitle: 'Sales Agent', Address: '35 King George', City: 'London', Region: null, PostalCode: 'WX3 6FW', Country: 'UK', Phone: '(171) 555-0297', Fax: '(171) 555-3373' },
        { ID: 'ERNSH', PTODays: 29, CompanyName: 'Ernst Handel', ContactName: 'Roland Mendel', ContactTitle: 'Sales Manager', Address: 'Kirchgasse 6', City: 'Graz', Region: null, PostalCode: '8010', Country: 'Austria', Phone: '7675-3425', Fax: '7675-3426' },
        { ID: 'FAMIA', PTODays: 0, CompanyName: 'Familia Arquibaldo', ContactName: 'Aria Cruz', ContactTitle: 'Marketing Assistant', Address: 'Rua Orós, 92', City: 'Sao Paulo', Region: 'SP', PostalCode: '05442-030', Country: 'Brazil', Phone: '(11) 555-9857', Fax: null },
        { ID: 'FISSA', PTODays: 2, CompanyName: 'FISSA Fabrica Inter. Salchichas S.A.', ContactName: 'Diego Roel', ContactTitle: 'Accounting Manager', Address: 'C/ Moralzarzal, 86', City: 'Madrid', Region: null, PostalCode: '28034', Country: 'Spain', Phone: '(91) 555 94 44', Fax: '(91) 555 55 93' },
        { ID: 'FOLIG', PTODays: 1, CompanyName: 'Folies gourmandes', ContactName: 'Martine Rancé', ContactTitle: 'Assistant Sales Agent', Address: '184, chaussée de Tournai', City: 'Lille', Region: null, PostalCode: '59000', Country: 'France', Phone: '20.16.10.16', Fax: '20.16.10.17', Shipped: true },
        { ID: 'FOLKO', PTODays: 12, CompanyName: 'Folk och fä HB', ContactName: 'Maria Larsson', ContactTitle: 'Owner', Address: 'Åkergatan 24', City: 'Bräcke', Region: null, PostalCode: 'S-844 67', Country: 'Sweden', Phone: '0695-34 67 21', Fax: null, Shipped: true },
        { ID: 'FRANK', PTODays: 24, CompanyName: 'Frankenversand', ContactName: 'Peter Franken', ContactTitle: 'Marketing Manager', Address: 'Berliner Platz 43', City: 'München', Region: null, PostalCode: '80805', Country: 'Germany', Phone: '089-0877310', Fax: '089-0877451', Shipped: true },
        { ID: 'FRANR', PTODays: 26, CompanyName: 'France restauration', ContactName: 'Carine Schmitt', ContactTitle: 'Marketing Manager', Address: '54, rue Royale', City: 'Nantes', Region: null, PostalCode: '44000', Country: 'France', Phone: '40.32.21.21', Fax: '40.32.21.20', Shipped: true },
        { ID: 'FRANS', PTODays: 18, CompanyName: 'Franchi S.p.A.', ContactName: 'Paolo Accorti', ContactTitle: 'Sales Representative', Address: 'Via Monte Bianco 34', City: 'Torino', Region: null, PostalCode: '10100', Country: 'Italy', Phone: '011-4988260', Fax: '011-4988261', Shipped: true }
    ]);

    public static contactInfoDataTwoRecords = () => ([
        { ID: 'ALFKI', CompanyName: 'Alfreds Futterkiste', ContactName: 'Maria Anders', ContactTitle: 'Sales Representative', Address: 'Obere Str. 57', City: 'Berlin', Region: null, PostalCode: '12209', Country: 'Germany', Phone: '030-0074321', Fax: '030-0076545' },
        { ID: 'ANATR', CompanyName: 'Ana Trujillo Emparedados y helados', ContactName: 'Ana Trujillo', ContactTitle: 'Owner', Address: 'Avda. de la Constitución 2222', City: 'México D.F.', Region: null, PostalCode: '05021', Country: 'Mexico', Phone: '(5) 555-4729', Fax: '(5) 555-3745' },
    ]);

    /* Data fields: ID: number, CompanyName: string, ContactName: string, ContactTitle: string, Address: string,
        City: string, Region: string, PostalCode: string, Country: string, Phone: string, Fax: string; 1 item. */
    public static contactMariaAndersData = () => ([{
        ID: 'ALFKI',
        CompanyName: 'Alfreds Futterkiste',
        ContactName: 'Maria Anders',
        ContactTitle: 'Sales Representative',
        Address: 'Obere Str. 57',
        City: 'Berlin',
        Region: null,
        PostalCode: '12209',
        Country: 'Germany',
        Phone: '030-0074321',
        Fax: '030-0076545'
    }]);

    /* Data fields: Downloads: number, ID: number, ProductName: string, ReleaseDate: Date, Released: boolean;
        8 items, sorted by ID. */
    public static productInfoData = () => ([
        {
            Downloads: 254,
            ID: 1,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'day', 15),
            Released: false
        },
        {
            Downloads: 127,
            ID: 2,
            ProductName: 'NetAdvantage',
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'month', -1),
            Released: true
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: null,
            Released: null
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: null,
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'day', -1),
            Released: true
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: '',
            ReleaseDate: undefined,
            Released: ''
        },
        {
            Downloads: 702,
            ID: 6,
            ProductName: 'Some other item with Script',
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'day', 1),
            Released: null
        },
        {
            Downloads: 1,
            ID: 7,
            ProductName: null,
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'month', 1),
            Released: true
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: null,
            ReleaseDate: SampleTestData.today,
            Released: false
        }
    ]);

    /* Data fields: Downloads: number, ID: number, ProductName: string, ReleaseDate: Date, Released: boolean,
        Category: string, Items: string, Test: string;
        8 items, sorted by ID. */
    public static productInfoDataFull = () => ([
        {
            Downloads: 254,
            ID: 1,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'day', 15),
            Released: false,
            Category: 'Category 1',
            Items: 'Item 1',
            Test: 'Test 1'
        },
        {
            Downloads: 127,
            ID: 2,
            ProductName: 'NetAdvantage',
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'month', -1),
            Released: true,
            Category: 'Category 2',
            Items: 'Item 2',
            Test: 'Test 2'
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: null,
            Released: null,
            Category: 'Category 3',
            Items: 'Item 3',
            Test: 'Test 3'
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: null,
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'day', -1),
            Released: true,
            Category: 'Category 4',
            Items: 'Item 4',
            Test: 'Test 4'
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: '',
            ReleaseDate: undefined,
            Released: '',
            Category: 'Category 5',
            Items: 'Item 5',
            Test: 'Test 5'
        },
        {
            Downloads: 702,
            ID: 6,
            ProductName: 'Some other item with Script',
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'day', 1),
            Released: null,
            Category: 'Category 6',
            Items: 'Item 6',
            Test: 'Test 6'
        },
        {
            Downloads: 0,
            ID: 7,
            ProductName: null,
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'month', 1),
            Released: true,
            Category: 'Category 7',
            Items: 'Item 7',
            Test: 'Test 7'
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: null,
            ReleaseDate: SampleTestData.today,
            Released: false,
            Category: 'Category 8',
            Items: 'Item 8',
            Test: 'Test 8'
        }
    ]);

    /* Data fields: ProductID: number, ProductName: string, InStock: boolean, UnitsInStock: number, OrderDate: Date;
        10 items, sorted by ID. */
    public static foodProductData = () => ([
        { ProductID: 1, ProductName: 'Chai', InStock: true, UnitsInStock: 2760, OrderDate: new Date('2005-03-21') },
        { ProductID: 2, ProductName: 'Aniseed Syrup', InStock: false, UnitsInStock: 198, OrderDate: new Date('2008-01-15') },
        { ProductID: 3, ProductName: 'Chef Antons Cajun Seasoning', InStock: true, UnitsInStock: 52, OrderDate: new Date('2010-11-20') },
        { ProductID: 4, ProductName: 'Grandmas Boysenberry Spread', InStock: false, UnitsInStock: 0, OrderDate: new Date('2007-10-11') },
        { ProductID: 5, ProductName: 'Uncle Bobs Dried Pears', InStock: false, UnitsInStock: 0, OrderDate: new Date('2001-07-27') },
        { ProductID: 6, ProductName: 'Northwoods Cranberry Sauce', InStock: true, UnitsInStock: 1098, OrderDate: new Date('1990-05-17') },
        { ProductID: 7, ProductName: 'Queso Cabrales', InStock: false, UnitsInStock: 0, OrderDate: new Date('2005-03-03') },
        { ProductID: 8, ProductName: 'Tofu', InStock: true, UnitsInStock: 7898, OrderDate: new Date('2017-09-09') },
        { ProductID: 9, ProductName: 'Teatime Chocolate Biscuits', InStock: true, UnitsInStock: 6998, OrderDate: new Date('2025-12-25') },
        { ProductID: 10, ProductName: 'Chocolate', InStock: true, UnitsInStock: 20000, OrderDate: new Date('2018-03-01') }
    ]);

    public static foodProductDateTimeData = () => ([
        { ProductID: 1, ProductName: 'Chai', InStock: true, UnitsInStock: 2760, OrderDate: new Date(2015, 9, 1, 11, 37, 22),
            ReceiveTime: new Date(2015, 10, 1, 8, 37, 11), ProducedDate: new Date(2014, 9, 1, 11, 37, 22) },
        { ProductID: 2, ProductName: 'Aniseed Syrup', InStock: false, UnitsInStock: 198, OrderDate: new Date(2016, 7, 18, 11, 17, 22),
        ReceiveTime: new Date(2016, 10, 8, 12, 12, 2), ProducedDate: new Date(2015, 7, 18, 11, 17, 22) },
        { ProductID: 3, ProductName: 'Antons Cajun Seasoning', InStock: true, UnitsInStock: 52, OrderDate: new Date(2021, 4, 11, 7, 47, 1),
        ReceiveTime: new Date(2021, 4, 29, 14, 7, 12), ProducedDate: new Date(2020, 4, 11, 7, 47, 1) },
        { ProductID: 4, ProductName: 'Boysenberry Spread', InStock: false, UnitsInStock: 0, OrderDate: new Date(2021, 4, 11, 18, 37, 2),
        ReceiveTime: new Date(2021, 4, 27, 6, 40, 18), ProducedDate: new Date(2020, 4, 11, 18, 37, 2) },
        { ProductID: 5, ProductName: 'Uncle Bobs Dried Pears', InStock: false, UnitsInStock: 0, OrderDate: new Date(2019, 3, 17, 5, 5, 15),
        ReceiveTime: new Date(2019, 3, 31, 12, 47, 42), ProducedDate: new Date(2018, 3, 17, 5, 5, 15) },
        { ProductID: 6, ProductName: 'Cranberry Sauce', InStock: true, UnitsInStock: 1098, OrderDate: new Date(2019, 9, 30, 16, 17, 27),
        ReceiveTime: new Date(2019, 10, 11, 12, 47, 42), ProducedDate: new Date(2018, 9, 30, 16, 17, 27) },
        { ProductID: 7, ProductName: 'Queso Cabrales', InStock: false, UnitsInStock: 0, OrderDate: new Date(2015, 2, 12, 21, 31, 22),
        ReceiveTime: new Date(2015, 3, 3, 20, 20, 24), ProducedDate: new Date(2014, 2, 12, 21, 31, 22) },
        { ProductID: 8, ProductName: 'Tofu', InStock: true, UnitsInStock: 7898, OrderDate: new Date(2018, 6, 14, 17, 27, 23),
        ReceiveTime: new Date(2018, 6, 18, 15, 30, 30), ProducedDate: new Date(2017, 6, 14, 17, 27, 23) },
        { ProductID: 9, ProductName: 'Chocolate Biscuits', InStock: true, UnitsInStock: 6998, OrderDate: new Date(2021, 7, 3, 15, 15, 0),
        ReceiveTime: new Date(2021, 7, 7, 15, 30, 22), ProducedDate: new Date(2020, 7, 3, 15, 15, 0) },
        { ProductID: 10, ProductName: 'Chocolate', InStock: true, UnitsInStock: 20000, OrderDate: new Date(2021, 7, 3, 15, 15, 0),
        ReceiveTime: new Date(2021, 7, 11, 14, 30, 0), ProducedDate: new Date(2020, 7, 3, 15, 15, 0) }
    ]);

    public static foodPercentProductData = () => ([
        { ProductID: 1, ProductName: 'Chai', InStock: true, UnitsInStock: 2760, OrderDate: new Date('2005-03-21'), Discount: 0.27 },
        { ProductID: 2, ProductName: 'Syrup', InStock: false, UnitsInStock: 198, OrderDate: new Date('2008-01-15'), Discount: 0.83 },
        { ProductID: 3, ProductName: 'Seasoning', InStock: true, UnitsInStock: 5, OrderDate: new Date('2010-11-20'), Discount: -0.7 },
        { ProductID: 4, ProductName: 'Spread', InStock: false, UnitsInStock: 0, OrderDate: new Date('2007-10-11'), Discount: 11 },
        { ProductID: 5, ProductName: 'Bobs Pears', InStock: false, UnitsInStock: 0, OrderDate: new Date('2001-07-27'), Discount: -0.5},
        { ProductID: 6, ProductName: 'Sauce', InStock: true, UnitsInStock: 1098, OrderDate: new Date('1990-05-17'), Discount: 0.027 },
        { ProductID: 7, ProductName: 'Queso Cabrale', InStock: false, UnitsInStock: 0, OrderDate: new Date('2005-03-03'), Discount: 0.099 },
        { ProductID: 8, ProductName: 'Tofu', InStock: true, UnitsInStock: 7898, OrderDate: new Date('2017-09-09'), Discount: 10 },
        { ProductID: 9, ProductName: 'Chocolate', InStock: true, UnitsInStock: 698, OrderDate: new Date('2025-12-25'), Discount: .123},
        { ProductID: 10, ProductName: 'Biscuits', InStock: true, UnitsInStock: 20000, OrderDate: new Date('2018-03-01'), Discount: 0.39 }
    ]);


    /* Data fields: ProductID: number, ProductName: string, InStock: boolean, UnitsInStock: number, OrderDate: Date;
        19 items, sorted by ID. */
    public static foodProductDataExtended = () => ([
        { ProductID: 1, ProductName: 'Chai', InStock: true, UnitsInStock: 2760, OrderDate: new Date('2005-03-21') },
        { ProductID: 2, ProductName: 'Aniseed Syrup', InStock: false, UnitsInStock: 198, OrderDate: new Date('2008-01-15') },
        { ProductID: 3, ProductName: 'Chef Antons Cajun Seasoning', InStock: true, UnitsInStock: 52, OrderDate: new Date('2010-11-20') },
        { ProductID: 4, ProductName: 'Grandmas Boysenberry Spread', InStock: false, UnitsInStock: 0, OrderDate: new Date('2007-10-11') },
        { ProductID: 5, ProductName: 'Uncle Bobs Dried Pears', InStock: false, UnitsInStock: 0, OrderDate: new Date('2001-07-27') },
        { ProductID: 6, ProductName: 'Northwoods Cranberry Sauce', InStock: true, UnitsInStock: 1098, OrderDate: new Date('1990-05-17') },
        { ProductID: 7, ProductName: 'Queso Cabrales', InStock: false, UnitsInStock: 0, OrderDate: new Date('2005-03-03') },
        { ProductID: 8, ProductName: 'Tofu', InStock: true, UnitsInStock: 7898, OrderDate: new Date('2017-09-09') },
        { ProductID: 9, ProductName: 'Teatime Chocolate Biscuits', InStock: true, UnitsInStock: 6998, OrderDate: new Date('2025-12-25') },
        { ProductID: 10, ProductName: 'Pie', InStock: true, UnitsInStock: 1000, OrderDate: new Date('2017-05-07') },
        { ProductID: 11, ProductName: 'Pasta', InStock: false, UnitsInStock: 198, OrderDate: new Date('2001-02-15') },
        { ProductID: 12, ProductName: 'Krusty krab\'s burger', InStock: true, UnitsInStock: 52, OrderDate: new Date('2012-09-25') },
        { ProductID: 13, ProductName: 'Lasagna', InStock: false, UnitsInStock: 0, OrderDate: new Date('2015-02-09') },
        { ProductID: 14, ProductName: 'Uncle Bobs Dried Pears', InStock: false, UnitsInStock: 0, OrderDate: new Date('2008-03-17') },
        { ProductID: 15, ProductName: 'Cheese', InStock: true, UnitsInStock: 1098, OrderDate: new Date('1990-11-27') },
        { ProductID: 16, ProductName: 'Devil\'s Hot Chilli Sauce', InStock: false, UnitsInStock: 0, OrderDate: new Date('2012-08-14') },
        { ProductID: 17, ProductName: 'Parmesan', InStock: true, UnitsInStock: 4898, OrderDate: new Date('2017-09-09') },
        { ProductID: 18, ProductName: 'Steaks', InStock: true, UnitsInStock: 3098, OrderDate: new Date('2025-12-25') },
        { ProductID: 19, ProductName: 'Biscuits', InStock: true, UnitsInStock: 10570, OrderDate: new Date('2018-03-01') }
    ]);

    /* Generates data with the following data fields: index: number, value: number, other: number, another: number. */
    public static generateNumberData(rowsCount: number) {
        const data = [];
        for (let i = 0; i < rowsCount; i++) {
            data.push({ index: i, value: i, other: i, another: i });
        }
        return data;
    }

    /* Generates columns with 'field' and 'width' fields. */
    public static generateNumberDataSpecial(rowsCount, colsCount, defaultColWidth = null) {
        const cols = [];
        for (let j = 0; j < colsCount; j++) {
            cols.push({
                field: j.toString(),
                width: defaultColWidth !== null ? defaultColWidth : j % 8 < 2 ? 100 : (j % 6) * 125
            });
        }

        const data = [];
        for (let i = 0; i < rowsCount; i++) {
            const obj = {};
            for (let j = 0; j < cols.length; j++) {
                const col = cols[j].field;
                obj[col] = 10 * i * j;
            }
            data.push(obj);
        }
        return data;
    }

    /* Data fields: Downloads:number, ID: number, ProductName: string, ReleaseDate: Date,
                    Released: boolean, Category: string, Items: string, Test: string. */
    public static generateProductData(itemsCount: number) {
        const data = [];
        for (let i = 0; i < itemsCount; i++) {
            const item = {
                Downloads: 100 + i,
                ID: i,
                ProductName: 'ProductName' + i,
                ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'month', -1),
                Released: true,
                Category: 'Category' + i,
                Items: 'Items' + i,
                Test: 'test' + i
            };
            data.push(item);
        }

        return data;
    }

    /* Data fields: ID: string, Column1: string, Column2: string, Column3: string. */
    public static generateBigValuesData(rowsCount: number) {
        const bigData = [];
        for (let i = 0; i < rowsCount; i++) {
            for (let j = 0; j < 5; j++) {
                bigData.push({
                    ID: i.toString() + '_' + j.toString(),
                    Column1: i * j,
                    Column2: i * j * Math.pow(10, i),
                    Column3: i * j * Math.pow(100, i)
                });
            }
        }
        return bigData;
    }

    /* Data fields: ID: string, Column 1..N: number. */
    public static generateBigDataRowsAndCols(rowsCount: number, colsCount: number) {
        const bigData = [];
        for (let i = 0; i < rowsCount; i++) {
            const row = {};
            row['ID'] = i.toString();
            for (let j = 1; j < colsCount; j++) {
                row['Column ' + j] = i * j;
            }

            bigData.push(row);
        }
        return bigData;
    }

    /* Generates columns with the following fields: key, field and header. */
    public static generateColumns(count, namePrefix = 'col') {
        const cols = [];
        for (let i = 0; i < count; i++) {
            cols.push({
                key: namePrefix + i,
                field: namePrefix + i,
                header: namePrefix + i
            });
        }
        return cols;
    }

    /* Generates columns with the following fields: key, field, header and dataType. */
    public static generateColumnsByType(count, type: string, namePrefix = 'col') {
        const cols = [];
        for (let i = 0; i < count; i++) {
            cols.push({
                key: namePrefix + i,
                field: namePrefix + i,
                header: namePrefix + i,
                dataType: type
            });
        }
        return cols;
    }

    /* Generates columns with the following fields: key, dataType and editable. */
    public static generateEditableColumns(count, columnsType = 'string', namePrefix = 'col') {
        const cols = [];
        for (let i = 0; i < count; i++) {
            if (i % 2 === 0) {
                cols.push({
                    key: namePrefix + i,
                    dataType: columnsType,
                    editable: true
                });
            } else {
                cols.push({
                    key: namePrefix + i,
                    dataType: columnsType,
                    editable: false
                });
            }
        }
        return cols;
    }

    /* Generates numeric data for the specified columns collection. */
    public static generateDataForColumns(columns: any[], rowsCount: number, startFromOne = false) {
        const data = [];

        for (let r = 0; r < rowsCount; r++) {
            const record = {};
            for (let c = 0; c < columns.length; c++) {
                record[columns[c].key] = startFromOne && c === 0 ? 1 : c * r;
            }
            data.push(record);
        }

        return data;
    }

    /* Generates data with headers in the format "colNamePrefix1..N" and
    number values calculated by "colIndex * rowIndex" formula. */
    public static generateData(rowsCount, colsCount, colNamePrefix = 'col') {
        const cols = SampleTestData.generateColumns(colsCount, colNamePrefix);
        const data = [];
        for (let r = 0; r < rowsCount; r++) {
            const record = {};
            for (let c = 0; c < cols.length; c++) {
                record[cols[c].field] = c * r;
            }
            data.push(record);
        }
        return data;
    }

    /* Generate a different set of data using the specified baseData.
    Note: If a numeric ID field is available, it will be incremented accordingly. */
    public static generateFromData(baseData: any[], rowsCount: number) {
        const data = [];
        const iterations = Math.floor(rowsCount / baseData.length);
        const remainder = rowsCount % baseData.length;

        for (let i = 0; i < iterations; i++) {
            baseData.forEach((item) => {
                const currentItem = cloneValue(item);
                const id = SampleTestData.getIDColumnName(currentItem);
                if (id) {
                    currentItem[id] = item[id] + i * baseData.length;
                }
                data.push(currentItem);
            });
        }
        const currentLength = data.length;
        for (let i = 0; i < remainder; i++) {
            const currentItem = cloneValue(baseData[i]);
            const id = SampleTestData.getIDColumnName(currentItem);
            if (id) {
                currentItem[id] = currentLength + baseData[i][id];
            }
            data.push(currentItem);
        }

        return data;
    }

    /* Fields: name: string, phone: string; 6 items. Remarks: Contains special and cyrilic characters.
    Certain characters serving as delimiters can be changed. Mostly used in CSV exporters tests. */
    public static getContactsFunkyData(delimiter) {
        return [{
            name: 'Terrance Mc\'Orta',
            phone: '(+359)770-504-2217 | 2218'
        }, {
            name: 'Richard Mahoney /LongerName/',
            phone: ''
        }, {
            name: 'Donna' + delimiter + ' \/; Price',
            phone: '859 496 28**'
        }, {
            name: '\r\n',
            phone: '901-747-3428'
        }, {
            name: 'Dorothy "H." Spencer',
            phone: '573-394-9254[fax]'
        }, {
            name: 'Иван Иванов (1' + delimiter + '2)',
            phone: '№ 573-394-9254'
        }];
    }

    /* Tree data: Every employee node has ID, Name, HireDate, Age and Employees */
    public static employeeTreeData = () => ([
        {
            ID: 147,
            Name: 'John Winchester',
            HireDate: new Date(2008, 3, 20),
            Age: 55,
            OnPTO: false,
            Employees: [
                {
                    ID: 475,
                    Name: 'Michael Langdon',
                    HireDate: new Date(2011, 6, 3),
                    Age: 43,
                    OnPTO: false,
                    Employees: null
                },
                {
                    ID: 957,
                    Name: 'Thomas Hardy',
                    HireDate: new Date(2009, 6, 19),
                    Age: 29,
                    OnPTO: true,
                    Employees: undefined
                },
                {
                    ID: 317,
                    Name: 'Monica Reyes',
                    HireDate: new Date(2014, 8, 18),
                    Age: 31,
                    OnPTO: false,
                    Employees: [
                        {
                            ID: 711,
                            Name: 'Roland Mendel',
                            HireDate: new Date(2015, 9, 17),
                            Age: 35,
                            OnPTO: true,
                        },
                        {
                            ID: 998,
                            Name: 'Sven Ottlieb',
                            HireDate: new Date(2009, 10, 11),
                            Age: 44,
                            OnPTO: false,
                        }
                    ]
                }]
        },
        {
            ID: 847,
            Name: 'Ana Sanders',
            HireDate: new Date(2014, 1, 22),
            Age: 42,
            OnPTO: false,
            Employees: [
                {
                    ID: 225,
                    Name: 'Laurence Johnson',
                    HireDate: new Date(2014, 4, 4),
                    OnPTO: true,
                    Age: 44,
                },
                {
                    ID: 663,
                    Name: 'Elizabeth Richards',
                    HireDate: new Date(2017, 11, 9),
                    Age: 25,
                    OnPTO: false,
                    Employees: [
                        {
                            ID: 141,
                            Name: 'Trevor Ashworth',
                            HireDate: new Date(2010, 3, 22),
                            OnPTO: false,
                            Age: 39
                        }
                    ]
                }]
        },
        {
            ID: 19,
            Name: 'Victoria Lincoln',
            HireDate: new Date(2014, 1, 22),
            Age: 49,
            OnPTO: false,
            Employees: [
                {
                    ID: 15,
                    Name: 'Antonio Moreno',
                    HireDate: new Date(2014, 4, 4),
                    Age: 44,
                    OnPTO: true,
                    Employees: []
                }]
        },
        {
            ID: 17,
            Name: 'Yang Wang',
            HireDate: new Date(2010, 1, 1),
            Age: 61,
            OnPTO: false,
            Employees: [
                {
                    ID: 12,
                    Name: 'Pedro Afonso',
                    HireDate: new Date(2007, 11, 18),
                    Age: 50,
                    OnPTO: false,
                    Employees: [
                        {
                            ID: 109,
                            Name: 'Patricio Simpson',
                            HireDate: new Date(2017, 11, 9),
                            Age: 25,
                            OnPTO: false,
                            Employees: []
                        },
                        {
                            ID: 99,
                            Name: 'Francisco Chang',
                            HireDate: new Date(2010, 3, 22),
                            OnPTO: true,
                            Age: 39
                        },
                        {
                            ID: 299,
                            Name: 'Peter Lewis',
                            HireDate: new Date(2018, 3, 18),
                            OnPTO: false,
                            Age: 25
                        }
                    ]
                },
                {
                    ID: 101,
                    Name: 'Casey Harper',
                    HireDate: new Date(2016, 2, 19),
                    OnPTO: false,
                    Age: 27
                }]
        }
    ]);

    public static employeeScrollingData = () => ([
        { Salary: 2500, employeeID: 0, PID: -1, firstName: 'Andrew', lastName: 'Fuller', Title: 'Vice President, Sales' },
        { Salary: 3500, employeeID: 1, PID: -1, firstName: 'Jonathan', lastName: 'Smith', Title: 'Human resources' },
        { Salary: 1500, employeeID: 2, PID: -1, firstName: 'Nancy', lastName: 'Davolio', Title: 'CFO' },
        { Salary: 2500, employeeID: 3, PID: -1, firstName: 'Steven', lastName: 'Buchanan', Title: 'CTO' },
        // sub of ID 0
        { Salary: 2500, employeeID: 4, PID: 0, firstName: 'Janet', lastName: 'Leverling', Title: 'Sales Manager' },
        { Salary: 3500, employeeID: 5, PID: 0, firstName: 'Laura', lastName: 'Callahan', Title: 'Inside Sales Coordinator' },
        { Salary: 1500, employeeID: 6, PID: 0, firstName: 'Margaret', lastName: 'Peacock', Title: 'Sales Representative' },
        { Salary: 2500, employeeID: 7, PID: 0, firstName: 'Michael', lastName: 'Suyama', Title: 'Sales Representative' },
        // sub of ID 4
        { Salary: 2500, employeeID: 8, PID: 4, firstName: 'Anne', lastName: 'Dodsworth', Title: 'Sales Representative' },
        { Salary: 3500, employeeID: 9, PID: 4, firstName: 'Danielle', lastName: 'Davis', Title: 'Sales Representative' },
        { Salary: 1500, employeeID: 10, PID: 4, firstName: 'Robert', lastName: 'King', Title: 'Sales Representative' },
        // sub of ID 2
        { Salary: 2500, employeeID: 11, PID: 2, firstName: 'Peter', lastName: 'Lewis', Title: 'Chief Accountant' },
        { Salary: 3500, employeeID: 12, PID: 2, firstName: 'Ryder', lastName: 'Zenaida', Title: 'Accountant' },
        { Salary: 1500, employeeID: 13, PID: 2, firstName: 'Wang', lastName: 'Mercedes', Title: 'Accountant' },
        // sub of ID 3
        { Salary: 1500, employeeID: 14, PID: 3, firstName: 'Theodore', lastName: 'Zia', Title: 'Software Architect' },
        { Salary: 4500, employeeID: 15, PID: 3, firstName: 'Lacota', lastName: 'Mufutau', Title: 'Product Manager' },
        // sub of ID 16
        { Salary: 2500, employeeID: 16, PID: 15, firstName: 'Jin', lastName: 'Elliott', Title: 'Product Owner' },
        { Salary: 3500, employeeID: 17, PID: 15, firstName: 'Armand', lastName: 'Ross', Title: 'Product Owner' },
        { Salary: 1500, employeeID: 18, PID: 15, firstName: 'Dane', lastName: 'Rodriquez', Title: 'Team Leader' },
        // sub of ID 19
        { Salary: 2500, employeeID: 19, PID: 18, firstName: 'Declan', lastName: 'Lester', Title: 'Senior Software Developer' },
        { Salary: 3500, employeeID: 20, PID: 18, firstName: 'Bernard', lastName: 'Jarvis', Title: 'Senior Software Developer' },
        { Salary: 1500, employeeID: 21, PID: 18, firstName: 'Jason', lastName: 'Clark', Title: 'QA' },
        { Salary: 1500, employeeID: 22, PID: 18, firstName: 'Mark', lastName: 'Young', Title: 'QA' },
        // sub of ID 20
        { Salary: 1500, employeeID: 23, PID: 20, firstName: 'Jeremy', lastName: 'Donaldson', Title: 'Software Developer' }
    ]);

    /* Small tree data: Every employee node has ID, Name, HireDate, Age and Employees */
    public static employeeSmallTreeData = () => ([
        {
            ID: 147,
            Name: 'John Winchester',
            HireDate: new Date(2008, 3, 20),
            Age: 55,
            Employees: [
                {
                    ID: 475,
                    Name: 'Michael Langdon',
                    HireDate: new Date(2011, 6, 3),
                    Age: 30,
                    Employees: null
                },
                {
                    ID: 957,
                    Name: 'Thomas Hardy',
                    HireDate: new Date(2009, 6, 19),
                    Age: 29,
                    Employees: undefined
                },
                {
                    ID: 317,
                    Name: 'Monica Reyes',
                    HireDate: new Date(2014, 8, 18),
                    Age: 31,
                    Employees: [
                        {
                            ID: 711,
                            Name: 'Roland Mendel',
                            HireDate: new Date(2015, 9, 17),
                            Age: 35
                        },
                        {
                            ID: 998,
                            Name: 'Sven Ottlieb',
                            HireDate: new Date(2009, 10, 11),
                            Age: 44
                        },
                        {
                            ID: 299,
                            Name: 'Peter Lewis',
                            HireDate: new Date(2018, 3, 18),
                            Age: 25
                        }
                    ]
                }]
        },
        {
            ID: 19,
            Name: 'Yang Wang',
            HireDate: new Date(2010, 1, 1),
            Age: 61
        },
        {
            ID: 847,
            Name: 'Ana Sanders',
            HireDate: new Date(2014, 1, 22),
            Age: 42,
            Employees: [
                {
                    ID: 663,
                    Name: 'Elizabeth Richards',
                    HireDate: new Date(2017, 11, 9),
                    Age: 25
                }]
        }
    ]);

    public static employeeSmallPrimaryForeignKeyTreeData = () => ([
        {
            ID: 147,
            ParentID: -1,
            Name: 'John Winchester',
            HireDate: new Date(2008, 3, 20),
            Age: 55,
        },
        {
            ID: 475,
            ParentID: 147,
            Name: 'Michael Langdon',
            HireDate: new Date(2011, 6, 3),
            Age: 30,
        },
        {
            ID: 957,
            ParentID: 147,
            Name: 'Thomas Hardy',
            HireDate: new Date(2009, 6, 19),
            Age: 29,
        },
        {
            ID: 317,
            ParentID: 147,
            Name: 'Monica Reyes',
            HireDate: new Date(2014, 8, 18),
            Age: 31,
        },
        {
            ID: 711,
            ParentID: 317,
            Name: 'Roland Mendel',
            HireDate: new Date(2015, 9, 17),
            Age: 35
        },
        {
            ID: 998,
            ParentID: 317,
            Name: 'Sven Ottlieb',
            HireDate: new Date(2009, 10, 11),
            Age: 44
        },
        {
            ID: 299,
            ParentID: 317,
            Name: 'Peter Lewis',
            HireDate: new Date(2018, 3, 18),
            Age: 25
        },
        {
            ID: 19,
            ParentID: -1,
            Name: 'Yang Wang',
            HireDate: new Date(2010, 1, 1),
            Age: 61,
        },
        {
            ID: 847,
            ParentID: -1,
            Name: 'Ana Sanders',
            HireDate: new Date(2014, 1, 22),
            Age: 42,
        },
        {
            ID: 663,
            ParentID: 847,
            Name: 'Elizabeth Richards',
            HireDate: new Date(2017, 11, 9),
            Age: 25
        }
    ]);

    /* Search tree data: Every employee node has ID, Name, HireDate, Age, JobTitle and Employees */
    public static employeeSearchTreeData = () => ([
        {
            ID: 147,
            Name: 'John Winchester',
            HireDate: new Date(2008, 3, 20),
            Age: 55,
            JobTitle: 'Director',
            Employees: [
                {
                    ID: 475,
                    Name: 'Michael Langdon',
                    HireDate: new Date(2011, 6, 3),
                    Age: 30,
                    JobTitle: 'Software Developer Evangelist',
                    Employees: null
                },
                {
                    ID: 957,
                    Name: 'Thomas Hardy',
                    HireDate: new Date(2009, 6, 19),
                    Age: 29,
                    JobTitle: 'Junior Software Developer',
                    Employees: undefined
                },
                {
                    ID: 317,
                    Name: 'Monica Reyes',
                    HireDate: new Date(2014, 8, 18),
                    Age: 31,
                    JobTitle: 'Manager',
                    Employees: [
                        {
                            ID: 711,
                            Name: 'Eva Mendel',
                            HireDate: new Date(2015, 9, 17),
                            JobTitle: 'Senior Software Developer',
                            Age: 35
                        },
                        {
                            ID: 998,
                            Name: 'Sven Ottlieb',
                            HireDate: new Date(2009, 10, 11),
                            JobTitle: 'Senior Software Developer',
                            Age: 44
                        },
                        {
                            ID: 299,
                            Name: 'Peter Lewis',
                            HireDate: new Date(2018, 3, 18),
                            JobTitle: 'QA Developer',
                            Age: 25
                        }
                    ]
                }]
        },
        {
            ID: 19,
            Name: 'Yang Wang',
            HireDate: new Date(2010, 1, 1),
            JobTitle: 'Software Developer',
            Age: 61
        },
        {
            ID: 847,
            Name: 'Ana Sanders',
            HireDate: new Date(2014, 1, 22),
            Age: 42,
            JobTitle: 'QA Developer',
            Employees: [
                {
                    ID: 663,
                    Name: 'Elizabeth Richards',
                    HireDate: new Date(2017, 11, 9),
                    JobTitle: 'Software Developer',
                    Age: 25
                }]
        }
    ]);

    /* All types tree data: Every employee node has ID, Name, HireDate, Age, OnPTO and Employees */
    public static employeeAllTypesTreeData = () => ([
        {
            ID: 147,
            Name: 'John Winchester',
            HireDate: new Date(2008, 3, 20),
            Age: 55,
            OnPTO: false,
            Employees: [
                {
                    ID: 475,
                    Name: 'Michael Langdon',
                    HireDate: new Date(2011, 6, 3),
                    Age: 30,
                    OnPTO: true,
                    Employees: null
                },
                {
                    ID: 957,
                    Name: 'Thomas Hardy',
                    HireDate: new Date(2009, 6, 19),
                    Age: 29,
                    OnPTO: false,
                    Employees: undefined
                },
                {
                    ID: 317,
                    Name: 'Monica Reyes',
                    HireDate: new Date(2014, 8, 18),
                    Age: 31,
                    OnPTO: true,
                    Employees: [
                        {
                            ID: 711,
                            Name: 'Roland Mendel',
                            HireDate: new Date(2015, 9, 17),
                            Age: 35,
                            OnPTO: false,
                        },
                        {
                            ID: 998,
                            Name: 'Sven Ottlieb',
                            HireDate: new Date(2009, 10, 11),
                            Age: 44,
                            OnPTO: false,
                        },
                        {
                            ID: 299,
                            Name: 'Peter Lewis',
                            HireDate: new Date(2018, 3, 18),
                            Age: 25,
                            OnPTO: false,
                        }
                    ]
                }]
        },
        {
            ID: 19,
            Name: 'Yang Wang',
            HireDate: new Date(2010, 1, 1),
            Age: 61,
            OnPTO: true
        },
        {
            ID: 847,
            Name: 'Ana Sanders',
            HireDate: new Date(2014, 1, 22),
            Age: 42,
            OnPTO: false,
            Employees: [
                {
                    ID: 663,
                    Name: 'Elizabeth Richards',
                    HireDate: new Date(2017, 11, 9),
                    Age: 25,
                    OnPTO: true
                }]
        }
    ]);

    public static employeeTreeDataDisplayOrder = () => ([
        { ID: 1, ParentID: -1, Name: 'Casey Houston', JobTitle: 'Vice President', Age: 32 },
        { ID: 2, ParentID: 1, Name: 'Gilberto Todd', JobTitle: 'Director', Age: 41 },
        { ID: 3, ParentID: 2, Name: 'Tanya Bennett', JobTitle: 'Director', Age: 29 },
        { ID: 7, ParentID: 2, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', Age: 35 },
        { ID: 4, ParentID: 1, Name: 'Jack Simon', JobTitle: 'Software Developer', Age: 33 },
        { ID: 6, ParentID: -1, Name: 'Erma Walsh', JobTitle: 'CEO', Age: 52 },
        { ID: 10, ParentID: -1, Name: 'Eduardo Ramirez', JobTitle: 'Manager', Age: 53 },
        { ID: 9, ParentID: 10, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', Age: 44 }
    ]);

    public static employeePrimaryForeignKeyTreeData = () => ([
        { ID: 1, ParentID: -1, Name: 'Casey Houston', JobTitle: 'Vice President', Age: 32 },
        { ID: 2, ParentID: 1, Name: 'Gilberto Todd', JobTitle: 'Director', Age: 41 },
        { ID: 3, ParentID: 2, Name: 'Tanya Bennett', JobTitle: 'Director', Age: 29 },
        { ID: 4, ParentID: 1, Name: 'Jack Simon', JobTitle: 'Software Developer', Age: 33 },
        { ID: 6, ParentID: -1, Name: 'Erma Walsh', JobTitle: 'CEO', Age: 52 },
        { ID: 7, ParentID: 2, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', Age: 35 },
        { ID: 9, ParentID: 10, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', Age: 44 },
        { ID: 10, ParentID: -1, Name: 'Eduardo Ramirez', JobTitle: 'Manager', Age: 53 }
    ]);

    public static employeeTreeDataPrimaryForeignKey = () => ([
        {
            ID: 147,
            ParentID: -1,
            Name: 'John Winchester',
            HireDate: new Date(2008, 3, 20),
            Age: 55,
            OnPTO: false
        },
        {
            ID: 475,
            ParentID: 147,
            Name: 'Michael Langdon',
            HireDate: new Date(2011, 6, 3),
            Age: 43,
            OnPTO: false,
            Employees: null
        },
        {
            ID: 957,
            ParentID: 147,
            Name: 'Thomas Hardy',
            HireDate: new Date(2009, 6, 19),
            Age: 29,
            OnPTO: true,
            Employees: undefined
        },
        {
            ID: 317,
            ParentID: 147,
            Name: 'Monica Reyes',
            HireDate: new Date(2014, 8, 18),
            Age: 31,
            OnPTO: false
        },
        {
            ID: 711,
            ParentID: 317,
            Name: 'Roland Mendel',
            HireDate: new Date(2015, 9, 17),
            Age: 35,
            OnPTO: true,
        },
        {
            ID: 998,
            ParentID: 317,
            Name: 'Sven Ottlieb',
            HireDate: new Date(2009, 10, 11),
            Age: 44,
            OnPTO: false,
        },
        {
            ID: 847,
            ParentID: -1,
            Name: 'Ana Sanders',
            HireDate: new Date(2014, 1, 22),
            Age: 42,
            OnPTO: false
        },
        {
            ID: 225,
            ParentID: 847,
            Name: 'Laurence Johnson',
            HireDate: new Date(2014, 4, 4),
            OnPTO: true,
            Age: 44,
        },
        {
            ID: 663,
            ParentID: 847,
            Name: 'Elizabeth Richards',
            HireDate: new Date(2017, 11, 9),
            Age: 25,
            OnPTO: false
        },
        {
            ID: 141,
            ParentID: 663,
            Name: 'Trevor Ashworth',
            HireDate: new Date(2010, 3, 22),
            OnPTO: false,
            Age: 39
        },
        {
            ID: 19,
            ParentID: -1,
            Name: 'Victoria Lincoln',
            HireDate: new Date(2014, 1, 22),
            Age: 49,
            OnPTO: false
        },
        {
            ID: 15,
            ParentID: 19,
            Name: 'Antonio Moreno',
            HireDate: new Date(2014, 4, 4),
            Age: 44,
            OnPTO: true,
            Employees: []
        },
        {
            ID: 17,
            ParentID: -1,
            Name: 'Yang Wang',
            HireDate: new Date(2010, 1, 1),
            Age: 61,
            OnPTO: false
        },
        {
            ID: 12,
            ParentID: 17,
            Name: 'Pedro Afonso',
            HireDate: new Date(2007, 11, 18),
            Age: 50,
            OnPTO: false
        },
        {
            ID: 109,
            ParentID: 12,
            Name: 'Patricio Simpson',
            HireDate: new Date(2017, 11, 9),
            Age: 25,
            OnPTO: false,
            Employees: []
        },
        {
            ID: 99,
            ParentID: 12,
            Name: 'Francisco Chang',
            HireDate: new Date(2010, 3, 22),
            OnPTO: true,
            Age: 39
        },
        {
            ID: 299,
            ParentID: 12,
            Name: 'Peter Lewis',
            HireDate: new Date(2018, 3, 18),
            OnPTO: false,
            Age: 25
        },
        {
            ID: 101,
            ParentID: 17,
            Name: 'Casey Harper',
            HireDate: new Date(2016, 2, 19),
            OnPTO: false,
            Age: 27
        }
    ]);

    public static employeeTreeDataPrimaryForeignKeyExt = () => ([
        {
            ID: 147,
            ParentID: -1,
            Name: 'John Winchester',
            HireDate: new Date(2008, 3, 20),
            Age: 55,
            OnPTO: false,
            JobTitle: 'Director'
        },
        {
            ID: 475,
            ParentID: 147,
            Name: 'Michael Langdon',
            HireDate: new Date(2011, 6, 3),
            Age: 43,
            OnPTO: false,
            Employees: null,
            JobTitle: 'Software Developer'
        },
        {
            ID: 957,
            ParentID: 147,
            Name: 'Thomas Hardy',
            HireDate: new Date(2009, 6, 19),
            Age: 29,
            OnPTO: true,
            Employees: undefined,
            JobTitle: 'Associate Software Developer'
        },
        {
            ID: 317,
            ParentID: 147,
            Name: 'Monica Reyes',
            HireDate: new Date(2014, 8, 18),
            Age: 31,
            OnPTO: false,
            JobTitle: 'Software Developer'
        },
        {
            ID: 711,
            ParentID: 317,
            Name: 'Roland Mendel',
            HireDate: new Date(2015, 9, 17),
            Age: 35,
            OnPTO: true,
            JobTitle: 'Software Developer'
        },
        {
            ID: 998,
            ParentID: 317,
            Name: 'Sven Ottlieb',
            HireDate: new Date(2009, 10, 11),
            Age: 44,
            OnPTO: false,
            JobTitle: 'Senior Software Developer'
        },
        {
            ID: 847,
            ParentID: -1,
            Name: 'Ana Sanders',
            HireDate: new Date(2014, 1, 22),
            Age: 42,
            OnPTO: false,
            JobTitle: 'Vice President'
        },
        {
            ID: 225,
            ParentID: 847,
            Name: 'Laurence Johnson',
            HireDate: new Date(2014, 4, 4),
            OnPTO: true,
            Age: 44,
            JobTitle: 'Senior Software Developer'
        },
        {
            ID: 663,
            ParentID: 847,
            Name: 'Elizabeth Richards',
            HireDate: new Date(2017, 11, 9),
            Age: 25,
            OnPTO: false,
            JobTitle: 'Associate Software Developer'
        },

        {
            ID: 141,
            ParentID: 663,
            Name: 'Trevor Ashworth',
            HireDate: new Date(2010, 3, 22),
            OnPTO: false,
            Age: 39,
            JobTitle: 'Software Developer'
        },
        {
            ID: 19,
            ParentID: -1,
            Name: 'Victoria Lincoln',
            HireDate: new Date(2014, 1, 22),
            Age: 49,
            OnPTO: false,
            JobTitle: 'Director'
        },
        {
            ID: 15,
            ParentID: 19,
            Name: 'Antonio Moreno',
            HireDate: new Date(2014, 4, 4),
            Age: 44,
            OnPTO: true,
            Employees: [],
            JobTitle: 'Senior Software Developer, TL'
        },
        {
            ID: 17,
            ParentID: -1,
            Name: 'Yang Wang',
            HireDate: new Date(2010, 1, 1),
            Age: 61,
            OnPTO: false,
            JobTitle: 'Director'
        },
        {
            ID: 12,
            ParentID: 17,
            Name: 'Pedro Afonso',
            HireDate: new Date(2007, 11, 18),
            Age: 50,
            OnPTO: false,
            JobTitle: 'Director'
        },
        {
            ID: 109,
            ParentID: 12,
            Name: 'Patricio Simpson',
            HireDate: new Date(2017, 11, 9),
            Age: 25,
            OnPTO: false,
            Employees: [],
            JobTitle: 'Associate Software Developer'
        },
        {
            ID: 99,
            ParentID: 12,
            Name: 'Francisco Chang',
            HireDate: new Date(2010, 3, 22),
            OnPTO: true,
            Age: 39,
            JobTitle: 'Senior Software Developer'
        },
        {
            ID: 299,
            ParentID: 12,
            Name: 'Peter Lewis',
            HireDate: new Date(2018, 3, 18),
            OnPTO: false,
            Age: 25,
            JobTitle: 'Associate Software Developer'
        },
        {
            ID: 101,
            ParentID: 17,
            Name: 'Casey Harper',
            HireDate: new Date(2010, 3, 22),
            OnPTO: false,
            Age: 27,
            JobTitle: 'Software Developer'
        }
    ]);

    public static employeeTreeDataCaseSensitive = () => ([
        {
            ID: 147,
            ParentID: -1,
            Name: 'John Winchester',
            HireDate: new Date(2008, 3, 20),
            Age: 55,
            OnPTO: false,
            JobTitle: 'Director'
        },
        {
            ID: 475,
            ParentID: 147,
            Name: 'Michael Langdon',
            HireDate: new Date(2011, 6, 3),
            Age: 43,
            OnPTO: false,
            Employees: null,
            JobTitle: 'Software Developer'
        },
        {
            ID: 957,
            ParentID: 147,
            Name: 'Thomas Hardy',
            HireDate: new Date(2009, 6, 19),
            Age: 29,
            OnPTO: true,
            Employees: undefined,
            JobTitle: 'Software developer'
        },
        {
            ID: 317,
            ParentID: 147,
            Name: 'Monica Reyes',
            HireDate: new Date(2014, 8, 18),
            Age: 31,
            OnPTO: false,
            JobTitle: 'Software Developer'
        },
        {
            ID: 19,
            ParentID: -1,
            Name: 'Victoria Lincoln',
            HireDate: new Date(2014, 1, 22),
            Age: 49,
            OnPTO: false,
            JobTitle: 'Director'
        }
    ]);

    public static employeeGroupByData = () => ([
        {
            ID: 475,
            ParentID: 147,
            Name: 'Michael Langdon',
            HireDate: new Date(2011, 6, 3),
            Age: 43,
            OnPTO: false,
            Employees: null
        },
        {
            ID: 957,
            ParentID: 147,
            Name: 'Thomas Hardy',
            HireDate: new Date(2009, 6, 19),
            Age: 29,
            OnPTO: true,
            Employees: undefined
        },
        {
            ID: 317,
            ParentID: 147,
            Name: 'Monica Reyes',
            HireDate: new Date(2014, 8, 18),
            Age: 31,
            OnPTO: false
        },
        {
            ID: 225,
            ParentID: 847,
            Name: 'Laurence Johnson',
            HireDate: new Date(2014, 4, 4),
            OnPTO: true,
            Age: 44,
        },
        {
            ID: 663,
            ParentID: 847,
            Name: 'Elizabeth Richards',
            HireDate: new Date(2017, 11, 9),
            Age: 25,
            OnPTO: false
        },

        {
            ID: 15,
            ParentID: 19,
            Name: 'Antonio Moreno',
            HireDate: new Date(2014, 4, 4),
            Age: 44,
            OnPTO: true,
            Employees: []
        },
        {
            ID: 12,
            ParentID: 17,
            Name: 'Pedro Afonso',
            HireDate: new Date(2007, 11, 18),
            Age: 50,
            OnPTO: false
        },
        {
            ID: 101,
            ParentID: 17,
            Name: 'Casey Harper',
            HireDate: new Date(2016, 2, 19),
            OnPTO: false,
            Age: 27
        }
    ]);

    public static excelFilteringData = () => ([
        {
            Downloads: 254,
            ID: 1,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'day', 1),
            ReleaseDateTime: SampleTestData.timeGenerator.timedelta(SampleTestData.todayFullDate, 'hour', 1),
            ReleaseTime: SampleTestData.timeGenerator.timedelta(SampleTestData.todayFullDate, 'hour', 1),
            Released: false,
            AnotherField: 'a',
            Revenue: 100000
        },
        {
            Downloads: 127,
            ID: 2,
            ProductName: 'NetAdvantage',
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'month', -1),
            ReleaseDateTime: SampleTestData.timeGenerator.timedelta(SampleTestData.todayFullDate, 'hour', -1),
            ReleaseTime: SampleTestData.timeGenerator.timedelta(SampleTestData.todayFullDate, 'hour', -1),
            Released: true,
            AnotherField: 'a',
            Revenue: 40000
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: null,
            ReleaseDateTime: null,
            ReleaseTime: null,
            Released: null,
            AnotherField: 'a',
            Revenue: 9000
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: null,
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'day', -1),
            ReleaseDateTime: SampleTestData.timeGenerator.timedelta(SampleTestData.todayFullDate, 'minute', -10),
            ReleaseTime: SampleTestData.timeGenerator.timedelta(SampleTestData.todayFullDate, 'minute', -10),
            Released: true,
            AnotherField: 'a',
            Revenue: 10000
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: '',
            ReleaseDate: undefined,
            ReleaseDateTime: undefined,
            ReleaseTime: undefined,
            Released: false,
            AnotherField: 'a',
            Revenue: 30000
        },
        {
            Downloads: 702,
            ID: 6,
            ProductName: 'Some other item with Script',
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'day', 1),
            ReleaseDateTime: SampleTestData.timeGenerator.timedelta(SampleTestData.todayFullDate, 'second', 20),
            ReleaseTime: SampleTestData.timeGenerator.timedelta(SampleTestData.todayFullDate, 'second', 20),
            Released: null,
            AnotherField: 'Custom',
            Revenue: 60000
        },
        {
            Downloads: 0,
            ID: 7,
            ProductName: null,
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'month', 1),
            ReleaseDateTime: SampleTestData.timeGenerator.timedelta(SampleTestData.todayFullDate, 'minute', +10),
            ReleaseTime: SampleTestData.timeGenerator.timedelta(SampleTestData.todayFullDate, 'minute', +10),
            Released: true,
            AnotherField: 'custoM',
            Revenue: 10000
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: null,
            ReleaseDate: SampleTestData.today,
            ReleaseDateTime: SampleTestData.todayFullDate,
            ReleaseTime: SampleTestData.todayFullDate,
            Released: undefined,
            AnotherField: 'custom',
            Revenue: 50000
        }
    ]);

    public static excelFilteringDataDuplicateValues = () => ([
        {
            Downloads: 254,
            ID: 1,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'day', 1),
            ReleaseDateTime: SampleTestData.timeGenerator.timedelta(SampleTestData.todayFullDate, 'hour', 1),
            ReleaseTime: SampleTestData.timeGenerator.timedelta(SampleTestData.todayFullDate, 'hour', 1),
            Released: false,
            AnotherField: 'a',
            Revenue: 100000
        },
        {
            Downloads: 702,
            ID: 2,
            ProductName: 'Some other item with Script',
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'day', 1),
            ReleaseDateTime: SampleTestData.timeGenerator.timedelta(SampleTestData.todayFullDate, 'second', 20),
            ReleaseTime: SampleTestData.timeGenerator.timedelta(SampleTestData.todayFullDate, 'second', 20),
            Released: null,
            AnotherField: 'Custom',
            Revenue: 60000
        },
        {
            Downloads: 0,
            ID: 3,
            ProductName: null,
            ReleaseDate: SampleTestData.timeGenerator.timedelta(SampleTestData.today, 'month', 1),
            ReleaseDateTime: SampleTestData.timeGenerator.timedelta(SampleTestData.todayFullDate, 'minute', +10),
            ReleaseTime: SampleTestData.timeGenerator.timedelta(SampleTestData.todayFullDate, 'minute', +10),
            Released: true,
            AnotherField: 'custoM',
            Revenue: 10000
        },
        {
            Downloads: 1000,
            ID: 4,
            ProductName: null,
            ReleaseDate: SampleTestData.today,
            ReleaseDateTime: SampleTestData.todayFullDate,
            ReleaseTime: SampleTestData.todayFullDate,
            Released: undefined,
            AnotherField: 'custom',
            Revenue: 50000
        },
        {
            Downloads: 1000,
            ID: 5,
            ProductName: null,
            ReleaseDate: SampleTestData.today,
            ReleaseDateTime: SampleTestData.todayFullDate,
            ReleaseTime: SampleTestData.todayFullDate,
            Released: undefined,
            AnotherField: 'custom_1',
            Revenue: 50000
        },
        {
            Downloads: 1000,
            ID: 6,
            ProductName: null,
            ReleaseDate: SampleTestData.today,
            ReleaseDateTime: SampleTestData.todayFullDate,
            ReleaseTime: SampleTestData.todayFullDate,
            Released: undefined,
            AnotherField: 'custom_A',
            Revenue: 50000
        }
    ]);

    /* Data fields: Price: number, Brand: string, Model: string, Edition: string */
    public static exportGroupedDataColumns = () => ([
        { Price: 75000, Brand: 'Tesla', Model: 'Model S', Edition: 'Sport' },
        { Price: 100000, Brand: 'Tesla', Model: 'Roadster', Edition: 'Performance' },
        { Price: 65000, Brand: 'Tesla', Model: 'Model S', Edition: 'Base' },
        { Price: 150000, Brand: 'BMW', Model: 'M5', Edition: 'Competition' },
        { Price: 100000, Brand: 'BMW', Model: 'M5', Edition: 'Performance' },
        { Price: 75000, Brand: 'VW', Model: 'Arteon', Edition: 'Business' },
        { Price: 65000, Brand: 'VW', Model: 'Passat', Edition: 'Business' },
        { Price: 100000, Brand: 'VW', Model: 'Arteon', Edition: 'R Line' },
    ]);

    /* Data fields: Artist, Debut, GrammyNominations, GrammyAwards, Tours, Albums, Songs */
    public static hierarchicalGridExportData = () => ([
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
    ]);

    /* Data fields: Artist, Debut, GrammyNominations, GrammyAwards, Tours, Albums, Songs */
    public static hierarchicalGridSingersFullData = () => ([
        {
            ID: 0,
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
                        Released: new Date('22 Avg 2004'),
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
    ]);

    public static gridProductData = () => [{
        ProductID: 1,
        ProductName: "Chai",
        SupplierID: 1,
        CategoryID: 1,
        QuantityPerUnit: "10 boxes x 20 bags",
        UnitPrice: 18.0000,
        UnitsInStock: 39,
        UnitsOnOrder: 30,
        ReorderLevel: 10,
        Discontinued: false,
        OrderDate: new Date("2012-02-12")
      }, {
        ProductID: 2,
        ProductName: "Chang",
        SupplierID: 1,
        CategoryID: 1,
        QuantityPerUnit: "24 - 12 oz bottles",
        UnitPrice: 19.0000,
        UnitsInStock: 17,
        UnitsOnOrder: 40,
        ReorderLevel: 25,
        Discontinued: true,
        OrderDate: new Date("2003-03-17")
      }, {
        ProductID: 3,
        ProductName: "Aniseed Syrup",
        SupplierID: 1,
        CategoryID: 2,
        QuantityPerUnit: "12 - 550 ml bottles",
        UnitPrice: 10.0000,
        UnitsInStock: 13,
        UnitsOnOrder: 70,
        ReorderLevel: 25,
        Discontinued: false,
        OrderDate: new Date("2006-03-17")
      }, {
        ProductID: 4,
        ProductName: "Chef Antons Cajun Seasoning",
        SupplierID: 2,
        CategoryID: 2,
        QuantityPerUnit: "48 - 6 oz jars",
        UnitPrice: 22.0000,
        UnitsInStock: 53,
        UnitsOnOrder: 30,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2016-03-17")
      }, {
        ProductID: 5,
        ProductName: "Chef Antons Gumbo Mix",
        SupplierID: 2,
        CategoryID: 2,
        QuantityPerUnit: "36 boxes",
        UnitPrice: 21.3500,
        UnitsInStock: 0,
        UnitsOnOrder: 30,
        ReorderLevel: 0,
        Discontinued: true,
        OrderDate: new Date("2011-11-11")
      }, {
        ProductID: 6,
        ProductName: "Grandmas Boysenberry Spread",
        SupplierID: 3,
        CategoryID: 2,
        QuantityPerUnit: "12 - 8 oz jars",
        UnitPrice: 25.0000,
        UnitsInStock: 0,
        UnitsOnOrder: 30,
        ReorderLevel: 25,
        Discontinued: false,
        OrderDate: new Date("2017-12-17")
      }, {
        ProductID: 7,
        ProductName: "Uncle Bobs Organic Dried Pears",
        SupplierID: 3,
        CategoryID: 7,
        QuantityPerUnit: "12 - 1 lb pkgs.",
        UnitPrice: 30.0000,
        UnitsInStock: 150,
        UnitsOnOrder: 30,
        ReorderLevel: 10,
        Discontinued: false,
        OrderDate: new Date("2016-07-17")
      }, {
        ProductID: 8,
        ProductName: "Northwoods Cranberry Sauce",
        SupplierID: 3,
        CategoryID: 2,
        QuantityPerUnit: "12 - 12 oz jars",
        UnitPrice: 40.0000,
        UnitsInStock: 6,
        UnitsOnOrder: 30,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2018-01-17")
      }, {
        ProductID: 9,
        ProductName: "Mishi Kobe Niku",
        SupplierID: 4,
        CategoryID: 6,
        QuantityPerUnit: "18 - 500 g pkgs.",
        UnitPrice: 97.0000,
        UnitsInStock: 29,
        UnitsOnOrder: 30,
        ReorderLevel: 0,
        Discontinued: true,
        OrderDate: new Date("2010-02-17")
      }, {
        ProductID: 10,
        ProductName: "Ikura",
        SupplierID: 4,
        CategoryID: 8,
        QuantityPerUnit: "12 - 200 ml jars",
        UnitPrice: 31.0000,
        UnitsInStock: 31,
        UnitsOnOrder: 30,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2008-05-17")
      }, {
        ProductID: 11,
        ProductName: "Queso Cabrales",
        SupplierID: 5,
        CategoryID: 4,
        QuantityPerUnit: "1 kg pkg.",
        UnitPrice: 21.0000,
        UnitsInStock: 22,
        UnitsOnOrder: 30,
        ReorderLevel: 30,
        Discontinued: false,
        OrderDate: new Date("2009-01-17")
      }, {
        ProductID: 12,
        ProductName: "Queso Manchego La Pastora",
        SupplierID: 5,
        CategoryID: 4,
        QuantityPerUnit: "10 - 500 g pkgs.",
        UnitPrice: 38.0000,
        UnitsInStock: 86,
        UnitsOnOrder: 30,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2015-11-17")
      }, {
        ProductID: 13,
        ProductName: "Konbu",
        SupplierID: 6,
        CategoryID: 8,
        QuantityPerUnit: "2 kg box",
        UnitPrice: 6.0000,
        UnitsInStock: 24,
        UnitsOnOrder: 30,
        ReorderLevel: 5,
        Discontinued: false,
        OrderDate: new Date("2015-03-17")
      }, {
        ProductID: 14,
        ProductName: "Tofu",
        SupplierID: 6,
        CategoryID: 7,
        QuantityPerUnit: "40 - 100 g pkgs.",
        UnitPrice: 23.2500,
        UnitsInStock: 35,
        UnitsOnOrder: 30,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2017-06-17")
      }, {
        ProductID: 15,
        ProductName: "Genen Shouyu",
        SupplierID: 6,
        CategoryID: 2,
        QuantityPerUnit: "24 - 250 ml bottles",
        UnitPrice: 15.5000,
        UnitsInStock: 39,
        UnitsOnOrder: 30,
        ReorderLevel: 5,
        Discontinued: false,
        OrderDate: new Date("2014-03-17")
      }, {
        ProductID: 16,
        ProductName: "Pavlova",
        SupplierID: 7,
        CategoryID: 3,
        QuantityPerUnit: "32 - 500 g boxes",
        UnitPrice: 17.4500,
        UnitsInStock: 29,
        UnitsOnOrder: 30,
        ReorderLevel: 10,
        Discontinued: false,
        OrderDate: new Date("2018-03-28")
      }, {
        ProductID: 17,
        ProductName: "Alice Mutton",
        SupplierID: 7,
        CategoryID: 6,
        QuantityPerUnit: "20 - 1 kg tins",
        UnitPrice: 39.0000,
        UnitsInStock: 0,
        UnitsOnOrder: 30,
        ReorderLevel: 0,
        Discontinued: true,
        OrderDate: new Date("2015-08-17")
      }, {
        ProductID: 18,
        ProductName: "Carnarvon Tigers",
        SupplierID: 7,
        CategoryID: 8,
        QuantityPerUnit: "16 kg pkg.",
        UnitPrice: 62.5000,
        UnitsInStock: 42,
        UnitsOnOrder: 30,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2005-09-27")
      }, {
        ProductID: 19,
        ProductName: "Teatime Chocolate Biscuits",
        SupplierID: 8,
        CategoryID: 3,
        QuantityPerUnit: "",
        UnitPrice: 9.2000,
        UnitsInStock: 25,
        UnitsOnOrder: 30,
        ReorderLevel: 5,
        Discontinued: false,
        OrderDate: new Date("2001-03-17")
      }, {
        ProductID: 20,
        ProductName: "Sir Rodneys Marmalade",
        SupplierID: 8,
        CategoryID: 3,
        QuantityPerUnit: undefined,
        UnitPrice: 4.5,
        UnitsInStock: 40,
        UnitsOnOrder: 30,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2005-03-17")
      }
    ];

    public static gridCustomSummaryData = () => [{
        ProductID: 1,
        ProductName: "Chai",
        SupplierID: 1,
        CategoryID: 1,
        QuantityPerUnit: "10 boxes x 20 bags",
        UnitPrice: 18.0000,
        UnitsInStock: 39,
        UnitsOnOrder: 30,
        ReorderLevel: 10,
        Discontinued: false,
        OrderDate: new Date("2012-02-12")
      }, {
        ProductID: 2,
        ProductName: "Chang",
        SupplierID: 1,
        CategoryID: 1,
        QuantityPerUnit: "24 - 12 oz bottles",
        UnitPrice: 19.0000,
        UnitsInStock: 17,
        UnitsOnOrder: 40,
        ReorderLevel: 25,
        Discontinued: true,
        OrderDate: new Date("2003-03-17")
      }, {
        ProductID: 3,
        ProductName: "Aniseed Syrup",
        SupplierID: 1,
        CategoryID: 2,
        QuantityPerUnit: "12 - 550 ml bottles",
        UnitPrice: 10.0000,
        UnitsInStock: 13,
        UnitsOnOrder: 70,
        ReorderLevel: 25,
        Discontinued: false,
        OrderDate: new Date("2006-03-17")
      }, {
        ProductID: 4,
        ProductName: "Chef Antons Cajun Seasoning",
        SupplierID: 2,
        CategoryID: 2,
        QuantityPerUnit: "48 - 6 oz jars",
        UnitPrice: 22.0000,
        UnitsInStock: 53,
        UnitsOnOrder: 30,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2016-03-17")
      }, {
        ProductID: 5,
        ProductName: "Chef Antons Gumbo Mix",
        SupplierID: 2,
        CategoryID: 2,
        QuantityPerUnit: "36 boxes",
        UnitPrice: 21.3500,
        UnitsInStock: 0,
        UnitsOnOrder: 30,
        ReorderLevel: 0,
        Discontinued: true,
        OrderDate: new Date("2011-11-11")
      }, {
        ProductID: 6,
        ProductName: "Grandmas Boysenberry Spread",
        SupplierID: 3,
        CategoryID: 2,
        QuantityPerUnit: "12 - 8 oz jars",
        UnitPrice: 25.0000,
        UnitsInStock: 0,
        UnitsOnOrder: 30,
        ReorderLevel: 25,
        Discontinued: false,
        OrderDate: new Date("2017-12-17")
      }, {
        ProductID: 7,
        ProductName: "Uncle Bobs Organic Dried Pears",
        SupplierID: 3,
        CategoryID: 7,
        QuantityPerUnit: "12 - 1 lb pkgs.",
        UnitPrice: 30.0000,
        UnitsInStock: 150,
        UnitsOnOrder: 30,
        ReorderLevel: 10,
        Discontinued: false,
        OrderDate: new Date("2016-07-17")
      }, {
        ProductID: 8,
        ProductName: "Northwoods Cranberry Sauce",
        SupplierID: 3,
        CategoryID: 2,
        QuantityPerUnit: "12 - 12 oz jars",
        UnitPrice: 40.0000,
        UnitsInStock: 6,
        UnitsOnOrder: 30,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2018-01-17")
      }, {
        ProductID: 9,
        ProductName: "Mishi Kobe Niku",
        SupplierID: 4,
        CategoryID: 6,
        QuantityPerUnit: "18 - 500 g pkgs.",
        UnitPrice: 97.0000,
        UnitsInStock: 29,
        UnitsOnOrder: 30,
        ReorderLevel: 0,
        Discontinued: true,
        OrderDate: new Date("2010-02-17")
      }, {
        ProductID: 10,
        ProductName: "Ikura",
        SupplierID: 4,
        CategoryID: 8,
        QuantityPerUnit: "12 - 200 ml jars",
        UnitPrice: 31.0000,
        UnitsInStock: 31,
        UnitsOnOrder: 30,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2008-05-17")
      }, {
        ProductID: 11,
        ProductName: "Queso Cabrales",
        SupplierID: 5,
        CategoryID: 4,
        QuantityPerUnit: "1 kg pkg.",
        UnitPrice: 21.0000,
        UnitsInStock: 22,
        UnitsOnOrder: 30,
        ReorderLevel: 30,
        Discontinued: false,
        OrderDate: new Date("2009-01-17")
      }, {
        ProductID: 12,
        ProductName: "Queso Manchego La Pastora",
        SupplierID: 5,
        CategoryID: 4,
        QuantityPerUnit: "10 - 500 g pkgs.",
        UnitPrice: 38.0000,
        UnitsInStock: 86,
        UnitsOnOrder: 30,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2015-11-17")
      }, {
        ProductID: 13,
        ProductName: "Konbu",
        SupplierID: 6,
        CategoryID: 8,
        QuantityPerUnit: "2 kg box",
        UnitPrice: 6.0000,
        UnitsInStock: 24,
        UnitsOnOrder: 30,
        ReorderLevel: 5,
        Discontinued: false,
        OrderDate: new Date("2015-03-17")
      }, {
        ProductID: 14,
        ProductName: "Tofu",
        SupplierID: 6,
        CategoryID: 7,
        QuantityPerUnit: "40 - 100 g pkgs.",
        UnitPrice: 23.2500,
        UnitsInStock: 35,
        UnitsOnOrder: 30,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2017-06-17")
      }, {
        ProductID: 15,
        ProductName: "Genen Shouyu",
        SupplierID: 6,
        CategoryID: 2,
        QuantityPerUnit: "24 - 250 ml bottles",
        UnitPrice: 15.5000,
        UnitsInStock: 39,
        UnitsOnOrder: 30,
        ReorderLevel: 5,
        Discontinued: false,
        OrderDate: new Date("2014-03-17")
      }, {
        ProductID: 16,
        ProductName: "Pavlova",
        SupplierID: 7,
        CategoryID: 3,
        QuantityPerUnit: "32 - 500 g boxes",
        UnitPrice: 17.4500,
        UnitsInStock: 29,
        UnitsOnOrder: 30,
        ReorderLevel: 10,
        Discontinued: false,
        OrderDate: new Date("2018-03-28")
      }, {
        ProductID: 17,
        ProductName: "Alice Mutton",
        SupplierID: 7,
        CategoryID: 6,
        QuantityPerUnit: "20 - 1 kg tins",
        UnitPrice: 39.0000,
        UnitsInStock: 0,
        UnitsOnOrder: 30,
        ReorderLevel: 0,
        Discontinued: true,
        OrderDate: new Date("2015-08-17")
      }, {
        ProductID: 18,
        ProductName: "Carnarvon Tigers",
        SupplierID: 7,
        CategoryID: 8,
        QuantityPerUnit: "16 kg pkg.",
        UnitPrice: 62.5000,
        UnitsInStock: 42,
        UnitsOnOrder: 30,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2005-09-27")
      }, {
        ProductID: 19,
        ProductName: "Teatime Chocolate Biscuits",
        SupplierID: 8,
        CategoryID: 3,
        QuantityPerUnit: "",
        UnitPrice: 9.2000,
        UnitsInStock: 25,
        UnitsOnOrder: 30,
        ReorderLevel: 5,
        Discontinued: false,
        OrderDate: new Date("2001-03-17")
      }, {
        ProductID: 20,
        ProductName: "Sir Rodneys Marmalade",
        SupplierID: 8,
        CategoryID: 3,
        QuantityPerUnit: undefined,
        UnitPrice: 4.5,
        UnitsInStock: 40,
        UnitsOnOrder: 30,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2005-03-17")
      }
    ];

    /**
     * Generates simple array of primitve values
     *
     * @param rows Number of items to add to the array
     * @param type The type of the items
     */
    public static generateListOfPrimitiveValues(rows: number, type: string): any[] {
        const data: any[] = [];
        for (let row = 0; row < rows; row++) {
            if (type === 'Number') {
                data.push(row);
            } else if (type === 'String') {
                data.push(`Row ${row}`);
            } else if (type === 'Boolean') {
                data.push(row % 7 === 0);
            }
        }
        return data;
    }

    /* Generates hierahical data  */
    public static generateHGridData(count: number, level: number, parendID?) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
            const rowID = parendID ? parendID + i : i.toString();
           if (level > 0 ) {
                children = this.generateHGridData(count / 2 , currLevel - 1, rowID);
           }
           prods.push({
            ID: rowID, ChildLevels: currLevel,  ProductName: 'Product: A' + i, Col1: i,
            Col2: i, Col3: i, childData: children, childData2: children });
        }
        return prods;
    }

    public static generateTestDateTimeData = () => {
        return [
            {
                ProductID: 1,
                ProductName: 'Product1',
                DateField: new Date('2012-02-12'),
                TimeField: new Date(new Date('2012-02-12').setHours(3, 20, 0, 1)),
                DateTimeField: new Date(new Date('2003-03-17').setHours(3, 20, 5)),
            },
            {
                ProductID: 2,
                ProductName: 'Product2',
                DateField: new Date('2012-02-13'),
                TimeField: new Date(new Date('2003-03-17').setHours(3, 20, 0, 1)),
                DateTimeField: new Date(new Date('2003-03-17').setHours(3, 20)),
            },
            {
                ProductID: 3,
                ProductName: 'Product3',
                DateField: new Date('2012-02-12').setHours(1, 55),
                TimeField: new Date(new Date('2012-02-12').setHours(4, 4)),
                DateTimeField: new Date(new Date('2006-03-17').setHours(1, 55)),
            },
            {
                ProductID: 4,
                ProductName: 'Product3',
                DateField: new Date(new Date('2006-03-17').setHours(11, 11)),
                TimeField: new Date(new Date('2006-03-17').setHours(11, 11)),
                DateTimeField: new Date(new Date('2003-03-17').setHours(3, 20, 0, 1)),
            },
            {
                ProductID: 5,
                ProductName: 'Product5',
                DateField: new Date(new Date('2006-03-17').setHours(11, 11)),
                TimeField: new Date(new Date('2003-03-17').setHours(3, 20, 0, 1)),
                DateTimeField: new Date(new Date('2003-03-17').setHours(3, 20, 0, 1)),
            }
        ];
    };

    /* Gets the name of the identifier column if exists. */
    private static getIDColumnName(dataItem: any) {
        if (!dataItem) {
            return undefined;
        }

        if (dataItem['ID']) {
            return 'ID';
        } else if (dataItem['Id']) {
            return 'Id';
        } else if (dataItem['id']) {
            return 'id';
        } else {
            return undefined;
        }
    }
}

export class DataParent {
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
    public nextDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 0, 0, 0);
    public prevDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1, 0, 0, 0);
    public data = [
        {
            Downloads: 254,
            ID: 1,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: this.today,
            Released: false
        },
        {
            Downloads: 1000,
            ID: 2,
            ProductName: 'NetAdvantage',
            ReleaseDate: this.nextDay,
            Released: true
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: null,
            Released: false
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: this.prevDay,
            Released: true
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: '',
            ReleaseDate: null,
            Released: true
        },
        {
            Downloads: 1000,
            ID: 6,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: this.nextDay,
            Released: null
        },
        {
            Downloads: 0,
            ID: 7,
            ProductName: null,
            ReleaseDate: this.prevDay,
            Released: true
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: 'NetAdvantage',
            ReleaseDate: this.today,
            Released: false
        }
    ];
}
