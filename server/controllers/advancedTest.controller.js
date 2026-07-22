import User from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { spotifyApiRequest } from "../services/spotify.service.js";

const averageAudioFeatures = (audioFeatures) => {
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

const formatGenreName = (genre) =>
  String(genre || "").replace(/-/g, " ").replace(/\s+/g, " ").trim();

const describeMusicProfile = (avgFeatures, topGenreNames = []) => {
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

const describeMood = (avgFeatures) => {
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

export const advancedSpotifyTest = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.accessToken) return res.status(401).json({ message: "No Spotify token" });

    const [topTracks, topArtists] = await Promise.all([
      spotifyApiRequest(user, "https://api.spotify.com/v1/me/top/tracks?limit=5"),
      spotifyApiRequest(user, "https://api.spotify.com/v1/me/top/artists?limit=5"),
    ]);

    const topTracksItems = topTracks.data.items || [];
    const topArtistsItems = topArtists.data.items || [];
    const favoriteTrack = topTracksItems[0] || null;
    const favoriteArtist = topArtistsItems[0] || null;

    const artistIds = Array.from(
      new Set([
        ...topArtistsItems.map((artist) => artist.id),
        ...topTracksItems.flatMap((track) => track.artists.map((artist) => artist.id)),
      ])
    ).filter(Boolean);

    const artistsDetailsRes =
      artistIds.length > 0
        ? await spotifyApiRequest(user, `https://api.spotify.com/v1/artists?ids=${artistIds.join(",")}`).catch(() => null)
        : null;

    const allArtists = artistsDetailsRes?.data?.artists || [];
    const genreCount = {};

    allArtists.forEach((artist) => {
      (artist.genres || []).forEach((genre) => {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });
    });

    let genres = Object.entries(genreCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    if (genres.length === 0 && favoriteArtist?.genres?.length > 0) {
      genres = favoriteArtist.genres.map((name) => ({ name, count: 1 })).slice(0, 10);
    }

    const topGenreNames = genres.map((genre) => formatGenreName(genre.name));

    const trackIds = topTracksItems.map((track) => track.id).filter(Boolean);
    const audioFeaturesRes =
      trackIds.length > 0
        ? await spotifyApiRequest(user, `https://api.spotify.com/v1/audio-features?ids=${trackIds.join(",")}`)
        : null;

    const audioFeaturesData = (audioFeaturesRes?.data?.audio_features || []).filter(Boolean);
    const avgAudioFeatures = averageAudioFeatures(audioFeaturesData);

    const recommendationParams = [];
    if (topArtistsItems.length > 0) {
      recommendationParams.push(`seed_artists=${topArtistsItems.slice(0, 2).map((artist) => artist.id).join(",")}`);
    }
    if (favoriteTrack?.id) {
      recommendationParams.push(`seed_tracks=${favoriteTrack.id}`);
    }
    if (topGenreNames.length > 0) {
      recommendationParams.push(`seed_genres=${topGenreNames.slice(0, 2).map((s) => s.replace(/\s+/g, "")).join(",")}`);
    }

    const recommendationsRes =
      recommendationParams.length > 0
        ? await spotifyApiRequest(user, `https://api.spotify.com/v1/recommendations?limit=8&${recommendationParams.join("&")}`).catch(() => null)
        : null;

    const relatedArtistsRes =
      favoriteArtist?.id
        ? await spotifyApiRequest(user, `https://api.spotify.com/v1/artists/${favoriteArtist.id}/related-artists`).catch(() => null)
        : null;

    const artistDetailsRes =
      favoriteArtist?.id
        ? await spotifyApiRequest(user, `https://api.spotify.com/v1/artists/${favoriteArtist.id}`).catch(() => null)
        : null;

    const albums = Array.from(
      new Map(
        topTracksItems
          .map((track) => track.album)
          .filter(Boolean)
          .map((album) => [album.id, album])
      ).values()
    );

    const musicProfile = describeMusicProfile(avgAudioFeatures, topGenreNames);
    const moodSummary = describeMood(avgAudioFeatures);
    const genreSummary = topGenreNames.slice(0, 5).join(", ");

    user.analysis = {
      mood: moodSummary.mood,
      moodDescription: moodSummary.moodDescription,
      musicProfile,
      topGenres: topGenreNames,
      favoriteArtist,
      favoriteSong: favoriteTrack,
      averageFeatures: avgAudioFeatures,
      updatedAt: new Date(),
    };
    await user.save();

    res.json({
      favoriteArtist,
      favoriteTrack,
      topGenres: genres,
      topGenreNames,
      genreSummary,
      avgAudioFeatures,
      musicProfile,
      mood: moodSummary.mood,
      moodDescription: moodSummary.moodDescription,
      moodMetrics: moodSummary.metrics,
      audioFeatures: audioFeaturesData,
      recommendations: recommendationsRes?.data?.tracks || [],
      artistDetails: artistDetailsRes?.data || favoriteArtist || null,
      relatedArtists: relatedArtistsRes?.data?.artists || [],
      albums,
      warnings: {
        noTopTracks: topTracksItems.length === 0,
        noTopArtists: topArtistsItems.length === 0,
        noAudioFeatures: audioFeaturesData.length === 0,
        noRecommendations: (recommendationsRes?.data?.tracks || []).length === 0,
        noRelatedArtists: (relatedArtistsRes?.data?.artists || []).length === 0,
      },
    });
  } catch (error) {
    console.error("Advanced Spotify Error:", error.response?.data || error.message);
    throw new AppError("Failed to load Spotify insights", error.response?.status || 500);
  }
};
