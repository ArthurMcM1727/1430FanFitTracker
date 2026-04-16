let sportsData;
let selectedSport = '';
let selectedLeague = '';
let selectedTeam = '';

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

function getWorkoutStorageKey(sport, team) {
    return `workouts_${sport}_${team}`;
}

function getStoredWorkouts(sport, team) {
    if (!sport || !team) {
        return [];
    }
    const key = getWorkoutStorageKey(sport, team);
    return JSON.parse(localStorage.getItem(key)) || [];
}

function saveStoredWorkouts(sport, team, workouts) {
    if (!sport || !team) {
        return;
    }
    const key = getWorkoutStorageKey(sport, team);
    localStorage.setItem(key, JSON.stringify(workouts));
}

function renderWorkoutSection(sport, team) {
    const workoutList = document.getElementById('workout-list');
    const workoutHelp = document.getElementById('workout-help');
    const workoutSummary = document.getElementById('workout-summary');
    if (!workoutList || !workoutHelp || !workoutSummary) {
        return;
    }

    if (!sport || !team) {
        workoutHelp.textContent = 'Select a sport and team to save custom workouts for that favorite team.';
        workoutSummary.textContent = '';
        workoutList.innerHTML = '<p class="status-message">Workouts are saved per team and sport once a team is selected.</p>';
        return;
    }

    const workouts = getStoredWorkouts(sport, team);
    const dueCount = workouts.filter(workout => !workout.completed).length;
    const completedCount = workouts.filter(workout => workout.completed).length;
    workoutHelp.textContent = `Workouts saved for ${team} (${sport}). These are stored locally in your browser.`;
    workoutSummary.textContent = `Exercises due: ${dueCount} | Completed: ${completedCount}`;

    if (!workouts.length) {
        workoutList.innerHTML = '<p class="status-message">No saved workouts yet. Add one above.</p>';
        return;
    }

    workoutList.innerHTML = '';
    workouts.forEach((workout, index) => {
        const card = document.createElement('div');
        card.className = 'workout-card';
        if (workout.completed) {
            card.classList.add('completed');
        }

        const details = document.createElement('div');
        details.className = 'workout-details';
        details.innerHTML = `<strong>${workout.name}</strong>`;

        const repsLabel = document.createElement('label');
        repsLabel.textContent = 'Reps:';
        repsLabel.className = 'rep-label';

        const repsInput = document.createElement('input');
        repsInput.type = 'number';
        repsInput.min = '1';
        repsInput.value = workout.reps;
        repsInput.className = 'rep-input';
        repsInput.onchange = () => updateWorkoutReps(index, parseInt(repsInput.value, 10), sport, team);

        const addRepsButton = document.createElement('button');
        addRepsButton.type = 'button';
        addRepsButton.className = 'add-reps-button';
        addRepsButton.textContent = '+';
        addRepsButton.onclick = () => {
            const newReps = parseInt(repsInput.value, 10) + 1;
            repsInput.value = newReps;
            updateWorkoutReps(index, newReps, sport, team);
        };

        const actions = document.createElement('div');
        actions.className = 'workout-actions';

        const completeButton = document.createElement('button');
        completeButton.type = 'button';
        completeButton.className = 'complete-workout-button';
        completeButton.textContent = workout.completed ? 'Undo' : 'Complete';
        completeButton.onclick = () => toggleWorkoutCompleted(index, sport, team);

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'remove-workout-button';
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => removeWorkoutFromSavedList(index, sport, team);

        actions.appendChild(repsLabel);
        actions.appendChild(repsInput);
        actions.appendChild(addRepsButton);
        actions.appendChild(completeButton);
        actions.appendChild(removeButton);

        card.appendChild(details);
        card.appendChild(actions);
        workoutList.appendChild(card);
    });
}

function updateWorkoutReps(index, reps, sport, team) {
    if (!sport || !team || isNaN(reps) || reps < 1) {
        renderWorkoutSection(selectedSport, selectedTeam);
        return;
    }
    const workouts = getStoredWorkouts(sport, team);
    if (index < 0 || index >= workouts.length) {
        return;
    }
    workouts[index].reps = reps;
    saveStoredWorkouts(sport, team, workouts);
    renderWorkoutSection(sport, team);
}

function toggleWorkoutCompleted(index, sport, team) {
    const workouts = getStoredWorkouts(sport, team);
    if (index < 0 || index >= workouts.length) {
        return;
    }
    workouts[index].completed = !workouts[index].completed;
    saveStoredWorkouts(sport, team, workouts);
    renderWorkoutSection(sport, team);
}

function addWorkoutFromForm() {
    const nameField = document.getElementById('workout-name');
    const repsField = document.getElementById('workout-reps');
    if (!nameField || !repsField) {
        return;
    }

    const workoutName = nameField.value.trim();
    const workoutReps = parseInt(repsField.value, 10);

    if (!selectedSport || !selectedTeam) {
        alert('Please select a sport and team before adding workouts.');
        return;
    }

    if (!workoutName) {
        alert('Enter an exercise name.');
        return;
    }

    if (!workoutReps || workoutReps < 1) {
        alert('Enter a valid number of reps.');
        return;
    }

    const workouts = getStoredWorkouts(selectedSport, selectedTeam);
    workouts.push({ name: workoutName, reps: workoutReps, completed: false });
    saveStoredWorkouts(selectedSport, selectedTeam, workouts);
    nameField.value = '';
    repsField.value = '10';
    renderWorkoutSection(selectedSport, selectedTeam);
}

