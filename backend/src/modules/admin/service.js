import prisma from "../../lib/prisma.js";
import { AppError } from "../../utils/error.js";
import { serializeUser } from "../../utils/serializers.js";
import { getJobsPage } from "../api/api_get.js";

export async function getAdminSourcePreview() {
  const page = await getJobsPage({ page: 0, size: 5 });

  return {
    source: "welovedevs",
    totalAvailable: page.totalCount,
    preview: page.values.map((job) => ({
      id: job.id ?? job.objectID,
      title: job.title ?? "Untitled offer",
      companyName: job.smallCompany?.companyName ?? "Unknown company",
    })),
  };
}

export async function getAdminSourceStatus() {
  const page = await getJobsPage({ page: 0, size: 1 });

  return {
    source: "welovedevs",
    status: "reachable",
    totalAvailable: page.totalCount,
  };
}

export async function getAdminDashboard() {
  const [
    totalUsers,
    activeUsers,
    pendingUsers,
    blockedUsers,
    totalOffers,
    totalReports,
    pendingReports,
    totalTickets,
    openTickets,
    totalApplications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "active" } }),
    prisma.user.count({ where: { status: "pending" } }),
    prisma.user.count({ where: { status: "blocked" } }),
    prisma.offer.count(),
    prisma.report.count(),
    prisma.report.count({ where: { status: "pending" } }),
    prisma.supportTicket.count(),
    prisma.supportTicket.count({ where: { status: "open" } }),
    prisma.application.count(),
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      pending: pendingUsers,
      blocked: blockedUsers,
    },
    offers: {
      total: totalOffers,
    },
    reports: {
      total: totalReports,
      pending: pendingReports,
    },
    supportTickets: {
      total: totalTickets,
      open: openTickets,
    },
    applications: {
      total: totalApplications,
    },
  };
}

export async function listUsers() {
  const users = await prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });

  return users.map((user) => ({
    ...serializeUser(user),
    type: user.role.name,
    joinDate: user.createdAt,
  }));
}

export async function updateUserStatus(id, status) {
  const numericId = Number(id);
  const existing = await prisma.user.findUnique({
    where: { id: numericId },
    include: { role: true },
  });

  if (!existing) {
    throw new AppError(404, "User not found");
  }

  const updated = await prisma.user.update({
    where: { id: numericId },
    data: { status },
    include: { role: true },
  });

  return {
    ...serializeUser(updated),
    type: updated.role.name,
    joinDate: updated.createdAt,
  };
}
