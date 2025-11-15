export class Logger {
  loaders = import.meta.glob(
    "./images/*.svg",
    { as: "url" },
    //{query: '?url'}
  );

  logCity(city) {
    const Currcity = document.querySelector("#city");
    Currcity.textContent = city;
  }

  logCurrent(Info, unit) {
    let cnt = 0;
    // put an image of the corresponding icon and append it as child
    const temp = document.querySelector("#current>*>:first-child");
    const iconText = document.querySelector(
      "#current>:nth-child(1)>:nth-child(2)>p:nth-child(1)",
    ); // TODO later change it to condition itself
    const realFeel = document.querySelector(
      "#current>:nth-child(1)>:nth-child(2)>p:nth-child(2)",
    );
    cnt = 4;
    const CurrentConditions = document.querySelector("#CurrentConds>div"); // parent
    CurrentConditions.textContent = "";
    // console.log(Info.length - cnt)
    // console.log(Info.length)
    let Dom = [temp, iconText, realFeel];
    // Dom.map((_, i) => {
    //     Dom[i].textContent = `${Info[i][0]} : ${Info[i][1]}`;
    // })
    Dom[0].textContent = `${Info[0][1]} ${unit}`;
    Dom[1].textContent = `${Info[1][1]}`;
    Dom[2].textContent = `${Info[2][0]} : ${Info[2][1]} ${unit}`;
    console.log();
    // console.log(typeof Info)
    let DomTitle = new Array(Info.length - cnt);
    let DomContent = new Array(Info.length - cnt);
    let parentC = new Array(Info.length - cnt);
    for (let j = Info.length - 1; j >= cnt; j--) {
      DomTitle[j] = document.createElement("div");
      DomContent[j] = document.createElement("div");
      parentC[j] = document.createElement("div");
    }

    for (let j = Info.length - 1; j >= cnt; j--) {
      DomTitle[j].textContent = Info[j][0];
      DomContent[j].textContent = Info[j][1];
    }
    for (let j = Info.length - 1; j >= cnt; j--) {
      parentC[j].appendChild(DomTitle[j]);
      parentC[j].appendChild(DomContent[j]);
      CurrentConditions.appendChild(parentC[j]);
    }
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
    let dom1 = new Array(24);
    let dom2 = new Array(24);
    let dom3 = new Array(24);
    console.log(Info.length, type);
    //get dom
    for (let i = 1; i <= Info.length; i++) {
      dom1[i - 1] = document.querySelector(
        `#${type}>div:nth-Child(${i})>div:nth-Child(1)`,
      );
      dom2[i - 1] = document.querySelector(
        `#${type}>div:nth-Child(${i})>:nth-Child(2)`,
      );
      dom3[i - 1] = document.querySelector(
        `#${type}>div:nth-Child(${i})>:nth-Child(3)`,
      );
    }
    // populate dom
    for (let i = 0; i < Info.length; i++) {
      dom1[i].textContent = Info[i][0][1];
      dom2[i].src = await this.loadIconUrl(Info[i][3][1]);
      dom2[i].alt = Info[i][3][1];
      dom3[i].textContent = `${Info[i][5][1]} ${unit}`;
    }
  }

  loadIconUrl(name) {
    const key = `./images/${name}.svg`;
    const loader = this.loaders[key];
    if (!loader) throw new Error(`Icon not found: ${name}`);
    return loader();
  }

  // async generateGif(input) {
  //   const response = await fetch(
  //     `https://api.giphy.com/v1/gifs/translate?api_key=f8tP39se0V3gozKPnYMR01EPSenDRSeg&s=${input}`,
  //   );
  //   const promise = await response.json();
  //   return promise["data"]["images"]["original"]["url"];
  // }
}
