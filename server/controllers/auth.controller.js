export const spotifyLogin = (req, res) => {
  const scope = "user-read-email user-top-read user-read-recently-played user-read-playback-state playlist-read-private user-library-read user-read-currently-playing user-follow-read";

  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    scope,
    show_dialog: "true", // forces login prompt
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
};
