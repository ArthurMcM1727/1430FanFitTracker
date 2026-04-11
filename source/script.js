let sportsData;

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
    // get sport from button click;
    // pre determine leagues allowed for sports
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

    clearDisplayArea();

    const favTeam = getFavoriteTeamForSport(sport);
    if (favTeam) {
        console.log(`Found favorite: ${favTeam} for ${sport}`);
        displayFavoriteTeam(favTeam, sport);
        return;
    }

    try {
        const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams`);
        console.log('API response:', response);

        data = await response.json(); console.log('API data:', data);
        let teamNames = (data?.sports?.[0]?.leagues?.[0]?.teams ?? []).map(team => team?.team?.displayName).filter(Boolean);
        displayTeams(teamNames, sport); console.log('Team names:', teamNames);
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
    
    document.body.appendChild(teamList);
}

function removeFavoriteTeam(sport, teamName) {
    const favorites = JSON.parse(localStorage.getItem('favoriteTeams')) || [];
    let index = favorites.findIndex(fav => fav.sport === sport && (!teamName || fav.team === teamName));
    if (index === -1 && sport !== 'selectedSport') {
        index = favorites.findIndex(fav => fav.sport === 'selectedSport');
    }
    if (index !== -1) {
        const removed = favorites.splice(index, 1)[0];
        localStorage.setItem('favoriteTeams', JSON.stringify(favorites));
        clearDisplayArea();
        loadFavoriteTeam();
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
    const favorites = JSON.parse(localStorage.getItem('favoriteTeams')) || [];
    const favorite = favorites.find(fav => fav.sport === sport);
    return favorite ? favorite.team : null;
}

// Function to set a favorite team, storing it in localStorage with sport and team name
//FIXME:: somehow three default teams get added to localStorage on page load and I don't know why or how
function setFavoriteTeam(sport, teamName) {
    // Retrieve existing favorites from localStorage, or initialize as empty array
    const favorites = JSON.parse(localStorage.getItem('favoriteTeams')) || [];
    
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
    
    // Save back to localStorage
    localStorage.setItem('favoriteTeams', JSON.stringify(favorites));
    
    // Refresh the display
    loadSport(sport);
}


// function for loading favorite teams onto webpage, essentially this entire function is DOM  for html in js. There is no logic control here
function loadFavoriteTeam() {
    const favorites = JSON.parse(localStorage.getItem('favoriteTeams')) || [];
    clearDisplayArea();

    const message = document.createElement('div');
    message.id = 'favorite-message';
    document.body.appendChild(message);

    if (favorites.length > 0) {
        console.log('Favorite teams:', favorites);
        message.textContent = 'Saved favorite teams:';

        const favoriteList = document.createElement('div');
        favoriteList.id = 'favorite-list';
        favorites.forEach((fav, index) => {
            const row = document.createElement('div');
            row.className = 'favorite-row';

            const label = document.createElement('span');
            label.textContent = `${fav.team} (${fav.sport})`;
            row.appendChild(label);

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.onclick = () => showTeamsForFavoriteUpdate(fav.sport);
            row.appendChild(editButton);

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.onclick = () => removeFavoriteTeam(fav.sport, fav.team);
            row.appendChild(removeButton);

            favoriteList.appendChild(row);
        });
        document.body.appendChild(favoriteList);
    } else {
        message.textContent = 'No favorite teams yet. Please select a sport and add at least one team.';
    }
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


//iniliaize any functions that need to run on page load. 
function init() {
    // Load and display favorite teams on page load
    loadFavoriteTeam(); // run at page load to access localStrorage for user
}

init();
