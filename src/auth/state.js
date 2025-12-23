const storageKey = "auth.session";

function readSession() {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.warn("Could not read session", error);
    return null;
  }
}

function writeSession(session) {
  try {
    if (!session) {
      localStorage.removeItem(storageKey);
      return;
    }
    localStorage.setItem(storageKey, JSON.stringify(session));
  } catch (error) {
    console.warn("Could not persist session", error);
  }
}

let currentSession = readSession();
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener(currentSession));
}

export const authState = {
  get session() {
    return currentSession;
  },
  setSession(session) {
    currentSession = session;
    writeSession(session);
    notify();
  },
  clear() {
    currentSession = null;
    writeSession(null);
    notify();
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
