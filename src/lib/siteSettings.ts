import { supabase } from "@/lib/supabase";

export type SiteSettings = Record<string, string>;

type SettingsRow = {
  key: string;
  value: string;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data } = await supabase.from("settings").select("key,value");

  const map: SiteSettings = {};

  if (data) {
    data.forEach((s: SettingsRow) => {
      map[s.key] = s.value;
    });
  }

  return map;
}
