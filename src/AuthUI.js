import { ApiError } from "./ApiClient.js";

export class AuthUI {
  constructor(authService) {
    this.authService = authService;
    this.modal = document.querySelector("#auth-modal");
    this.form = document.querySelector("#auth-form");
    this.openButton = document.querySelector("#open-login");
    this.logoutButton = document.querySelector("#logout");
    this.sessionStatus = document.querySelector("#session-status");
    this.generalError = document.querySelector("[data-general-error]");
    this.cancelButton = document.querySelector("[data-cancel]");
    this.submitButton = this.form?.querySelector('[type="submit"]');
    this.messageArea = document.querySelector("[data-auth-message]");

    this.fieldErrorTargets = new Map(
      Array.from(document.querySelectorAll("[data-error-for]"), (target) => [
        target.dataset.errorFor,
        target,
      ]),
    );

    this.#attachEvents();
  }

  #attachEvents() {
    if (this.form) {
      this.form.addEventListener("submit", (event) => this.#handleSubmit(event));
    }

    if (this.openButton) {
      this.openButton.addEventListener("click", () => this.open());
    }

    if (this.logoutButton) {
      this.logoutButton.addEventListener("click", () => this.#handleLogout());
    }

    if (this.cancelButton) {
      this.cancelButton.addEventListener("click", () => this.close());
    }
  }

  open(message) {
    this.clearErrors();
    this.modal?.classList.remove("hidden");
    if (message && this.generalError) {
      this.generalError.textContent = message;
    }
    const firstInput = this.form?.querySelector("input");
    firstInput?.focus();
  }

  close() {
    this.modal?.classList.add("hidden");
    this.clearErrors();
    this.form?.reset();
    this.setLoading(false);
  }

  handleUnauthorized() {
    this.setSessionStatus("Session expired. Please log in again.");
    this.open("Your session expired. Please sign in again.");
    this.#toggleAuthButtons({ isAuthenticated: false });
  }

  async #handleSubmit(event) {
    event.preventDefault();
    this.setLoading(true);
    this.clearErrors();

    const formData = new FormData(this.form);
    const credentials = Object.fromEntries(formData.entries());

    try {
      await this.authService.login(credentials);
      this.setSessionStatus("Signed in");
      this.#toggleAuthButtons({ isAuthenticated: true });
      this.close();
    } catch (error) {
      this.#showErrors(error);
    } finally {
      this.setLoading(false);
    }
  }

  async #handleLogout() {
    this.setLoading(true);
    this.setSessionStatus("Signing out...");

    try {
      await this.authService.logout();
      this.setSessionStatus("Signed out");
      this.#toggleAuthButtons({ isAuthenticated: false });
    } catch (error) {
      this.#showErrors(error);
    } finally {
      this.setLoading(false);
    }
  }

  #showErrors(error) {
    if (error instanceof ApiError) {
      const fieldErrors = error.fieldErrors;
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        this.#showFieldErrors(fieldErrors);
      }
      if (this.generalError) {
        this.generalError.textContent = error.generalMessage ?? "Authentication failed.";
      }
      return;
    }

    if (this.generalError) {
      this.generalError.textContent = "Something went wrong. Please try again.";
    }
    console.error(error);
  }

  #showFieldErrors(fieldErrors) {
    Object.entries(fieldErrors).forEach(([field, message]) => {
      const target = this.fieldErrorTargets.get(field);
      if (target) {
        target.textContent = message;
      }
    });
  }

  clearErrors() {
    if (this.generalError) {
      this.generalError.textContent = "";
    }

    this.fieldErrorTargets.forEach((target) => {
      target.textContent = "";
    });
  }

  setLoading(isLoading) {
    this.submitButton?.toggleAttribute("disabled", isLoading);
    this.logoutButton?.toggleAttribute("disabled", isLoading);

    if (this.messageArea) {
      this.messageArea.textContent = isLoading ? "Working..." : "";
    }
  }

  setSessionStatus(message) {
    if (this.sessionStatus) {
      this.sessionStatus.textContent = message;
    }
  }

  #toggleAuthButtons({ isAuthenticated }) {
    if (!this.openButton || !this.logoutButton) return;

    if (isAuthenticated) {
      this.openButton.classList.add("hidden");
      this.logoutButton.classList.remove("hidden");
    } else {
      this.logoutButton.classList.add("hidden");
      this.openButton.classList.remove("hidden");
    }
  }
}
