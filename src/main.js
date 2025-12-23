import "./style.css";
import { ApiClient } from "./apiClient.js";
import { WeatherApp } from "./weatherApp.js";

const tokenStorageKey = "weather-auth-token";
let authToken = localStorage.getItem(tokenStorageKey);

const authStatus = document.querySelector("#auth-status");
const welcome = document.querySelector("#welcome");
const logoutButton = document.querySelector("#logout-btn");
const authPanel = document.querySelector("#auth-panel");
const weatherShell = document.querySelector("#weather-shell");

const apiClient = new ApiClient(() => authToken);
const weatherApp = new WeatherApp();

function showStatus(message, isError = false) {
  authStatus.textContent = message;
  authStatus.className = isError ? "error" : "ok";
}

function setAuthState(user, token) {
  authToken = token;
  if (token && user) {
    localStorage.setItem(tokenStorageKey, token);
    welcome.textContent = `Welcome, ${user.firstName}`;
    logoutButton.classList.remove("hidden");
    authPanel.classList.add("hidden");
    weatherShell.classList.remove("hidden");
  } else {
    localStorage.removeItem(tokenStorageKey);
    welcome.textContent = "";
    logoutButton.classList.add("hidden");
    authPanel.classList.remove("hidden");
    weatherShell.classList.add("hidden");
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const email = event.target.elements["login-email"].value;
  const password = event.target.elements["login-password"].value;

  try {
    const { user, token } = await apiClient.login({ email, password });
    setAuthState(user, token);
    showStatus("Logged in successfully.");
    await renderWeather();
  } catch (error) {
    showStatus(error.message, true);
  }
}

async function handleSignup(event) {
  event.preventDefault();
  const firstName = event.target.elements["signup-first-name"].value;
  const lastName = event.target.elements["signup-last-name"].value;
  const email = event.target.elements["signup-email"].value;
  const password = event.target.elements["signup-password"].value;

  try {
    const { user, token } = await apiClient.signup({
      firstName,
      lastName,
      email,
      password,
    });
    setAuthState(user, token);
    showStatus("Account created. You are logged in.");
    await renderWeather();
  } catch (error) {
    showStatus(error.message, true);
  }
}

async function bootstrap() {
  if (authToken) {
    try {
      const { user } = await apiClient.currentUser();
      setAuthState(user, authToken);
      showStatus("Session restored.");
      await renderWeather();
    } catch (error) {
      setAuthState(null, null);
      showStatus("Session expired. Please log in again.", true);
    }
  } else {
    showStatus("Log in to personalize your forecast.");
  }
}

async function renderWeather() {
  try {
    await weatherApp.display();
  } catch (error) {
    showStatus(error.message, true);
  }
}

logoutButton?.addEventListener("click", () => {
  setAuthState(null, null);
  showStatus("Signed out.");
});

document
  .querySelector("#login-form")
  ?.addEventListener("submit", (event) => void handleLogin(event));
document
  .querySelector("#signup-form")
  ?.addEventListener("submit", (event) => void handleSignup(event));

await bootstrap();
