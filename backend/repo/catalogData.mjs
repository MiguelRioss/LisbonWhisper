import { getMongoDatabase } from './mongoDb.mjs';
import toursSeed from './tours.seed.json' with { type: 'json' };

const tourProjection = {
  _id: 0, slug: 1, title: 1, description: 1, descriptions: 1,
  image: 1, videoSrc: 1, tag: 1, backgroundImage: 1,
};

export default async function createCatalogData(database = getMongoDatabase()) {
  const tours = database?.collection('tours');
  const clients = database?.collection('clients');
  const promoCodes = database?.collection('promoCodes');
  const localClients = new Map();
  const localPromoCodes = new Map();

  if (tours) {
    await tours.bulkWrite(toursSeed.map((tour) => ({
      updateOne: {
        filter: { _id: tour.slug },
        update: { $setOnInsert: tour },
        upsert: true,
      },
    })));
  }

  return {
    async getPromoCodes() {
      if (promoCodes) return promoCodes.find({}).sort({ _id: 1 }).toArray();
      return [...localPromoCodes.values()].sort((a, b) => a.code.localeCompare(b.code));
    },
    async createPromoCode(promoCode) {
      if (!promoCodes) {
        if (localPromoCodes.has(promoCode.code)) return false;
        localPromoCodes.set(promoCode.code, promoCode);
        return true;
      }
      try {
        await promoCodes.insertOne({ ...promoCode, _id: promoCode.code });
        return true;
      } catch (error) {
        if (error.code === 11000) return false;
        throw error;
      }
    },
    async getTours() {
      if (!tours) return toursSeed.map(({ order: _order, ...tour }) => tour);
      return tours.find({}, { projection: tourProjection }).sort({ order: 1, slug: 1 }).toArray();
    },
    async getTourById(id) {
      if (tours) return tours.findOne({ _id: id }, { projection: tourProjection });
      const match = toursSeed.find((tour) => tour.slug === id);
      if (!match) return null;
      const { order: _order, ...tour } = match;
      return tour;
    },
    async saveClient({ email, name, phone, source }) {
      const id = email.trim().toLowerCase();
      const lastSeenAt = new Date().toISOString();
      const fields = { lastSeenAt, ...(name && { name }), ...(phone && { phone }) };
      if (!clients) {
        const existing = localClients.get(id) || { _id: id, email: id, createdAt: lastSeenAt, sources: [] };
        localClients.set(id, { ...existing, ...fields, sources: [...new Set([...existing.sources, source])] });
        return;
      }
      const update = {
        $set: fields,
        $setOnInsert: { email: id, createdAt: lastSeenAt },
        $addToSet: { sources: source },
      };
      try {
        await clients.updateOne({ _id: id }, update, { upsert: true });
      } catch (error) {
        if (error.code !== 11000) throw error;
        await clients.updateOne({ _id: id }, update);
      }
    },
    async countClients() {
      return clients ? clients.countDocuments() : localClients.size;
    },
    async getClients({ offset, count }) {
      if (clients) {
        return clients.find().sort({ lastSeenAt: -1, _id: 1 }).skip(offset).limit(count).toArray();
      }
      return [...localClients.values()]
        .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt) || a._id.localeCompare(b._id))
        .slice(offset, offset + count);
    },
  };
}
