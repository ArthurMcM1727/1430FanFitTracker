let sportsData;
let selectedSport = '';
let selectedLeague = '';

const SPORT_LEAGUE_MAP = {
    football: 'nfl',
    hockey: 'nhl',
    baseball: 'mlb',
    basketball: 'nba'
};

function getFavorites() {
    return JSON.parse(localStorage.getItem('favoriteTeams')) || [];
}

function saveFavorites(favorites) {
    localStorage.setItem('favoriteTeams', JSON.stringify(favorites));
}

// function extractScoreboard(data) { // Extract the scoreboard information from the ESPN API response
//     return (data?.events?.map(event => ({
//         name: event.name,
//         status: event.status?.type?.description,
//         competitors: event.competitions?.[0]?.competitors?.map(comp => ({
//             teamName: comp.team?.displayName,
//             score: comp.score
//         })) || []
//     })) || []);
// }


// bring sports data from ESPN API to our webpage. triggered by divs on click.
async function loadSport(sport) {
    const league = SPORT_LEAGUE_MAP[sport];
    if (!league) {
        console.error('Unsupported sport:', sport);
        return;
    }

    selectedSport = sport;
    selectedLeague = league;
    setActiveSportCard(sport);

    clearDisplayArea();

    const favTeam = getFavoriteTeamForSport(sport);
    if (favTeam) {
        console.log(`Found favorite: ${favTeam} for ${sport}`);
        displayFavoriteTeam(favTeam, sport);
        return;
    }

    try {
        const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams`);
        if (!response.ok) {
            throw new Error(`Failed to load teams for ${sport}`);
        }

        const data = await response.json();
        const teamNames = (data?.sports?.[0]?.leagues?.[0]?.teams ?? [])
            .map(team => team?.team?.displayName)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));

        populateTeamDropdown(teamNames, sport);

        const favoriteTeam = getFavoriteTeamForSport(sport);
        const dropdown = document.getElementById('team-dropdown');
        if (favoriteTeam && dropdown && teamNames.includes(favoriteTeam)) {
            dropdown.value = favoriteTeam;
            updateFavoriteCheckbox(favoriteTeam);
            fetchTeamGames(favoriteTeam);
        } else {
            updateFavoriteCheckbox('');
            setGamesMessage('Select a team to view current games.');
        }
    } catch (error) {
        console.error('Error fetching ESPN data:', error);
    }

    console.log(`selected sport: ${sport}, league: ${league}`);

}

// show team names on the page, styling in css. DOM creation
function displayTeams(teamNames, sport) {
    const teamList = document.createElement('div');
    teamList.id = 'team-list';
    teamNames.forEach(teamName => {
        const teamItem = document.createElement('div');
        teamItem.className = 'team-item';
        teamItem.textContent = teamName;
        teamItem.onclick = () => setFavoriteTeam(sport, teamName);
        teamList.appendChild(teamItem);
    });
    document.body.appendChild(teamList);
}


// ensure proper cleanup of DOM elements when switching sports or chaning any more page information. 
function clearDisplayArea() {
    const existingList = document.getElementById('team-list');
    if (existingList) {
        existingList.remove();
    }
    const existingMessage = document.getElementById('favorite-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    const existingFavoriteList = document.getElementById('favorite-list');
    if (existingFavoriteList) {
        existingFavoriteList.remove();
    }
}

// Display favorite team for the selected sport
function displayFavoriteTeam(teamName, sport) {
    const teamList = document.createElement('div');
    teamList.id = 'team-list';

    const title = document.createElement('h2');
    title.textContent = `Your Favorite ${sport.charAt(0).toUpperCase() + sport.slice(1)} Team`;
    teamList.appendChild(title);

    const teamItem = document.createElement('div');
    teamItem.className = 'team-item favorite';
    teamItem.textContent = teamName;
    teamList.appendChild(teamItem);

    const changeButton = document.createElement('button');
    changeButton.textContent = 'Change Favorite Team';
    changeButton.onclick = () => showTeamsForFavoriteUpdate(sport);
    teamList.appendChild(changeButton);

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove Favorite Team';
    removeButton.onclick = () => removeFavoriteTeam(sport, teamName);
    teamList.appendChild(removeButton);

    const inputStatsButton = document.createElement('button');
    inputStatsButton.textContent = 'Input Game Stats for Workout Plan';
    inputStatsButton.onclick = () => inputstats();
    teamList.appendChild(inputStatsButton);

    document.body.appendChild(teamList);
}

function removeFavoriteTeam(sport, teamName) {
    const favorites = getFavorites();
    const index = favorites.findIndex(fav => fav.sport === sport && (!teamName || fav.team === teamName));
    if (index !== -1) {
        const removed = favorites.splice(index, 1)[0];
        saveFavorites(favorites);
        loadFavoriteTeam();
        syncFavoriteCheckboxFromSelection();
        console.log(`Removed favorite team ${removed.team} for ${removed.sport}.`);
    } else {
        console.log(`No favorite team found for ${sport} to remove.`);
    }
}

async function showTeamsForFavoriteUpdate(sport) {
    clearDisplayArea();

    let league;
    if (sport === 'football') {
        league = 'nfl';
    } else if (sport === 'hockey') {
        league = 'nhl';
    } else if (sport === 'baseball') {
        league = 'mlb';
    } else if (sport === 'basketball') {
        league = 'nba';
    } else {
        console.error('Unsupported sport:', sport);
        return;
    }

    try {
        const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams`);
        const data = await response.json();
        let teamNames = (data?.sports?.[0]?.leagues?.[0]?.teams ?? []).map(team => team?.team?.displayName).filter(Boolean);
        displayTeams(teamNames, sport);
    } catch (error) {
        console.error('Error fetching ESPN data:', error);
    }
}

