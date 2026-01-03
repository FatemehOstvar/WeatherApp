export default class Login {
  constructor() {
    (async () => {
      this.initialize();
    })();
    this.preFillForm();
  }

  async sendForm(data) {
    let response;
    try {
      response = await fetch("http://localhost:4000/login", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(data),
      });
    } catch {
      throw new Error("Network error. Check your connection and try again.");
    }

    // //
    // // const res = await fetch(url, options);
    // if (!response.ok) {
    //   const errBody = await res.json().catch(() => ({}));
    //   const msg = errBody.msg || errBody.error || "Login failed";
    // //   throw new Error(msg);
    // }
    return response;
  }

  preFillForm() {
    this.setData("", "");
  }

  updateFormData({ username, password }) {
    this.setData(username, password);
  }

  initialize() {
    const submitButton = document.querySelector('button[type="submit"]');
    submitButton.addEventListener("click", async (ev) => {
      ev.preventDefault();
      this.updateFormData(this.getData());
      try {
        const result = await this.sendForm(this.getData());
        if (result.ok) {
          window.location.href = "/index.html";
        } else {
          this.displayError(resp.msg);
        }
        // window.location.href = "/index.html";
      } catch (error) {
        console.error(error);
        this.displayError(error.message);
      }
    });
  }

  displayError(text) {
    const container = document.createElement("div");
    container.id = "error";
    const parent = document.querySelector("body>div>form") || document.body;
    parent.prepend(container);
    container.textContent = text;
  }

  getData() {
    return {
      username: document.querySelector('input[name="username"]').value,
      password: document.querySelector('input[name="password"]').value,
    };
  }

  setData(username = "", password = "") {
    const userEl = document.querySelector('input[name="username"]');
    const passEl = document.querySelector('input[name="password"]');
    if (userEl) userEl.value = username;
    if (passEl) passEl.value = password;
  }
}

new Login();
