const API_KEY = "e530c016b028fa384b92183344f7526e";

const form = document.getElementById("searchForm");
const input = document.getElementById("songInput");
const searchType = document.getElementById("searchType");
const resultsDiv = document.getElementById("results");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = input.value.trim();
  const type = searchType.value;
  if (!query) return;

  resultsDiv.innerHTML = "<p>Loading...</p>";

  try {
    if (type === "album") {
      await searchAlbums(query);
    } else {
      await searchTracks(query);
    }
  } catch (err) {
    resultsDiv.innerHTML = `<p class="error">Error: ${err.message}</p>`;
  }
});


// =================== ALBUM SEARCH ===================
async function searchAlbums(query) {
  const res = await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(
      query
    )}&api_key=${API_KEY}&format=json`
  );
  const data = await res.json();
  const albums = data.results?.albummatches?.album || [];
  displayAlbums(albums);
}

// =================== TRACK SEARCH ===================
async function searchTracks(query) {
  const res = await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(
      query
    )}&api_key=${API_KEY}&format=json`
  );
  const data = await res.json();
  const tracks = data.results?.trackmatches?.track || [];
  displayTracks(tracks);
}

// =================== DISPLAY ALBUMS ===================
async function displayAlbums(albums) {
  resultsDiv.innerHTML = "";
  if (!albums.length) {
    resultsDiv.innerHTML = "<p>No albums found.</p>";
    return;
  }

  for (const album of albums) {
    // show small image first
    let imageUrl =
      album.image?.[2]?.["#text"] ||
      "https://via.placeholder.com/300x300?text=No+Art";

    const item = document.createElement("div");
    item.classList.add("track");
    item.innerHTML = `
      <img src="${imageUrl}" alt="Album Art" data-artist="${album.artist}" data-album="${album.name}">
      <div>
        <h3>${album.name} — ${album.artist}</h3>
        <p><a href="${album.url}" target="_blank">View on Last.fm</a></p>
      </div>
    `;
    resultsDiv.appendChild(item);

    // Fetch high-res image asynchronously and replace
    fetchHighResAlbumArt(album.artist, album.name).then((highRes) => {
      if (highRes) {
        const img = item.querySelector("img");
        img.src = highRes;
      }
    });
  }
}

// =================== DISPLAY TRACKS ===================
async function displayTracks(tracks) {
  resultsDiv.innerHTML = "";
  if (!tracks.length) {
    resultsDiv.innerHTML = "<p>No songs found.</p>";
    return;
  }

  for (const track of tracks) {
    // show placeholder first
    let imageUrl = "https://via.placeholder.com/300x300?text=Loading...";
    const item = document.createElement("div");
    item.classList.add("track");
    item.innerHTML = `
      <img src="${imageUrl}" alt="Artist Image" data-artist="${track.artist}" data-track="${track.name}">
      <div>
        <h3>${track.name} — ${track.artist}</h3>
        <p><a href="${track.url}" target="_blank">View on Last.fm</a></p>
      </div>
    `;
    resultsDiv.appendChild(item);

    // Fetch artist image asynchronously and replace
    fetchArtistImage(track.artist).then((artistImg) => {
      if (artistImg) {
        const img = item.querySelector("img");
        img.src = artistImg;
      } else {
        img.src = "https://via.placeholder.com/300x300?text=No+Image";
      }
    });
  }
}

// =================== FETCH HIGH-RES ALBUM ART ===================
async function fetchHighResAlbumArt(artist, album) {
  try {
    const res = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=album.getInfo&api_key=${API_KEY}&artist=${encodeURIComponent(
        artist
      )}&album=${encodeURIComponent(album)}&format=json`
    );
    const data = await res.json();
    return data.album?.image?.[4]?.["#text"] || "";
  } catch {
    return "";
  }
}

// =================== FETCH ARTIST IMAGE ===================
async function fetchArtistImage(artist) {
  try {
    const res = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=artist.getInfo&artist=${encodeURIComponent(
        artist
      )}&api_key=${API_KEY}&format=json`
    );
    const data = await res.json();
    return data.artist?.image?.[4]?.["#text"] || "";
  } catch {
    return "";
  }
}
