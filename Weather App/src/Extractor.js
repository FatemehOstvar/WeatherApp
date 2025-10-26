export class Extractor {
  data;

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
    return {
      temperature: await this.data["currentConditions"]["temp"],
      "real feel": await this.data["currentConditions"]["feelslike"],
      humidity: await this.data["currentConditions"]["humidity"],
      icon: await this.data["currentConditions"]["icon"],
      uvindex: await this.data["currentConditions"]["uvindex"],
      description: await this.data["currentConditions"]["description"],
    };
  }

  // should return an array of size 14
  // !!! I changes length: days.length -1 to length: days.length
  async extractDaily() {
    const days = await this.data["days"];
    return Array.from({ length: days.length }, (_, i) => {
      return {
        day: days[i]["datetime"],
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

    let time = await this.data["currentConditions"]["datetime"];
    let starter;
    for (let i = 0; i < 48; i++) {
      if (hours[i]["datetime"] > time) {
        starter = i;
        break;
      }
    }
    hours = hours.slice(starter, 25 + starter);

    return Array.from({ length: hours.length }).map((_, i) => {
      return {
        hour: hours[i]["datetime"],
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
