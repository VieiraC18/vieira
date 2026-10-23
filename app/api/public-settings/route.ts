import { getPublicSettings } from "@/lib/server/public";
import { api, json } from "@/lib/security/http";
export const GET = api(async () => {
  const settings = await getPublicSettings();
  return json({
    investmentEnabled: settings.budgetEnabled,
    investmentRanges: settings.budgetRanges,
    whatsapp: settings.whatsapp,
  });
});