// Helper function to get favorite team for a specific sport
function getFavoriteTeamForSport(sport) {
    const favorites = getFavorites();
    const favorite = favorites.find(fav => fav.sport === sport);
    return favorite ? favorite.team : null;
}

// Function to set a favorite team, storing it in localStorage with sport and team name
//FIXME:: somehow three default teams get added to localStorage on page load and I don't know why or how
function setFavoriteTeam(sport, teamName) {
    const favorites = getFavorites();

    // Find if a favorite already exists for this sport
    const existingIndex = favorites.findIndex(fav => fav.sport === sport);

    if (existingIndex === -1) {
        // Add new favorite for this sport
        favorites.push({ sport: sport, team: teamName });
        console.log(`Added ${teamName} (${sport}) as a favorite.`);
    } else {
        // Replace existing favorite for this sport
        favorites[existingIndex].team = teamName;
        console.log(`Updated favorite for ${sport} to ${teamName}.`);
    }

    saveFavorites(favorites);
    loadFavoriteTeam();
    syncFavoriteCheckboxFromSelection();
}


// function for loading favorite teams onto webpage, essentially this entire function is DOM  for html in js. There is no logic control here
function loadFavoriteTeam() {
    const favorites = getFavorites();
    const favoritesSection = document.getElementById('favorites-section');
    if (!favoritesSection) {
        return;
    }

    favoritesSection.innerHTML = '';

    const message = document.createElement('div');
    message.id = 'favorite-message';
    favoritesSection.appendChild(message);

    if (favorites.length > 0) {
        console.log('Favorite teams:', favorites);
        message.textContent = 'Saved favorite teams:';

        const favoriteList = document.createElement('div');
        favoriteList.id = 'favorite-list';
        favorites.forEach((fav) => {
            const row = document.createElement('div');
            row.className = 'favorite-row';

            const label = document.createElement('span');
            label.textContent = `${fav.team} (${fav.sport})`;
            row.appendChild(label);

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.onclick = () => {
                loadSport(fav.sport);
            };
            row.appendChild(editButton);

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.onclick = () => removeFavoriteTeam(fav.sport, fav.team);
            row.appendChild(removeButton);

            favoriteList.appendChild(row);
        });
        favoritesSection.appendChild(favoriteList);
    } else {
        message.textContent = 'No favorite teams yet. Please select a sport and add at least one team.';
    }
}

function syncFavoriteCheckboxFromSelection() {
    const dropdown = document.getElementById('team-dropdown');
    if (!dropdown) {
        return;
    }

    updateFavoriteCheckbox(dropdown.value);
}

// Get team names

// async function fetchFootballTeams() { // Get all NFL teams from the ESPN API
//     try {
//         const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams');
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         const data = await response.json();
//         console.log('NFL Teams:', extractTeamNames(data));
//     } catch (error) {
//         console.error('Error fetching ESPN data:', error);
//     }
// }

// async function fetchNHLTeams() { // Get all NHL teams from the ESPN API
//     try {
//         const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams');
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         const data = await response.json();
//         console.log('NHL Teams:', extractTeamNames(data));
//     } catch (error) {
//         console.error('Error fetching ESPN data:', error);
//     }
// }

// async function fetchMLBTeams() { // Get all MLB teams from the ESPN API
//     try {
//         const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams');
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         const data = await response.json();
//         console.log('MLB Teams:', extractTeamNames(data));
//     } catch (error) {
//         console.error('Error fetching ESPN data:', error);
//     }
// }