function removeWorkoutFromSavedList(index, sport, team) {
    const workouts = getStoredWorkouts(sport, team);
    if (index < 0 || index >= workouts.length) {
        return;
    }
    workouts.splice(index, 1);
    saveStoredWorkouts(sport, team, workouts);
    renderWorkoutSection(sport, team);
}

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
            selectedTeam = favoriteTeam;
            updateFavoriteCheckbox(favoriteTeam);
            fetchTeamGames(favoriteTeam);
        } else {
            selectedTeam = '';
            updateFavoriteCheckbox('');
            setGamesMessage('Select a team to view current games.');
        }
        renderWorkoutSection(selectedSport, selectedTeam);
    } catch (error) {
        console.error('Error fetching ESPN data:', error);
    }

    console.log(`selected sport: ${sport}, league: ${league}`);

}

function setActiveSportCard(sport) {
    const sportCards = document.querySelectorAll('#sport-selector .sport-card');
    sportCards.forEach(card => {
        card.classList.toggle('active', card.textContent.trim().toLowerCase() === sport);
    });
}

function populateTeamDropdown(teamNames, sport) {
    const dropdown = document.getElementById('team-dropdown');
    const favoriteCheckbox = document.getElementById('favorite-checkbox');
    if (!dropdown) {
        return;
    }

    dropdown.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = `Select a ${sport} team`;
    dropdown.appendChild(defaultOption);

    teamNames.forEach(teamName => {
        const option = document.createElement('option');
        option.value = teamName;
        option.textContent = teamName;
        dropdown.appendChild(option);
    });

    dropdown.disabled = false;

    if (favoriteCheckbox) {
        favoriteCheckbox.checked = false;
        favoriteCheckbox.disabled = true;
    }
}

function updateFavoriteCheckbox(teamName) {
    const favoriteCheckbox = document.getElementById('favorite-checkbox');
    if (!favoriteCheckbox) {
        return;
    }

    if (!selectedSport || !teamName) {
        favoriteCheckbox.checked = false;
        favoriteCheckbox.disabled = true;
        return;
    }

    favoriteCheckbox.disabled = false;
    favoriteCheckbox.checked = getFavoriteTeamForSport(selectedSport) === teamName;
}

async function fetchTeamGames(teamName) {
    if (!selectedSport || !selectedLeague || !teamName) {
        return;
    }

    setGamesMessage(`Loading current ${selectedSport} games for ${teamName}...`);

    try {
        const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${selectedSport}/${selectedLeague}/scoreboard`);
        if (!response.ok) {
            throw new Error('Could not fetch scoreboard');
        }

        const data = await response.json();
        const matchingGames = (data?.events ?? []).filter(event => {
            const competitors = event?.competitions?.[0]?.competitors ?? [];
            return competitors.some(comp => comp?.team?.displayName === teamName);
        });

        renderGames(matchingGames, teamName);
    } catch (error) {
        console.error('Error fetching team games:', error);
        setGamesMessage('Could not load current games from ESPN right now.');
    }
}

function renderGames(games, teamName) {
    const output = document.getElementById('games-output');
    if (!output) {
        return;
    }

    output.innerHTML = '';

    if (!games.length) {
        setGamesMessage(`No current games found for ${teamName}.`);
        return;
    }

    const heading = document.createElement('h3');
    heading.textContent = `Today's games for ${teamName}`;
    output.appendChild(heading);

    games.forEach(game => {
        const item = document.createElement('div');
        item.className = 'game-item';

        const status = game?.status?.type?.shortDetail || game?.status?.type?.description || 'Status unavailable';
        const competitors = game?.competitions?.[0]?.competitors ?? [];
        const matchup = competitors.map(comp => comp?.team?.shortDisplayName || comp?.team?.displayName).filter(Boolean).join(' vs ');
        const score = competitors.map(comp => `${comp?.team?.abbreviation || comp?.team?.displayName}: ${comp?.score ?? '0'}`).join(' | ');

        item.innerHTML = `
            <strong>${matchup || game?.name || 'Game'}</strong><br>
            <span>${status}</span><br>
            <span>${score}</span>
        `;

        output.appendChild(item);
    });
}

function setGamesMessage(message) {
    const output = document.getElementById('games-output');
    if (!output) {
        return;
    }

    output.innerHTML = `<p class="status-message">${message}</p>`;
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
    const existingTeamStats = document.getElementById('team-stats');
    if (existingTeamStats) {
        existingTeamStats.remove();
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
        renderWorkoutSection(selectedSport, selectedTeam);
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
    selectedTeam = teamName;
    renderWorkoutSection(sport, teamName);
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

        const inputStatsButton = document.createElement('button');
        inputStatsButton.id = 'favorite-input-stats-button';
        inputStatsButton.textContent = 'Input Game Stats for Workout Plan';
        inputStatsButton.onclick = () => {
            console.log('Bottom Input Game Stats button clicked.');
            inputstats();
        };
        favoritesSection.appendChild(inputStatsButton);
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
            selectedTeam = event.target.value;
            updateFavoriteCheckbox(selectedTeam);
            if (!selectedTeam) {
                setGamesMessage('Select a team to view current games.');
                renderWorkoutSection(selectedSport, selectedTeam);
                return;
            }
            fetchTeamGames(selectedTeam);
            renderWorkoutSection(selectedSport, selectedTeam);
        });
    }

    const addWorkoutButton = document.getElementById('add-workout-button');
    if (addWorkoutButton) {
        addWorkoutButton.addEventListener('click', addWorkoutFromForm);
    }

    renderWorkoutSection(selectedSport, selectedTeam);

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

