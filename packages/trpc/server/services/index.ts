import { authService } from "@formly/services/auth/service";
import FormService from "@formly/services/form";
import FormFieldService from "@formly/services/form-field";

export const formService = new FormService();
export const formFieldService = new FormFieldService();

export { authService };
