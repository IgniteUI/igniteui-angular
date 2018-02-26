import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "timeFormat",
    pure: true
  })
export class IgxTimeFormatPipe implements PipeTransform {

    public transform(value: Date, format: string): string {
        if (value) {
            var hour = value.getHours();
            var minute = value.getMinutes();
            var formattedMinute;  
            var formattedHour;

            if (format.includes("h")){
                var amPM = (hour > 11) ? "PM" : "AM";

                if (hour > 12) {
                    hour -= 12;
                    if (hour < 10 && format.includes("hh")){
                        formattedHour = "0" + hour;
                    } else {
                        formattedHour = hour.toString();
                    }                
                } else if (hour == 0) {                
                    formattedHour = "12";
                } else if (hour < 10 && format.includes("hh")) {
                    formattedHour = "0" + hour;
                } else {
                    formattedHour = hour.toString();
                }
            } else {
                if (hour < 10 && format.includes("HH")) {
                    formattedHour = "0" + hour;
                } else {
                    formattedHour = hour.toString();
                }
            }

            if(minute < 10 && format.includes("mm")) {
                formattedMinute = "0" + minute;
            } else {
                formattedMinute = minute.toString();
            }

            return format.replace("hh",formattedHour).replace("h",formattedHour)
                        .replace("HH",formattedHour).replace("H",formattedHour)
                        .replace("mm",formattedMinute).replace("m",formattedMinute)
                        .replace("tt",amPM);
        } else {
            return format;
        }
    }

}