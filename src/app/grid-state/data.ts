export const EMPLOYEE_DATA = [
  {
      Age: 55,
      Employees: [
          {
              Age: 43,
              Employees: [],
              HireDate: new Date(2011, 6, 3),
              ID: 3,
              Name: 'Michael Burke'
          },
          {
              Age: 29,
              Employees: undefined,
              HireDate: new Date(2009, 6, 19),
              ID: 2,
              Name: 'Thomas Anderson'
          },
          {
              Age: 31,
              Employees: [
                  {
                      Age: 35,
                      HireDate: new Date(2015, 9, 17),
                      ID: 6,
                      Name: 'Roland Mendel'
                  },
                  {
                      Age: 44,
                      HireDate: new Date(2009, 10, 11),
                      ID: 12,
                      Name: 'Sven Cooper'
                  }
              ],
              HireDate: new Date(2014, 8, 18),
              ID: 11,
              Name: 'Monica Reyes'
          }],
      HireDate: new Date(2008, 3, 20),
      ID: 1,
      Name: 'Johnathan Winchester'
  },
  {
      Age: 42,
      Employees: [
          {
              Age: 44,
              HireDate: new Date(2014, 4, 4),
              ID: 14,
              Name: 'Laurence Johnson'
          },
          {
              Age: 25,
              Employees: [
                  {
                      Age: 39,
                      HireDate: new Date(2010, 3, 22),
                      ID: 13,
                      Name: 'Trevor Ashworth'
                  }
              ],
              HireDate: new Date(2017, 11, 9),
              ID: 5,
              Name: 'Elizabeth Richards'
          }],
      HireDate: new Date(2014, 1, 22),
      ID: 4,
      Name: 'Ana Sanders'
  },
  {
      Age: 49,
      Employees: [
          {
              Age: 44,
              Employees: [],
              HireDate: new Date(2014, 4, 4),
              ID: 17,
              Name: 'Antonio Moreno'
          }],
      HireDate: new Date(2014, 1, 22),
      ID: 18,
      Name: 'Victoria Lincoln'
  },
  {
      Age: 61,
      Employees: [
          {
              Age: 50,
              Employees: [
                  {
                      Age: 25,
                      Employees: [],
                      HireDate: new Date(2017, 11, 9),
                      ID: 15,
                      Name: 'Patricia Simpson'
                  },
                  {
                      Age: 39,
                      HireDate: new Date(2010, 3, 22),
                      ID: 9,
                      Name: 'Francisco Chang'
                  },
                  {
                      Age: 25,
                      HireDate: new Date(2018, 3, 18),
                      ID: 16,
                      Name: 'Peter Lewis'
                  }
              ],
              HireDate: new Date(2007, 11, 18),
              ID: 7,
              Name: 'Pedro Rodriguez'
          },
          {
              Age: 27,
              HireDate: new Date(2016, 2, 19),
              ID: 8,
              Name: 'Casey Harper'
          }],
      HireDate: new Date(2010, 1, 1),
      ID: 10,
      Name: 'Yang Wang'
  }
];

export const TREEGRID_FLAT_DATA = [
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
];

