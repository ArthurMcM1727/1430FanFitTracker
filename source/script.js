const SPORT_LEAGUE_MAP = {
    football: 'nfl',
    hockey: 'nhl',
    baseball: 'mlb',
    basketball: 'nba'
};

const SPORT_LABELS = {
    football: 'Football',
    hockey: 'Hockey',
    baseball: 'Baseball',
    basketball: 'Basketball'
};

const STORAGE_PREFIX = 'fanfit_workouts';
const REFRESH_INTERVAL_MS = 60000;

const state = {
    selectedSport: '',
    selectedLeague: '',
    selectedTeam: '',
    games: []
};

let refreshTimer = null;

function createId() {
    if (window.crypto?.randomUUID) {
        return window.crypto.randomUUID();
    }

    return `workout_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function slugify(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
}

function parsePositiveInteger(value, fallback = 1) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
        return fallback;
    }

    return parsed;
}

function getWorkoutStorageKey(sport, team) {
    return `${STORAGE_PREFIX}_${slugify(sport)}_${slugify(team)}`;
}

function getStoredWorkouts(sport, team) {
    if (!sport || !team) {
        return [];
    }

    const raw = localStorage.getItem(getWorkoutStorageKey(sport, team));
    if (!raw) {
        return [];
    }

    try {
        const workouts = JSON.parse(raw);
        return Array.isArray(workouts) ? workouts.map(normalizeWorkout).filter(Boolean) : [];
    } catch (error) {
        console.error('Unable to load stored workouts:', error);
        return [];
    }
}

function saveStoredWorkouts(sport, team, workouts) {
    if (!sport || !team) {
        return;
    }

    localStorage.setItem(getWorkoutStorageKey(sport, team), JSON.stringify(workouts.map(normalizeWorkout).filter(Boolean)));
}

function normalizeWorkout(workout) {
    if (!workout || typeof workout !== 'object') {
        return null;
<<<<<<< HEAD
    }

    const multiplierType = workout.multiplierType === 'live-score' ? 'live-score' : 'event-count';
    const normalized = {
        id: workout.id || createId(),
        name: String(workout.name || '').trim(),
        baseReps: parsePositiveInteger(workout.baseReps, 1),
        multiplierType,
        eventLabel: String(workout.eventLabel || '').trim(),
        eventCount: parsePositiveInteger(workout.eventCount, 1),
        liveTeamSource: workout.liveTeamSource === 'opponent-team' ? 'opponent-team' : 'selected-team',
        completed: Boolean(workout.completed),
        completedReps: Number.isFinite(Number(workout.completedReps)) ? Number(workout.completedReps) : null
    };

    if (!normalized.name) {
        return null;
    }

    if (!normalized.eventLabel) {
        normalized.eventLabel = normalized.multiplierType === 'live-score' ? 'Live score' : 'Custom event';
    }

    // Add completedEvents for partial completion
    if (normalized.multiplierType === 'event-count') {
        if (Array.isArray(workout.completedEvents)) {
            if (workout.completedEvents.length === normalized.eventCount) {
                normalized.completedEvents = workout.completedEvents.slice();
            } else {
                // Resize array
                normalized.completedEvents = new Array(normalized.eventCount).fill(false);
                workout.completedEvents.forEach((val, idx) => {
                    if (idx < normalized.eventCount) {
                        normalized.completedEvents[idx] = val;
                    }
                });
            }
        } else {
            // Initialize based on legacy completed
            normalized.completedEvents = new Array(normalized.eventCount).fill(normalized.completed);
        }
        // Update completed based on completedEvents
        normalized.completed = normalized.completedEvents.every(Boolean);
        if (normalized.completed && normalized.completedReps === null) {
            normalized.completedReps = calculateWorkoutTotal(normalized);
        }
    } else if (normalized.multiplierType === 'live-score') {
        const currentScore = Math.max(0, getLiveScoreForSource(normalized.liveTeamSource));
        if (Array.isArray(workout.completedEvents)) {
            if (workout.completedEvents.length === currentScore) {
                normalized.completedEvents = workout.completedEvents.slice();
            } else if (workout.completedEvents.length < currentScore) {
                // Score increased, add false entries
                normalized.completedEvents = workout.completedEvents.slice();
                while (normalized.completedEvents.length < currentScore) {
                    normalized.completedEvents.push(false);
                }
            } else {
                // Score decreased, truncate but keep completed ones
                normalized.completedEvents = workout.completedEvents.slice(0, currentScore);
            }
        } else {
            // Initialize based on legacy completed
            normalized.completedEvents = new Array(currentScore).fill(normalized.completed);
        }
        // Update completed based on completedEvents
        normalized.completed = normalized.completedEvents.every(Boolean);
        if (normalized.completed && normalized.completedReps === null) {
            normalized.completedReps = calculateWorkoutTotal(normalized);
        }
    } else {
        normalized.completedEvents = null;
    }

    return normalized;
}

function setMessage(elementId, message) {
    const element = document.getElementById(elementId);
    if (!element) {
        return;
    }

    element.innerHTML = `<p class="status-message">${message}</p>`;
}

function renderSportButtons() {
    const container = document.getElementById('sport-selector');
    if (!container) {
        return;
    }

=======
    }

    const multiplierType = workout.multiplierType === 'live-score' ? 'live-score' : 'event-count';
    const normalized = {
        id: workout.id || createId(),
        name: String(workout.name || '').trim(),
        baseReps: parsePositiveInteger(workout.baseReps, 1),
        multiplierType,
        eventLabel: String(workout.eventLabel || '').trim(),
        eventCount: parsePositiveInteger(workout.eventCount, 1),
        liveTeamSource: workout.liveTeamSource === 'opponent-team' ? 'opponent-team' : 'selected-team',
        completed: Boolean(workout.completed),
        completedReps: Number.isFinite(Number(workout.completedReps)) ? Number(workout.completedReps) : null
    };

    if (!normalized.name) {
        return null;
    }

    if (!normalized.eventLabel) {
        normalized.eventLabel = normalized.multiplierType === 'live-score' ? 'Live score' : 'Custom event';
    }

    if (normalized.completed && normalized.completedReps === null) {
        normalized.completedReps = calculateWorkoutTotal(normalized);
    }

    return normalized;
}

function setMessage(elementId, message) {
    const element = document.getElementById(elementId);
    if (!element) {
        return;
    }

    element.innerHTML = `<p class="status-message">${message}</p>`;
}

function renderSportButtons() {
    const container = document.getElementById('sport-selector');
    if (!container) {
        return;
    }

>>>>>>> b19d3e5 (ADD: Overhaul. Completed custom workout input implementation)
    container.innerHTML = '';

    Object.keys(SPORT_LEAGUE_MAP).forEach((sport) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'sport-card';
        button.dataset.sport = sport;
        button.textContent = SPORT_LABELS[sport] || sport;
        button.addEventListener('click', () => loadSport(sport));
        container.appendChild(button);
    });
}

function setActiveSportCard(sport) {
    document.querySelectorAll('#sport-selector .sport-card').forEach((card) => {
        card.classList.toggle('active', card.dataset.sport === sport);
    });
}

function clearRefreshTimer() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}

function updateBuilderVisibility() {
    const multiplierType = document.getElementById('workout-multiplier-type');
    const eventCountGroup = document.getElementById('event-count-group');
    const liveTeamGroup = document.getElementById('live-team-group');
    const eventLabelField = document.getElementById('workout-event-label');
    const liveTeamSelect = document.getElementById('workout-live-team');

    if (!multiplierType || !eventCountGroup || !liveTeamGroup || !eventLabelField || !liveTeamSelect) {
        return;
    }

    const isLiveScore = multiplierType.value === 'live-score';
    if (isLiveScore) {
        if (eventLabelField.value && eventLabelField.value !== 'Live score') {
            eventLabelField.dataset.customValue = eventLabelField.value;
        }
        eventLabelField.value = 'Live score';
    } else if (eventLabelField.value === 'Live score') {
        eventLabelField.value = eventLabelField.dataset.customValue || '';
    }
    eventLabelField.disabled = isLiveScore;
    eventLabelField.placeholder = isLiveScore ? 'Live score' : 'Fouls, power plays, hat tricks';
    eventCountGroup.classList.toggle('is-hidden', isLiveScore);
    liveTeamGroup.classList.toggle('is-hidden', !isLiveScore);
    liveTeamSelect.disabled = !state.selectedTeam;
}

function populateLiveScoreOptions() {
    const liveTeamSelect = document.getElementById('workout-live-team');
    if (!liveTeamSelect) {
        return;
    }

    const previousValue = liveTeamSelect.value || 'selected-team';
    liveTeamSelect.innerHTML = '';

    const selectedOption = document.createElement('option');
    selectedOption.value = 'selected-team';
    selectedOption.textContent = state.selectedTeam ? `Selected team (${state.selectedTeam})` : 'Selected team';
    liveTeamSelect.appendChild(selectedOption);

    const opponentOption = document.createElement('option');
    opponentOption.value = 'opponent-team';
    opponentOption.textContent = 'Opponent team';
    liveTeamSelect.appendChild(opponentOption);

    if ([...liveTeamSelect.options].some((option) => option.value === previousValue)) {
        liveTeamSelect.value = previousValue;
    } else {
        liveTeamSelect.value = 'selected-team';
    }

    liveTeamSelect.disabled = !state.selectedTeam;
}

async function loadSport(sport) {
    const league = SPORT_LEAGUE_MAP[sport];
    if (!league) {
        return;
    }

    state.selectedSport = sport;
    state.selectedLeague = league;
    state.selectedTeam = '';
    state.games = [];

    clearRefreshTimer();
    setActiveSportCard(sport);
    populateTeamDropdown([], sport);
    populateLiveScoreOptions();
    updateBuilderVisibility();
    setMessage('team-status', `Loading ${SPORT_LABELS[sport] || sport} teams from ESPN...`);
    setMessage('games-output', 'Choose a team to see live games and scores.');
    renderWorkoutSection();

    try {
        const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams`);
        if (!response.ok) {
            throw new Error(`Failed to load teams for ${sport}`);
        }

        const data = await response.json();
        const teamNames = (data?.sports?.[0]?.leagues?.[0]?.teams ?? [])
            .map((team) => team?.team?.displayName)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));

        populateTeamDropdown(teamNames, sport);
        setMessage('team-status', `Loaded ${teamNames.length} teams. Choose one to continue.`);
    } catch (error) {
        console.error('Error fetching ESPN teams:', error);
        setMessage('team-status', 'Could not load teams from ESPN right now. Try another sport or reload the page.');
    }

    renderWorkoutSection();
}

