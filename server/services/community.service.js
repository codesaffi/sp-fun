import Community from "../models/Community.js";

const officialCommunities = [
  ["Pop", "Pop"], ["Rock", "Rock"], ["Indie", "Indie"], ["Hip-Hop", "Hip-Hop"],
  ["Rap", "Rap"], ["Jazz", "Jazz"], ["R&B", "R&B"], ["Electronic", "Electronic"],
  ["Metal", "Metal"], ["Alternative", "Alternative"], ["Folk", "Folk"], ["Classical", "Classical"],
  ["Bedroom Pop", "Bedroom Pop"], ["Lo-fi", "Lo-fi"], ["Clairo", "Artist"], ["Steve Lacy", "Artist"],
  ["Arctic Monkeys", "Artist"], ["Mac DeMarco", "Artist"], ["Malcolm Todd", "Artist"], ["Frank Ocean", "Artist"],
  ["Tyler, The Creator", "Artist"], ["Lana Del Rey", "Artist"], ["The Weeknd", "Artist"], ["Kendrick Lamar", "Artist"],
];

const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

let isOfficialSeeded = false;

export const ensureOfficialCommunities = async (ownerId) => {
  if (!ownerId || isOfficialSeeded) return;
  const count = await Community.countDocuments({ official: true });
  if (count >= officialCommunities.length) {
    isOfficialSeeded = true;
    return;
  }
  await Promise.all(officialCommunities.map(([name, genre]) => Community.updateOne(
    { slug: slugify(name) },
    { $setOnInsert: { name, slug: slugify(name), genre, tags: [name, genre], description: `A place for listeners who love ${name}.`, official: true, createdBy: ownerId, icon: "♫" } },
    { upsert: true },
  )));
  isOfficialSeeded = true;
};

export { slugify };
