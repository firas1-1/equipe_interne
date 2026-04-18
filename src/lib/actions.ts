"use server";

import { prisma } from "./prisma";
import { createSession, getSession, deleteSession } from "./auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

type ActionResult = { success: true } | { success: false; error: string };

// ─── Auth ────────────────────────────────────────────────────────────────

export async function login(formData: FormData): Promise<{ error: string } | never> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Email et mot de passe requis" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Aucun compte trouve avec cet email" };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { error: "Mot de passe incorrect" };

  await createSession({ userId: user.id, isAdmin: user.isAdmin });
  redirect(user.isAdmin ? "/admin" : "/equipe");
}

export async function createMember(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.isAdmin) return { success: false, error: "Acces refuse : admin uniquement" };

    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;
    const isAdmin = formData.get("isAdmin") === "on";

    if (!name || !email || !password) return { success: false, error: "Tous les champs sont requis" };
    if (password.length < 6) return { success: false, error: "Le mot de passe doit contenir au moins 6 caracteres" };

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { success: false, error: `L'email ${email} est deja utilise par un autre compte` };

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { name, email, password: hashed, isAdmin } });

    revalidatePath("/admin/equipe");
    return { success: true };
  } catch (e) {
    console.error("createMember error:", e);
    return { success: false, error: "Erreur serveur, veuillez reessayer" };
  }
}

export async function logout() {
  await deleteSession();
  redirect("/");
}

// ─── Profile ─────────────────────────────────────────────────────────────

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Session expiree, veuillez vous reconnecter" };

    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!name || !email) return { success: false, error: "Nom et email sont requis" };
    if (!currentPassword) return { success: false, error: "Le mot de passe actuel est requis" };

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return { success: false, error: "Compte introuvable" };

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) return { success: false, error: "Mot de passe actuel incorrect" };

    if (email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return { success: false, error: `L'email ${email} est deja utilise par un autre compte` };
    }

    if (newPassword && newPassword.length < 6) {
      return { success: false, error: "Le nouveau mot de passe doit contenir au moins 6 caracteres" };
    }

    const data: { name: string; email: string; password?: string } = { name, email };
    if (newPassword) data.password = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({ where: { id: session.userId }, data });
    revalidatePath("/equipe/profil");
    revalidatePath("/admin/profil");
    return { success: true };
  } catch (e) {
    console.error("updateProfile error:", e);
    return { success: false, error: "Erreur serveur, veuillez reessayer" };
  }
}

// ─── Orders (Admin) ──────────────────────────────────────────────────────

export async function createOrder(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.isAdmin) return { success: false, error: "Acces refuse" };

    const title = (formData.get("title") as string)?.trim();
    const description = formData.get("description") as string;
    const type = formData.get("type") as "RECLAMATION" | "CONFIRMATION";
    const assignedUserId = (formData.get("assignedUserId") as string) || null;

    if (!title) return { success: false, error: "Le titre est requis" };

    await prisma.order.create({
      data: { title, description, type, adminId: session.userId, assignedUserId: assignedUserId || undefined },
    });
    revalidatePath("/admin");
    revalidatePath("/equipe");
    return { success: true };
  } catch (e) {
    console.error("createOrder error:", e);
    return { success: false, error: "Erreur lors de la creation de l'ordre" };
  }
}

export async function deleteOrder(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.isAdmin) return { success: false, error: "Acces refuse" };

    const id = formData.get("id") as string;
    await prisma.order.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/equipe");
    return { success: true };
  } catch (e) {
    console.error("deleteOrder error:", e);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

// ─── Orders (Equipe) ─────────────────────────────────────────────────────

export async function toggleOrderDone(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Session expiree" };

    const id = formData.get("id") as string;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return { success: false, error: "Ordre introuvable" };

    await prisma.order.update({
      where: { id },
      data: { status: order.status === "DONE" ? "PENDING" : "DONE" },
    });
    revalidatePath("/equipe");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error("toggleOrderDone error:", e);
    return { success: false, error: "Erreur lors de la mise a jour" };
  }
}

// ─── Daily Role Assignment (Admin) ───────────────────────────────────────

export async function assignDailyRole(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.isAdmin) return { success: false, error: "Acces refuse" };

    const userId = formData.get("userId") as string;
    const roleType = formData.get("roleType") as "RECLAMATION" | "CONFIRMATION";
    const date = new Date(formData.get("date") as string);

    await prisma.dailyAssignment.upsert({
      where: { userId_date: { userId, date } },
      update: { roleType },
      create: { userId, date, roleType },
    });
    revalidatePath("/admin/equipe");
    revalidatePath("/equipe");
    return { success: true };
  } catch (e) {
    console.error("assignDailyRole error:", e);
    return { success: false, error: "Erreur lors de l'assignation du role" };
  }
}

export async function autoRotateRoles(): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.isAdmin) return { success: false, error: "Acces refuse" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAssignments = await prisma.dailyAssignment.findMany({ where: { date: today } });

    for (const assignment of todayAssignments) {
      const newRole = assignment.roleType === "CONFIRMATION" ? "RECLAMATION" : "CONFIRMATION";
      await prisma.dailyAssignment.upsert({
        where: { userId_date: { userId: assignment.userId, date: tomorrow } },
        update: { roleType: newRole },
        create: { userId: assignment.userId, date: tomorrow, roleType: newRole },
      });
    }

    revalidatePath("/admin/equipe");
    revalidatePath("/equipe");
    return { success: true };
  } catch (e) {
    console.error("autoRotateRoles error:", e);
    return { success: false, error: "Erreur lors de la rotation des roles" };
  }
}

// ─── Kilometres ──────────────────────────────────────────────────────────

export async function addKilometres(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.isAdmin) return { success: false, error: "Acces refuse" };

    const userId = formData.get("userId") as string;
    const value = parseFloat(formData.get("value") as string);
    const date = new Date(formData.get("date") as string);

    if (!userId) return { success: false, error: "Veuillez choisir un membre" };
    if (isNaN(value) || value <= 0) return { success: false, error: "Valeur de kilometres invalide" };

    await prisma.kilometre.upsert({
      where: { userId_date: { userId, date } },
      update: { value },
      create: { userId, date, value },
    });
    revalidatePath("/admin/kilometres");
    return { success: true };
  } catch (e) {
    console.error("addKilometres error:", e);
    return { success: false, error: "Erreur lors de l'ajout des kilometres" };
  }
}
