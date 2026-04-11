let sportsData;

async function loadData() {
    try {
        const response = await fetch('sports.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        sportsData = data.sports;
    } catch (error) {
        console.error('Error loading sports data:', error);
    }
}

function extractTeamNames(data) { // Extract team names from the ESPN API response
    return (data?.sports?.[0]?.leagues?.[0]?.teams ?? [])
        .map(entry => entry?.team?.displayName)
        .filter(Boolean);
} // I'll be honest, copilot helped me with this one. I wasn't sure how to work through the layers of the JSON response.

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


// Get team names

async function fetchFootballTeams() { // Get all NFL teams from the ESPN API
    try {
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('NFL Teams:', extractTeamNames(data));
    } catch (error) {
        console.error('Error fetching ESPN data:', error);
    }
}

async function fetchNHLTeams() { // Get all NHL teams from the ESPN API
    try {
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('NHL Teams:', extractTeamNames(data));
    } catch (error) {
        console.error('Error fetching ESPN data:', error);
    }
}

async function fetchMLBTeams() { // Get all MLB teams from the ESPN API
    try {
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('MLB Teams:', extractTeamNames(data));
    } catch (error) {
        console.error('Error fetching ESPN data:', error);
    }
}

async function fetchNBATeams() { // Get all NBA teams from the ESPN API
    try {
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('NBA Teams:', extractTeamNames(data));
    } catch (error) {
        console.error('Error fetching ESPN data:', error);
    }
}

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

function showSports() {
    const sportSelector = document.getElementById('sport-selector');
    sportsData.forEach(sport => {
        const sportButton = document.createElement('button');
        sportButton.classList.add('sport-button');
        sportButton.textContent = sport.name;
        sportButton.addEventListener('click', () => showTeamsForSport(sport));
        sportSelector.appendChild(sportButton);
    });
}

function showTeamsForSport(sport) {
    const teamList = document.getElementById('team-list');
    teamList.innerHTML = ''; // Clear previous teams

    const teamsContainer = document.createElement('div');
    teamsContainer.classList.add('teams-container');

    sport.teams.forEach(team => {
        const teamCard = document.createElement('div');
        teamCard.classList.add('team-card');

        const teamName = document.createElement('h2');
        teamName.textContent = team;
        teamCard.appendChild(teamName);

        teamsContainer.appendChild(teamCard);
    });

    teamList.appendChild(teamsContainer);
}

function init() {
    // loadData();
    // showSports();
    fetchFootballTeams();
    fetchNHLTeams();
    fetchMLBTeams();
    fetchNBATeams();

    fetchFootballScoreboard();
}

init();
