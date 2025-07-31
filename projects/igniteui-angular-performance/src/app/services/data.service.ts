import { Injectable } from '@angular/core';
import { Mulberry32 } from '../lib/mulberry';
import { DATA as athletesData } from "../data/athletesData"
import { EMPLOYEES_DATA } from '../data/employeesData';


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
