export default class Signup {
  constructor() {
    this.form = null;
    this.submitBtn = null;
    this.errorEl = null;

    this.fields = {
      username: null,
      firstName: null,
      lastName: null,
      password: null,
    };

    this.initialize();
  }

  initialize() {
    // Safe even if script is moved to <head>
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.initialize(), {
        once: true,
      });
      return;
    }

    this.form = document.getElementById("signupForm");
    if (!this.form) return;

    this.submitBtn = this.form.querySelector('button[type="submit"]');

    // Ensure we have an error container (create it if missing)
    this.errorEl = this.ensureErrorEl();

    // Cache field elements (DOM-driven, no repeated getElementById calls)
    this.fields.username = this.form.querySelector("#username");
    this.fields.firstName = this.form.querySelector("#firstname");
    this.fields.lastName = this.form.querySelector("#lastname");
    this.fields.password = this.form.querySelector("#password");

    this.form.addEventListener("submit", this.onSubmit);
  }

  ensureErrorEl() {
    let el = document.getElementById("signupError");

    if (!el) {
      el = document.createElement("div");
      el.id = "signupError";
      el.setAttribute("role", "alert");
      el.setAttribute("aria-live", "polite");
      el.style.margin = "10px 0";
      el.style.padding = "10px 12px";
      el.style.border = "1px solid rgba(220, 38, 38, 0.4)";
      el.style.background = "rgba(220, 38, 38, 0.08)";
      el.style.borderRadius = "8px";
      el.style.color = "#b91c1c";
      el.hidden = true;

      // Put it at the top of the form so it’s visible
      this.form.prepend(el);
    }

    return el;
  }

  setError(message) {
    if (!this.errorEl) return;
    const msg = (message || "").trim();

    this.errorEl.textContent = msg;
    this.errorEl.hidden = !msg;
  }

  setLoading(isLoading) {
    // Disable inputs + button while submitting
    Object.values(this.fields).forEach((input) => {
      if (input) input.disabled = isLoading;
    });

    if (!this.submitBtn) return;

    if (!this.submitBtn.dataset.originalText) {
      this.submitBtn.dataset.originalText =
        this.submitBtn.textContent || "Submit";
    }

    this.submitBtn.disabled = isLoading;
    this.submitBtn.textContent = isLoading
      ? "Submitting..."
      : this.submitBtn.dataset.originalText;
  }

  validate() {
    const username = (this.fields.username?.value || "").trim();
    const firstName = (this.fields.firstName?.value || "").trim();
    const lastName = (this.fields.lastName?.value || "").trim();
    const password = this.fields.password?.value || "";

    if (!username) return "Username is required.";
    if (username.length < 3) return "Username must be at least 3 characters.";
    if (!firstName) return "First name is required.";
    if (!lastName) return "Last name is required.";
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";

    return null;
  }

  getData() {
    return {
      username: (this.fields.username?.value || "").trim(),
      firstName: (this.fields.firstName?.value || "").trim(),
      lastName: (this.fields.lastName?.value || "").trim(),
      password: this.fields.password?.value || "",
    };
  }

  onSubmit = async (e) => {
    e.preventDefault();

    this.setError("");

    const validationError = this.validate();
    if (validationError) {
      this.setError(validationError);
      return;
    }

    this.setLoading(true);

    try {
      const response = await this.sendForm(this.getData());
      localStorage.setItem("role", response.role);
      // localStorage.setItem("username", response.username);
      // localStorage.setItem("firstName", response.firstName);
      // localStorage.setItem("lastName", response.lastName);
      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("refToken", response.refreshToken);
      window.location.assign("/index.html");
    } catch (err) {
      this.setError(err?.message || "Signup failed.");
    } finally {
      this.setLoading(false);
    }
  };

  async sendForm(data) {
    let res;
    try {
      res = await fetch("http://localhost:4000/register", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(data),
      });
    } catch {
      // TODO show the user what error it really was instead of this bs.
      throw new Error("Network error. Check your connection and try again.");
    }

    const text = await res.text();
    const payload = (() => {
      try {
        return text ? JSON.parse(text) : {};
      } catch {
        return { raw: text };
      }
    })();

    if (!res.ok) {
      throw new Error(payload?.msg || payload?.message || "Signup failed.");
    }

    return payload;
  }
}

new Signup();
