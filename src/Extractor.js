export class Extractor {
  data;
  icon;
  constructor(city, unit) {
    this.city = city;
    this.unit = unit;
  }

  async extract() {
    const temperature = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${this.city}?unitGroup=${this.unit}&key=E47KCVVZKD5PP9P3WD2KRQFDC`,
    );
    this.data = await temperature.json();
  }

  async extractCurrent() {
    return [
      {
        temperature: await this.data["currentConditions"]["temp"],
        icon: await this.data["currentConditions"]["icon"],
        "real feel": await this.data["currentConditions"]["feelslike"],
        description: await this.data["currentConditions"]["description"],
        humidity: await this.data["currentConditions"]["humidity"],
        uvindex: await this.data["currentConditions"]["uvindex"],
      },
    ];
  }

  // should return an array of size 14
  // this length used is different from that length
  async extractDaily() {
    const days = await this.data["days"];
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return Array.from({ length: days.length - 1 }, (_, i) => {
      return {
        day: daysOfWeek[new Date(days[i]["datetime"]).getDay()],
        "real feel": days[i]["feelslike"],
        humidity: days[i]["humidity"],
        icon: days[i]["icon"],
        uvindex: days[i]["uvindex"],
        temp: days[i]["temp"],
        tempmin: days[i]["tempmin"],
        tempmax: days[i]["tempmax"],
        conditions: days[i]["conditions"],
      };
    });
  }

  // should return an array of size 24
  async extractHourly() {
    let hours = [
      ...(await this.data["days"][0]["hours"]),
      ...(await this.data["days"][1]["hours"]),
    ];
    let time = await this.data["currentConditions"]["datetime"].split(":")[0];
    let starter;
    if (parseInt(time) === 23) {
      starter = 0;
    } else {
      for (let i = 0; i < 48; i++) {
        if (hours[i]["datetime"] > time) {
          starter = i;
          break;
        }
      }
    }
    hours = hours.slice(starter, 24 + starter);

    return Array.from({ length: hours.length }).map((_, i) => {
      return {
        hour: parseInt(hours[i]["datetime"].split(":")[0]),
        "real feel": hours[i]["feelslike"],
        humidity: hours[i]["humidity"],
        icon: hours[i]["icon"],
        uvindex: hours[i]["uvindex"],
        temp: hours[i]["temp"],
        conditions: hours[i]["consditions"],
      };
    });
  }
}

// export class Test {
//   constructor() {
//     const n = new Extractor();
//     n.extractHourly();
//   }
// }
//
