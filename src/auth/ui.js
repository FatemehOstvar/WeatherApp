import { AuthClient } from "./client.js";
import { authState } from "./state.js";
import { validateLoginPayload, validateSignupPayload } from "./validation.js";

const validators = {
  login: validateLoginPayload,
  signup: validateSignupPayload,
};

export class AuthUI {
  constructor(root = document) {
    this.root = root;
    this.client = new AuthClient();
    this.mode = "login";
    this.modal = this.root.querySelector("#auth-modal");
    this.status = this.root.querySelector("#auth-status");
    this.forms = {
      login: this.root.querySelector("#auth-login-form"),
      signup: this.root.querySelector("#auth-signup-form"),
    };
    this.submitButtons = {
      login: this.root.querySelector("#auth-login-submit"),
      signup: this.root.querySelector("#auth-signup-submit"),
    };
    this.badge = this.root.querySelector("#user-badge");
    this.badgeName = this.root.querySelector("#user-badge-name");
    this.badgeEmail = this.root.querySelector("#user-badge-email");
    this.signOut = this.root.querySelector("#auth-signout");
    this.authActions = this.root.querySelector("#auth-actions");
    this.tabButtons = this.root.querySelectorAll("[data-auth-tab]");
    this.openers = this.root.querySelectorAll("[data-auth-open]");
    this.closeButton = this.root.querySelector("#auth-close");
  }

  initialize() {
    if (!this.modal) return;
    this.bindFormSubmissions();
    this.bindInputValidation();
    this.bindTabSwitching();
    this.bindOpeners();
    this.bindCloseButton();
    this.bindSignOut();
    authState.subscribe((session) => this.renderSession(session));
    this.renderSession(authState.session);
    this.switchMode("login", false);
    this.syncSubmitState("login");
    this.syncSubmitState("signup");
  }

  bindFormSubmissions() {
    ["login", "signup"].forEach((mode) => {
      const form = this.forms[mode];
      if (!form) return;
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        await this.handleSubmit(mode);
      });
    });
  }

  bindInputValidation() {
    ["login", "signup"].forEach((mode) => {
      const form = this.forms[mode];
      if (!form) return;
      form.addEventListener("input", () => {
        this.clearStatus();
        this.syncSubmitState(mode);
      });
      form.addEventListener("blur", () => this.syncSubmitState(mode), { capture: true });
    });
  }

  bindTabSwitching() {
    this.tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.authTab;
        this.switchMode(target);
      });
    });
  }

  bindOpeners() {
    this.openers.forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.authOpen;
        this.open(target);
      });
    });
  }

  bindCloseButton() {
    if (this.closeButton) {
      this.closeButton.addEventListener("click", () => this.close());
    }
  }

  bindSignOut() {
    if (this.signOut) {
      this.signOut.addEventListener("click", () => {
        authState.clear();
      });
    }
  }

  readPayload(mode) {
    const form = this.forms[mode];
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    return payload;
  }

  getFieldErrorTargets(form) {
    return form.querySelectorAll("[data-field-error]");
  }

  resetFieldErrors(form) {
    this.getFieldErrorTargets(form).forEach((element) => {
      element.textContent = "";
    });
  }

  applyFieldErrors(form, errors) {
    this.resetFieldErrors(form);
    errors.forEach((error) => {
      const target = form.querySelector(`[data-field-error="${error.field}"]`);
      if (target) target.textContent = error.message;
    });
  }

  setStatus(message) {
    if (this.status) {
      this.status.textContent = message;
      this.status.hidden = false;
    }
  }

  clearStatus() {
    if (this.status) {
      this.status.textContent = "";
      this.status.hidden = true;
    }
  }

  switchMode(mode, focus = true) {
    if (!["login", "signup"].includes(mode)) return;
    this.mode = mode;
    Object.entries(this.forms).forEach(([key, form]) => {
      if (!form) return;
      form.classList.toggle("hidden", key !== mode);
    });
    this.tabButtons.forEach((button) => {
      const isActive = button.dataset.authTab === mode;
      button.classList.toggle("active", isActive);
    });
    this.clearStatus();
    this.syncSubmitState(mode);
    if (focus) {
      const firstField = this.forms[mode]?.querySelector("input");
      if (firstField) firstField.focus();
    }
  }

  open(mode = "login") {
    this.modal.classList.remove("hidden");
    this.modal.setAttribute("aria-hidden", "false");
    this.switchMode(mode);
  }

  close() {
    this.modal.classList.add("hidden");
    this.modal.setAttribute("aria-hidden", "true");
    this.forms[this.mode]?.reset();
    this.resetFieldErrors(this.forms[this.mode]);
    this.clearStatus();
  }

  syncSubmitState(mode) {
    const payload = this.readPayload(mode);
    const validation = validators[mode](payload);
    const form = this.forms[mode];
    if (!form) return;
    this.applyFieldErrors(form, validation.errors);
    const button = this.submitButtons[mode];
    if (button) {
      button.disabled = !validation.isValid;
    }
    return validation;
  }

  async handleSubmit(mode) {
    const validation = this.syncSubmitState(mode);
    if (!validation?.isValid) return;
    const payload = this.readPayload(mode);
    const button = this.submitButtons[mode];
    const previousLabel = button?.textContent;
    if (button) {
      button.disabled = true;
      button.textContent = "Submitting…";
    }
    const result =
      mode === "signup" ? await this.client.signup(payload) : await this.client.login(payload);
    if (button) {
      button.textContent = previousLabel;
    }
    if (!result.ok) {
      this.applyFieldErrors(this.forms[mode], result.error.fieldErrors || []);
      this.setStatus(result.error.message);
      this.syncSubmitState(mode);
      return;
    }
    authState.setSession(result.data);
    this.close();
  }

  renderSession(session) {
    const isAuthenticated = Boolean(session?.user);
    this.authActions?.classList.toggle("hidden", isAuthenticated);
    this.badge?.classList.toggle("hidden", !isAuthenticated);
    if (isAuthenticated && session.user) {
      this.badgeName.textContent = session.user.name;
      this.badgeEmail.textContent = session.user.email;
    } else {
      this.badgeName.textContent = "";
      this.badgeEmail.textContent = "";
    }
  }
}
