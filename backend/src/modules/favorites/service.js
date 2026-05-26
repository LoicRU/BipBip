import prisma from "../../lib/prisma.js";
import { serializeOffer } from "../../utils/serializers.js";
import { ensureLocalOfferRecord } from "../offers/service.js";

export async function listFavorites(user) {
  const favorites = await prisma.favorite.findMany({
    where: { userId: user.userId },
    include: { offer: true },
    orderBy: { createdAt: "desc" },
  });

  return favorites.map((favorite) => serializeOffer(favorite.offer));
}

export async function addFavorite(offerId, user) {
  const offer = await ensureLocalOfferRecord(offerId);

  await prisma.favorite.upsert({
    where: {
      userId_offerId: {
        userId: user.userId,
        offerId: offer.id,
      },
    },
    update: {},
    create: {
      userId: user.userId,
      offerId: offer.id,
    },
  });

  return serializeOffer(offer);
}

export async function removeFavorite(offerId, user) {
  const offer = await ensureLocalOfferRecord(offerId);

  await prisma.favorite.deleteMany({
    where: {
      userId: user.userId,
      offerId: offer.id,
    },
  });

  return { success: true };
}
