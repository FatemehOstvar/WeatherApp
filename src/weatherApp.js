import { Extractor } from "./Extractor.js";
import { Logger } from "./Logger.js";
import { Organizer } from "./Organizer.js";

export class WeatherApp {
  constructor() {
    this.unit = "metric";
    this.enteredCity = "Rasht";
    this.sign = {
      metric: "°C",
      us: "°F",
    };
    this.logger = new Logger();
    this.organizer = new Organizer();
    this.extractor = new Extractor(this.enteredCity, this.unit);
    this.#registerCityControl();
    this.#registerUnitToggle();
    this.#renderThermometer();
  }

  async display() {
    this.logger.logCity(this.enteredCity);
    await this.extractor.extract();

    const currentDataText = this.organizer.organize(
      await this.extractor.extractCurrent(),
    );
    const dailyDataText = this.organizer.organize(
      await this.extractor.extractDaily(),
    );
    const hourlyDataText = this.organizer.organize(
      await this.extractor.extractHourly(),
    );

    this.#renderThermometer();
    await this.logger.logCurrent(currentDataText[0], this.sign[this.unit]);
    await this.logger.log(dailyDataText, "daily", this.sign[this.unit]);
    await this.logger.log(hourlyDataText, "hourly", this.sign[this.unit]);
    await this.logger.logWeatherAsBG(currentDataText[0][1][1]);
  }

  async refresh() {
    this.extractor = new Extractor(this.enteredCity, this.unit);
    await this.display();
  }

  #registerCityControl() {
    const btn = document.querySelector('button[name="change-city"]');
    btn?.addEventListener("click", async () => {
      const input = prompt("City?", this.enteredCity);
      if (input) {
        this.enteredCity = input;
        await this.refresh();
      }
    });
  }

  #registerUnitToggle() {
    const thermometer = document.querySelector("#thermometer");
    thermometer?.addEventListener("click", async () => {
      this.unit = this.unit === "metric" ? "us" : "metric";
      await this.refresh();
    });
  }

  #renderThermometer() {
    const thermometer = document.querySelector("#thermometer");
    if (!thermometer) return;
    thermometer.innerHTML = "";
    const isMetric = this.sign[this.unit] === this.sign.metric;
    thermometer.textContent = isMetric ? "°C" : "°F";
  }
}
