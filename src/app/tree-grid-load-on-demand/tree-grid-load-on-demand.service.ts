const EMPLOYEE_DATA = [
    { 'Salary': 2500, 'employeeID': 0, 'PID': -1, 'firstName': 'Andrew', 'lastName': 'Fuller', 'Title': 'Vice President, Sales' },
    { 'Salary': 3500, 'employeeID': 1, 'PID': -1, 'firstName': 'Jonathan', 'lastName': 'Smith', 'Title': 'Human resources' },
    { 'Salary': 1500, 'employeeID': 2, 'PID': -1, 'firstName': 'Nancy', 'lastName': 'Davolio', 'Title': 'CFO' },
    { 'Salary': 2500, 'employeeID': 3, 'PID': -1, 'firstName': 'Steven', 'lastName': 'Buchanan', 'Title': 'CTO' },
    // sub of ID 0
    { 'Salary': 2500, 'employeeID': 4, 'PID': 0, 'firstName': 'Janet', 'lastName': 'Leverling', 'Title': 'Sales Manager' },
    { 'Salary': 3500, 'employeeID': 5, 'PID': 0, 'firstName': 'Laura', 'lastName': 'Callahan', 'Title': 'Inside Sales Coordinator' },
    { 'Salary': 1500, 'employeeID': 6, 'PID': 0, 'firstName': 'Margaret', 'lastName': 'Peacock', 'Title': 'Sales Representative' },
    { 'Salary': 2500, 'employeeID': 7, 'PID': 0, 'firstName': 'Michael', 'lastName': 'Suyama', 'Title': 'Sales Representative' },
    // sub of ID 4
    { 'Salary': 2500, 'employeeID': 8, 'PID': 4, 'firstName': 'Anne', 'lastName': 'Dodsworth', 'Title': 'Sales Representative' },
    { 'Salary': 3500, 'employeeID': 9, 'PID': 4, 'firstName': 'Danielle', 'lastName': 'Davis', 'Title': 'Sales Representative' },
    { 'Salary': 1500, 'employeeID': 10, 'PID': 4, 'firstName': 'Robert', 'lastName': 'King', 'Title': 'Sales Representative' },
    // sub of ID 2
    { 'Salary': 2500, 'employeeID': 11, 'PID': 2, 'firstName': 'Peter', 'lastName': 'Lewis', 'Title': 'Chief Accountant' },
    { 'Salary': 3500, 'employeeID': 12, 'PID': 2, 'firstName': 'Ryder', 'lastName': 'Zenaida', 'Title': 'Accountant' },
    { 'Salary': 1500, 'employeeID': 13, 'PID': 2, 'firstName': 'Wang', 'lastName': 'Mercedes', 'Title': 'Accountant' },
    // sub of ID 3
    { 'Salary': 1500, 'employeeID': 14, 'PID': 3, 'firstName': 'Theodore', 'lastName': 'Zia', 'Title': 'Software Architect' },
    { 'Salary': 4500, 'employeeID': 15, 'PID': 3, 'firstName': 'Lacota', 'lastName': 'Mufutau', 'Title': 'Product Manager' },
    // sub of ID 16
    { 'Salary': 2500, 'employeeID': 16, 'PID': 15, 'firstName': 'Jin', 'lastName': 'Elliott', 'Title': 'Product Owner' },
    { 'Salary': 3500, 'employeeID': 17, 'PID': 15, 'firstName': 'Armand', 'lastName': 'Ross', 'Title': 'Product Owner' },
    { 'Salary': 1500, 'employeeID': 18, 'PID': 15, 'firstName': 'Dane', 'lastName': 'Rodriquez', 'Title': 'Team Leader' },
    // sub of ID 19
    { 'Salary': 2500, 'employeeID': 19, 'PID': 18, 'firstName': 'Declan', 'lastName': 'Lester', 'Title': 'Senior Software Developer' },
    { 'Salary': 3500, 'employeeID': 20, 'PID': 18, 'firstName': 'Bernard', 'lastName': 'Jarvis', 'Title': 'Senior Software Developer' },
    { 'Salary': 1500, 'employeeID': 21, 'PID': 18, 'firstName': 'Jason', 'lastName': 'Clark', 'Title': 'QA' },
    { 'Salary': 1500, 'employeeID': 22, 'PID': 18, 'firstName': 'Mark', 'lastName': 'Young', 'Title': 'QA' },
    // sub of ID 20
    { 'Salary': 1500, 'employeeID': 23, 'PID': 20, 'firstName': 'Jeremy', 'lastName': 'Donaldson', 'Title': 'Software Developer' }
];

export class TreeGridLoadOnDemandService {
    public getData(parentID: any, done: (children: any[]) => void) {
        setTimeout(() => {
            const children = EMPLOYEE_DATA.filter(r => r.PID === parentID);
            children.forEach(r => r['hasEmployees'] = EMPLOYEE_DATA.some(c => c.PID === r.employeeID));
            done(children);
        }, 1000);
    }
}
