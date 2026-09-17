import type { CityStatus, LaunchCity } from "../domain/types";

export const LAUNCH_CITIES: {
  id: LaunchCity;
  label: LaunchCity;
  status: CityStatus;
  helper: string;
}[] = [
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

export function cityStatus(city: string): CityStatus | null {
  return LAUNCH_CITIES.find((c) => c.id === city)?.status ?? null;
}

export function isFoundingCity(city: string) {
  return cityStatus(city) === "founding";
}
