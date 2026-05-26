import prisma from "../../lib/prisma.js";
import { AppError } from "../../utils/error.js";
import { serializeSupportTicket } from "../../utils/serializers.js";

async function getTicket(id) {
  return prisma.supportTicket.findUnique({
    where: { id: Number(id) },
    include: {
      user: {
        include: { role: true },
      },
    },
  });
}

export async function createSupportTicket(input, user) {
  const ticket = await prisma.supportTicket.create({
    data: {
      userId: user.userId,
      subject: input.subject,
      description: input.description,
      status: "open",
    },
    include: {
      user: {
        include: { role: true },
      },
    },
  });

  return serializeSupportTicket(ticket);
}

export async function listSupportTickets() {
  const tickets = await prisma.supportTicket.findMany({
    include: {
      user: {
        include: { role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return tickets.map(serializeSupportTicket);
}

export async function resolveSupportTicket(id) {
  const ticket = await getTicket(id);
  if (!ticket) {
    throw new AppError(404, "Support ticket not found");
  }

  const updated = await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: {
      status: "resolved",
      resolvedAt: new Date(),
    },
    include: {
      user: {
        include: { role: true },
      },
    },
  });

  return serializeSupportTicket(updated);
}
