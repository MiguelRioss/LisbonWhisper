import { randomUUID } from 'node:crypto';
import { getMongoDatabase } from './mongoDb.mjs';
import toursSeed from './tours.seed.json' with { type: 'json' };

const tourProjection = {
  _id: 0, slug: 1, title: 1, description: 1, descriptions: 1,
  image: 1, availabilityImage: 1, videoSrc: 1, tag: 1, backgroundImage: 1, carouselImages: 1,
  startingPoint: 1, priceCents: 1, maxPersons: 1,
};

const carouselImages = [
  '/res/pexels-hillaryfox-1615815.jpg',
  '/res/pexels-pixabay-461936.jpg',
  '/res/pexels-fotios-photos-1599497.jpg',
];

export default async function createCatalogData(database = getMongoDatabase()) {
  const tours = database?.collection('tours');
  const clients = database?.collection('clients');
  const promoCodes = database?.collection('promoCodes');
  const promoters = database?.collection('promoters');
  const localClients = new Map();
  const localPromoCodes = new Map();
  const localPromoters = [];
  const localTours = toursSeed.map((tour) => ({
    startingPoint: 'Hard Rock Cafe, Restauradores', priceCents: 4900, maxPersons: 8,
    ...tour, carouselImages,
  }));

  if (tours) {
    await tours.bulkWrite(localTours.map((tour) => ({
      updateOne: {
        filter: { _id: tour.slug },
        update: { $setOnInsert: tour },
        upsert: true,
      },
    })));
    await tours.bulkWrite(localTours.flatMap(({ slug, availabilityImage, startingPoint, priceCents, maxPersons }) =>
      Object.entries({ availabilityImage, carouselImages, startingPoint, priceCents, maxPersons }).map(([field, value]) => ({
      updateOne: {
        filter: { _id: slug, [field]: { $exists: false } },
        update: { $set: { [field]: value } },
      },
    }))));
  }

  async function getTourById(id) {
    if (tours) return tours.findOne({ _id: id }, { projection: tourProjection });
    const match = localTours.find((tour) => tour.slug === id);
    if (!match) return null;
    const { order: _order, ...tour } = match;
    return tour;
  }

  return {
    async getPromoters() {
      if (promoters) return promoters.find({}).sort({ companyName: 1, lastName: 1, _id: 1 }).toArray();
      return [...localPromoters].sort((a, b) =>
        a.companyName.localeCompare(b.companyName) || a.lastName.localeCompare(b.lastName) || a._id.localeCompare(b._id));
    },
    async createPromoter(fields) {
      const promoter = { _id: randomUUID(), ...fields };
      if (promoters) await promoters.insertOne(promoter);
      else localPromoters.push(promoter);
      return promoter;
    },
    async updatePromoterPromoCode(id, promoCode) {
      if (promoters) {
        const update = promoCode ? { $set: { promoCode } } : { $unset: { promoCode: '' } };
        return promoters.findOneAndUpdate({ _id: id }, update, { returnDocument: 'after' });
      }
      const promoter = localPromoters.find((entry) => entry._id === id);
      if (!promoter) return null;
      if (promoCode) promoter.promoCode = promoCode;
      else delete promoter.promoCode;
      return promoter;
    },
    async getPromoCode(code) {
      return promoCodes ? promoCodes.findOne({ _id: code }) : localPromoCodes.get(code);
    },
    async getPromoCodes() {
      if (promoCodes) {
        return promoCodes.aggregate([
          { $sort: { _id: 1 } },
          {
            $lookup: {
              from: 'promoters',
              localField: '_id',
              foreignField: 'promoCode',
              pipeline: [
                { $sort: { companyName: 1, lastName: 1, _id: 1 } },
                { $project: { companyName: 1, firstName: 1, lastName: 1 } },
              ],
              as: 'promoters',
            },
          },
        ]).toArray();
      }
      const assignments = new Map();
      for (const { _id, companyName, firstName, lastName, promoCode } of localPromoters) {
        if (!promoCode) continue;
        if (!assignments.has(promoCode)) assignments.set(promoCode, []);
        assignments.get(promoCode).push({ _id, companyName, firstName, lastName });
      }
      return [...localPromoCodes.values()]
        .sort((a, b) => a.code.localeCompare(b.code))
        .map((promoCode) => ({ ...promoCode, promoters: assignments.get(promoCode.code) ?? [] }));
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
      if (!tours) return localTours.map(({ order: _order, ...tour }) => tour);
      return tours.find({}, { projection: tourProjection }).sort({ order: 1, slug: 1 }).toArray();
    },
    getTourById,
    async getTourByTitle(title) {
      const legacyTour = toursSeed.find((tour) => tour.title.toLowerCase() === title.toLowerCase());
      if (legacyTour) return getTourById(legacyTour.slug);
      if (tours) return tours.findOne({ title }, { projection: tourProjection });
      const match = localTours.find((tour) => tour.title === title);
      return match ? getTourById(match.slug) : null;
    },
    async updateTour(id, fields) {
      if (tours) return tours.findOneAndUpdate({ _id: id }, { $set: fields }, {
        returnDocument: 'after', projection: tourProjection,
      });
      const match = localTours.find((tour) => tour.slug === id);
      if (!match) return null;
      const { order: _order, ...tour } = Object.assign(match, fields);
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
