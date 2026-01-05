const container = document.getElementById("cities-container");
const errorEl = document.getElementById("cities-error");

function showError(msg) {
  container.textContent = "";
  errorEl.hidden = false;
  errorEl.textContent = msg;
  container.removeAttribute("aria-busy");
}

function renderCities(cities) {
  container.textContent = "";
  container.removeAttribute("aria-busy");

  if (!cities?.length) {
    container.textContent = "No cities saved yet.";
    return;
  }

  const wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.flexWrap = "wrap";
  wrap.style.gap = "10px";

  cities.forEach((city) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = city;
    btn.style.padding = "10px 14px";
    btn.style.borderRadius = "12px";
    btn.style.border = "1px solid rgba(148,163,184,.35)";
    btn.style.background = "transparent";
    btn.style.cursor = "pointer";
    btn.style.fontWeight = "700";

    btn.addEventListener("click", () => {
      localStorage.setItem("selectedCity", city);
      const url = new URL("/pages/index.html", window.location.origin);
      url.searchParams.set("city", city);
      window.location.href = url.toString();
    });

    wrap.appendChild(btn);
  });

  container.appendChild(wrap);
}

async function loadCities() {
  try {
    const res = await fetch("/api/cities", {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      if (res.status === 401) return showError("Please log in first.");
      return showError(`Failed to load cities (HTTP ${res.status})`);
    }

    const data = await res.json();
    // Expecting: { cities: ["Rasht", "Tehran"] }
    renderCities(data.cities);
  } catch (e) {
    showError("Network error while loading cities.");
  }
}

loadCities();

function listenForSignOut() {
  const logout = document.querySelector("#logout");

  logout.addEventListener("click", async () => {
    const res = await fetch("/api/auth//logout", {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      window.location = "./index.html";
    }
  });
}

listenForSignOut();
