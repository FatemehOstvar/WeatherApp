export class Extractor {
  data;
  icon;

  constructor(city, unit) {
    this.city = city;
    this.unit = unit;
  }

  async extract() {
    const res = await fetch("http://localhost:3006/api/key");
    const data = await res.json();
    const temperature = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${this.city}?unitGroup=${this.unit}&key=${data["key"]}`,
    );
    this.data = await temperature.json();
  }

  // async checkAvailability(city, unit) {
  //   try {
  //
  //   }
  // }

  async extractCurrent() {
    return [
      {
        temperature: Math.round(await this.data["currentConditions"]["temp"]),
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
        temp: Math.round(days[i]["temp"]),
        tempmin: days[i]["tempmin"],
        tempmax: days[i]["tempmax"],
        conditions: days[i]["conditions"],
      };
    });
  }

  async extractHourly() {
    let hours = [...this.data.days[0].hours, ...this.data.days[1].hours];
    let now = this.data["currentConditions"]["datetimeEpoch"];
    const nowHour = Math.floor(now / 3600) * 3600;

    let starter = hours.findIndex((h) => h.datetimeEpoch >= nowHour);
    if (starter < 0) starter = 0;

    const slice = hours.slice(starter, starter + 24);

    return slice.map((h) => ({
      hour: parseInt(h.datetime.split(":")[0], 10),
      "real feel": h.feelslike,
      humidity: h.humidity,
      icon: h.icon,
      uvindex: h.uvindex,
      temp: Math.round(h.temp),
      conditions: h.conditions, // <- also fix your typo if you use it
    }));
  }
}

// export class Test {
//   constructor() {
//     const n = new Extractor();
//     n.extractHourly();
//   }
// }
//