const lastYear = new Date().getFullYear() - 1;
export const employeesData = [
    {
        EmployeeID: '56250fa57ab1535722e564a6',
        FirstName: 'Downs',
        LastName: 'Holcomb',
        Country: 'Italy',
        Age: 35,
        RegistererDate: new Date(lastYear, 7, 25),
        IsActive: false
    },
    {
        EmployeeID: '56250fa5c0fd04f12555d44d',
        FirstName: 'Mckenzie',
        LastName: 'Calderon',
        Country: 'USA',
        Age: 26,
        RegistererDate: new Date(lastYear - 1, 9, 22),
        IsActive: false
    },
    {
        EmployeeID: '56250fa565a7bcc21f6bd15e',
        FirstName: 'Howell',
        LastName: 'Hawkins',
        Country: 'Canada',
        Age: 25,
        RegistererDate: new Date(lastYear, 8, 8),
        IsActive: false
    },
    {
        EmployeeID: '56250fa5d71a83c33f3f6479',
        FirstName: 'Sheppard',
        LastName: 'Nicholson',
        Country: 'Italy',
        Age: 49,
        RegistererDate: new Date(lastYear - 1, 6, 28),
        IsActive: false
    },
    {
        EmployeeID: '56250fa546abbe8c616d37eb',
        FirstName: 'Bettye',
        LastName: 'Trujillo',
        Country: 'Canada',
        Age: 37,
        RegistererDate: new Date(new Date().setDate(-20)),
        IsActive: false
    },
    {
        EmployeeID: '56250fa535809820f2c44291',
        FirstName: 'Joyce',
        LastName: 'Vaughan',
        Country: 'USA',
        Age: 48,
        RegistererDate: new Date(lastYear - 1, 4, 24),
        IsActive: false
    },
    {
        EmployeeID: '56250fa5732f6adc0b52ace0',
        FirstName: 'Janine',
        LastName: 'Munoz',
        Country: 'USA',
        Age: 59,
        RegistererDate: new Date(lastYear - 1, 2, 9),
        IsActive: true
    },
    {
        EmployeeID: '56250fa540b15dfd507cffb9',
        FirstName: 'Betsy',
        LastName: 'Short',
        Country: 'USA',
        Age: 26,
        RegistererDate: new Date(new Date().setMonth(-1)),
        IsActive: true
    },
    {
        EmployeeID: '56250fa5a33146a85fdeda66',
        FirstName: 'Tanisha',
        LastName: 'Harrington',
        Country: 'USA',
        Age: 31,
        RegistererDate: new Date(lastYear - 1, 11, 25),
        IsActive: false
    },
    {
        EmployeeID: '56250fa572bea435113bb3be',
        FirstName: 'French',
        LastName: 'Sullivan',
        Country: 'Italy',
        Age: 37,
        RegistererDate: new Date(new Date().setMonth(-2)),
        IsActive: true
    },
    {
        EmployeeID: '56250fa55f17965b7b19e3cf',
        FirstName: 'Gomez',
        LastName: 'Sandoval',
        Country: 'Italy',
        Age: 24,
        RegistererDate: new Date(lastYear - 1, 6, 19),
        IsActive: true
    },
    {
        EmployeeID: '56250fa5f630e559e163de06',
        FirstName: 'Estes',
        LastName: 'Soto',
        Country: 'Canada',
        Age: 24,
        RegistererDate: new Date(new Date().setDate(-2)),
        IsActive: true
    },
    {
        EmployeeID: '56250fa5c797f025a835abd4',
        FirstName: 'Newman',
        LastName: 'Mathews',
        Country: 'Italy',
        Age: 60,
        RegistererDate: new Date(lastYear - 1, 10, 9),
        IsActive: true
    },
    {
        EmployeeID: '56250fa5fd5cd14418a9c790',
        FirstName: 'Paul',
        LastName: 'Harper',
        Country: 'USA',
        Age: 52,
        RegistererDate: new Date(lastYear - 1, 5, 9),
        IsActive: true
    },
    {
        EmployeeID: '56250fa56a88b994f0925d7c',
        FirstName: 'Sharpe',
        LastName: 'Blair',
        Country: 'Canada',
        Age: 41,
        RegistererDate: new Date(new Date().setMonth(-3)),
        IsActive: false
    },
    {
        EmployeeID: '56250fa53793e85f499fbf8b',
        FirstName: 'Kirk',
        LastName: 'Downs',
        Country: 'USA',
        Age: 58,
        RegistererDate: new Date(lastYear, 7, 10),
        IsActive: false
    },
    {
        EmployeeID: '56250fa581c03d4c735c0e8b',
        FirstName: 'Abby',
        LastName: 'Wheeler',
        Country: 'Canada',
        Age: 42,
        RegistererDate: new Date(lastYear, 3, 28),
        IsActive: false
    },
    {
        EmployeeID: '56250fa576d7ce7293fc09c6',
        FirstName: 'Walter',
        LastName: 'Roth',
        Country: 'Canada',
        Age: 36,
        RegistererDate: new Date(lastYear, 7, 24),
        IsActive: true
    },
    {
        EmployeeID: '56250fa5d88119d49b29d8ce',
        FirstName: 'Pratt',
        LastName: 'Mann',
        Country: 'Canada',
        Age: 40,
        RegistererDate: new Date(lastYear, 7, 3),
        IsActive: true
    },
    {
        EmployeeID: '56250fa52152c985dfbfcccb',
        FirstName: 'Blackwell',
        LastName: 'Randall',
        Country: 'Italy',
        Age: 20,
        RegistererDate: new Date(new Date().setDate(-1)),
        IsActive: true
    },
    {
        EmployeeID: '56250fa51a20b01e6ed8f726',
        FirstName: 'Linda',
        LastName: 'Sanchez',
        Country: 'USA',
        Age: 26,
        RegistererDate: new Date(lastYear - 1, 7, 24),
        IsActive: false
    },
    {
        EmployeeID: '56250fa5330ca7347f162f06',
        FirstName: 'Nieves',
        LastName: 'Hampton',
        Country: 'Italy',
        Age: 27,
        RegistererDate: new Date(lastYear - 1, 11, 10),
        IsActive: false
    },
    {
        EmployeeID: '56250fa5afae141d6229d5b1',
        FirstName: 'Pruitt',
        LastName: 'Pace',
        Country: 'Canada',
        Age: 25,
        RegistererDate: new Date(lastYear - 1, 11, 8),
        IsActive: true
    },
    {
        EmployeeID: '56250fa5340a5a2c9124717b',
        FirstName: 'Byrd',
        LastName: 'Bailey',
        Country: 'Canada',
        Age: 20,
        RegistererDate: new Date(lastYear - 1, 7, 7),
        IsActive: false
    },
    {
        EmployeeID: '56250fa5cf7613339d7e89ef',
        FirstName: 'Hardy',
        LastName: 'Terry',
        Country: 'USA',
        Age: 45,
        RegistererDate: new Date(lastYear - 1, 6, 1),
        IsActive: false
    },
    {
        EmployeeID: '56250fa566f393ab8dadba48',
        FirstName: 'Millie',
        LastName: 'Boyd',
        Country: 'USA',
        Age: 28,
        RegistererDate: new Date(lastYear, 7, 7),
        IsActive: false
    },
    {
        EmployeeID: '56250fa58eeb7bba0116b2d5',
        FirstName: 'Rosa',
        LastName: 'Mercer',
        Country: 'Canada',
        Age: 25,
        RegistererDate: new Date(lastYear - 1, 8, 18),
        IsActive: true
    },
    {
        EmployeeID: '56250fa5f85bd1754870f53f',
        FirstName: 'Blair',
        LastName: 'Long',
        Country: 'Canada',
        Age: 21,
        RegistererDate: new Date(lastYear - 1, 9, 26),
        IsActive: false
    },
    {
        EmployeeID: '56250fa5a0b51fe08c3c767b',
        FirstName: 'Whitfield',
        LastName: 'Cherry',
        Country: 'USA',
        Age: 38,
        RegistererDate: new Date(lastYear - 1, 4, 25),
        IsActive: true
    },
    {
        EmployeeID: '56250fa5b4e64d93a5742a57',
        FirstName: 'Cathryn',
        LastName: 'Hunt',
        Country: 'USA',
        Age: 26,
        RegistererDate: new Date(lastYear - 1, 6, 16),
        IsActive: true
    },
    {
        EmployeeID: '56250fa5fad324f0adefae2d',
        FirstName: 'Morris',
        LastName: 'Stout',
        Country: 'Italy',
        Age: 41,
        RegistererDate: new Date(lastYear - 1, 3, 26),
        IsActive: true
    },
    {
        EmployeeID: '56250fa59c7408d236d6a804',
        FirstName: 'Vera',
        LastName: 'Richardson',
        Country: 'Canada',
        Age: 32,
        RegistererDate: new Date(lastYear - 1, 1, 2),
        IsActive: false
    },
    {
        EmployeeID: '56250fa5d6cd5f712b557a0d',
        FirstName: 'Shelton',
        LastName: 'Henderson',
        Country: 'Canada',
        Age: 53,
        RegistererDate: new Date(lastYear, 9, 6),
        IsActive: true
    },
    {
        EmployeeID: '56250fa5a11af8868f285db6',
        FirstName: 'Jimmie',
        LastName: 'Cain',
        Country: 'USA',
        Age: 45,
        RegistererDate: new Date(lastYear, 6, 5),
        IsActive: true
    },
    {
        EmployeeID: '56250fa53c8439c4e5e7d864',
        FirstName: 'Bryan',
        LastName: 'Bradshaw',
        Country: 'Canada',
        Age: 24,
        RegistererDate: new Date(lastYear - 1, 8, 2),
        IsActive: true
    },
    {
        EmployeeID: '56250fa5fc8d4f4859804c7e',
        FirstName: 'Decker',
        LastName: 'Kane',
        Country: 'Canada',
        Age: 29,
        RegistererDate: new Date(lastYear - 1, 6, 7),
        IsActive: false
    },
    {
        EmployeeID: '56250fa50158aa6a0fd162f2',
        FirstName: 'Keisha',
        LastName: 'Phelps',
        Country: 'Canada',
        Age: 34,
        RegistererDate: new Date(lastYear - 1, 10, 11),
        IsActive: true
    },
    {
        EmployeeID: '56250fa58ca7ea6c3dfe7830',
        FirstName: 'West',
        LastName: 'Frye',
        Country: 'Italy',
        Age: 40,
        RegistererDate: new Date(lastYear - 1, 6, 25),
        IsActive: false
    }
];
