export class Logger {
  loaders = import.meta.glob("./images/*.svg", {
    query: "?url",
    import: "default",
  });

  logCity(city) {
    const currentCity = document.querySelector("#city");
    currentCity.textContent = city;
  }

  async logCurrent(infoEntries, unit) {
    const data = Object.fromEntries(infoEntries);
    const temp = document.querySelector("#current-temp");
    const iconImg = document.querySelector("#current-icon");
    const description = document.querySelector("#current-description");
    const realFeel = document.querySelector("#current-real-feel");
    const currentDetails = document.querySelector("#current-details");

    temp.textContent = `${Math.round(data.temperature)} ${unit}`;
    description.textContent = data.description ?? data.icon;
    realFeel.textContent = `Real feel: ${Math.round(data["real feel"])} ${unit}`;

    try {
      iconImg.src = await this.loadIconUrl(data.icon);
      iconImg.alt = data.icon ?? "weather icon";
    } catch (error) {
      iconImg.removeAttribute("src");
      iconImg.alt = "weather icon";
      console.error(error);
    }

    currentDetails.innerHTML = "";
    const detailItems = [
      ["Humidity", `${data.humidity}%`],
      ["UV Index", data.uvindex],
    ];
    detailItems.forEach(([label, value]) => {
      const item = document.createElement("li");
      item.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
      currentDetails.appendChild(item);
    });
  }

  // TODO logWeatherAsBG
  async logWeatherAsBG(iconText) {
    const weatherAsBG = document.querySelector("#app");
    weatherAsBG.style.backgroundImage = `url(${this.wAnimation()})`;
    console.log(weatherAsBG);
  }

  wAnimation() {
    return "./animations/windy.webm";
  }

  async log(Info, type, unit) {
    const container = document.querySelector(`#${type}`);
    container.innerHTML = "";

    for (let i = 0; i < Info.length; i++) {
      const data = Object.fromEntries(Info[i]);
      const wrapper = document.createElement("div");
      wrapper.className = "forecast-card";

      const title = document.createElement("p");
      title.className = "forecast-title";
      title.textContent =
        type === "daily" ? data.day : `${String(data.hour).padStart(2, "0")}:00`;

      const icon = document.createElement("img");
      icon.src = await this.loadIconUrl(data.icon);
      icon.alt = data.icon ?? `${type} icon`;

      const temp = document.createElement("p");
      temp.className = "forecast-temp";
      const tempValue = Number.isFinite(Number(data.temp))
        ? Math.round(Number(data.temp))
        : data.temp ?? "-";
      temp.textContent = `${tempValue} ${unit}`;

      const meta = document.createElement("p");
      meta.className = "forecast-meta";
      const feelValue = Number.isFinite(Number(data["real feel"]))
        ? `${Math.round(Number(data["real feel"]))} ${unit}`
        : "-";
      meta.textContent = `Feels ${feelValue} • Humidity ${data.humidity}%`;

      wrapper.appendChild(title);
      wrapper.appendChild(icon);
      wrapper.appendChild(temp);
      wrapper.appendChild(meta);
      container.appendChild(wrapper);
    }
  }

  loadIconUrl(name) {
    const key = `./images/${name}.svg`;
    const loader = this.loaders[key];
    if (loader) return loader();

    const fallback = this.loaders["./images/partly-cloudy-day.svg"];
    if (fallback) {
      return fallback();
    }
    throw new Error(`Icon not found: ${name}`);
  }

  // async generateGif(input) {
  //   const response = await fetch(
  //     `https://api.giphy.com/v1/gifs/translate?api_key=f8tP39se0V3gozKPnYMR01EPSenDRSeg&s=${input}`,
  //   );
  //   const promise = await response.json();
  //   return promise["data"]["images"]["original"]["url"];
  // }
}
