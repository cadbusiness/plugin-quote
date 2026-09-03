export const ANALYTICS_EVENTS = {
  pageView: "quotebuilder_page_view",
  started: "quotebuilder_started",
  email: "quotebuilder_email",
  completed: "quotebuilder_completed",
  submitted: "quotebuilder_submitted",
  abandoned: "quotebuilder_abandoned",
} as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
