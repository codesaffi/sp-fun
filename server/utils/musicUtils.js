export const averageAudioFeatures = (audioFeatures) => {
  const validFeatures = (audioFeatures || []).filter(Boolean);
  if (validFeatures.length === 0) return {};

  const totals = validFeatures.reduce(
    (acc, feature) => {
      acc.energy += feature.energy || 0;
      acc.danceability += feature.danceability || 0;
      acc.valence += feature.valence || 0;
      acc.acousticness += feature.acousticness || 0;
      acc.instrumentalness += feature.instrumentalness || 0;
      acc.tempo += feature.tempo || 0;
      acc.count += 1;
      return acc;
    },
    {
      energy: 0,
      danceability: 0,
      valence: 0,
      acousticness: 0,
      instrumentalness: 0,
      tempo: 0,
      count: 0,
    }
  );

  const count = totals.count || 1;
  return {
    energy: +(totals.energy / count).toFixed(2),
    danceability: +(totals.danceability / count).toFixed(2),
    valence: +(totals.valence / count).toFixed(2),
    acousticness: +(totals.acousticness / count).toFixed(2),
    instrumentalness: +(totals.instrumentalness / count).toFixed(2),
    tempo: +(totals.tempo / count).toFixed(1),
  };
};

export const formatGenreName = (genre) =>
  String(genre || "").replace(/-/g, " ").replace(/\s+/g, " ").trim();

export const describeMusicProfile = (avgFeatures, topGenreNames = []) => {
  if (!avgFeatures || Object.keys(avgFeatures).length === 0) {
    if (topGenreNames.length > 0) {
      return `You enjoy ${topGenreNames.slice(0, 3).join(", ")} music. Genres inferred from your top artists.`;
    }
    return "No audio analysis available.";
  }

  const energyDesc =
    avgFeatures.energy >= 0.7
      ? "energetic"
      : avgFeatures.energy >= 0.4
      ? "balanced"
      : "mellow";

  const danceDesc =
    avgFeatures.danceability >= 0.7
      ? "danceable"
      : avgFeatures.danceability >= 0.4
      ? "groovy"
      : "laid-back";

  const valenceDesc =
    avgFeatures.valence >= 0.7
      ? "bright"
      : avgFeatures.valence >= 0.4
      ? "thoughtful"
      : "moody";

  const vibe =
    avgFeatures.acousticness >= 0.6
      ? "acoustic"
      : avgFeatures.instrumentalness >= 0.5
      ? "instrumental"
      : "modern";

  const genresText =
    topGenreNames.length > 0
      ? `with hints of ${topGenreNames.slice(0, 3).join(", ")}`
      : "with mixed genre influences";

  return `A ${vibe}, ${energyDesc}, ${danceDesc}, ${valenceDesc} profile ${genresText}.`;
};

export const describeMood = (avgFeatures) => {
  if (!avgFeatures || Object.keys(avgFeatures).length === 0) {
    return {
      mood: "Mixed mood",
      moodDescription: "Your listening vibe is still being inferred from your recent tracks.",
      metrics: {},
    };
  }

  const { energy = 0, valence = 0, danceability = 0, acousticness = 0 } = avgFeatures;

  if (valence >= 0.7 && energy >= 0.7 && danceability >= 0.7) {
    return {
      mood: "Upbeat and dancey",
      moodDescription: "Your music feels bright, energetic, and made for movement.",
      metrics: { energy, valence, danceability },
    };
  }

  if (valence < 0.3 && energy >= 0.6) {
    return {
      mood: "Intense and emotional",
      moodDescription: "Your tracks lean passionate, dramatic, and emotionally heavy.",
      metrics: { energy, valence, danceability },
    };
  }

  if (acousticness >= 0.6) {
    return {
      mood: "Calm and acoustic",
      moodDescription: "Your listening style feels warm, intimate, and relaxed.",
      metrics: { energy, valence, acousticness },
    };
  }

  if (valence < 0.3) {
    return {
      mood: "Moody and reflective",
      moodDescription: "Your songs often sound thoughtful, deep, and emotionally introspective.",
      metrics: { energy, valence, danceability },
    };
  }

  return {
    mood: "Balanced and versatile",
    moodDescription: "Your taste is a healthy mix of energy, emotion, and groove.",
    metrics: { energy, valence, danceability },
  };
};
