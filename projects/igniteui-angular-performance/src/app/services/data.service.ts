import { Injectable } from '@angular/core';
import { Mulberry32 } from '../lib/mulberry';
import { DATA as athletesData } from "../data/athletesData"
import { EMPLOYEES_DATA } from '../data/employeesData';
import { brandNames, flags, monthsMaxDays, storeNames } from '../data/pivotData';

interface Store {
    city: string;
    mall: string;
};

type StoreByCountry = Record<string, Store[]>;

type Employee = typeof EMPLOYEES_DATA[number] & {
    CheckedIn: string;
    CareerStart: string;
    GrossSalary: number;
    PTO: boolean;
    SuccessRate: number;
};

type Athlete = typeof athletesData[number] & {
    Registered: string;
    FirstAppearance: string;
    CareerStart: string;
    Active: boolean;
    SuccessRate: number;
    AthleteNumber: number;
    childData?: Athlete[];
};

export interface SalesRecord {
    Store: string;
    Brand: string;
    Country: string;
    Sale: number;
    Cost: number;
    Date: string;
};


@Injectable({
    providedIn: 'root'
})
export class DataService {
    constructor() { }
    public generateData(rows: number): Athlete[] {
        const rnd = new Mulberry32(1234);
        const data = this.generateAthletesData(rnd, rows);
        return data;
    }

    public generateHierarchicalData(rows: number): Athlete[] {
        const rnd = new Mulberry32(1234);
        const data = this.generateAthletesData(rnd, rows, true);
        return data;
    }

    public generateTreeData(rows: number): Employee[] {
        const rnd = new Mulberry32(1234);
        const data = this.generateEmployeesData(rnd, rows);
        return data;
    }

    public generatePivotData(rows: number): SalesRecord[] {
        const rnd = new Mulberry32(1234);
        const data = this.generateSalesData(rnd, rows);
        return data;
    }

    private generateSalesData(rnd: Mulberry32, rows: number): SalesRecord[] {
        const numCountries = 6;
        const numRecsPerCountry = rows / numCountries;
        const countryStoreKeys = Object.keys(storeNames);
        const newStoreNames = this.generateStoreNames(countryStoreKeys);

        const newCountryStoreKeys = Object.keys(newStoreNames);
        let maxNumMalls = newStoreNames[newCountryStoreKeys[0]]?.length * 3 || 0;
        for (let s = 1; s < newCountryStoreKeys.length; s++) {
            const curCountryMalls = newStoreNames[newCountryStoreKeys[s]]?.length || 0;
            if (curCountryMalls > maxNumMalls) {
                maxNumMalls = curCountryMalls;
            }
        }

        const numBrandsPerMall = 3;
        const numDatesPerMall = numRecsPerCountry / maxNumMalls;
        const numDatesPerBrand = numDatesPerMall / numBrandsPerMall;
        const dates = [];
        for (let d = 0; d < numDatesPerBrand; d++) {
            const month = this.generateRandomNumber(rnd, 1, 12);
            const day = this.generateRandomNumber(rnd, 1, monthsMaxDays[month - 1]);
            const year = 2018 + this.generateRandomNumber(rnd, 0, 6);
            dates.push(month + "/" + day + "/" + year);
        }

        const data: SalesRecord[] = [];
        for (let c = 0; c < numCountries; c++) {
            const countryName = flags[c];
            const stores = countryName ? newStoreNames[countryName] : undefined;
            if (!stores) {
                continue;
            }
            const numMallsForCountry = stores.length;
            for (let m = 0; m < numMallsForCountry; m++) {
                const brandNamesPerMall = [];
                for (let t = 0; t < numBrandsPerMall; t++) {
                    brandNamesPerMall.push(Math.round(this.generateRandomNumber(rnd, 0, brandNames.length - 1)));
                }
                for (let b = 0; b < numBrandsPerMall; b++) {
                    for (let k = 0; k < numDatesPerBrand; k++) {
                        const brandName = brandNames[brandNamesPerMall[b]];
                        const saleValue = this.generateRandomNumber(rnd, 1, 1000);
                        const costValue = this.generateRandomNumber(rnd, saleValue / 2, saleValue * 0.95);
                        const storeInfo = stores[m];
                        if (!storeInfo) {
                            continue;
                        }
                        const storeName = storeInfo.mall.includes(storeInfo.city) ? storeInfo.mall : `${storeInfo.mall}, ${storeInfo.city}`;

                        data.push({
                            "Store": storeName,
                            "Brand": brandName,
                            "Country": countryName!,
                            "Sale": saleValue,
                            "Cost": costValue,
                            "Date": dates[k]
                        });
                    }
                }
            }

        }
        return data;

    }

