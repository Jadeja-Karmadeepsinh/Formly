import { and, asc, db, desc, eq, inArray, isNull, max } from "@formly/database";
import {
  formElementsTable,
  formsTable,
  formVersionsTable,
  formVersionElementsTable,
  type FormElementConfig,
  type FormValidationRules,
} from "@formly/database/schema";
import {
  type CreateFormFieldInput,
  createFormFieldInputSchema,
  type ReorderFormFieldsInput,
  reorderFormFieldsInputSchema,
  type SyncFormFieldsInput,
  syncFormFieldsInputSchema,
  type UpdateFormFieldInput,
  updateFormFieldInputSchema,
} from "./model";

export type FormElement = typeof formElementsTable.$inferSelect;

export default class FormFieldService {
  /**
   * Helper to verify form ownership and non-deleted state.
   */
  private async getOwnedForm(userId: string, formId: string, tx: any = db) {
    const [form] = await tx
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
   * Captures an immutable snapshot into form_versions and form_version_elements
   * whenever a form's fields are mutated outside of saveFormDraft.
   * If the form is currently published, automatically promotes the new version.
   */
  private async snapshotFormState(
    tx: any,
    formId: string
  ): Promise<void> {
    const [form] = await tx
      .select()
      .from(formsTable)
      .where(eq(formsTable.id, formId))
      .for("update");

    if (!form) return;

    const [existingLatestVersion] = await tx
      .select()
      .from(formVersionsTable)
      .where(eq(formVersionsTable.formId, form.id))
      .orderBy(desc(formVersionsTable.versionNumber))
      .limit(1);

    const isPublished = form.status === "published";
    const now = new Date();
    const nextVersionNumber = existingLatestVersion
      ? existingLatestVersion.versionNumber + 1
      : 1;

    const [newVersion] = await tx
      .insert(formVersionsTable)
      .values({
        formId: form.id,
        versionNumber: nextVersionNumber,
        title: form.title,
        description: form.description,
        themeId: form.themeId,
        settings: form.settings,
        createdAt: now,
        publishedAt: isPublished ? now : null,
      })
      .returning();

    if (!newVersion) return;

    if (isPublished) {
      await tx
        .update(formsTable)
        .set({
          publishedVersionId: newVersion.id,
          updatedAt: now,
        })
        .where(eq(formsTable.id, form.id));
    }

    const currentElements = await tx
      .select()
      .from(formElementsTable)
      .where(eq(formElementsTable.formId, form.id))
      .orderBy(asc(formElementsTable.sortOrder));

    if (currentElements.length > 0) {
      await tx.insert(formVersionElementsTable).values(
        currentElements.map((el: FormElement) => ({
          formVersionId: newVersion.id,
          sourceElementId: el.id,
          kind: el.kind,
          type: el.type,
          label: el.label,
          content: el.content,
          helpText: el.helpText,
          placeholder: el.placeholder,
          required: el.required,
          sortOrder: el.sortOrder,
          config: el.config,
          validationRules: el.validationRules,
          createdAt: el.createdAt,
        }))
      );
    }
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

    return await db.transaction(async (tx) => {
      const form = await this.getOwnedForm(userId, formId, tx);
      if (!form) {
        throw new Error("Form not found or you do not have permission to modify it.");
      }

      let sortOrder = validated.sortOrder;
      if (sortOrder === undefined) {
        const [maxResult] = await tx
          .select({ maxOrder: max(formElementsTable.sortOrder) })
          .from(formElementsTable)
          .where(eq(formElementsTable.formId, formId));

        sortOrder =
          maxResult && maxResult.maxOrder !== null ? maxResult.maxOrder + 1 : 0;
      }

      const [created] = await tx
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

      await this.snapshotFormState(tx, formId);

      return created;
    });
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

    return await db.transaction(async (tx) => {
      const form = await this.getOwnedForm(userId, formId, tx);
      if (!form) {
        return null;
      }

      const [existing] = await tx
        .select()
        .from(formElementsTable)
        .where(
          and(
            eq(formElementsTable.id, fieldId),
            eq(formElementsTable.formId, formId)
          )
        )
        .limit(1);

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

      const [updated] = await tx
        .update(formElementsTable)
        .set(updates)
        .where(
          and(
            eq(formElementsTable.id, fieldId),
            eq(formElementsTable.formId, formId)
          )
        )
        .returning();

      if (updated) {
        await this.snapshotFormState(tx, formId);
      }

      return updated || null;
    });
  }

  /**
   * Deletes a form element by ID, verifying parent form ownership.
   */
  public async deleteFormField(
    userId: string,
    formId: string,
    fieldId: string
  ): Promise<boolean> {
    return await db.transaction(async (tx) => {
      const form = await this.getOwnedForm(userId, formId, tx);
      if (!form) {
        return false;
      }

      const result = await tx
        .delete(formElementsTable)
        .where(
          and(
            eq(formElementsTable.id, fieldId),
            eq(formElementsTable.formId, formId)
          )
        )
        .returning({ id: formElementsTable.id });

      if (result.length > 0) {
        await this.snapshotFormState(tx, formId);
        return true;
      }

      return false;
    });
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

    return await db.transaction(async (tx) => {
      const form = await this.getOwnedForm(userId, formId, tx);
      if (!form) {
        throw new Error("Form not found or you do not have permission to modify it.");
      }

      // Verify all requested fields exist and belong to this form
      const existing = await tx
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

      await this.snapshotFormState(tx, formId);

      return await tx
        .select()
        .from(formElementsTable)
        .where(eq(formElementsTable.formId, formId))
        .orderBy(asc(formElementsTable.sortOrder));
    });
  }

  /**
   * Batch synchronizes the entire list of form fields in a single transaction.
   * - Deletes fields removed from the draft.
   * - Updates existing fields with new values and sequential sortOrder.
   * - Inserts new fields with sequential sortOrder.
   */
  public async syncFormFields(
    userId: string,
    formId: string,
    input: SyncFormFieldsInput
  ): Promise<FormElement[]> {
    const validated = syncFormFieldsInputSchema.parse(input);

    return await db.transaction(async (tx) => {
      const form = await this.getOwnedForm(userId, formId, tx);
      if (!form) {
        throw new Error("Form not found or you do not have permission to modify it.");
      }

      // 1. Get all current DB element IDs for this form
      const existingElements = await tx
        .select({ id: formElementsTable.id })
        .from(formElementsTable)
        .where(eq(formElementsTable.formId, formId));

      const existingIdSet = new Set(existingElements.map((e) => e.id));

      // 2. Determine fields to delete
      const incomingIds = new Set(
        validated.fields.map((f) => f.id).filter((id): id is string => Boolean(id))
      );

      const toDelete = existingElements
        .map((e) => e.id)
        .filter((id) => !incomingIds.has(id));

      if (toDelete.length > 0) {
        await tx
          .delete(formElementsTable)
          .where(
            and(
              eq(formElementsTable.formId, formId),
              inArray(formElementsTable.id, toDelete)
            )
          );
      }

      // 3. Process each incoming field in its draft order
      for (let i = 0; i < validated.fields.length; i++) {
        const item = validated.fields[i];
        if (!item) continue;

        const isExisting = item.id && existingIdSet.has(item.id);

        if (isExisting && item.id) {
          await tx
            .update(formElementsTable)
            .set({
              type: item.type,
              label: item.label ?? null,
              content: item.content ?? null,
              helpText: item.helpText ?? null,
              placeholder: item.placeholder ?? null,
              required: item.kind === "content" ? false : item.required,
              sortOrder: i,
              config: item.config as FormElementConfig,
              validationRules: item.validationRules as FormValidationRules,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(formElementsTable.id, item.id),
                eq(formElementsTable.formId, formId)
              )
            );
        } else {
          await tx.insert(formElementsTable).values({
            formId,
            kind: item.kind,
            type: item.type,
            label: item.label ?? null,
            content: item.content ?? null,
            helpText: item.helpText ?? null,
            placeholder: item.placeholder ?? null,
            required: item.kind === "content" ? false : item.required,
            sortOrder: i,
            config: item.config as FormElementConfig,
            validationRules: item.validationRules as FormValidationRules,
          });
        }
      }

      await this.snapshotFormState(tx, formId);

      // 4. Return all updated elements in sortOrder
      return await tx
        .select()
        .from(formElementsTable)
        .where(eq(formElementsTable.formId, formId))
        .orderBy(asc(formElementsTable.sortOrder));
    });
  }
}
