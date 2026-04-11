let sportsData;

function extractScoreboard(data) { // Extract the scoreboard information from the ESPN API response
    return (data?.events?.map(event => ({
        name: event.name,
        status: event.status?.type?.description,
        competitors: event.competitions?.[0]?.competitors?.map(comp => ({
            teamName: comp.team?.displayName,
            score: comp.score
        })) || []
    })) || []);
}

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

    // fetch teams from API with user input and pre-determined leagues
    try {
        const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams`);
        console.log('API response:', response);

        data = await response.json(); console.log('API data:', data);
        let teamNames = (data?.sports?.[0]?.leagues?.[0]?.teams ?? []).map(team => team?.team?.displayName).filter(Boolean);
        displayTeams(teamNames); console.log('Team names:', teamNames);
    } catch (error) {
        console.error('Error fetching ESPN data:', error);
    }

    console.log(`selected sport: ${sport}, league: ${league}`);

}

// show team names on the page, styling in css. DOM creation
function displayTeams(teamNames) {
    const teamList = document.createElement('div');
    teamList.id = 'team-list';
    teamNames.forEach(teamName => {
        const teamItem = document.createElement('div');
        teamItem.className = 'team-item';
        teamItem.textContent = teamName;
        teamItem.onclick = () => setFavoriteTeam('selectedSport', teamName);
        teamList.appendChild(teamItem);
    });
    document.body.appendChild(teamList);

}

// Function to set a favorite team, storing it in localStorage with sport and team name
function setFavoriteTeam(sport, teamName) {
    // Retrieve existing favorites from localStorage, or initialize as empty array
    const favorites = JSON.parse(localStorage.getItem('favoriteTeams')) || [];
    
    // Check if this team is already a favorite for this sport
    const existingIndex = favorites.findIndex(fav => fav.sport === sport && fav.team === teamName);
    
    if (existingIndex === -1) {
        // Add new favorite
        favorites.push({ sport: sport, team: teamName });
        console.log(`Added ${teamName} (${sport}) as a favorite.`);
    } else {
        // Optionally, you could remove it or alert that it's already a favorite
        console.log(`${teamName} (${sport}) is already a favorite.`);
        // To remove: favorites.splice(existingIndex, 1);
    }
    
    // Save back to localStorage
    localStorage.setItem('favoriteTeams', JSON.stringify(favorites));
}

function loadFavoriteTeam() {
    const favorites = JSON.parse(localStorage.getItem('favoriteTeams')) || [];
    if (favorites.length > 0) {
        // For now, just log the favorites; you can display them on the page
        console.log('Favorite teams:', favorites);
        // TODO: Display favorites on the page, e.g., in a dedicated section
    } else {
        console.log('No favorite teams set.');
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



function init() {
    // loadData();
    // showSports();
    // fetchFootballTeams();
    // fetchNHLTeams();
    // fetchMLBTeams();
    // fetchNBATeams();

    // fetchFootballScoreboard();
}

init();