function populateTeamDropdown(teamNames, sport) {
    const dropdown = document.getElementById('team-dropdown');
    if (!dropdown) {
        return;
    }

    dropdown.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = sport ? `Select a ${SPORT_LABELS[sport] || sport} team` : 'Select a sport first';
    dropdown.appendChild(defaultOption);

    teamNames.forEach((teamName) => {
        const option = document.createElement('option');
        option.value = teamName;
        option.textContent = teamName;
        dropdown.appendChild(option);
    });

    dropdown.disabled = !teamNames.length;
    dropdown.value = '';
}

function getCurrentGame() {
    return state.games[0] || null;
}

function getLiveScoreForSource(source) {
    const game = getCurrentGame();
    if (!game) {
        return 0;
    }

    const competitors = game?.competitions?.[0]?.competitors ?? [];
    const selectedCompetitor = competitors.find((competitor) => competitor?.team?.displayName === state.selectedTeam) || competitors[0] || null;
    const opponentCompetitor = competitors.find((competitor) => competitor !== selectedCompetitor) || competitors[1] || null;
    const targetCompetitor = source === 'opponent-team' ? opponentCompetitor : selectedCompetitor;
    const score = Number.parseInt(targetCompetitor?.score, 10);

    return Number.isNaN(score) ? 0 : score;
}

