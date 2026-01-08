import "./style.css";
import { Logger } from "./Logger.js";
import { Extractor } from "./Extractor.js";
import { Organizer } from "./Organizer.js";

class Main {
  constructor() {
    this.unit = "metric";
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("city");
    const fromLS = localStorage.getItem("selectedCity");
    const toTitleCase = (s) =>
      s
        .trim()
        .toLowerCase()
        .replace(/\b\p{L}/gu, (ch) => ch.toUpperCase());

    const entered = fromUrl ?? fromLS ?? "Rasht";
    this.enteredCity = toTitleCase(entered);

    this.sign = {
      metric: " °C",
      us: " °F",
      // uk: " °C",
      // base: " K",
    };
    this.role = "spectator";
  }

  async initialize() {
    this.role = await this.getRole();
    await this.setAccount();
    this.SetCity();
    this.toggleUnit();
    this.role !== "spectator" ? this.addAddCitySVG() : this.removeAddCitySVG();
    this.logger = new Logger();
    this.extractor = new Extractor(this.enteredCity, this.unit);
    this.organizer = new Organizer();
  }

  // SetCity() {
  //   const btn = document.querySelector('button[name="change-city"]');
  //   btn.innerHTML = ``;
  //   btn.addEventListener("click", async () => {
  //     this.enteredCity = prompt("City?");
  //     this.extractor = new Extractor(this.enteredCity, this.unit);
  //     await this.display();
  //   });
  // }
  SetCity() {
    const btn = document.querySelector('button[name="change-city"]');

    btn.innerHTML = `<svg  height="40px" width="40px" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 264.018 264.018" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier"> <g> <path
                    d="M132.009,0c-42.66,0-77.366,34.706-77.366,77.366c0,11.634,2.52,22.815,7.488,33.24c0.1,0.223,0.205,0.442,0.317,0.661 l58.454,113.179c2.146,4.154,6.431,6.764,11.106,6.764c4.676,0,8.961-2.609,11.106-6.764l58.438-113.148 c0.101-0.195,0.195-0.392,0.285-0.591c5.001-10.455,7.536-21.67,7.536-33.341C209.375,34.706,174.669,0,132.009,0z M132.009,117.861c-22.329,0-40.495-18.166-40.495-40.495c0-22.328,18.166-40.494,40.495-40.494s40.495,18.166,40.495,40.494 C172.504,99.695,154.338,117.861,132.009,117.861z"></path>
                <path d="M161.81,249.018h-59.602c-4.143,0-7.5,3.357-7.5,7.5c0,4.143,3.357,7.5,7.5,7.5h59.602c4.143,0,7.5-3.357,7.5-7.5 C169.31,252.375,165.952,249.018,161.81,249.018z"></path> </g> </g></svg>`;

    btn.addEventListener("click", async () => {
      const raw = await this.openCityModal(this.enteredCity);
      if (raw == null) return;

      const normalized = this.normalizeCityName(raw);

      if (!this.isValidCityFormat(normalized)) {
        alert("Invalid city name format.");
        return;
      }

      const [ok, resolved] = await this.ensureCityExistsInWeather(normalized);
      if (!ok) {
        alert("City not found. Please enter a real city.");
        return;
      }

      this.enteredCity = resolved;

      localStorage.setItem("selectedCity", normalized);
      const url = new URL(window.location.href);
      url.searchParams.set("city", normalized);
      window.history.replaceState({}, "", url);

      this.extractor = new Extractor(this.enteredCity, this.unit);
      await this.display();
    });
  }

  removeAddCitySVG() {
    const btn = document.querySelector('button[name="addAddCitySVG"]');
    btn.innerHTML = ``;
    btn.style.display = "none";
  }

