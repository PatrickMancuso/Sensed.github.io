const API_KEY = "e530c016b028fa384b92183344f7526e";

// Grab main elements
const form = document.getElementById("searchForm");
const input = document.getElementById("songInput");
const searchType = document.getElementById("searchType");
const resultsDiv = document.getElementById("results");

// =================== SEARCH HANDLING ===================
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
    showClearButton();
  } catch (err) {
    resultsDiv.innerHTML = `<p class="error">Error: ${err.message}</p>`;
  }
});

// =================== ALBUM SEARCH ===================
async function searchAlbums(query) {
  const res = await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(
      query
    )}&api_key=${API_KEY}&format=json&limit=10`
  );
  const data = await res.json();
  const albums = data.results?.albummatches?.album?.slice(0, 10) || [];
  displayAlbums(albums);
}

// =================== TRACK SEARCH ===================
async function searchTracks(query) {
  const res = await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(
      query
    )}&api_key=${API_KEY}&format=json&limit=10`
  );
  const data = await res.json();
  const tracks = data.results?.trackmatches?.track?.slice(0, 10) || [];
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
    let imageUrl =
      album.image?.[2]?.["#text"] ||
      "https://via.placeholder.com/300x300?text=No+Art";

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

    // Try to replace with higher quality
    fetchHighResAlbumArt(album.artist, album.name).then((highRes) => {
      if (highRes) item.querySelector("img").src = highRes;
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
    const item = document.createElement("div");
    item.classList.add("track");
    item.innerHTML = `
      <img src="https://via.placeholder.com/300x300?text=Loading..." alt="Artist Image">
      <div>
        <h3>${track.name} — ${track.artist}</h3>
        <p><a href="${track.url}" target="_blank">View on Last.fm</a></p>
      </div>
    `;
    resultsDiv.appendChild(item);

    // Fetch artist image and replace placeholder
    fetchArtistImage(track.artist).then((artistImg) => {
      const img = item.querySelector("img");
      img.src =
        artistImg ||
        "https://via.placeholder.com/300x300?text=No+Image";
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
    return (
      data.album?.image?.[4]?.["#text"] ||
      data.album?.image?.[3]?.["#text"] ||
      ""
    );
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
    return (
      data.artist?.image?.[4]?.["#text"] ||
      data.artist?.image?.[3]?.["#text"] ||
      ""
    );
  } catch {
    return "";
  }
}

// =================== CLEAR RESULTS ===================
function showClearButton() {
  if (document.getElementById("clearBtn")) return;
  const clearBtn = document.createElement("button");
  clearBtn.id = "clearBtn";
  clearBtn.textContent = "Clear Results";
  clearBtn.style.cssText = `
    margin-top: 1rem;
    padding: 0.7rem 1.2rem;
    border: none;
    border-radius: 8px;
    background: linear-gradient(90deg, #8b5cf6, #6366f1);
    color: white;
    cursor: pointer;
  `;
  resultsDiv.insertAdjacentElement("beforebegin", clearBtn);

  clearBtn.addEventListener("click", () => {
    resultsDiv.innerHTML = "";
    clearBtn.remove();
    input.value = "";
  });
}
