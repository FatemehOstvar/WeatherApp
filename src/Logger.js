export class Logger {

    logCurrent(Info) {
        let cnt = 0
        // put an image of the corresponding icon and append it as child
        const temp = document.querySelector("#current>:nth-child(1)>p");
        const iconText = document.querySelector("#current>:nth-child(1)>:nth-child(2)>p:nth-child(2)");// TODO later change it to condition itself
        const realFeel = document.querySelector("#current>:nth-child(1)>:nth-child(2)>p:nth-child(2)");
        const descriptionText = document.querySelector("#current>:nth-child(3)");
        cnt = 4
        const CurrentConditions = document.querySelector("#current>:nth-child(2)"); // parent
        console.log(Info.length - cnt)
        console.log(Info.length)
        let DomTitle = new Array(Info.length - cnt)
        let DomContent = new Array(Info.length - cnt)

        for (let i = Info.length; i >= Info.length - cnt; i++) {
            DomTitle[i] = document.createElement('p')
            DomContent[i] = document.createElement('p')
        }
        for (let j = Info.length; j >= Info.length - cnt; j++) {
            DomTitle[j] = Info[j][0]
            DomContent[j] = Info[j][1]
        }
        for (let j = Info.length; j >= Info.length - cnt; j++) {
            CurrentConditions.appendChild(DomTitle[j])
            CurrentConditions.appendChild(DomContent[j])
        }
        //             temperature: await this.data["currentConditions"]["temp"],
        //             "real feel": await this.data["currentConditions"]["feelslike"],
        //             humidity: await this.data["currentConditions"]["humidity"],
        //             icon: await this.data["currentConditions"]["icon"],
        //             uvindex: await this.data["currentConditions"]["uvindex"],
        //             description: await this.data["currentConditions"]["description"],
    }

    async logWeatherAsBG(iconText) {
        const weatherAsBG = document.querySelector("#App");
        weatherAsBG.style.backgroundImage = await this.generateGif(iconText)
    }

    log(Info, type) {
        let dom1 = new Array(24)
        let dom2 = new Array(24)
        let dom3 = new Array(24)
        console.log(Info.length, type)
        //get dom
        for (let i = 1; i <= Info.length; i++) {
            dom1[i - 1] = document.querySelector(`#${type}>div:nth-Child(${i})>div:nth-Child(1)`)
            dom2[i - 1] = document.querySelector(`#${type}>div:nth-Child(${i})>:nth-Child(2)`)
            dom3[i - 1] = document.querySelector(`#${type}>div:nth-Child(${i})>:nth-Child(3)`)

        }
        // populate dom
        for (let i = 0; i < Info.length; i++) {
            dom1[i].textContent = Info[i][0][1]
            dom2[i].src = Info[i][3][1] // await this.generateGif(Info[i][3][1])
            dom3[i].textContent = Info[i][5][1]
        }

    }

    async generateGif(input) {
        const response = await fetch(`https://api.giphy.com/v1/gifs/translate?api_key=f8tP39se0V3gozKPnYMR01EPSenDRSeg&s=${input}`)
        const promise = await response.json()
        return promise['data']['images']['original']['url']
    }

}