  addAddCitySVG() {
    const btn = document.querySelector('button[name="addAddCitySVG"]');
    btn.innerHTML = `<svg  height="200px" width="200px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 34.398 34.398" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier"> <g> <g id="c28_geolocalization"> <path
                    d="M17.202,0C10.749,0,5.515,5.197,5.515,11.607c0,3.281,3.218,9.156,3.218,9.156l8.039,13.635l8.386-13.477 c0,0,3.726-5.605,3.726-9.314C28.883,5.197,23.653,0,17.202,0z M17.147,18.002c-3.695,0-6.688-2.994-6.688-6.693 c0-3.693,2.993-6.686,6.688-6.686c3.693,0,6.69,2.992,6.69,6.686C23.837,15.008,20.84,18.002,17.147,18.002z"></path>
                <polygon
                        points="18.539,7.233 15.898,7.233 15.898,10.242 12.823,10.242 12.823,12.887 15.898,12.887 15.898,15.985 18.539,15.985 18.539,12.887 21.576,12.887 21.576,10.242 18.539,10.242 "></polygon> </g>
                <g id="Capa_1_146_"> </g> </g> </g></svg>`;
    btn.addEventListener("click", async () => {
      const city = this.normalizeCityName(this.enteredCity);
      if (!this.isValidCityFormat(city)) {
        alert("Invalid city name.");
        return;
      }
      const res = await fetch("/api/cities", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ city_name: this.enteredCity }),
      });

      if (res.status === 409) {
        alert("That city is already saved.");
        return;
      }
      if (!res.ok) {
        const msg = await res.text();
        alert(`Failed to save city: ${res.status} ${msg}`);
        return;
      }
      const svg = document.querySelector('button[name="addAddCitySVG"]>svg');
      svg.style = "background: rgb(232 80 250)";
    });
  }

  async getRole() {
    try {
      const res = await fetch("/api/role", {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        return "spectator";
      }
      const data = await res.json(); // the data is coming as spectator after login

      return data?.role ?? "spectator";
    } catch {
      return "spectator";
    }
  }

  async setAccount() {
    const btn = document.querySelector('button[name="account"]');

    btn.addEventListener("click", async () => {
      if (this.role === "user") {
        window.location.href = "/pages/cities.html";
      } else if (this.role === "admin") {
        window.location.href = "/pages/cities.html";
      } else {
        window.location.href = "/pages/signup.html";
      }
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

  normalizeCityName(s) {
    return s
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase()
      .replace(/\b\p{L}/gu, (ch) => ch.toUpperCase());
  }

  // allow letters + spaces + - ' .  (no digits, no random "rfdfd" prevention alone,
  // but this blocks obvious garbage; true validation is server-side check below)
  isValidCityFormat(s) {
    const v = s.trim();
    if (v.length < 2 || v.length > 60) return false;
    return /^[\p{L}]+(?:[ .'-][\p{L}]+)*$/u.test(v);
  }

  async ensureCityExistsInWeather(city) {
    try {
      let res = await fetch("/api/validateCity?city=" + city);
      res = await res.json();
      if (res.valid === true) {
        return [true, res.resolvedAddress];
      }
    } catch {
      return false;
    }
  }

  ensureCityDialog() {
    let dlg = document.getElementById("cityDialog");
    if (dlg) return dlg;

    dlg = document.createElement("dialog");
    dlg.id = "cityDialog";
    dlg.innerHTML = `
    <form method="dialog" class="cityDialog__panel">
      <h3 class="cityDialog__title">Choose a city</h3>

      <label class="cityDialog__label">
        City name
        <input id="cityDialogInput" class="cityDialog__input" autocomplete="off" />
      </label>

      <p id="cityDialogHint" class="cityDialog__hint">Use real city names (e.g., Rasht, New York).</p>
      <p id="cityDialogError" class="cityDialog__error" role="alert" aria-live="polite"></p>

      <div class="cityDialog__actions">
        <button value="cancel" class="cityDialog__btn cityDialog__btn--ghost">Cancel</button>
        <button id="cityDialogOk" value="ok" class="cityDialog__btn">Apply</button>
      </div>
    </form>
  `;
    document.body.appendChild(dlg);
    return dlg;
  }

  openCityModal(initialValue = "") {
    const dlg = this.ensureCityDialog();
    const input = dlg.querySelector("#cityDialogInput");
    const err = dlg.querySelector("#cityDialogError");

    err.textContent = "";
    input.value = initialValue;

    return new Promise((resolve) => {
      const onClose = () => {
        dlg.removeEventListener("close", onClose);
        resolve(dlg.returnValue === "ok" ? input.value : null);
      };
      dlg.addEventListener("close", onClose);
      dlg.showModal();
      input.focus();
      input.select();
    });
  }
}

(async () => {
  const main = new Main();
  await main.initialize();
  await main.display();
})();
