import { randomUUID } from "node:crypto";

const userCityStore = new Map();

function getUserCities(userId) {
  if (!userCityStore.has(userId)) {
    userCityStore.set(userId, []);
  }
  return userCityStore.get(userId);
}

export function listUserCities(userId) {
  return [...getUserCities(userId)];
}

export function findUserCity(userId, cityId) {
  return getUserCities(userId).find((city) => city.id === cityId);
}

export function addUserCity(userId, cityPayload) {
  const cities = getUserCities(userId);
  const duplicate = cities.find(
    (entry) => entry.normalizedLabel === cityPayload.normalizedLabel,
  );
  if (duplicate) {
    return { error: "duplicate", city: duplicate };
  }

  const newCity = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...cityPayload,
  };
  cities.push(newCity);
  return { city: newCity };
}

export function updateUserCity(userId, cityId, updates) {
  const cities = getUserCities(userId);
  const index = cities.findIndex((city) => city.id === cityId);
  if (index === -1) {
    return { error: "notFound" };
  }

  if (updates.normalizedLabel) {
    const duplicate = cities.find(
      (city) =>
        city.normalizedLabel === updates.normalizedLabel && city.id !== cityId,
    );
    if (duplicate) {
      return { error: "duplicate", city: duplicate };
    }
  }

  const updated = { ...cities[index], ...updates, updatedAt: new Date().toISOString() };
  cities[index] = updated;
  return { city: updated };
}

export function deleteUserCity(userId, cityId) {
  const cities = getUserCities(userId);
  const index = cities.findIndex((city) => city.id === cityId);
  if (index === -1) {
    return { error: "notFound" };
  }

  const [removed] = cities.splice(index, 1);
  return { city: removed };
}
