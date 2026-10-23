import { z } from "zod";

export function getZodErrorMessage(error: any): string {
  if (!error) return "Validasi gagal";
  if (Array.isArray(error.issues) && error.issues.length > 0) {
    return error.issues[0].message;
  }
  if (Array.isArray(error.errors) && error.errors.length > 0) {
    return error.errors[0].message;
  }
  return error.message || "Validasi data gagal";
}
