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
    loadData();
    showSports();
}

init();
