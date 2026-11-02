import crypto from "node:crypto";
import { and, asc, db, desc, eq, isNull } from "@formly/database";
import {
  formsTable,
  formElementsTable,
  type FormSettings,
} from "@formly/database/schema";
import {
  type CreateFormInput,
  createFormInputSchema,
  defaultFormSettings,
  type UpdateFormInput,
  updateFormInputSchema,
} from "./model";

export type Form = typeof formsTable.$inferSelect;
export type FormElement = typeof formElementsTable.$inferSelect;

export default class FormService {
  /**
   * Generates a secure 16-character base64url share ID (12 bytes = 16 base64url chars).
   */
  public generateShareId(): string {
    return crypto.randomBytes(12).toString("base64url");
  }

  /**
   * Creates a new form for the given user with automatic collision retry on shareId.
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
        const [form] = await db
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

    throw new Error("Failed to generate a unique share ID for form after multiple attempts.");
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
      // Preserve existing settings while merging incoming defined update fields
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
   * Publishes a form owned by the user.
   */
  public async publishForm(userId: string, formId: string): Promise<Form | null> {
    return this.updateForm(userId, formId, {
      status: "published",
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
}

