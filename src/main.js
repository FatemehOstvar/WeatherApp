import "./style.css";
import { Logger } from "./Logger.js";
import { Extractor } from "./Extractor.js";
import { Organizer } from "./Organizer.js";

class Main{
  constructor(){
    this.unit = "metric";
    this.enteredCity = "rasht";
    this.logger = new Logger();
    this.extractor = new Extractor(this.enteredCity, this.unit);
    this.organizer = new Organizer();
  }
  async display(){
    await this.extractor.extract();
    const currentDataText = this.organizer.organizeCurrent(await this.extractor.extractCurrent(), this.unit);
    const dailyDataText = this.organizer.organizeDaily(await this.extractor.extractDaily());
    const hourlyDataText = this.organizer.organizeHourly(await this.extractor.extractHourly());
    this.logger.logCurrent(currentDataText); //give text to Logger
    this.logger.logDailyTemp(dailyDataText);
    this.logger.logHourlyTemp(hourlyDataText);
  }
}

const main= new Main();
// TODO user input should be assessed here
await main.display();