function describeLiveSource(source) {
    if (source === 'opponent-team') {
        return 'opponent team';
    }

    return state.selectedTeam || 'selected team';
}

function calculateWorkoutMultiplier(workout) {
    if (workout.multiplierType === 'live-score') {
        return Math.max(0, getLiveScoreForSource(workout.liveTeamSource));
    }

    return Math.max(1, parsePositiveInteger(workout.eventCount, 1));
}

function calculateWorkoutTotal(workout) {
    const baseReps = Math.max(1, parsePositiveInteger(workout.baseReps, 1));
    return baseReps * calculateWorkoutMultiplier(workout);
}

function getWorkoutLabel(workout) {
    if (workout.eventLabel) {
        return workout.eventLabel;
    }

    return workout.multiplierType === 'live-score' ? 'Live score' : 'Custom event';
}

function renderGames(games, teamName) {
    const output = document.getElementById('games-output');
    if (!output) {
        return;
    }

    output.innerHTML = '';

    if (!games.length) {
        output.innerHTML = `<p class="status-message">No current games found for ${teamName}. The workout builder still works with custom events.</p>`;
        return;
    }

    const heading = document.createElement('h3');
    heading.textContent = `Live games for ${teamName}`;
    output.appendChild(heading);

    games.forEach((game) => {
        const item = document.createElement('article');
        item.className = 'game-item';

        const competitors = game?.competitions?.[0]?.competitors ?? [];
        const matchup = competitors
            .map((competitor) => competitor?.team?.shortDisplayName || competitor?.team?.displayName)
            .filter(Boolean)
            .join(' vs ');
        const status = game?.status?.type?.shortDetail || game?.status?.type?.description || 'Status unavailable';
        const scoreLine = competitors
            .map((competitor) => `${competitor?.team?.abbreviation || competitor?.team?.displayName}: ${competitor?.score ?? '0'}`)
            .join(' | ');

        item.innerHTML = `
            <strong>${matchup || game?.name || 'Game'}</strong>
            <p>${status}</p>
            <p>${scoreLine}</p>
        `;

        output.appendChild(item);
    });
}

