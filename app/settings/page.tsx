"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DEFAULT_AUTOMATION_SETTINGS, normalizeAdSettings } from "@/lib/automation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { AdSettings } from "@/lib/types";

const defaultForm: AdSettings = { ...DEFAULT_AUTOMATION_SETTINGS };

export default function SettingsPage() {
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [form, setForm] = useState<AdSettings>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      setLoading(true);
      setStatusMessage("");

      const { data, error } = await supabase
        .from("ad_settings")
        .select(
          "id, amazon_client_id, amazon_client_secret, amazon_refresh_token, amazon_profile_id, target_acos, acos_threshold, scale_up_pct, scale_down_pct, budget_floor, automation_enabled, daily_budget_cap",
        )
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) {
        return;
      }

      if (error) {
        setStatusMessage(
          "Supabase table not ready yet. Apply migrations, then save settings.",
        );
        setLoading(false);
        return;
      }

      if (data) {
        const normalized = normalizeAdSettings(data as Partial<AdSettings>);
        setSettingsId(data.id ?? null);
        setForm(normalized);
      }

      setLoading(false);
    };

    void loadSettings();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const updateField = <K extends keyof AdSettings>(key: K, value: AdSettings[K]) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage("");

    const payload = {
      amazon_client_id: form.amazon_client_id,
      amazon_client_secret: form.amazon_client_secret,
      amazon_refresh_token: form.amazon_refresh_token,
      amazon_profile_id: form.amazon_profile_id,
      target_acos: Number(form.target_acos),
      acos_threshold: Number(form.acos_threshold),
      scale_up_pct: Number(form.scale_up_pct),
      scale_down_pct: Number(form.scale_down_pct),
      budget_floor: Number(form.budget_floor),
      automation_enabled: Boolean(form.automation_enabled),
      daily_budget_cap: Number(form.daily_budget_cap),
      updated_at: new Date().toISOString(),
    };

    if (settingsId) {
      const { error } = await supabase
        .from("ad_settings")
        .update(payload)
        .eq("id", settingsId);

      if (error) {
        setStatusMessage(`Save failed: ${error.message}`);
        setSaving(false);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("ad_settings")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        setStatusMessage(`Save failed: ${error.message}`);
        setSaving(false);
        return;
      }

      setSettingsId(data.id);
    }

    setSaving(false);
    setStatusMessage("Settings saved.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-mono text-2xl font-semibold text-zinc-100">Settings</h2>
        <p className="text-sm text-zinc-400">
          Configure automation thresholds and budget adjustment rules.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Amazon Ads API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="amazon-client-id" className="text-xs text-zinc-400">
                Amazon Client ID
              </label>
              <Input
                id="amazon-client-id"
                value={form.amazon_client_id}
                onChange={(event) => updateField("amazon_client_id", event.target.value)}
                placeholder="amzn1.application-oa2-client..."
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="amazon-profile-id" className="text-xs text-zinc-400">
                Profile ID
              </label>
              <Input
                id="amazon-profile-id"
                value={form.amazon_profile_id}
                onChange={(event) => updateField("amazon_profile_id", event.target.value)}
                placeholder="1234567890"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="amazon-client-secret" className="text-xs text-zinc-400">
                Client Secret
              </label>
              <Input
                id="amazon-client-secret"
                type="password"
                value={form.amazon_client_secret}
                onChange={(event) => updateField("amazon_client_secret", event.target.value)}
                placeholder="Enter client secret"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="amazon-refresh-token" className="text-xs text-zinc-400">
                Refresh Token
              </label>
              <Input
                id="amazon-refresh-token"
                type="password"
                value={form.amazon_refresh_token}
                onChange={(event) => updateField("amazon_refresh_token", event.target.value)}
                placeholder="Atzr|..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Automation Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="target-acos" className="text-xs text-zinc-400">
                ACoS Target %
              </label>
              <Input
                id="target-acos"
                type="number"
                min={1}
                value={form.target_acos}
                onChange={(event) => updateField("target_acos", Number(event.target.value) || 0)}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="acos-threshold" className="text-xs text-zinc-400">
                ACoS Threshold %
              </label>
              <Input
                id="acos-threshold"
                type="number"
                min={1}
                value={form.acos_threshold}
                onChange={(event) =>
                  updateField("acos_threshold", Number(event.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="scale-up" className="text-xs text-zinc-400">
                Scale Up by X%
              </label>
              <Input
                id="scale-up"
                type="number"
                min={0}
                value={form.scale_up_pct}
                onChange={(event) =>
                  updateField("scale_up_pct", Number(event.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="scale-down" className="text-xs text-zinc-400">
                Scale Down by Y%
              </label>
              <Input
                id="scale-down"
                type="number"
                min={0}
                value={form.scale_down_pct}
                onChange={(event) =>
                  updateField("scale_down_pct", Number(event.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="budget-floor" className="text-xs text-zinc-400">
                Budget Floor $
              </label>
              <Input
                id="budget-floor"
                type="number"
                min={1}
                value={form.budget_floor}
                onChange={(event) =>
                  updateField("budget_floor", Number(event.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="daily-budget-cap" className="text-xs text-zinc-400">
                Daily Budget Cap $
              </label>
              <Input
                id="daily-budget-cap"
                type="number"
                min={1}
                value={form.daily_budget_cap}
                onChange={(event) =>
                  updateField("daily_budget_cap", Number(event.target.value) || 0)
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-zinc-100">Automation ON/OFF</p>
              <p className="text-xs text-zinc-400">Master switch for hourly cron actions.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.automation_enabled}
              onClick={() => updateField("automation_enabled", !form.automation_enabled)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full border transition-colors ${
                form.automation_enabled
                  ? "border-emerald-500 bg-emerald-500/30"
                  : "border-zinc-700 bg-zinc-800"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-zinc-100 transition-transform ${
                  form.automation_enabled ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-3">
            <p className="text-xs text-zinc-400">
              {loading ? "Loading settings..." : statusMessage || "Ready."}
            </p>
            <Button onClick={handleSave} disabled={saving || loading}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
