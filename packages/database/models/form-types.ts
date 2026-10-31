import type { FormElementType } from "./form-enums";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

/** Flexible settings for the current form and a published form version. */
export type FormSettings = JsonObject;

/** Per-element configuration, for example select options or rating bounds. */
export type FormElementConfig = JsonObject;

/** Validation settings are interpreted and validated by the API with Zod. */
export type FormValidationRules = JsonObject;

export type DeviceType = "desktop" | "mobile" | "tablet" | "unknown";

/**
 * The JSONB blueprint stored in form_templates.definition.
 * templateKey is local to the template; the service generates new UUIDs
 * when it copies these elements into form_elements.
 */
export interface TemplateElementDefinition {
  templateKey: string;
  kind: "question" | "content";
  type: FormElementType;
  label?: string | null;
  content?: string | null;
  helpText?: string | null;
  placeholder?: string | null;
  required: boolean;
  sortOrder: number;
  config: FormElementConfig;
  validationRules: FormValidationRules;
}

export interface FormTemplateDefinition {
  elements: TemplateElementDefinition[];
  settings?: FormSettings;
}
