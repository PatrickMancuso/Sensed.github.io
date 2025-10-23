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
    // show small/medium image first
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

    // Upgrade to high-res if available
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
      <img src="${imageUrl}" alt="Artist Image">
      <div>
        <h3>${track.name} — ${track.artist}</h3>
        <p><a href="${track.url}" target="_blank">View on Last.fm</a></p>
      </div>
    `;
    resultsDiv.appendChild(item);

    // Fetch artist image asynchronously
    fetchArtistImage(track.artist).then((artistImg) => {
      const img = item.querySelector("img");
      img.src = artistImg || "https://via.placeholder.com/300x300?text=No+Image";
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

// =================== TAB SWITCHING ===================
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    // deactivate all tabs
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    const target = tab.dataset.tab;
    tabContents.forEach((content) => {
      content.classList.toggle("active", content.id === target);
    });
  });
});

// =================== JOURNAL HANDLING ===================
const journalForm = document.getElementById("journalForm");
const journalEntries = document.getElementById("journalEntries");

journalForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const song = document.getElementById("songTitle").value;
  const reflection = document.getElementById("reflection").value;
  const color = document.getElementById("color").value;

  const entry = document.createElement("div");
  entry.classList.add("entry");
  entry.innerHTML = `
    <h3 style="color:${color}">${song}</h3>
    <p>${reflection}</p>
  `;
  journalEntries.prepend(entry);

  journalForm.reset();
});

// =================== POPULAR PICKS ===================
const popularData = [
  {
    type: "artist",
    name: "Daft Punk",
    image: "https://lastfm.freetls.fastly.net/i/u/300x300/91b78e3f16b04c8b9d2e6c392e31e02b.jpg"
  },
  {
    type: "artist",
    name: "Prince",
    image: "https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png"
  },
  {
    type: "album",
    name: "Random Access Memories",
    artist: "Daft Punk",
    image: "https://lastfm.freetls.fastly.net/i/u/300x300/cd1e399b719b47a6aa4e2edc56e0a1a1.png"
  },
  {
    type: "album",
    name: "Purple Rain",
    artist: "Prince",
    image: "https://lastfm.freetls.fastly.net/i/u/300x300/08b8bdb8d5c847edba04b5e3cdb47a91.png"
  },
  {
    type: "artist",
    name: "Stevie Wonder",
    image: "https://lastfm.freetls.fastly.net/i/u/300x300/5c1b863d9f9447c1af8ac1ed8e7dc006.png"
  },
  {
    type: "artist",
    name: "Chic",
    image: "https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png"
  },
];

function displayPopularBubbles() {
  const container = document.getElementById("popular-bubbles");
  const sizes = ["80px", "100px", "120px", "140px"]; // varied bubble sizes

  popularData.forEach((item) => {
    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    bubble.style.width = size;
    bubble.style.height = size;

    bubble.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <span>${item.name}</span>
    `;

    bubble.addEventListener("click", () => {
      input.value = item.name;
      searchType.value = item.type === "album" ? "album" : "track";
      form.dispatchEvent(new Event("submit"));
    });

    container.appendChild(bubble);
  });
}

// Initialize bubbles on load
displayPopularBubbles();

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
