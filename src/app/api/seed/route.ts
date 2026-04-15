import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  const adminExists = await prisma.user.findFirst({ where: { isAdmin: true } });
  if (adminExists) {
    return NextResponse.json({ message: "Seed deja execute" });
  }

  const adminPassword = await bcrypt.hash("admin123", 10);
  const memberPassword = await bcrypt.hash("equipe123", 10);

  await prisma.user.create({
    data: {
      name: "Administrateur",
      email: "admin@equipe.com",
      password: adminPassword,
      isAdmin: true,
    },
  });

  const member1 = await prisma.user.create({
    data: {
      name: "Ahmed",
      email: "ahmed@equipe.com",
      password: memberPassword,
      isAdmin: false,
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: "Sara",
      email: "sara@equipe.com",
      password: memberPassword,
      isAdmin: false,
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyAssignment.createMany({
    data: [
      { userId: member1.id, date: today, roleType: "CONFIRMATION" },
      { userId: member2.id, date: today, roleType: "RECLAMATION" },
    ],
  });

  return NextResponse.json({
    message: "Seed termine!",
    comptes: {
      admin: "admin@equipe.com / admin123",
      membre1: "ahmed@equipe.com / equipe123",
      membre2: "sara@equipe.com / equipe123",
    },
  });
}
