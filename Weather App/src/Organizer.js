export class Organizer {
  constructor(unit) {
    this.unit = unit === "metric" ? "C" : unit === "uk" ? `k` : `F`; //TODO what unit is this
  }
  organizeCurrent(today) {
    return `\n\n${today.temperature} ${this.unit}\n\nreal feel:${today["real feel"]} ${this.unit}`;
  }

  organizeDaily(param) {
    return undefined;
  }

  organizeHourly(param) {
    return undefined;
  }
}
