"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, verifyPassword, hashPassword, getCurrentAdmin } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/admin");

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const valid = await verifyPassword(password, user!.passwordHash);
  if (!valid) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }

  await createSession(user!.id);
  redirect(next || "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePasswordAction(formData: FormData) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  const valid = await verifyPassword(currentPassword, admin!.passwordHash);
  if (!valid) {
    redirect("/admin/settings?pwerror=current#security");
  }

  if (newPassword.length < 8) {
    redirect("/admin/settings?pwerror=length#security");
  }

  if (newPassword !== confirmPassword) {
    redirect("/admin/settings?pwerror=mismatch#security");
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.adminUser.update({ where: { id: admin!.id }, data: { passwordHash } });

  redirect("/admin/settings?pwsuccess=1#security");
}
