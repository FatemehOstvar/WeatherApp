export class Logger {

  logCurrent(text) {
    const currentTemp = document.querySelector("#currentTemp");
    // put an image of the corresponding icon and append it as child
    currentTemp.textContent =text;
  }
  logDailyTemp() {
    const dailyTemp = document.querySelector("#dailyTemp");
  }


  logHourlyTemp(hourlyDataText) {
    const hourlyTemp = document.querySelector("#hourlyTemp");
  }
}
