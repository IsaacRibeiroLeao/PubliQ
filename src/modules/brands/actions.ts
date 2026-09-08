"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import type { BrandFormState } from "@/components/BrandForm";
import { getBrandService } from "@/modules/brands/service";
import {
  brandFormSchema,
  parseBrandFormData,
} from "@/modules/brands/schemas";
import { BrandLimitError } from "@/modules/brands/service";
import { WorkspaceAccessError } from "@/modules/auth/session";

function toErrorState(error: unknown): BrandFormState {
  if (error instanceof ZodError) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      errors: error.flatten().fieldErrors,
    };
  }
  if (error instanceof BrandLimitError || error instanceof WorkspaceAccessError) {
    return { status: "error", message: error.message };
  }
  return {
    status: "error",
    message: "Não foi possível salvar a marca. Tente novamente.",
  };
}

export async function createBrandAction(
  workspaceId: string,
  _previousState: BrandFormState,
  formData: FormData,
): Promise<BrandFormState> {
  let brandId: string;
  try {
    const values = brandFormSchema.parse(parseBrandFormData(formData));
    const service = await getBrandService();
    const brand = await service.create(workspaceId, values);
    brandId = brand.id;
  } catch (error) {
    return toErrorState(error);
  }
  revalidatePath("/app/marcas");
  redirect(`/app/marcas/${brandId}`);
}

export async function updateBrandAction(
  workspaceId: string,
  brandId: string,
  _previousState: BrandFormState,
  formData: FormData,
): Promise<BrandFormState> {
  try {
    const values = brandFormSchema.parse(parseBrandFormData(formData));
    const service = await getBrandService();
    await service.update(workspaceId, brandId, values);
  } catch (error) {
    return toErrorState(error);
  }
  revalidatePath("/app/marcas");
  revalidatePath(`/app/marcas/${brandId}`);
  return { status: "success", message: "Marca atualizada." };
}
