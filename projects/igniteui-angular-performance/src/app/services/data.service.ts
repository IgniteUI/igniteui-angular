import { Injectable } from '@angular/core';
import { Mulberry32 } from '../lib/mulberry';
import { DATA as athletesData } from "../data/athletesData"
import { EMPLOYEES_DATA } from '../data/employeesData';
import { brandNames, flags, monthsMaxDays, storeNames } from '../data/pivotData';


@Injectable({
    providedIn: 'root'
})
export class DataService {
    constructor() { }
    public generateData(rows: number): any[] {
        const rnd = new Mulberry32(1234);
        const data = this.generateAthletesData(rnd, rows);
        return data;
    }

    public generateTreeData(rows: number): any[] {
        const rnd = new Mulberry32(1234);
        const data = this.generateEmployeesData(rnd, rows);
        return data;
    }

    public generatePivotData(rows: number) {
        const rnd = new Mulberry32(1234);
        const data = this.generateSalesData(rnd, rows);
        return data;
    }

    private generateSalesData(rnd: Mulberry32, rows: number): any[] {
        const numCountries = 6;
        const numRecsPerCountry = rows/1.2;
        const countryStoreKeys = Object.keys(storeNames);
        const newStoreNames = this.generateStoreNames(countryStoreKeys, 100);

        const newCountryStoreKeys = Object.keys(newStoreNames);
        let maxNumMalls = newStoreNames[newCountryStoreKeys[0]].length * 3;
        for (let s = 1; s < newCountryStoreKeys.length; s++) {
            const curCountryMalls = newStoreNames[newCountryStoreKeys[s]].length;
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

        const data = [];
        for (let c = 0; c < numCountries; c++) {
            const countryName = flags[c];
            const numMallsForCountry = newStoreNames[countryName].length;
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
                        const storeInfo = newStoreNames[countryName][m];
                        const storeName = storeInfo["mall"].indexOf(storeInfo["city"]) !== -1 ? storeInfo["mall"] : storeInfo["mall"] + ", " + storeInfo["city"];

                        data.push({
                            "Store": storeName,
                            "Brand": brandName,
                            "Country": countryName,
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

    private generateEmployeesData(rnd: Mulberry32, rows: number): any[] {
        const currData = [];
        let uniqueId = 1;
        const parentCandidates: number[] = [];
        for (let i = 0; i < rows; i++) {
            const rand = Math.floor(rnd.random() * Math.floor(EMPLOYEES_DATA.length));
            const dataObj = Object.assign({}, EMPLOYEES_DATA[rand]);
            dataObj.ID = uniqueId++;
            if (currData.length > 0 && rnd.random() > 0.2) {
                const parentIndex = Math.floor(rnd.random() * parentCandidates.length);
                dataObj.ParentID = parentCandidates[parentIndex];
            } else {
                dataObj.ParentID = -1; // Root node
            }
            dataObj["CheckedIn"] = this.formatDateTime(this.randomizeDateTime(rnd));
            dataObj["CareerStart"] = this.formatDateTime(this.randomizeDateTime(rnd));
            dataObj["GrossSalary"] = this.randomizeSalary(rnd);
            dataObj["PTO"] = this.randomizeBoolean(rnd);
            dataObj["SuccessRate"] = this.randomizePercentage(rnd);
            parentCandidates.push(dataObj.ID);

            currData.push(dataObj);
        }
        return currData;
    }

    private generateAthletesData(rnd: Mulberry32, rows: number): any[] {
        const currData = [];
        for (let i = 0; i < rows; i++) {
            const rand = Math.floor(rnd.random() * Math.floor(athletesData.length));
            const dataObj = Object.assign({}, athletesData[rand]);
            dataObj["Registered"] = this.formatDateTime(this.randomizeDateTime(rnd));
            dataObj["FirstAppearance"] = this.formatDateTime(this.randomizeDateTime(rnd));
            dataObj["CareerStart"] = this.formatDateTime(this.randomizeDateTime(rnd));
            dataObj["Active"] = this.randomizeBoolean(rnd);
            dataObj["SuccessRate"] = this.randomizePercentage(rnd);
            dataObj["AthleteNumber"] = this.randomizeAthleteNumber(dataObj["AthleteNumber"], rnd);
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

    private generateStoreNames(countryStoreKeys: string[], storesCount: number) {
        const newStoreNames = {}
        for (let s = 0; s < countryStoreKeys.length; s++) {
            const curCountryMalls = storeNames[countryStoreKeys[s]].length;
            const newStores = [];
            for (let m = 0; m < curCountryMalls; m++) {
                const newStoreName = storeNames[countryStoreKeys[s]][m]["mall"];
                for (let k = 0; k < storesCount; k++) {
                    newStores.push({ "city": storeNames[countryStoreKeys[s]][m]["city"], "mall": newStoreName + k });
                    newStores.push({ "city": storeNames[countryStoreKeys[s]][m]["city"], "mall": newStoreName + 'A' + k });
                    newStores.push({ "city": storeNames[countryStoreKeys[s]][m]["city"], "mall": newStoreName + 'B' + k });
                    newStores.push({ "city": storeNames[countryStoreKeys[s]][m]["city"], "mall": newStoreName + 'C' + k });
                    newStores.push({ "city": storeNames[countryStoreKeys[s]][m]["city"], "mall": newStoreName + 'D' + k });
                }

            }

            newStoreNames[countryStoreKeys[s]] = newStores;
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

    private generateRandomNumber(rnd, min, max) {
        return Math.floor(rnd.random() * (max - min + 1)) + min;
    }

}
