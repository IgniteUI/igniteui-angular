import { Injectable } from '@angular/core';
import { Mulberry32 } from '../lib/mulberry';
import { DATA as athletesData } from "../data/athletesData"


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

    private randomizePercentage(rnd: Mulberry32): number {
        const value = rnd.random(); // returns value in [0, 1)
        return Math.floor(value * 1000) / 1000;
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
