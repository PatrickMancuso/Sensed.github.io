const API_KEY = "e530c016b028fa384b92183344f7526e";

const form = document.getElementById("searchForm");
const input = document.getElementById("songInput");
const searchType = document.getElementById("searchType");
const resultsDiv = document.getElementById("results");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = input.value.trim();
  const type = searchType.value; // "track" or "album"
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

//  Album search
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

// 🔹 Song search
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

// 🖼 Display albums
function displayAlbums(albums) {
  resultsDiv.innerHTML = "";
  if (!albums.length) {
    resultsDiv.innerHTML = "<p>No albums found.</p>";
    return;
  }

  albums.forEach((album) => {
    const imageUrl =
      album.image?.find((img) => img["#text"])?.["#text"] ||
      "https://via.placeholder.com/200x200?text=No+Art";

    const item = document.createElement("div");
    item.classList.add("track");
    item.innerHTML = `
      <img src="${imageUrl}" alt="Album Art">
      <div>
        <h3>${album.name} — ${album.artist}</h3>
        <p><a href="${album.url}" target="_blank">View on Last.fm</a></p>
      </div>
    `;
    resultsDiv.appendChild(item);
  });
}

// 🎤 Display tracks with artist images
async function displayTracks(tracks) {
  resultsDiv.innerHTML = "";
  if (!tracks.length) {
    resultsDiv.innerHTML = "<p>No songs found.</p>";
    return;
  }

  for (const track of tracks) {
    const artistImage = await fetchArtistImage(track.artist);
    const item = document.createElement("div");
    item.classList.add("track");
    item.innerHTML = `
      <img src="${
        artistImage || "https://via.placeholder.com/200x200?text=No+Artist+Image"
      }" alt="Artist Image">
      <div>
        <h3>${track.name} — ${track.artist}</h3>
        <p><a href="${track.url}" target="_blank">View on Last.fm</a></p>
      </div>
    `;
    resultsDiv.appendChild(item);
  }
}

// 📸 Fetch artist image
async function fetchArtistImage(artist) {
  try {
    const res = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=artist.getInfo&artist=${encodeURIComponent(
        artist
      )}&api_key=${API_KEY}&format=json`
    );
    const data = await res.json();
    return data.artist?.image?.find((img) => img["#text"])?.["#text"] || "";
  } catch {
    return "";
  }
}