    private generateEmployeesData(rnd: Mulberry32, rows: number): Employee[] {
        const currData: Employee[] = [];
        let uniqueId = 1;
        const parentCandidates: number[] = [];
        for (let i = 0; i < rows; i++) {
            const rand = Math.floor(rnd.random() * Math.floor(EMPLOYEES_DATA.length));
            const source = EMPLOYEES_DATA[rand];
            if (!source) {
                continue;
            }
            const dataObj: Employee = {
                ...source,
                CheckedIn: this.formatDateTime(this.randomizeDateTime(rnd)),
                CareerStart: this.formatDateTime(this.randomizeDateTime(rnd)),
                GrossSalary: this.randomizeSalary(rnd),
                PTO: this.randomizeBoolean(rnd),
                SuccessRate: this.randomizePercentage(rnd)
            };
            dataObj.ID = uniqueId++;
            if (currData.length > 0 && rnd.random() > 0.2) {
                const parentIndex = Math.floor(rnd.random() * parentCandidates.length);
                dataObj.ParentID = parentCandidates[parentIndex];
            } else {
                dataObj.ParentID = -1; // Root node
            }
            parentCandidates.push(dataObj.ID);

            currData.push(dataObj);
        }
        return currData;
    }

    private generateAthletesData(rnd: Mulberry32, rows: number, children = false): Athlete[] {
        const currData: Athlete[] = [];
        for (let i = 0; i < rows; i++) {
            const rand = Math.floor(rnd.random() * Math.floor(athletesData.length));
            const source = athletesData[rand];
            if (!source) {
                continue;
            }
            const dataObj: Athlete = {
                ...source,
                Registered: this.formatDateTime(this.randomizeDateTime(rnd)),
                FirstAppearance: this.formatDateTime(this.randomizeDateTime(rnd)),
                CareerStart: this.formatDateTime(this.randomizeDateTime(rnd)),
                Active: this.randomizeBoolean(rnd),
                SuccessRate: this.randomizePercentage(rnd),
                AthleteNumber: this.randomizeAthleteNumber(source.AthleteNumber, rnd)
            };
            if (children) {
                const childRandomizer = new Mulberry32(i);
                dataObj.childData = this.generateAthletesData(childRandomizer, 5);
            }
            currData.push(dataObj);
        }
        return currData;
    }

    private randomizeDateTime(rnd: Mulberry32): Date {
        const now = new Date();

        // Generate a random date in the current year up to the current month/day
        const year = now.getFullYear();
        const month = this.generateRandomNumber(rnd, 0, now.getMonth()); // 0 to current month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const day = this.generateRandomNumber(rnd, 1, daysInMonth); // 1 to last day of month

        // Generate random time
        const hours = this.generateRandomNumber(rnd, 0, 23);
        const minutes = this.generateRandomNumber(rnd, 0, 59);
        const seconds = this.generateRandomNumber(rnd, 0, 59);

        const date = new Date(year, month, day, hours, minutes, seconds);
        return date;
    }

    private randomizeBoolean(rnd: Mulberry32): boolean {
        const number = this.generateRandomNumber(rnd, 0, 10);
        return number >= 5;
    }

    private randomizeAthleteNumber(value: number, rnd: Mulberry32): number {
        const number = this.generateRandomNumber(rnd, 0, 100);
        return number % 2 ? value + number : value - number;
    }

    private randomizePercentage(rnd: Mulberry32): number {
        const value = rnd.random(); // returns value in [0, 1)
        return Math.floor(value * 1000) / 1000;
    }

    private randomizeSalary(rnd: Mulberry32): number {
        return this.generateRandomNumber(rnd, 80_000, 100_000);
    }

    private generateStoreNames(countryStoreKeys: string[]): StoreByCountry {
        const newStoreNames: StoreByCountry = {};
        for (let s = 0; s < countryStoreKeys.length; s++) {
            const countryName = countryStoreKeys[s];
            const countryStores = countryName ? storeNames[countryName as keyof typeof storeNames] : undefined;
            if (!countryName || !countryStores) {
                continue;
            }
            const curCountryMalls = countryStores.length;
            const newStores = [];
            for (let m = 0; m < curCountryMalls; m++) {
                const store = countryStores[m];
                if (store) {
                    newStores.push({ city: store.city, mall: store.mall });
                }
            }

            newStoreNames[countryName] = newStores;
        }
        return newStoreNames;
    }

    private formatDateTime(date: Date) {
        // Format: MM/DD/YYYY HH:mm:ss
        const formatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ` +
            `${this.pad(date.getHours())}:${this.pad(date.getMinutes())}:${this.pad(date.getSeconds())}`;
        return formatted;
    }

    // Helper for leading zeros
    private pad(num: number): string {
        return num.toString().padStart(2, '0');
    }

    private generateRandomNumber(rnd: Mulberry32, min: number, max: number): number {
        return Math.floor(rnd.random() * (max - min + 1)) + min;
    }

}
