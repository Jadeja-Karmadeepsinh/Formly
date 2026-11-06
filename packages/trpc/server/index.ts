import { router } from "./trpc";
import { healthRouter } from "./routes/health/route";
import { authRouter } from "./routes/auth/route";
import { formsRouter } from "./routes/form/route";
import { formFieldsRouter } from "./routes/form-field/route";
import { formSubmissionsRouter } from "./routes/form-submissions/route";

export const serverRouter = router({
  health: healthRouter,
  auth: authRouter,
  forms: formsRouter,
  formFields: formFieldsRouter,
  formSubmissions: formSubmissionsRouter,
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
