import { AdSettings } from "@/lib/types";

export const DEFAULT_AUTOMATION_SETTINGS: AdSettings = {
  amazon_client_id: "",
  amazon_client_secret: "",
  amazon_refresh_token: "",
  amazon_profile_id: "",
  target_acos: 30,
  acos_threshold: 40,
  scale_up_pct: 20,
  scale_down_pct: 15,
  budget_floor: 5,
  automation_mode: "off",
  daily_budget_cap: 100,
};

const toNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizeAdSettings = (
  raw: Partial<AdSettings> | null | undefined,
): AdSettings => {
  if (!raw) {
    return { ...DEFAULT_AUTOMATION_SETTINGS };
  }

  return {
    id: raw.id,
    amazon_client_id: String(raw.amazon_client_id ?? ""),
    amazon_client_secret: String(raw.amazon_client_secret ?? ""),
    amazon_refresh_token: String(raw.amazon_refresh_token ?? ""),
    amazon_profile_id: String(raw.amazon_profile_id ?? ""),
    target_acos: toNumber(raw.target_acos, DEFAULT_AUTOMATION_SETTINGS.target_acos),
    acos_threshold: toNumber(
      raw.acos_threshold,
      DEFAULT_AUTOMATION_SETTINGS.acos_threshold,
    ),
    scale_up_pct: toNumber(raw.scale_up_pct, DEFAULT_AUTOMATION_SETTINGS.scale_up_pct),
    scale_down_pct: toNumber(
      raw.scale_down_pct,
      DEFAULT_AUTOMATION_SETTINGS.scale_down_pct,
    ),
    budget_floor: toNumber(raw.budget_floor, DEFAULT_AUTOMATION_SETTINGS.budget_floor),
    automation_mode:
      raw.automation_mode === "off" ||
      raw.automation_mode === "approval" ||
      raw.automation_mode === "auto"
        ? raw.automation_mode
        : Boolean((raw as { automation_enabled?: boolean }).automation_enabled)
          ? "auto"
          : "off",
    daily_budget_cap: toNumber(
      raw.daily_budget_cap,
      DEFAULT_AUTOMATION_SETTINGS.daily_budget_cap,
    ),
  };
};
