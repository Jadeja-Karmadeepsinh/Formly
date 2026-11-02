import { and, asc, db, eq, inArray, isNull, max, sql } from "@formly/database";
import {
  formElementsTable,
  formsTable,
  type FormElementConfig,
  type FormValidationRules,
} from "@formly/database/schema";
import {
  type CreateFormFieldInput,
  createFormFieldInputSchema,
  type ReorderFormFieldsInput,
  reorderFormFieldsInputSchema,
  type UpdateFormFieldInput,
  updateFormFieldInputSchema,
} from "./model";

export type FormElement = typeof formElementsTable.$inferSelect;

export default class FormFieldService {
  /**
   * Helper to verify form ownership and non-deleted state.
   */
  private async getOwnedForm(userId: string, formId: string) {
    const [form] = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(
        and(
          eq(formsTable.id, formId),
          eq(formsTable.createdBy, userId),
          isNull(formsTable.deletedAt)
        )
      )
      .limit(1);

    return form || null;
  }

  /**
   * Creates a new form element for a form owned by the authenticated user.
   */
  public async createFormField(
    userId: string,
    formId: string,
    input: CreateFormFieldInput
  ): Promise<FormElement> {
    const validated = createFormFieldInputSchema.parse(input);

    if (validated.kind === "question") {
      if (!validated.label || validated.label.trim().length === 0) {
        throw new Error("Label is required for question elements");
      }
    } else if (validated.kind === "content") {
      if (!["heading", "paragraph", "divider"].includes(validated.type)) {
        throw new Error("Content element type must be heading, paragraph, or divider");
      }
      if (validated.required) {
        throw new Error("Content elements cannot be marked as required");
      }
      if (
        validated.type !== "divider" &&
        (!validated.content || validated.content.trim().length === 0)
      ) {
        throw new Error("Content is required for heading and paragraph elements");
      }
    }

    const form = await this.getOwnedForm(userId, formId);
    if (!form) {
      throw new Error("Form not found or you do not have permission to modify it.");
    }

    let sortOrder = validated.sortOrder;
    if (sortOrder === undefined) {
      const [maxResult] = await db
        .select({ maxOrder: max(formElementsTable.sortOrder) })
        .from(formElementsTable)
        .where(eq(formElementsTable.formId, formId));

      sortOrder =
        maxResult && maxResult.maxOrder !== null ? maxResult.maxOrder + 1 : 0;
    }

    const [created] = await db
      .insert(formElementsTable)
      .values({
        formId,
        kind: validated.kind,
        type: validated.type,
        label: validated.label ?? null,
        content: validated.content ?? null,
        helpText: validated.helpText ?? null,
        placeholder: validated.placeholder ?? null,
        required: validated.required,
        sortOrder,
        config: validated.config as FormElementConfig,
        validationRules: validated.validationRules as FormValidationRules,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create form field.");
    }

    return created;
  }

  /**
   * Lists all elements for a form owned by the user, ordered by sortOrder ascending.
   */
  public async listFormFields(
    userId: string,
    formId: string
  ): Promise<FormElement[]> {
    const form = await this.getOwnedForm(userId, formId);
    if (!form) {
      throw new Error("Form not found or you do not have permission to view it.");
    }

    return await db
      .select()
      .from(formElementsTable)
      .where(eq(formElementsTable.formId, formId))
      .orderBy(asc(formElementsTable.sortOrder));
  }

  /**
   * Retrieves a single form element by ID, verifying parent form ownership.
   */
  public async getFormFieldById(
    userId: string,
    formId: string,
    fieldId: string
  ): Promise<FormElement | null> {
    const form = await this.getOwnedForm(userId, formId);
    if (!form) {
      return null;
    }

    const [field] = await db
      .select()
      .from(formElementsTable)
      .where(
        and(
          eq(formElementsTable.id, fieldId),
          eq(formElementsTable.formId, formId)
        )
      )
      .limit(1);

    return field || null;
  }

  /**
   * Updates an existing form element, verifying parent form ownership.
   */
  public async updateFormField(
    userId: string,
    formId: string,
    fieldId: string,
    input: UpdateFormFieldInput
  ): Promise<FormElement | null> {
    const validated = updateFormFieldInputSchema.parse(input);

    const form = await this.getOwnedForm(userId, formId);
    if (!form) {
      return null;
    }

    const existing = await this.getFormFieldById(userId, formId, fieldId);
    if (!existing) {
      return null;
    }

    const updates: Partial<typeof formElementsTable.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (validated.type !== undefined) {
      updates.type = validated.type;
    }
    if (validated.label !== undefined) {
      updates.label = validated.label;
    }
    if (validated.content !== undefined) {
      updates.content = validated.content;
    }
    if (validated.helpText !== undefined) {
      updates.helpText = validated.helpText;
    }
    if (validated.placeholder !== undefined) {
      updates.placeholder = validated.placeholder;
    }
    if (validated.required !== undefined) {
      // Content blocks must never be marked required per DB constraint
      updates.required = existing.kind === "content" ? false : validated.required;
    }
    if (validated.sortOrder !== undefined) {
      updates.sortOrder = validated.sortOrder;
    }
    if (validated.config !== undefined) {
      const existingConfig =
        typeof existing.config === "object" && existing.config !== null
          ? (existing.config as Record<string, unknown>)
          : {};
      updates.config = {
        ...existingConfig,
        ...validated.config,
      } as FormElementConfig;
    }
    if (validated.validationRules !== undefined) {
      const existingRules =
        typeof existing.validationRules === "object" &&
        existing.validationRules !== null
          ? (existing.validationRules as Record<string, unknown>)
          : {};
      updates.validationRules = {
        ...existingRules,
        ...validated.validationRules,
      } as FormValidationRules;
    }

    const [updated] = await db
      .update(formElementsTable)
      .set(updates)
      .where(
        and(
          eq(formElementsTable.id, fieldId),
          eq(formElementsTable.formId, formId)
        )
      )
      .returning();

    return updated || null;
  }

  /**
   * Deletes a form element by ID, verifying parent form ownership.
   */
  public async deleteFormField(
    userId: string,
    formId: string,
    fieldId: string
  ): Promise<boolean> {
    const form = await this.getOwnedForm(userId, formId);
    if (!form) {
      return false;
    }

    const result = await db
      .delete(formElementsTable)
      .where(
        and(
          eq(formElementsTable.id, fieldId),
          eq(formElementsTable.formId, formId)
        )
      )
      .returning({ id: formElementsTable.id });

    return result.length > 0;
  }

  /**
   * Reorders multiple form fields by their sequential positions in a transaction.
   */
  public async reorderFormFields(
    userId: string,
    formId: string,
    input: ReorderFormFieldsInput
  ): Promise<FormElement[]> {
    const validated = reorderFormFieldsInputSchema.parse(input);

    const form = await this.getOwnedForm(userId, formId);
    if (!form) {
      throw new Error("Form not found or you do not have permission to modify it.");
    }

    // Verify all requested fields exist and belong to this form
    const existing = await db
      .select({ id: formElementsTable.id })
      .from(formElementsTable)
      .where(
        and(
          eq(formElementsTable.formId, formId),
          inArray(formElementsTable.id, validated.fieldIds)
        )
      );

    if (existing.length !== validated.fieldIds.length) {
      throw new Error("Some field IDs were not found in this form.");
    }

    // Update each field's sortOrder in a transaction
    await db.transaction(async (tx) => {
      for (let i = 0; i < validated.fieldIds.length; i++) {
        const fieldId = validated.fieldIds[i];
        if (!fieldId) continue;

        await tx
          .update(formElementsTable)
          .set({
            sortOrder: i,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(formElementsTable.id, fieldId),
              eq(formElementsTable.formId, formId)
            )
          );
      }
    });

    return await this.listFormFields(userId, formId);
  }
}
