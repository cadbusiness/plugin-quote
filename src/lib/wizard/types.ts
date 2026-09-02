import type { Json } from "@/lib/db/database.types";

export type ScreenType = "questions" | "suggestions" | "customize" | "contact";
export type QuestionType =
  | "visual_choice"
  | "number"
  | "select"
  | "multi_select"
  | "text"
  | "file";
export type SessionMode = "wizard" | "chat";

export type Choice = {
  value: string;
  label: string;
  description?: string;
};

export type QuestionOptions = {
  choices?: Choice[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
};

export type ProductOption = {
  key: string;
  label: string;
  values: { value: string; label: string }[];
};

export type WizardQuestion = {
  id: string;
  key: string;
  label: string;
  helpText: string | null;
  type: QuestionType;
  required: boolean;
  sortOrder: number;
  options: QuestionOptions;
};

export type WizardStep = {
  id: string;
  title: string;
  subtitle: string | null;
  screenType: ScreenType;
  sortOrder: number;
  questions: WizardQuestion[];
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
  tags: string[];
  options: ProductOption[];
};

export type Suggestion = {
  id: string;
  name: string;
  headline: string | null;
  description: string | null;
  imageUrl: string | null;
  priceMin: number | null;
  priceMax: number | null;
  products: Product[];
};

export type ConfiguratorDefinition = {
  organization: {
    id: string;
    name: string;
    slug: string;
    salesEmail: string | null;
    salesName: string | null;
    salesPhone: string | null;
    branding: Record<string, unknown>;
    gaMeasurementId: string | null;
  };
  configurator: {
    id: string;
    name: string;
    slug: string;
    sector: string;
    wizardEnabled: boolean;
    chatEnabled: boolean;
    theme: Record<string, unknown>;
  };
  steps: WizardStep[];
  products: Product[];
};

export type Answers = Record<string, Json>;

export type Customization = {
  quantities: Record<string, number>;
  options: Record<string, Record<string, string>>;
  notes?: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type QuoteSession = {
  id: string;
  token: string;
  mode: SessionMode;
  currentStep: number;
  answers: Answers;
  extractedParams: Answers;
  chatMessages: ChatMessage[];
  selectedSuggestionId: string | null;
  customization: Customization;
  submittedQuoteId: string | null;
};

export type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
};

export type Condition = {
  key: string;
  op: "eq" | "neq" | "gte" | "lte" | "in" | "contains";
  value: Json;
};

export type RuleConditions = {
  all?: Condition[];
};
