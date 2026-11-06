import { authService } from "@formly/services/auth/service";
import FormService from "@formly/services/form";
import FormFieldService from "@formly/services/form-field";
import FormSubmissionService from "@formly/services/form-submissions";

export const formService = new FormService();
export const formFieldService = new FormFieldService();
export const formSubmissionService = new FormSubmissionService();

export { authService };
