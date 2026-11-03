import crypto from "node:crypto";
import { and, asc, db, desc, eq, inArray, isNull } from "@formly/database";
import {
  formsTable,
  formElementsTable,
  formVersionsTable,
  formVersionElementsTable,
  type FormSettings,
  type FormElementConfig,
  type FormValidationRules,
} from "@formly/database/schema";
import {
  type CreateFormInput,
  createFormInputSchema,
  defaultFormSettings,
  type UpdateFormInput,
  updateFormInputSchema,
  type SaveFormDraftInput,
  saveFormDraftInputSchema,
  type RestoreFormVersionInput,
  restoreFormVersionInputSchema,
} from "./model";

export type Form = typeof formsTable.$inferSelect;
export type FormElement = typeof formElementsTable.$inferSelect;
export type FormVersion = typeof formVersionsTable.$inferSelect;
export type FormVersionElement = typeof formVersionElementsTable.$inferSelect;

export interface SaveFormDraftResult {
  form: Form;
  fields: FormElement[];
  version: FormVersion;
  isNoOp: boolean;
}

export interface FormVersionDetail {
  version: FormVersion;
  elements: FormVersionElement[];
}

export interface RestoreFormVersionResult {
  form: Form;
  fields: FormElement[];
  version: FormVersion;
}

/**
 * Deterministic canonical JSON stringifier to compare objects regardless of key ordering.
 */
function canonicalJson(val: unknown): string {
  if (val === null || typeof val !== "object") {
    return JSON.stringify(val);
  }
  if (Array.isArray(val)) {
    return "[" + val.map(canonicalJson).join(",") + "]";
  }
  const keys = Object.keys(val as Record<string, unknown>).sort();
  return (
    "{" +
    keys
      .map(
        (k) =>
          `${JSON.stringify(k)}:${canonicalJson(
            (val as Record<string, unknown>)[k]
          )}`
      )
      .join(",") +
    "}"
  );
}

export default class FormService {
  /**
   * Generates a secure 16-character base64url share ID (12 bytes = 16 base64url chars).
   */
  public generateShareId(): string {
    return crypto.randomBytes(12).toString("base64url");
  }

  /**
   * Creates a new form for the given user with automatic collision retry on shareId
   * and creates its baseline Version 1 in the same transaction.
   */
  public async createForm(userId: string, input: CreateFormInput): Promise<Form> {
    const validated = createFormInputSchema.parse(input);
    const maxRetries = 5;
    let attempt = 0;

    const settings = (validated.settings ?? defaultFormSettings) as FormSettings;

    while (attempt < maxRetries) {
      attempt++;
      const shareId = this.generateShareId();

      try {
        const form = await db.transaction(async (tx) => {
          const [insertedForm] = await tx
            .insert(formsTable)
            .values({
              createdBy: userId,
              title: validated.title,
              description: validated.description ?? null,
              visibility: validated.visibility,
              maxSubmissions: validated.maxSubmissions ?? null,
              settings,
              expiresAt: validated.expiresAt ?? null,
              shareId,
              status: "draft",
            })
            .returning();

          if (insertedForm) {
            // Create baseline Version 1 snapshot
            await tx.insert(formVersionsTable).values({
              formId: insertedForm.id,
              versionNumber: 1,
              title: insertedForm.title,
              description: insertedForm.description,
              themeId: insertedForm.themeId,
              settings: insertedForm.settings,
              createdAt: insertedForm.createdAt,
              publishedAt: null,
            });
          }

          return insertedForm;
        });

        if (form) {
          return form;
        }
      } catch (error: unknown) {
        // PostgreSQL unique constraint violation error code is '23505'
        const pgError = error as { code?: string; constraint?: string };
        if (
          pgError?.code === "23505" &&
          pgError?.constraint === "forms_share_id_unique" &&
          attempt < maxRetries
        ) {
          continue;
        }
        throw error;
      }
    }

    throw new Error(
      "Failed to generate a unique share ID for form after multiple attempts."
    );
  }

