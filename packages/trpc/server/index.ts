import { router } from "./trpc";
import { healthRouter } from "./routes/health/route";
import { authRouter } from "./routes/auth/route";
import { formsRouter } from "./routes/form/route";
import { formFieldsRouter } from "./routes/form-field/route";

export const serverRouter = router({
  health: healthRouter,
  auth: authRouter,
  forms: formsRouter,
  formFields: formFieldsRouter,
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
