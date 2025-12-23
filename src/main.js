import "./style.css";
import { Logger } from "./Logger.js";
import { Extractor } from "./Extractor.js";
import { Organizer } from "./Organizer.js";
import { AuthUI } from "./auth/ui.js";

class Main {
  constructor() {
    this.unit = "metric";
    this.enteredCity = "Rasht";
    this.sign = {
      metric: " °C",
      us: " °F",
      // uk: " °C",
      // base: " K",
    };
    this.initialize();
  }

  initialize() {
    this.SetCity();
    this.toggleUnit();
    this.logger = new Logger();
    this.extractor = new Extractor(this.enteredCity, this.unit);
    this.organizer = new Organizer();
  }

  SetCity() {
    const btn = document.querySelector('button[name="change-city"]');
    btn.addEventListener("click", async (event) => {
      this.enteredCity = prompt("City?");
      this.extractor = new Extractor(this.enteredCity, this.unit);
      await this.display();
    });
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
    this.createSpecificThermometer();
    this.logger.logCurrent(currentDataText[0], this.sign[this.unit]);
    await this.logger.log(dailyDataText, "daily", this.sign[this.unit]);
    await this.logger.log(hourlyDataText, "hourly", this.sign[this.unit]);
    console.log(typeof currentDataText[0][1][1]);
    await this.logger.logWeatherAsBG(currentDataText[0][1][1]);
  }

  toggleUnit() {
    const thermometer = document.querySelector("#thermometer");
    thermometer.addEventListener("click", async () => {
      this.unit === "metric" ? (this.unit = "us") : (this.unit = "metric");
      this.extractor = new Extractor(this.enteredCity, this.unit);
      await this.display();
    });
  }