  /**
   * Retrieves a single non-deleted form by ID owned by the user.
   */
  public async getFormById(userId: string, formId: string): Promise<Form | null> {
    const [form] = await db
      .select()
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
   * Lists all non-deleted forms owned by the user, ordered by updatedAt descending.
   */
  public async listForms(userId: string): Promise<Form[]> {
    return await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.createdBy, userId),
          isNull(formsTable.deletedAt)
        )
      )
      .orderBy(desc(formsTable.updatedAt));
  }

  /**
   * Updates an existing non-deleted form owned by the user.
   */
  public async updateForm(
    userId: string,
    formId: string,
    input: UpdateFormInput
  ): Promise<Form | null> {
    const validated = updateFormInputSchema.parse(input);

    const existing = await this.getFormById(userId, formId);
    if (!existing) {
      return null;
    }

    const updates: Partial<typeof formsTable.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (validated.title !== undefined) {
      updates.title = validated.title;
    }

    if (validated.description !== undefined) {
      updates.description = validated.description;
    }

    if (validated.visibility !== undefined) {
      updates.visibility = validated.visibility;
    }

    if (validated.maxSubmissions !== undefined) {
      updates.maxSubmissions = validated.maxSubmissions;
    }

    if (validated.settings !== undefined) {
      const existingSettings =
        typeof existing.settings === "object" && existing.settings !== null
          ? (existing.settings as Record<string, unknown>)
          : {};

      const cleanIncomingSettings: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(validated.settings)) {
        if (value !== undefined) {
          cleanIncomingSettings[key] = value;
        }
      }

      updates.settings = {
        ...existingSettings,
        ...cleanIncomingSettings,
      } as FormSettings;
    }

    if (validated.expiresAt !== undefined) {
      updates.expiresAt = validated.expiresAt;
    }

    if (validated.status !== undefined) {
      updates.status = validated.status;
      if (validated.status === "published" && !existing.publishedAt) {
        updates.publishedAt = new Date();
      } else if (validated.status === "closed" && !existing.closedAt) {
        updates.closedAt = new Date();
      }
    }

    const [updated] = await db
      .update(formsTable)
      .set(updates)
      .where(
        and(
          eq(formsTable.id, formId),
          eq(formsTable.createdBy, userId),
          isNull(formsTable.deletedAt)
        )
      )
      .returning();

    return updated || null;
  }

  /**
   * Soft-deletes a form owned by the user by setting deletedAt to current timestamp.
   */
  public async deleteForm(userId: string, formId: string): Promise<boolean> {
    const result = await db
      .update(formsTable)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(formsTable.id, formId),
          eq(formsTable.createdBy, userId),
          isNull(formsTable.deletedAt)
        )
      )
      .returning({ id: formsTable.id });

    return result.length > 0;
  }

  /**
   * Publishes a form owned by the user, associating it with the latest saved version.
   */
  public async publishForm(userId: string, formId: string): Promise<Form | null> {
    return await db.transaction(async (tx) => {
      const [form] = await tx
        .select()
        .from(formsTable)
        .where(
          and(
            eq(formsTable.id, formId),
            eq(formsTable.createdBy, userId),
            isNull(formsTable.deletedAt)
          )
        )
        .for("update");

      if (!form) return null;

      // Find latest version
      const [existingLatestVersion] = await tx
        .select()
        .from(formVersionsTable)
        .where(eq(formVersionsTable.formId, form.id))
        .orderBy(desc(formVersionsTable.versionNumber))
        .limit(1);

      let latestVersion = existingLatestVersion;

      // If no version exists yet, backfill baseline Version 1
      if (!latestVersion) {
        const [v1] = await tx
          .insert(formVersionsTable)
          .values({
            formId: form.id,
            versionNumber: 1,
            title: form.title,
            description: form.description,
            themeId: form.themeId,
            settings: form.settings,
            createdAt: form.createdAt,
            publishedAt: new Date(),
          })
          .returning();

        if (!v1) {
          throw new Error("Failed to create baseline version snapshot");
        }

        latestVersion = v1;

        const currentElements = await tx
          .select()
          .from(formElementsTable)
          .where(eq(formElementsTable.formId, form.id))
          .orderBy(asc(formElementsTable.sortOrder));

        if (currentElements.length > 0) {
          await tx.insert(formVersionElementsTable).values(
            currentElements.map((el) => ({
              formVersionId: v1.id,
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
      } else if (!latestVersion.publishedAt) {
        await tx
          .update(formVersionsTable)
          .set({ publishedAt: new Date() })
          .where(eq(formVersionsTable.id, latestVersion.id));
      }

      if (!latestVersion) {
        throw new Error("Failed to determine published version");
      }

      const [updatedForm] = await tx
        .update(formsTable)
        .set({
          status: "published",
          publishedVersionId: latestVersion.id,
          publishedAt: form.publishedAt || new Date(),
          updatedAt: new Date(),
        })
        .where(eq(formsTable.id, form.id))
        .returning();

      return updatedForm || null;
    });
  }

  /**
   * Unpublishes a form owned by the user (sets status back to draft).
   */
  public async unpublishForm(userId: string, formId: string): Promise<Form | null> {
    return this.updateForm(userId, formId, {
      status: "draft",
    });
  }

  /**
   * Retrieves a public form by its shareId along with its questions.
   * If published and publishedVersionId is set, serves the immutable published snapshot.
   */
  public async getFormByShareId(shareId: string): Promise<{
    form: Form;
    fields: FormElement[];
  } | null> {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.shareId, shareId),
          isNull(formsTable.deletedAt)
        )
      )
      .limit(1);

    if (!form) {
      return null;
    }

    // If published and publishedVersionId is set, serve the immutable published snapshot!
    if (form.status === "published" && form.publishedVersionId) {
      const [pubVersion] = await db
        .select()
        .from(formVersionsTable)
        .where(
          and(
            eq(formVersionsTable.id, form.publishedVersionId),
            eq(formVersionsTable.formId, form.id)
          )
        )
        .limit(1);

      if (pubVersion) {
        const versionElements = await db
          .select()
          .from(formVersionElementsTable)
          .where(eq(formVersionElementsTable.formVersionId, pubVersion.id))
          .orderBy(asc(formVersionElementsTable.sortOrder));

        const mappedFields: FormElement[] = versionElements.map((el) => ({
          id: el.sourceElementId || el.id,
          formId: form.id,
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
          updatedAt: el.createdAt,
        }));

        const publishedFormSnapshot: Form = {
          ...form,
          title: pubVersion.title,
          description: pubVersion.description,
          themeId: pubVersion.themeId,
          settings: pubVersion.settings,
        };

        return {
          form: publishedFormSnapshot,
          fields: mappedFields,
        };
      }
    }

    // Default: return current mutable fields (for draft/preview)
    const fields = await db
      .select()
      .from(formElementsTable)
      .where(eq(formElementsTable.formId, form.id))
      .orderBy(asc(formElementsTable.sortOrder));

    return {
      form,
      fields,
    };
  }

  // =========================================================================
  // Complete Draft Save & Versioning Operations (Aggregate Transactional)
  // =========================================================================

  /**
   * Saves the entire form draft (metadata, documentContent settings, and elements)
   * in a single transaction, enforcing concurrency control and no-op detection.
   * Creates exactly one immutable version snapshot if meaningful changes exist.
   */
  public async saveFormDraft(
    userId: string,
    input: SaveFormDraftInput
  ): Promise<SaveFormDraftResult> {
    const validated = saveFormDraftInputSchema.parse(input);

    return await db.transaction(async (tx) => {
      // 1. Lock parent form row for update
      const [form] = await tx
        .select()
        .from(formsTable)
        .where(
          and(
            eq(formsTable.id, validated.formId),
            eq(formsTable.createdBy, userId),
            isNull(formsTable.deletedAt)
          )
        )
        .for("update");

      if (!form) {
        throw new Error(
          "Form not found or you do not have permission to modify it."
        );
      }

      // 2. Fetch current latest version
      const [existingLatestVersion] = await tx
        .select()
        .from(formVersionsTable)
        .where(eq(formVersionsTable.formId, form.id))
        .orderBy(desc(formVersionsTable.versionNumber))
        .limit(1);

      let latestVersion = existingLatestVersion;

      // 3. First-save fallback: if no baseline version exists, snapshot current state as Version 1
      if (!latestVersion) {
        const [v1] = await tx
          .insert(formVersionsTable)
          .values({
            formId: form.id,
            versionNumber: 1,
            title: form.title,
            description: form.description,
            themeId: form.themeId,
            settings: form.settings,
            createdAt: form.createdAt,
            publishedAt:
              form.status === "published"
                ? form.publishedAt || new Date()
                : null,
          })
          .returning();

        if (!v1) {
          throw new Error("Failed to create baseline version snapshot");
        }

        latestVersion = v1;

        const currentElements = await tx
          .select()
          .from(formElementsTable)
          .where(eq(formElementsTable.formId, form.id))
          .orderBy(asc(formElementsTable.sortOrder));

        if (currentElements.length > 0) {
          await tx.insert(formVersionElementsTable).values(
            currentElements.map((el) => ({
              formVersionId: v1.id,
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

        if (form.status === "published") {
          await tx
            .update(formsTable)
            .set({ publishedVersionId: v1.id })
            .where(eq(formsTable.id, form.id));
        }
      }

      if (!latestVersion) {
        throw new Error("Unable to establish form version");
      }

      const activeLatestVersion = latestVersion;

      // 4. Concurrency check
      if (
        validated.expectedVersion !== undefined &&
        validated.expectedVersion !== activeLatestVersion.versionNumber
      ) {
        throw new Error(
          `CONCURRENCY_CONFLICT: Form has been modified by another session (expected version ${validated.expectedVersion}, but current version is ${activeLatestVersion.versionNumber}). Please reload the form.`
        );
      }

      // 5. Fetch existing elements
      const existingElements = await tx
        .select()
        .from(formElementsTable)
        .where(eq(formElementsTable.formId, form.id))
        .orderBy(asc(formElementsTable.sortOrder));

      // 6. No-Op Detection
      const incomingTitle =
        validated.title !== undefined ? validated.title.trim() : form.title;
      const incomingDesc =
        validated.description !== undefined
          ? validated.description
            ? validated.description.trim()
            : null
          : form.description;
      const currentDesc = form.description ? form.description.trim() : null;

      const mergedSettings =
        validated.settings !== undefined
          ? {
              ...(typeof form.settings === "object" && form.settings !== null
                ? form.settings
                : {}),
              ...validated.settings,
            }
          : form.settings;

      const titleChanged = incomingTitle !== form.title;
      const descChanged = incomingDesc !== currentDesc;
      const settingsChanged =
        canonicalJson(mergedSettings) !== canonicalJson(form.settings);

      // Check fields differences
      let fieldsChanged = false;
      if (existingElements.length !== validated.fields.length) {
        fieldsChanged = true;
      } else {
        for (let i = 0; i < existingElements.length; i++) {
          const cur = existingElements[i]!;
          const inc = validated.fields[i]!;

          const curId = cur.id;
          const incId = inc.id && !inc.id.startsWith("temp_") ? inc.id : null;

          if (incId && incId !== curId) {
            fieldsChanged = true;
            break;
          }
          if ((inc.kind || "question") !== cur.kind) {
            fieldsChanged = true;
            break;
          }
          if (inc.type !== cur.type) {
            fieldsChanged = true;
            break;
          }
          if ((inc.label || "").trim() !== (cur.label || "").trim()) {
            fieldsChanged = true;
            break;
          }
          if ((inc.content || "").trim() !== (cur.content || "").trim()) {
            fieldsChanged = true;
            break;
          }
          if ((inc.helpText || "").trim() !== (cur.helpText || "").trim()) {
            fieldsChanged = true;
            break;
          }
          if (
            (inc.placeholder || "").trim() !== (cur.placeholder || "").trim()
          ) {
            fieldsChanged = true;
            break;
          }
          if (Boolean(inc.required) !== Boolean(cur.required)) {
            fieldsChanged = true;
            break;
          }
          if (
            canonicalJson(inc.config || {}) !==
            canonicalJson(cur.config || {})
          ) {
            fieldsChanged = true;
            break;
          }
          if (
            canonicalJson(inc.validationRules || {}) !==
            canonicalJson(cur.validationRules || {})
          ) {
            fieldsChanged = true;
            break;
          }
        }
      }

      const isMeaningfullyChanged =
        titleChanged || descChanged || settingsChanged || fieldsChanged;

      if (!isMeaningfullyChanged) {
        return {
          form,
          fields: existingElements,
          version: activeLatestVersion,
          isNoOp: true,
        };
      }

      // 7. Update formsTable
      const [updatedForm] = await tx
        .update(formsTable)
        .set({
          title: incomingTitle,
          description: incomingDesc,
          settings: mergedSettings as FormSettings,
          updatedAt: new Date(),
        })
        .where(eq(formsTable.id, form.id))
        .returning();

      if (!updatedForm) {
        throw new Error("Failed to update form");
      }

      // 8. Synchronize formElementsTable
      const existingIdSet = new Set(existingElements.map((e) => e.id));
      const incomingIds = new Set(
        validated.fields
          .map((f) => f.id)
          .filter(
            (id): id is string =>
              typeof id === "string" && id.length > 0 && !id.startsWith("temp_")
          )
      );

      const toDelete = existingElements
        .map((e) => e.id)
        .filter((id: string) => !incomingIds.has(id));

      if (toDelete.length > 0) {
        await tx
          .delete(formElementsTable)
          .where(
            and(
              eq(formElementsTable.formId, form.id),
              inArray(formElementsTable.id, toDelete)
            )
          );
      }

      for (let i = 0; i < validated.fields.length; i++) {
        const item = validated.fields[i]!;
        const isExisting =
          item.id &&
          !item.id.startsWith("temp_") &&
          existingIdSet.has(item.id);

        if (isExisting && item.id) {
          await tx
            .update(formElementsTable)
            .set({
              kind: item.kind,
              type: item.type,
              label: item.label ?? null,
              content: item.content ?? null,
              helpText: item.helpText ?? null,
              placeholder: item.placeholder ?? null,
              required: item.kind === "content" ? false : Boolean(item.required),
              sortOrder: i,
              config: (item.config || {}) as FormElementConfig,
              validationRules: (item.validationRules || {}) as FormValidationRules,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(formElementsTable.id, item.id),
                eq(formElementsTable.formId, form.id)
              )
            );
        } else {
          await tx.insert(formElementsTable).values({
            formId: form.id,
            kind: item.kind,
            type: item.type,
            label: item.label ?? null,
            content: item.content ?? null,
            helpText: item.helpText ?? null,
            placeholder: item.placeholder ?? null,
            required: item.kind === "content" ? false : Boolean(item.required),
            sortOrder: i,
            config: (item.config || {}) as FormElementConfig,
            validationRules: (item.validationRules || {}) as FormValidationRules,
          });
        }
      }

      // Read persisted elements in visual order
      const persistedElements = await tx
        .select()
        .from(formElementsTable)
        .where(eq(formElementsTable.formId, form.id))
        .orderBy(asc(formElementsTable.sortOrder));

      // 9. Create new Version snapshot
      const nextVersionNumber = activeLatestVersion.versionNumber + 1;

      const [newVersion] = await tx
        .insert(formVersionsTable)
        .values({
          formId: form.id,
          versionNumber: nextVersionNumber,
          title: updatedForm.title,
          description: updatedForm.description,
          themeId: updatedForm.themeId,
          settings: updatedForm.settings,
          createdAt: new Date(),
          publishedAt: null, // Draft save does not publish
        })
        .returning();

      if (!newVersion) {
        throw new Error("Failed to create new version snapshot");
      }

      // 10. Snapshot persisted elements
      if (persistedElements.length > 0) {
        await tx.insert(formVersionElementsTable).values(
          persistedElements.map((el) => ({
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

      return {
        form: updatedForm,
        fields: persistedElements,
        version: newVersion,
        isNoOp: false,
      };
    });
  }

  /**
   * Lists historical versions of a form owned by the user, ordered by versionNumber descending.
   */
  public async listFormVersions(
    userId: string,
    formId: string
  ): Promise<FormVersion[]> {
    const form = await this.getFormById(userId, formId);
    if (!form) {
      throw new Error("Form not found or you do not have permission to view it.");
    }

    return await db
      .select()
      .from(formVersionsTable)
      .where(eq(formVersionsTable.formId, formId))
      .orderBy(desc(formVersionsTable.versionNumber));
  }

  /**
   * Retrieves a specific form version snapshot along with its snapshot elements.
   */
  public async getFormVersionById(
    userId: string,
    formId: string,
    versionId?: string,
    versionNumber?: number
  ): Promise<FormVersionDetail | null> {
    const form = await this.getFormById(userId, formId);
    if (!form) {
      throw new Error("Form not found or you do not have permission to view it.");
    }

    const whereConditions = [eq(formVersionsTable.formId, formId)];
    if (versionId) {
      whereConditions.push(eq(formVersionsTable.id, versionId));
    }
    if (versionNumber !== undefined) {
      whereConditions.push(eq(formVersionsTable.versionNumber, versionNumber));
    }

    const [version] = await db
      .select()
      .from(formVersionsTable)
      .where(and(...whereConditions))
      .limit(1);

    if (!version) {
      return null;
    }

    const elements = await db
      .select()
      .from(formVersionElementsTable)
      .where(eq(formVersionElementsTable.formVersionId, version.id))
      .orderBy(asc(formVersionElementsTable.sortOrder));

    return {
      version,
      elements,
    };
  }

  /**
   * Restores an older historical version as the current live editable form,
   * creating a brand new version (Version N+1) that captures the restored state.
   */
  public async restoreFormVersion(
    userId: string,
    input: RestoreFormVersionInput
  ): Promise<RestoreFormVersionResult> {
    const validated = restoreFormVersionInputSchema.parse(input);

    return await db.transaction(async (tx) => {
      // 1. Lock form row
      const [form] = await tx
        .select()
        .from(formsTable)
        .where(
          and(
            eq(formsTable.id, validated.formId),
            eq(formsTable.createdBy, userId),
            isNull(formsTable.deletedAt)
          )
        )
        .for("update");

      if (!form) {
        throw new Error(
          "Form not found or you do not have permission to modify it."
        );
      }

      // 2. Concurrency check
      const [latestVersion] = await tx
        .select()
        .from(formVersionsTable)
        .where(eq(formVersionsTable.formId, form.id))
        .orderBy(desc(formVersionsTable.versionNumber))
        .limit(1);

      if (
        validated.expectedVersion !== undefined &&
        latestVersion &&
        validated.expectedVersion !== latestVersion.versionNumber
      ) {
        throw new Error(
          `CONCURRENCY_CONFLICT: Form has been modified by another session (expected version ${validated.expectedVersion}, but current version is ${latestVersion.versionNumber}).`
        );
      }

      // 3. Fetch target snapshot
      const [targetVersion] = await tx
        .select()
        .from(formVersionsTable)
        .where(
          and(
            eq(formVersionsTable.id, validated.versionId),
            eq(formVersionsTable.formId, form.id)
          )
        )
        .limit(1);

      if (!targetVersion) {
        throw new Error("Target version snapshot not found.");
      }

      const snapshotElements = await tx
        .select()
        .from(formVersionElementsTable)
        .where(eq(formVersionElementsTable.formVersionId, targetVersion.id))
        .orderBy(asc(formVersionElementsTable.sortOrder));

      // 4. Update mutable formsTable
      const [restoredForm] = await tx
        .update(formsTable)
        .set({
          title: targetVersion.title,
          description: targetVersion.description,
          themeId: targetVersion.themeId,
          settings: targetVersion.settings,
          updatedAt: new Date(),
        })
        .where(eq(formsTable.id, form.id))
        .returning();

      if (!restoredForm) {
        throw new Error("Failed to restore form record");
      }

      // 5. Replace current formElementsTable
      await tx
        .delete(formElementsTable)
        .where(eq(formElementsTable.formId, form.id));

      for (const el of snapshotElements) {
        await tx.insert(formElementsTable).values({
          ...(el.sourceElementId ? { id: el.sourceElementId } : {}),
          formId: form.id,
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
        });
      }

      const persistedElements = await tx
        .select()
        .from(formElementsTable)
        .where(eq(formElementsTable.formId, form.id))
        .orderBy(asc(formElementsTable.sortOrder));

      // 6. Create Version N+1
      const nextVersionNumber = (latestVersion?.versionNumber || 0) + 1;

      const [newVersion] = await tx
        .insert(formVersionsTable)
        .values({
          formId: form.id,
          versionNumber: nextVersionNumber,
          title: restoredForm.title,
          description: restoredForm.description,
          themeId: restoredForm.themeId,
          settings: restoredForm.settings,
          createdAt: new Date(),
          publishedAt: null, // Restored draft is not automatically published
        })
        .returning();

      if (!newVersion) {
        throw new Error("Failed to create snapshot for restored version");
      }

      // 7. Snapshot elements for new Version N+1
      if (persistedElements.length > 0) {
        await tx.insert(formVersionElementsTable).values(
          persistedElements.map((el) => ({
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

      return {
        form: restoredForm,
        fields: persistedElements,
        version: newVersion,
      };
    });
  }
}
