export type CommProvider =
  | "gmail"
  | "outlook"
  | "imap"
  | "instagram"
  | "facebook"
  | "whatsapp"
  | "messenger";

export type CommScope = "org" | "staff";

export type CommStatus = "connected" | "pending" | "error" | "coming_soon";

export type CommChannelKind = "email" | "social";

export const EMAIL_PROVIDERS: CommProvider[] = ["gmail", "outlook", "imap"];
export const SOCIAL_PROVIDERS: CommProvider[] = ["instagram", "facebook", "whatsapp", "messenger"];

export const PROVIDER_LABELS: Record<CommProvider, string> = {
  gmail: "Gmail",
  outlook: "Outlook",
  imap: "IMAP / SMTP",
  instagram: "Instagram",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  messenger: "Messenger",
};

export function providerKind(provider: CommProvider): CommChannelKind {
  return EMAIL_PROVIDERS.includes(provider) ? "email" : "social";
}

export const EMAIL_PRESETS: Record<
  "gmail" | "outlook" | "imap",
  { imapHost: string; imapPort: number; smtpHost: string; smtpPort: number }
> = {
  gmail: {
    imapHost: "imap.gmail.com",
    imapPort: 993,
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
  },
  outlook: {
    imapHost: "outlook.office365.com",
    imapPort: 993,
    smtpHost: "smtp.office365.com",
    smtpPort: 587,
  },
  imap: { imapHost: "", imapPort: 993, smtpHost: "", smtpPort: 587 },
};

export type ChannelSettings = {
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
};

export const DEFAULT_CHANNEL_SETTINGS: ChannelSettings = {
  imapHost: "",
  imapPort: 993,
  smtpHost: "",
  smtpPort: 587,
};

export function parseChannelSettings(value: unknown): ChannelSettings {
  const raw = (value && typeof value === "object" ? value : {}) as Partial<ChannelSettings>;
  return {
    imapHost: typeof raw.imapHost === "string" ? raw.imapHost : "",
    imapPort: Number(raw.imapPort) || 993,
    smtpHost: typeof raw.smtpHost === "string" ? raw.smtpHost : "",
    smtpPort: Number(raw.smtpPort) || 587,
  };
}

export type EmailCredentials = {
  username: string;
  password: string;
};

export function isEmailProvider(provider: string): provider is "gmail" | "outlook" | "imap" {
  return provider === "gmail" || provider === "outlook" || provider === "imap";
}
