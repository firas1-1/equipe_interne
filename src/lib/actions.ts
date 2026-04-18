"use server";

import { prisma } from "./prisma";
import { createSession, getSession, deleteSession } from "./auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// ─── Auth ────────────────────────────────────────────────────────────────

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Email ou mot de passe incorrect");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Email ou mot de passe incorrect");

  await createSession({ userId: user.id, isAdmin: user.isAdmin });
  redirect(user.isAdmin ? "/admin" : "/equipe");
}

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const isAdmin = formData.get("isAdmin") === "on";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Cet email est deja utilise");

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, isAdmin },
  });

  await createSession({ userId: user.id, isAdmin: user.isAdmin });
  redirect(user.isAdmin ? "/admin" : "/equipe");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}

// ─── Profile ───────────────────────────────────────────���────────────────

export async function updateProfile(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Non autorise" };

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return { success: false, error: "Utilisateur non trouve" };

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) return { success: false, error: "Mot de passe actuel incorrect" };

    if (email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return { success: false, error: "Cet email est deja utilise" };
    }

    const data: { name: string; email: string; password?: string } = { name, email };
    if (newPassword) {
      data.password = await bcrypt.hash(newPassword, 10);
    }

    await prisma.user.update({ where: { id: session.userId }, data });

    revalidatePath("/equipe/profil");
    revalidatePath("/admin/profil");

    return { success: true };
  } catch {
    return { success: false, error: "Une erreur est survenue, veuillez reessayer" };
  }
}

// ─── Orders (Admin) ─────────────────────────────────────────────────────

export async function createOrder(formData: FormData) {
  const session = await getSession();
  if (!session?.isAdmin) throw new Error("Non autorise");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as "RECLAMATION" | "CONFIRMATION";

  await prisma.order.create({
    data: { title, description, type, adminId: session.userId },
  });

  revalidatePath("/admin");
  revalidatePath("/equipe");
}

export async function deleteOrder(formData: FormData) {
  const session = await getSession();
  if (!session?.isAdmin) throw new Error("Non autorise");

  const id = formData.get("id") as string;
  await prisma.order.delete({ where: { id } });

  revalidatePath("/admin");
  revalidatePath("/equipe");
}

// ─── Orders (Equipe) ────────────────────────────────────────────────────

export async function toggleOrderDone(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Non autorise");

  const id = formData.get("id") as string;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new Error("Ordre non trouve");

  await prisma.order.update({
    where: { id },
    data: { status: order.status === "DONE" ? "PENDING" : "DONE" },
  });

  revalidatePath("/equipe");
  revalidatePath("/admin");
}

// ─── Daily Role Assignment (Admin) ──────────────────────────────────────

export async function assignDailyRole(formData: FormData) {
  const session = await getSession();
  if (!session?.isAdmin) throw new Error("Non autorise");

  const userId = formData.get("userId") as string;
  const roleType = formData.get("roleType") as "RECLAMATION" | "CONFIRMATION";
  const date = new Date(formData.get("date") as string);

  await prisma.dailyAssignment.upsert({
    where: { userId_date: { userId, date } },
    update: { roleType },
    create: { userId, date, roleType },
  });

  revalidatePath("/admin");
  revalidatePath("/equipe");
}

export async function autoRotateRoles() {
  const session = await getSession();
  if (!session?.isAdmin) throw new Error("Non autorise");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAssignments = await prisma.dailyAssignment.findMany({
    where: { date: today },
  });

  for (const assignment of todayAssignments) {
    const newRole =
      assignment.roleType === "CONFIRMATION" ? "RECLAMATION" : "CONFIRMATION";

    await prisma.dailyAssignment.upsert({
      where: { userId_date: { userId: assignment.userId, date: tomorrow } },
      update: { roleType: newRole },
      create: { userId: assignment.userId, date: tomorrow, roleType: newRole },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/equipe");
}

// ─── Kilometres ─────────────────────────────────────────────────────────

export async function addKilometres(formData: FormData) {
  const session = await getSession();
  if (!session?.isAdmin) throw new Error("Non autorise");

  const userId = formData.get("userId") as string;
  const value = parseFloat(formData.get("value") as string);
  const date = new Date(formData.get("date") as string);

  await prisma.kilometre.upsert({
    where: { userId_date: { userId, date } },
    update: { value },
    create: { userId, date, value },
  });

  revalidatePath("/admin");
}