async function fetchTeamGames(teamName) {
    if (!state.selectedSport || !state.selectedLeague || !teamName) {
        return;
    }

    setMessage('games-output', `Loading current ${SPORT_LABELS[state.selectedSport] || state.selectedSport} games for ${teamName}...`);

    try {
        const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${state.selectedSport}/${state.selectedLeague}/scoreboard`);
        if (!response.ok) {
            throw new Error('Could not fetch scoreboard');
        }

        const data = await response.json();
        state.games = (data?.events ?? []).filter((event) => {
            const competitors = event?.competitions?.[0]?.competitors ?? [];
            return competitors.some((competitor) => competitor?.team?.displayName === teamName);
        });

        renderGames(state.games, teamName);
        renderWorkoutSection();
    } catch (error) {
        console.error('Error fetching team games:', error);
        state.games = [];
        setMessage('games-output', 'Could not load current games from ESPN right now.');
        renderWorkoutSection();
    }
}

function startGameRefresh() {
    clearRefreshTimer();

    if (!state.selectedTeam) {
        return;
    }

    refreshTimer = window.setInterval(() => {
        fetchTeamGames(state.selectedTeam);
    }, REFRESH_INTERVAL_MS);
}

function populateWorkoutFormDefaults() {
    populateLiveScoreOptions();
    updateBuilderVisibility();
}

function addWorkoutFromForm(event) {
    event.preventDefault();

    if (!state.selectedSport || !state.selectedTeam) {
        setMessage('workout-help', 'Choose a sport and team before adding workouts.');
        return;
    }

    const nameField = document.getElementById('workout-name');
    const repsField = document.getElementById('workout-reps');
    const eventLabelField = document.getElementById('workout-event-label');
    const multiplierTypeField = document.getElementById('workout-multiplier-type');
    const eventCountField = document.getElementById('workout-event-count');
    const liveTeamField = document.getElementById('workout-live-team');

    if (!nameField || !repsField || !eventLabelField || !multiplierTypeField || !eventCountField || !liveTeamField) {
        return;
    }

    const workoutName = nameField.value.trim();
    const baseReps = parsePositiveInteger(repsField.value, 1);
    const multiplierType = multiplierTypeField.value === 'live-score' ? 'live-score' : 'event-count';
    const eventLabel = multiplierType === 'live-score' ? 'Live score' : eventLabelField.value.trim();
    const eventCount = parsePositiveInteger(eventCountField.value, 1);
    const liveTeamSource = liveTeamField.value === 'opponent-team' ? 'opponent-team' : 'selected-team';

    if (!workoutName) {
        setMessage('workout-help', 'Enter a workout name before adding it.');
        return;
    }

    const workout = normalizeWorkout({
        id: createId(),
        name: workoutName,
        baseReps,
        multiplierType,
        eventLabel: eventLabel || (multiplierType === 'live-score' ? 'Live score' : 'Custom event'),
        eventCount,
        liveTeamSource,
        completed: false,
        completedReps: null
    });

    const workouts = getStoredWorkouts(state.selectedSport, state.selectedTeam);
    workouts.push(workout);
    saveStoredWorkouts(state.selectedSport, state.selectedTeam, workouts);

    nameField.value = '';
    eventLabelField.value = '';
    repsField.value = '10';
    eventCountField.value = '1';
    liveTeamField.value = 'selected-team';

    renderWorkoutSection();
}

function updateWorkout(index, patch) {
    if (!state.selectedSport || !state.selectedTeam) {
        return;
    }

    const workouts = getStoredWorkouts(state.selectedSport, state.selectedTeam);
    if (index < 0 || index >= workouts.length) {
        return;
    }

    const nextWorkout = normalizeWorkout({
        ...workouts[index],
        ...patch,
        completed: workouts[index].completed,
        completedReps: workouts[index].completedReps
    });

    if (!nextWorkout) {
        return;
    }

    if (nextWorkout.completed) {
        nextWorkout.completedReps = calculateWorkoutTotal(nextWorkout);
    }

    workouts[index] = nextWorkout;
    saveStoredWorkouts(state.selectedSport, state.selectedTeam, workouts);
    renderWorkoutSection();
}

function toggleWorkoutCompleted(index) {
    if (!state.selectedSport || !state.selectedTeam) {
        return;
    }

    const workouts = getStoredWorkouts(state.selectedSport, state.selectedTeam);
    if (index < 0 || index >= workouts.length) {
        return;
    }

    const workout = normalizeWorkout(workouts[index]);
    if (!workout) {
        return;
    }

    workout.completed = !workout.completed;
    workout.completedReps = workout.completed ? calculateWorkoutTotal(workout) : null;

    workouts[index] = workout;
    saveStoredWorkouts(state.selectedSport, state.selectedTeam, workouts);
    renderWorkoutSection();
}

<<<<<<< HEAD
function toggleAllEventsCompleted(workoutIndex) {
    if (!state.selectedSport || !state.selectedTeam) {
        return;
    }

    const workouts = getStoredWorkouts(state.selectedSport, state.selectedTeam);
    if (workoutIndex < 0 || workoutIndex >= workouts.length) {
        return;
    }

    const workout = workouts[workoutIndex];
    if ((workout.multiplierType !== 'event-count' && workout.multiplierType !== 'live-score') || !workout.completedEvents) {
        return;
    }

    const allCompleted = workout.completedEvents.every(Boolean);
    workout.completedEvents.fill(!allCompleted);
    workout.completed = !allCompleted;
    workout.completedReps = workout.completed ? calculateWorkoutTotal(workout) : null;

    saveStoredWorkouts(state.selectedSport, state.selectedTeam, workouts);
    renderWorkoutSection();
}

//Partial completion toggle for individual events in event-count and live-score workouts
function toggleEventCompleted(workoutIndex, eventIndex) {
    if (!state.selectedSport || !state.selectedTeam) {
        return;
    }

    const workouts = getStoredWorkouts(state.selectedSport, state.selectedTeam);
    if (workoutIndex < 0 || workoutIndex >= workouts.length) {
        return;
    }

    const workout = normalizeWorkout(workouts[workoutIndex]);
    if ((workout.multiplierType !== 'event-count' && workout.multiplierType !== 'live-score') || !Array.isArray(workout.completedEvents)) {
        return;
    }

    if (eventIndex < 0 || eventIndex >= workout.completedEvents.length) {
        return;
    }

    workout.completedEvents[eventIndex] = !workout.completedEvents[eventIndex];
    const completedCount = workout.completedEvents.filter(Boolean).length;
    const totalCount = workout.multiplierType === 'event-count' ? workout.eventCount : workout.completedEvents.length;
    workout.completed = completedCount >= totalCount;
    workout.completedReps = completedCount * workout.baseReps;

    workouts[workoutIndex] = workout;
    saveStoredWorkouts(state.selectedSport, state.selectedTeam, workouts);
    renderWorkoutSection();
}

=======
>>>>>>> b19d3e5 (ADD: Overhaul. Completed custom workout input implementation)
function removeWorkout(index) {
    if (!state.selectedSport || !state.selectedTeam) {
        return;
    }

    const workouts = getStoredWorkouts(state.selectedSport, state.selectedTeam);
    if (index < 0 || index >= workouts.length) {
        return;
    }

    workouts.splice(index, 1);
    saveStoredWorkouts(state.selectedSport, state.selectedTeam, workouts);
    renderWorkoutSection();
}

function buildWorkoutCard(workout, index) {
    const card = document.createElement('article');
    card.className = 'workout-card';
    card.classList.toggle('completed', workout.completed);

    const titleRow = document.createElement('div');
    titleRow.className = 'workout-title-row';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'workout-name-input';
    titleInput.value = workout.name;
    titleInput.addEventListener('change', () => updateWorkout(index, { name: titleInput.value.trim() }));

    const statusPill = document.createElement('span');
    statusPill.className = 'status-pill';
<<<<<<< HEAD
    if (workout.multiplierType === 'event-count' || workout.multiplierType === 'live-score') {
        const completedCount = workout.completedEvents.filter(Boolean).length;
        const totalCount = workout.multiplierType === 'event-count' ? workout.eventCount : workout.completedEvents.length;
        if (completedCount === 0) {
            statusPill.textContent = 'Active';
            statusPill.classList.add('active');
        } else if (completedCount === totalCount) {
            statusPill.textContent = 'Completed';
            statusPill.classList.add('completed');
        } else {
            statusPill.textContent = `Partial (${completedCount}/${totalCount})`;
            statusPill.classList.add('partial');
        }
    } else {
        statusPill.textContent = workout.completed ? 'Completed' : 'Active';
        statusPill.classList.add(workout.completed ? 'completed' : 'active');
    }
=======
    statusPill.textContent = workout.completed ? 'Completed' : 'Active';
>>>>>>> b19d3e5 (ADD: Overhaul. Completed custom workout input implementation)

    titleRow.appendChild(titleInput);
    titleRow.appendChild(statusPill);

    const meta = document.createElement('div');
    meta.className = 'workout-meta';

    const baseRepsGroup = document.createElement('label');
    baseRepsGroup.className = 'mini-field';
    baseRepsGroup.textContent = 'Base reps';
    const baseRepsInput = document.createElement('input');
    baseRepsInput.type = 'number';
    baseRepsInput.min = '1';
    baseRepsInput.value = workout.baseReps;
    baseRepsInput.addEventListener('change', () => updateWorkout(index, { baseReps: parsePositiveInteger(baseRepsInput.value, 1) }));
    baseRepsGroup.appendChild(baseRepsInput);

    const multiplierTypeGroup = document.createElement('label');
    multiplierTypeGroup.className = 'mini-field';
    multiplierTypeGroup.textContent = 'Multiplier';
    const multiplierTypeSelect = document.createElement('select');
    multiplierTypeSelect.innerHTML = `
        <option value="event-count">Custom event count</option>
        <option value="live-score">Live score</option>
    `;
    multiplierTypeSelect.value = workout.multiplierType;
    multiplierTypeSelect.addEventListener('change', () => updateWorkout(index, { multiplierType: multiplierTypeSelect.value }));
    multiplierTypeGroup.appendChild(multiplierTypeSelect);

    const eventLabelGroup = document.createElement('label');
    eventLabelGroup.className = 'mini-field';
    eventLabelGroup.textContent = 'Game event';
    const eventLabelInput = document.createElement('input');
    eventLabelInput.type = 'text';
    eventLabelInput.value = workout.multiplierType === 'live-score' ? 'Live score' : workout.eventLabel;
    eventLabelInput.placeholder = workout.multiplierType === 'live-score' ? 'Live score' : 'Fouls, power plays, hat tricks...';
    eventLabelInput.disabled = workout.multiplierType === 'live-score';
    eventLabelInput.addEventListener('change', () => updateWorkout(index, { eventLabel: eventLabelInput.value.trim() }));
    eventLabelGroup.appendChild(eventLabelInput);

    const eventCountGroup = document.createElement('label');
    eventCountGroup.className = 'mini-field';
    eventCountGroup.textContent = 'Event count';
    const eventCountInput = document.createElement('input');
    eventCountInput.type = 'number';
    eventCountInput.min = '1';
    eventCountInput.value = workout.eventCount;
    eventCountInput.addEventListener('change', () => updateWorkout(index, { eventCount: parsePositiveInteger(eventCountInput.value, 1) }));
    eventCountGroup.appendChild(eventCountInput);

    const liveTeamGroup = document.createElement('label');
    liveTeamGroup.className = 'mini-field';
    liveTeamGroup.textContent = 'Track score for';
    const liveTeamSelect = document.createElement('select');
    liveTeamSelect.innerHTML = `
        <option value="selected-team">Selected team</option>
        <option value="opponent-team">Opponent team</option>
    `;
    liveTeamSelect.value = workout.liveTeamSource;
    liveTeamSelect.addEventListener('change', () => updateWorkout(index, { liveTeamSource: liveTeamSelect.value }));
    liveTeamGroup.appendChild(liveTeamSelect);

    const totalLine = document.createElement('p');
    totalLine.className = 'workout-total';
    const currentTotal = calculateWorkoutTotal(workout);
    const multiplierValue = calculateWorkoutMultiplier(workout);
    const multiplierLabel = workout.multiplierType === 'live-score'
        ? `${describeLiveSource(workout.liveTeamSource)} score (${multiplierValue})`
        : `${workout.eventCount} event${workout.eventCount === 1 ? '' : 's'}`;
<<<<<<< HEAD
    
    let completedReps = workout.completedReps;
    if ((workout.multiplierType === 'event-count' || workout.multiplierType === 'live-score') && workout.completedEvents) {
        completedReps = workout.baseReps * workout.completedEvents.filter(Boolean).length;
    }

    if (workout.multiplierType === 'event-count' || workout.multiplierType === 'live-score') {
        const completedCount = workout.completedEvents.filter(Boolean).length;
        const totalCount = workout.multiplierType === 'event-count' ? workout.eventCount : workout.completedEvents.length;
        if (completedCount === totalCount) {
            totalLine.textContent = `Completed: ${completedReps} reps | ${getWorkoutLabel(workout)} · ${multiplierLabel}`;
        } else if (completedCount > 0) {
            totalLine.textContent = `Partial: ${completedReps}/${currentTotal} reps | ${getWorkoutLabel(workout)} · ${multiplierLabel}`;
        } else {
            totalLine.textContent = `Current total: ${currentTotal} reps | ${getWorkoutLabel(workout)} · ${multiplierLabel}`;
        }
    } else {
        totalLine.textContent = workout.completed
            ? `Completed: ${workout.completedReps ?? currentTotal} reps | ${getWorkoutLabel(workout)} · ${multiplierLabel}`
            : `Current total: ${currentTotal} reps | ${getWorkoutLabel(workout)} · ${multiplierLabel}`;
    }
=======
    totalLine.textContent = workout.completed
        ? `Completed: ${workout.completedReps ?? currentTotal} reps | ${getWorkoutLabel(workout)} · ${multiplierLabel}`
        : `Current total: ${currentTotal} reps | ${getWorkoutLabel(workout)} · ${multiplierLabel}`;
>>>>>>> b19d3e5 (ADD: Overhaul. Completed custom workout input implementation)

    const actions = document.createElement('div');
    actions.className = 'workout-actions';

<<<<<<< HEAD
    // Partial completion UI for event-count and live-score workouts
    let partialSection = null;
    if (workout.multiplierType === 'event-count' || workout.multiplierType === 'live-score') {
        partialSection = document.createElement('div');
        partialSection.className = 'partial-completion';
        const partialTitle = document.createElement('p');
        partialTitle.textContent = workout.multiplierType === 'live-score' ? 'Mark score points completed:' : 'Mark events completed:';
        partialSection.appendChild(partialTitle);
        
        workout.completedEvents.forEach((isCompleted, eventIndex) => {
            const label = document.createElement('label');
            label.className = 'event-checkbox';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = isCompleted;
            checkbox.addEventListener('change', () => toggleEventCompleted(index, eventIndex));
            label.appendChild(checkbox);
            const labelText = workout.multiplierType === 'live-score' ? ` Point ${eventIndex + 1}` : ` Event ${eventIndex + 1}`;
            label.appendChild(document.createTextNode(labelText));
            partialSection.appendChild(label);
        });
    }

    const completeButton = document.createElement('button');
    completeButton.type = 'button';
    completeButton.className = 'complete-workout-button';
    if (workout.multiplierType === 'event-count' || workout.multiplierType === 'live-score') {
        const allCompleted = workout.completedEvents.every(Boolean);
        completeButton.textContent = allCompleted ? 'Undo all complete' : 'Mark all complete';
        completeButton.addEventListener('click', () => toggleAllEventsCompleted(index));
    } else {
        completeButton.textContent = workout.completed ? 'Undo complete' : 'Mark complete';
        completeButton.addEventListener('click', () => toggleWorkoutCompleted(index));
    }
=======
    const completeButton = document.createElement('button');
    completeButton.type = 'button';
    completeButton.className = 'complete-workout-button';
    completeButton.textContent = workout.completed ? 'Undo complete' : 'Mark complete';
    completeButton.addEventListener('click', () => toggleWorkoutCompleted(index));
>>>>>>> b19d3e5 (ADD: Overhaul. Completed custom workout input implementation)

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'remove-workout-button';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => removeWorkout(index));

    actions.appendChild(completeButton);
    actions.appendChild(removeButton);

    meta.appendChild(baseRepsGroup);
    meta.appendChild(multiplierTypeGroup);
    meta.appendChild(eventLabelGroup);
    meta.appendChild(eventCountGroup);
    meta.appendChild(liveTeamGroup);

    if (workout.multiplierType === 'live-score') {
        eventCountGroup.classList.add('is-hidden');
    } else {
        liveTeamGroup.classList.add('is-hidden');
    }

<<<<<<< HEAD
    const progressDisplay = renderWorkoutProgress(workout);

    card.appendChild(titleRow);
    card.appendChild(meta);
    card.appendChild(totalLine);
    card.appendChild(progressDisplay);
    if (partialSection) {
        card.appendChild(partialSection);
    }
=======
    card.appendChild(titleRow);
    card.appendChild(meta);
    card.appendChild(totalLine);
>>>>>>> b19d3e5 (ADD: Overhaul. Completed custom workout input implementation)
    card.appendChild(actions);

    return card;
}

function renderWorkoutSummary(workouts) {
    const summary = document.getElementById('workout-summary');
    if (!summary) {
        return;
    }

    if (!state.selectedSport || !state.selectedTeam) {
        summary.textContent = 'Pick a team to save and track workouts.';
        return;
    }

    if (!workouts.length) {
        summary.textContent = 'No workouts saved yet. Add one above.';
<<<<<<< HEAD
        return;
    }

    const dueWorkouts = workouts.filter((workout) => !workout.completed);
    const completedWorkouts = workouts.filter((workout) => workout.completed);
    const dueReps = dueWorkouts.reduce((total, workout) => {
        const fullTotal = calculateWorkoutTotal(workout);
        const doneReps = (workout.multiplierType === 'event-count' || workout.multiplierType === 'live-score') && workout.completedEvents 
            ? workout.baseReps * workout.completedEvents.filter(Boolean).length 
            : 0;
        return total + (fullTotal - doneReps);
    }, 0);
    const completedReps = completedWorkouts.reduce((total, workout) => total + (workout.completedReps ?? calculateWorkoutTotal(workout)), 0);

    summary.textContent = `${dueWorkouts.length} due (${dueReps} reps) · ${completedWorkouts.length} completed (${completedReps} reps)`;
}

function renderWorkoutSection() {
    const workoutList = document.getElementById('workout-list');
    const workoutHelp = document.getElementById('workout-help');

    if (!workoutList || !workoutHelp) {
        return;
    }

    populateWorkoutFormDefaults();

    if (!state.selectedSport || !state.selectedTeam) {
        workoutList.innerHTML = '<p class="status-message">Choose a sport and team to save workouts.</p>';
        workoutHelp.textContent = 'Pick a sport and team before adding workouts.';
        renderWorkoutSummary([]);
        return;
    }

    const workouts = getStoredWorkouts(state.selectedSport, state.selectedTeam);
    workoutHelp.textContent = `Workouts are saved locally for ${state.selectedTeam}. Custom events use your own count, and live-score workouts refresh from ESPN.`;
    renderWorkoutSummary(workouts);

    workoutList.innerHTML = '';
    if (!workouts.length) {
        workoutList.innerHTML = '<p class="status-message">No saved workouts yet. Add one above.</p>';
        return;
    }

    workouts.forEach((workout, index) => {
        const card = buildWorkoutCard(workout, index);
        workoutList.appendChild(card);
    });
}

// Calculates progress for a workout, including partial completion for event-count and live-score workouts
function calculateWorkoutProgress(workout) {
    if ((workout.multiplierType === 'event-count' || workout.multiplierType === 'live-score') && workout.completedEvents) {
        const completedCount = workout.completedEvents.filter(Boolean).length;
        const totalCount = workout.multiplierType === 'event-count' ? workout.eventCount : workout.completedEvents.length;
        const completedReps = workout.baseReps * completedCount;
        const totalReps = calculateWorkoutTotal(workout);
        const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        
        return {
            completedSets: completedCount,
            totalSets: totalCount,
            completedReps,
            totalReps,
            completionPercent
        };
    } else if (workout.multiplierType === 'live-score') {
        const totalReps = calculateWorkoutTotal(workout);
        const completedReps = workout.completed ? totalReps : 0;
        const completionPercent = workout.completed ? 100 : 0;
        
        return {
            completedSets: workout.completed ? 1 : 0,
            totalSets: 1,
            completedReps,
            totalReps,
            completionPercent
        };
    }
    
    return {
        completedSets: 0,
        totalSets: 1,
        completedReps: 0,
        totalReps: calculateWorkoutTotal(workout),
        completionPercent: 0
    };
}

// Renders a progress bar and stats line for a workout, showing partial completion for event-count workouts
function renderWorkoutProgress(workout) {
    const progress = calculateWorkoutProgress(workout);
    const progressDiv = document.createElement('div');
    progressDiv.className = 'workout-progress';
    
    const statsLine = document.createElement('p');
    statsLine.className = 'progress-stats';
    statsLine.textContent = `${progress.completedReps}/${progress.totalReps} reps · ${progress.completedSets}/${progress.totalSets} sets · ${progress.completionPercent}% complete`;
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar-container';
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-bar-fill';
    progressFill.style.width = `${progress.completionPercent}%`;
    progressBar.appendChild(progressFill);
    
    progressDiv.appendChild(statsLine);
    progressDiv.appendChild(progressBar);
    
    return progressDiv;
}

async function initTeamSelection(teamName) {
    state.selectedTeam = teamName;
    populateLiveScoreOptions();
    updateBuilderVisibility();

    if (!teamName) {
        state.games = [];
        clearRefreshTimer();
        setMessage('team-status', 'Choose a team to load live games.');
        setMessage('games-output', 'Choose a team to see live games and scores.');
        renderWorkoutSection();
        return;
    }

    setMessage('team-status', `Showing live data for ${teamName}.`);
    await fetchTeamGames(teamName);
    startGameRefresh();
    renderWorkoutSection();
}

=======
        return;
    }

    const dueWorkouts = workouts.filter((workout) => !workout.completed);
    const completedWorkouts = workouts.filter((workout) => workout.completed);
    const dueReps = dueWorkouts.reduce((total, workout) => total + calculateWorkoutTotal(workout), 0);
    const completedReps = completedWorkouts.reduce((total, workout) => total + (workout.completedReps ?? calculateWorkoutTotal(workout)), 0);

    summary.textContent = `${dueWorkouts.length} due (${dueReps} reps) · ${completedWorkouts.length} completed (${completedReps} reps)`;
}

function renderWorkoutSection() {
    const workoutList = document.getElementById('workout-list');
    const workoutHelp = document.getElementById('workout-help');

    if (!workoutList || !workoutHelp) {
        return;
    }

    populateWorkoutFormDefaults();

    if (!state.selectedSport || !state.selectedTeam) {
        workoutList.innerHTML = '<p class="status-message">Choose a sport and team to save workouts.</p>';
        workoutHelp.textContent = 'Pick a sport and team before adding workouts.';
        renderWorkoutSummary([]);
        return;
    }

    const workouts = getStoredWorkouts(state.selectedSport, state.selectedTeam);
    workoutHelp.textContent = `Workouts are saved locally for ${state.selectedTeam}. Custom events use your own count, and live-score workouts refresh from ESPN.`;
    renderWorkoutSummary(workouts);

    workoutList.innerHTML = '';
    if (!workouts.length) {
        workoutList.innerHTML = '<p class="status-message">No saved workouts yet. Add one above.</p>';
        return;
    }

    workouts.forEach((workout, index) => {
        const card = buildWorkoutCard(workout, index);
        workoutList.appendChild(card);
    });
}

async function initTeamSelection(teamName) {
    state.selectedTeam = teamName;
    populateLiveScoreOptions();
    updateBuilderVisibility();

    if (!teamName) {
        state.games = [];
        clearRefreshTimer();
        setMessage('team-status', 'Choose a team to load live games.');
        setMessage('games-output', 'Choose a team to see live games and scores.');
        renderWorkoutSection();
        return;
    }

    setMessage('team-status', `Showing live data for ${teamName}.`);
    await fetchTeamGames(teamName);
    startGameRefresh();
    renderWorkoutSection();
}

>>>>>>> b19d3e5 (ADD: Overhaul. Completed custom workout input implementation)
function init() {
    renderSportButtons();
    populateLiveScoreOptions();
    updateBuilderVisibility();
    renderWorkoutSection();

    const teamDropdown = document.getElementById('team-dropdown');
    if (teamDropdown) {
        teamDropdown.addEventListener('change', (event) => {
            initTeamSelection(event.target.value);
        });
    }

    const workoutForm = document.getElementById('workout-form');
    if (workoutForm) {
        workoutForm.addEventListener('submit', addWorkoutFromForm);
    }

    const multiplierType = document.getElementById('workout-multiplier-type');
    if (multiplierType) {
        multiplierType.addEventListener('change', updateBuilderVisibility);
    }
}

init();

