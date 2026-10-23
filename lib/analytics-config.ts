export type AnalyticsSettings = {
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  metaPixelId?: string;
};

export function analyticsIds(settings: AnalyticsSettings) {
  return {
    ga: /^G-[A-Z0-9]{4,20}$/.test(settings.googleAnalyticsId || "")
      ? settings.googleAnalyticsId!
      : "",
    gtm: /^GTM-[A-Z0-9]{4,20}$/.test(settings.googleTagManagerId || "")
      ? settings.googleTagManagerId!
      : "",
    pixel: /^\d{5,20}$/.test(settings.metaPixelId || "")
      ? settings.metaPixelId!
      : "",
  };
}
