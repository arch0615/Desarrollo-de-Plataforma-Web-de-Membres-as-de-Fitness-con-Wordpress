import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Tu nombre es muy corto").max(80),
    email: z.string().email("Email inválido").max(254),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .max(128)
      .regex(/[a-z]/, "Debe incluir minúsculas")
      .regex(/[A-Z]/, "Debe incluir mayúsculas")
      .regex(/\d/, "Debe incluir un número"),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, { message: "Tenés que aceptar los términos" }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

export const forgotSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[a-z]/, "Debe incluir minúsculas")
      .regex(/[A-Z]/, "Debe incluir mayúsculas")
      .regex(/\d/, "Debe incluir un número"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotInput = z.infer<typeof forgotSchema>;
export type ResetInput = z.infer<typeof resetSchema>;
