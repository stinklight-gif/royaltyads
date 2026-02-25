"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSupabaseClient } from "@/lib/supabase/client";
import { AdSettings } from "@/lib/types";

const defaultForm: AdSettings = {
  amazon_client_id: "",
  amazon_client_secret: "",
  amazon_refresh_token: "",
  amazon_profile_id: "",
  target_acos: 30,
  daily_budget_cap: 100,
};

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
          "id, amazon_client_id, amazon_client_secret, amazon_refresh_token, amazon_profile_id, target_acos, daily_budget_cap",
        )
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) {
        return;
      }

      if (error) {
        setStatusMessage(
          "Supabase table not ready yet. You can still edit values and save after running migration.",
        );
        setLoading(false);
        return;
      }

      if (data) {
        setSettingsId(data.id ?? null);
        setForm({
          amazon_client_id: data.amazon_client_id ?? "",
          amazon_client_secret: data.amazon_client_secret ?? "",
          amazon_refresh_token: data.amazon_refresh_token ?? "",
          amazon_profile_id: data.amazon_profile_id ?? "",
          target_acos: Number(data.target_acos) || 30,
          daily_budget_cap: Number(data.daily_budget_cap) || 100,
        });
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
          Connect Amazon Ads credentials and control automation guardrails.
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="target-acos" className="text-xs text-zinc-400">
                ACoS Target (%)
              </label>
              <Input
                id="target-acos"
                type="number"
                value={form.target_acos}
                onChange={(event) =>
                  updateField("target_acos", Number(event.target.value) || 0)
                }
                min={1}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="daily-budget-cap" className="text-xs text-zinc-400">
                Daily Budget Cap ($)
              </label>
              <Input
                id="daily-budget-cap"
                type="number"
                value={form.daily_budget_cap}
                onChange={(event) =>
                  updateField("daily_budget_cap", Number(event.target.value) || 0)
                }
                min={1}
              />
            </div>
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
