import { useEffect, useState } from "react";
import { listCities } from "../api/cities";
import type { CityStatus, LaunchCity } from "../domain/types";

export type LaunchCityOption = {
  id: LaunchCity;
  label: LaunchCity;
  status: CityStatus;
  helper: string;
};

/**
 * Shown until the catalog answers, and kept if it never does (offline, API not
 * deployed yet). Mirrors the backend seed so the two never disagree visibly.
 */
const FALLBACK_CITIES: LaunchCityOption[] = [
  {
    id: "Bangalore",
    label: "Bangalore",
    status: "founding",
    helper: "Founding circle · opening first",
  },
  {
    id: "Delhi NCR",
    label: "Delhi NCR",
    status: "waitlist",
    helper: "Next-city interest",
  },
  {
    id: "Mumbai",
    label: "Mumbai",
    status: "waitlist",
    helper: "Next-city interest",
  },
];

/** Catalog rule: Wave 1 is open for registration, later waves collect interest. */
function statusForWave(wave: number): CityStatus {
  return wave <= 1 ? "founding" : "waitlist";
}

function helperFor(status: CityStatus) {
  return status === "founding"
    ? "Founding circle · opening first"
    : "Next-city interest";
}

let cities: LaunchCityOption[] = FALLBACK_CITIES;
let loaded = false;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

/** Current list — the fallback until `loadLaunchCities` has succeeded once. */
export function getLaunchCities(): LaunchCityOption[] {
  return cities;
}

/** Kept for existing call sites; prefer `useLaunchCities` in screens. */
export const LAUNCH_CITIES = FALLBACK_CITIES;

export function subscribeLaunchCities(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Fetches the catalog from `GET /early-access/cities/GetAll` once per app
 * session. Failures are silent by design: the fallback stays on screen.
 */
export function loadLaunchCities(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (inFlight) return inFlight;

  inFlight = listCities()
    .then((catalog) => {
      const next = catalog
        .filter((c) => c.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map<LaunchCityOption>((c) => {
          const status = statusForWave(c.wave);
          return { id: c.name, label: c.name, status, helper: helperFor(status) };
        });
      if (next.length > 0) {
        cities = next;
        loaded = true;
        emit();
      }
    })
    .catch(() => {
      /* keep the fallback */
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

/** Subscribes a screen to the catalog and triggers the one-time load. */
export function useLaunchCities(): LaunchCityOption[] {
  const [list, setList] = useState(getLaunchCities);
  useEffect(() => {
    const unsubscribe = subscribeLaunchCities(() => setList(getLaunchCities()));
    void loadLaunchCities();
    return () => {
      unsubscribe();
    };
  }, []);
  return list;
}

export function cityStatus(city: string): CityStatus | null {
  return cities.find((c) => c.id === city)?.status ?? null;
}

export function isFoundingCity(city: string) {
  return cityStatus(city) === "founding";
}

/** "Bangalore first .. Delhi NCR and Mumbai next" — built from the live list. */
export function launchCitiesLine(list: LaunchCityOption[] = cities): string {
  const founding = list.filter((c) => c.status === "founding").map((c) => c.label);
  const waitlist = list.filter((c) => c.status === "waitlist").map((c) => c.label);
  const parts: string[] = [];
  if (founding.length > 0) parts.push(`${joinNames(founding)} first`);
  if (waitlist.length > 0) parts.push(`${joinNames(waitlist)} next`);
  return parts.join(" .. ");
}

function joinNames(names: string[]) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