// async function fetchNBATeams() { // Get all NBA teams from the ESPN API
//     try {
//         const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams');
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         const data = await response.json();
//         console.log('NBA Teams:', extractTeamNames(data));
//     } catch (error) {
//         console.error('Error fetching ESPN data:', error);
//     }
// }

// Get scoreboard info
// Zach - 2026-04,11: I did not mess with this at all and I have no clue what it does or how it works lol
async function fetchFootballScoreboard(team) { // Get the NFL scoreboard information from the ESPN API
    try {
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('NFL Scoreboard:', extractScoreboard(data));
    } catch (error) {
        console.error('Error fetching ESPN data:', error);
    }
}  // TODO: Allow team parameter to filter the scoreboard results to only show games involving that team.
// TODO: Clean up JSON output to be more user-friendly.

async function inputstats() {
    try {
        const favorites = JSON.parse(localStorage.getItem('favoriteTeams')) || [];
        if (favorites.length === 0) {
            console.error('No favorite team selected');
            return;
        }

        const favoriteSport = favorites[0].sport;

        const response = await fetch('./teams.json');
        const sportsData = await response.json();

        const sportData = sportsData.sports.find(
            s => s.name.toLowerCase() === favoriteSport.toLowerCase()
        );

        if (!sportData) {
            console.error(`Sport ${favoriteSport} not found in teams.json`);
            return;
        }

        clearDisplayArea();

        const teamstats = document.createElement('div');
        teamstats.id = 'team-stats';

        const title = document.createElement('h2');
        title.textContent = 'Input Game Stats to Create Workout Plan';
        teamstats.appendChild(title);

        const favoriteTeam = document.createElement('h3');
        favoriteTeam.textContent = `${favorites[0].team} (${favoriteSport})`;
        teamstats.appendChild(favoriteTeam);

        const optionsContainer = document.createElement('div');
        optionsContainer.id = 'stats-options';

        sportData.options.forEach(option => {
            const optionRow = document.createElement('div');
            optionRow.className = 'stat-option';

            const label = document.createElement('span');
            label.textContent = option;
            label.className = 'stat-label';

            const counterContainer = document.createElement('div');
            counterContainer.className = 'counter-container';

            const minusButton = document.createElement('button');
            minusButton.textContent = '−';
            minusButton.className = 'counter-btn';

            const countDisplay = document.createElement('input');
            countDisplay.type = 'number';
            countDisplay.value = '0';
            countDisplay.className = 'counter-display';

            const plusButton = document.createElement('button');
            plusButton.textContent = '+';
            plusButton.className = 'counter-btn';

            minusButton.onclick = () => {
                const currentValue = parseInt(countDisplay.value);
                if (currentValue > 0) {
                    countDisplay.value = currentValue - 1;
                }
            };

            plusButton.onclick = () => {
                const currentValue = parseInt(countDisplay.value);
                countDisplay.value = currentValue + 1;
            };

            counterContainer.appendChild(minusButton);
            counterContainer.appendChild(countDisplay);
            counterContainer.appendChild(plusButton);

            optionRow.appendChild(label);
            optionRow.appendChild(counterContainer);
            optionsContainer.appendChild(optionRow);
        });

        teamstats.appendChild(optionsContainer);

        const submitButton = document.createElement('button');
        submitButton.textContent = 'Calculate Workout Plan';
        submitButton.id = 'submit-stats';
        submitButton.onclick = () => {
            console.log('Calculating workout plan based on stats...');
        };

        teamstats.appendChild(submitButton);

        document.body.appendChild(teamstats);

    } catch (error) {
        console.error('Error loading stats options:', error);
    }
}

//iniliaize any functions that need to run on page load. 
function init() {
    // Load and display favorite teams on page load
    loadFavoriteTeam(); // run at page load to access localStrorage for user

    const teamDropdown = document.getElementById('team-dropdown');
    if (teamDropdown) {
        teamDropdown.addEventListener('change', (event) => {
            const selectedTeam = event.target.value;
            updateFavoriteCheckbox(selectedTeam);
            if (!selectedTeam) {
                setGamesMessage('Select a team to view current games.');
                return;
            }
            fetchTeamGames(selectedTeam);
        });
    }

    const favoriteCheckbox = document.getElementById('favorite-checkbox');
    if (favoriteCheckbox) {
        favoriteCheckbox.addEventListener('change', (event) => {
            const dropdown = document.getElementById('team-dropdown');
            const selectedTeam = dropdown ? dropdown.value : '';

            if (!selectedSport || !selectedTeam) {
                event.target.checked = false;
                return;
            }

            if (event.target.checked) {
                setFavoriteTeam(selectedSport, selectedTeam);
            } else {
                removeFavoriteTeam(selectedSport, selectedTeam);
            }
        });
    }
}

init();