  createSpecificThermometer() {
    const thermometer = document.querySelector("#thermometer");
    thermometer.innerHTML = "";
    const FbtnSVG =
      '<svg width="40px" height="40px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg"\n' +
      "        >\n" +
      "\n" +
      "            <title>thermometer_f [#746]</title>\n" +
      "            <desc>Created with Sketch.</desc>\n" +
      "            <defs>\n" +
      "\n" +
      "            </defs>\n" +
      '            <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\n' +
      '                <g id="Dribbble-Light-Preview" transform="translate(-140.000000, -4919.000000)" fill="#000000">\n' +
      '                    <g id="icons" transform="translate(56.000000, 160.000000)">\n' +
      '                        <path d="M94,4764 L94,4764 C94,4764.552 93.552,4765 93,4765 L90,4765 L90,4766 C90,4766.552 89.552,4767 89,4767 C88.448,4767 88,4766.552 88,4766 L88,4765 L88,4763 L88,4761 C88,4759.895 88.895,4759 90,4759 L93,4759 C93.552,4759 94,4759.448 94,4760 C94,4760.552 93.552,4761 93,4761 L91,4761 C90.448,4761 90,4761.448 90,4762 L90,4763 L93,4763 C93.552,4763 94,4763.448 94,4764 L94,4764 Z M84,4760 L84,4760 C84,4759.448 84.448,4759 85,4759 C85.552,4759 86,4759.448 86,4760 C86,4760.552 85.552,4761 85,4761 C84.448,4761 84,4760.552 84,4760 L84,4760 Z M99,4777 C97.346,4777 96,4775.654 96,4774 C96,4772.698 96.839,4771.599 98,4771.184 L98,4769.101 L98,4769 L100,4769 L100,4769.101 L100,4771.184 C101.161,4771.599 102,4772.698 102,4774 C102,4775.654 100.654,4777 99,4777 L99,4777 Z M100,4762 L100,4763 L98,4763 L98,4762 C98,4761.448 98.448,4761 99,4761 C99.552,4761 100,4761.448 100,4762 L100,4762 Z M98,4767 L100,4767 L100,4765 L98,4765 L98,4767 Z M102,4770.023 L102,4761 C102,4759.895 101.105,4759 100,4759 L98,4759 C96.895,4759 96,4759.895 96,4761 L96,4770.023 C94.566,4771.106 93.718,4772.925 94.086,4774.935 C94.443,4776.885 95.988,4778.486 97.929,4778.889 C101.158,4779.559 104,4777.111 104,4774 C104,4772.37 103.208,4770.935 102,4770.023 L102,4770.023 Z"\n' +
      '                              id="thermometer_f-[#746]">\n' +
      "\n" +
      "                        </path>\n" +
      "                    </g>\n" +
      "                </g>\n" +
      "            </g>\n" +
      "        </svg>";

    const Cbtn =
      '<svg width="40px" height="40px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n' +
      "    \n" +
      "    <title>thermometer_c [#745]</title>\n" +
      "    <desc>Created with Sketch.</desc>\n" +
      "    <defs>\n" +
      "\n" +
      "</defs>\n" +
      '    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\n' +
      '        <g id="Dribbble-Light-Preview" transform="translate(-180.000000, -4919.000000)" fill="#000000">\n' +
      '            <g id="icons" transform="translate(56.000000, 160.000000)">\n' +
      '                <path d="M130,4763.13638 L130,4764.12784 C130,4764.67513 130.448,4764.94877 131,4764.94877 L132,4764.94877 L133,4764.94877 C133.545,4764.94877 133.984,4765.46433 133.996,4766.00369 C133.984,4766.54007 133.545,4766.93169 133,4766.93169 L132,4766.93169 L130,4767.01696 C128.896,4767.01696 128,4766.21487 128,4765.1193 L128,4763.13638 L128,4761.15346 L128,4761.06819 C128,4759.97362 128.896,4759 130,4759 L132,4759 L133,4759 C133.552,4759 134,4759.48681 134,4760.03409 L134,4760.07673 C134,4760.62401 133.552,4760.98292 133,4760.98292 L132,4760.98292 L131,4760.98292 C130.448,4760.98292 130,4761.59763 130,4762.14492 L130,4763.13638 Z M134,4766.0255 C134,4766.01856 133.996,4766.01162 133.996,4766.00369 C133.996,4765.99675 134,4765.9908 134,4765.98287 L134,4766.0255 Z M124,4760.16199 L124,4760.16199 C124,4759.61471 124.448,4759.17053 125,4759.17053 C125.552,4759.17053 126,4759.61471 126,4760.16199 C126,4760.70928 125.552,4761.15346 125,4761.15346 C124.448,4761.15346 124,4760.70928 124,4760.16199 L124,4760.16199 Z M139,4777.01684 C137.346,4777.01684 136,4775.68234 136,4774.04246 C136,4772.75158 136.839,4771.66196 138,4771.2505 L138,4769.18529 L138,4768.91462 L140,4768.91462 L140,4769.18529 L140,4771.2505 C141.161,4771.66196 142,4772.75158 142,4774.04246 C142,4775.68234 140.654,4777.01684 139,4777.01684 L139,4777.01684 Z M140,4762.14492 L140,4763.13638 L138,4763.13638 L138,4762.14492 C138,4761.59763 138.448,4761.15346 139,4761.15346 C139.552,4761.15346 140,4761.59763 140,4762.14492 L140,4762.14492 Z M138,4767.10223 L140,4767.10223 L140,4765.1193 L138,4765.1193 L138,4767.10223 Z M142,4770.09942 L142,4761.15346 C142,4760.05789 141.105,4759 140,4759 L138,4759 C136.895,4759 136,4760.05789 136,4761.15346 L136,4770.09942 C134.566,4771.17317 133.718,4772.97664 134.086,4774.96948 C134.443,4776.90283 135.988,4778.49016 137.929,4778.88972 C141.158,4779.554 144,4777.1269 144,4774.04246 C144,4772.42638 143.208,4771.00363 142,4770.09942 L142,4770.09942 Z" id="thermometer_c-[#745]">\n' +
      "\n" +
      "</path>\n" +
      "            </g>\n" +
      "        </g>\n" +
      "    </g>\n" +
      "</svg>";
    this.sign[this.unit] === this.sign["metric"]
      ? (thermometer.innerHTML = Cbtn)
      : (thermometer.innerHTML = FbtnSVG);
  }
}

const main = new Main();
await main.display();

const authUI = new AuthUI();
authUI.initialize();
