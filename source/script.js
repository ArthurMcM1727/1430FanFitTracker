let sportsData

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
    } catch (error) {
        console.error('Error fetching ESPN data:', error);
    }

    console.log(`selected sport: ${sport}, league: ${league}`);

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
