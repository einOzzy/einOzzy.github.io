const DATA_URL = 'https://raw.githubusercontent.com/einOzzy/team-swift-data/main/roster.json';
const rosterContainer = document.getElementById('rosterContainer');
let allPlayers = [];

const modal = document.getElementById("playerModal");
const closeBtn = document.querySelector(".close-btn");
const modalImg = document.getElementById("modalImg");
const modalName = document.getElementById("modalName");
const modalRole = document.getElementById("modalRole");
const modalFlag = document.getElementById("modalFlag");
const modalHandle = document.getElementById("modalHandle");
const modalSocials = document.getElementById("modalSocials");

// NEU: Referenzen für die Gleit-Animation holen
const filterNav = document.querySelector('.filter-nav');
const activeGlider = document.querySelector('.active-bg');

// Icon mapping dictionary
const iconMap = {
    "Twitter": "fa-twitter",
    "X": "fa-x-twitter",
    "YouTube": "fa-youtube",
    "Twitch": "fa-twitch",
    "Discord": "fa-discord",
    "Instagram": "fa-instagram",
    "TikTok": "fa-tiktok",
    "Behance": "fa-behance"
};

// NEU: Funktion zur Berechnung der Position des Gleit-Hintergrunds
function positionGlider(activeButton) {
    if (!filterNav || !activeGlider || !activeButton) return;
    
    const navBounds = filterNav.getBoundingClientRect();
    const btnBounds = activeButton.getBoundingClientRect();
    
    // Berechne die exakte relative Position innerhalb der Nav-Leiste
    const targetLeft = (btnBounds.left - navBounds.left) - 13;

    // Weise Breite und Position dem .active-bg Element zu
    activeGlider.style.width = `${btnBounds.width + 12}px`;
    activeGlider.style.transform = `translateX(${targetLeft}px)`;
}

fetch(DATA_URL)
  .then(response => response.json())
  .then(data => {
    allPlayers = data.roster;
    renderRoster('all'); 
    
    // NEU: Setzt die Startposition des Hintergrunds auf den ersten aktiven Button, sobald Daten geladen sind
    const initialActiveBtn = document.querySelector('.filter-btn.active');
    if (initialActiveBtn) {
        setTimeout(() => positionGlider(initialActiveBtn), 50);
    }
  })
  .catch(error => console.error('Error loading roster:', error));

function renderRoster(filterKeyword) {
    rosterContainer.innerHTML = '';
    const filteredPlayers = allPlayers.filter(player => {
        if (filterKeyword === 'all') return true;
        return player.category.toLowerCase().includes(filterKeyword.toLowerCase());
    });

    filteredPlayers.forEach(player => {
        let card = document.createElement("div");
        card.className = "player-card";
        
        const fontSizeStyle = player.role.length > 20 ? 'style="font-size: 11px; padding-top: 3px; "' : '';

        card.innerHTML = `
            <img src="${player.imagePath}" alt="${player.name}">
            <div class="player-info">
                <h3>${player.name}</h3>
                <p ${fontSizeStyle}>${player.role}</p>
            </div>
        `;
        card.onclick = () => openModal(player);
        rosterContainer.appendChild(card);
    });
}

const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // NEU: Aktualisiert die Position des Gleit-Hintergrunds direkt beim Klick
        positionGlider(button);
        
        renderRoster(button.getAttribute('data-filter'));
    });
});

// NEU: Sorgt dafür, dass der Hintergrund mitgleitet, wenn der Browser in der Größe verändert wird
window.addEventListener('resize', () => {
    const currentActive = document.querySelector('.filter-btn.active');
    if (currentActive) positionGlider(currentActive);
});

function openModal(player) {
    // Populate basic info
    modalImg.src = player.imagePath;
    modalName.textContent = player.name.replace("Lucent ", "");
    modalRole.textContent = player.role;
    modalHandle.textContent = "Lucent " + player.name.replace("Lucent ", ""); 
    
    // Handle the country flag
    if (player.countryCode) {
        modalFlag.src = `https://flagcdn.com/w40/${player.countryCode.toLowerCase()}.png`;
        modalFlag.style.display = "block";
    } else {
        modalFlag.style.display = "none";
    }

    // --- REBUILD THE SOCIALS ---
    modalSocials.innerHTML = ""; // Clear out the previous player's socials

    // Check if the player has socials in the JSON, then loop through them
    if (player.socials && player.socials.length > 0) {
        player.socials.forEach(social => {
            const link = document.createElement("a");
            link.href = social.url;
            link.className = "social-icon";
            link.target = "_blank"; // Opens the link in a new tab
            
            // Check the dictionary for the icon class, fallback to a chain-link icon if not found
            let iconClass = iconMap[social.platform] ? iconMap[social.platform] : "fa-link";
            
            // Insert the FontAwesome icon into the anchor tag
            link.innerHTML = `<i class="fa-brands ${iconClass}"></i>`;
            
            // Add the icon to the modal
            modalSocials.appendChild(link);
        });
    }

    // Display the modal
    modal.style.display = "flex"; 
}

closeBtn.onclick = function() { modal.style.display = "none"; }
window.onclick = function(event) { if (event.target == modal) { modal.style.display = "none"; } }
