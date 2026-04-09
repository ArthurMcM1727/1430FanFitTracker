const STORAGE_KEY = 'fanfit-tracker-state-v1';

const fallbackCatalog = {
    sports: {
        football: {
            label: 'Football',
            accent: '#cc4b37',
            teams: [
                { id: 'buffalo-bills', name: 'Buffalo Bills' },
                { id: 'detroit-lions', name: 'Detroit Lions' },
                { id: 'kansas-city-chiefs', name: 'Kansas City Chiefs' },
                { id: 'san-francisco-49ers', name: 'San Francisco 49ers' }
            ],
            rules: [
                { event: 'Touchdown', exercise: 'Push-ups', amount: 20, unit: 'reps' },
                { event: 'Penalty', exercise: 'Squats', amount: 12, unit: 'reps' },
                { event: 'First Down', exercise: 'Mountain Climbers', amount: 16, unit: 'reps' },
                { event: 'Turnover', exercise: 'Burpees', amount: 10, unit: 'reps' },
                { event: 'Field Goal', exercise: 'Plank Hold', amount: 30, unit: 'seconds' },
                { event: 'Sack', exercise: 'Lunges', amount: 14, unit: 'reps' }
            ]
        },
        hockey: {
            label: 'Hockey',
            accent: '#1f6ea7',
            teams: [
                { id: 'boston-bruins', name: 'Boston Bruins' },
                { id: 'chicago-blackhawks', name: 'Chicago Blackhawks' },
                { id: 'pittsburgh-penguins', name: 'Pittsburgh Penguins' },
                { id: 'tampa-bay-lightning', name: 'Tampa Bay Lightning' }
            ],
            rules: [
                { event: 'Goal', exercise: 'Jumping Jacks', amount: 24, unit: 'reps' },
                { event: 'Penalty', exercise: 'Wall Sits', amount: 35, unit: 'seconds' },
                { event: 'Power Play', exercise: 'Bicycle Crunches', amount: 18, unit: 'reps' },
                { event: 'Save', exercise: 'Push-ups', amount: 15, unit: 'reps' },
                { event: 'Shot Block', exercise: 'High Knees', amount: 20, unit: 'reps' },
                { event: 'Overtime', exercise: 'Plank Hold', amount: 45, unit: 'seconds' }
            ]
        },
        baseball: {
            label: 'Baseball',
            accent: '#2f8f5b',
            teams: [
                { id: 'new-york-yankees', name: 'New York Yankees' },
                { id: 'los-angeles-dodgers', name: 'Los Angeles Dodgers' },
                { id: 'chicago-cubs', name: 'Chicago Cubs' },
                { id: 'boston-red-sox', name: 'Boston Red Sox' }
            ],
            rules: [
                { event: 'Home Run', exercise: 'Sit-ups', amount: 20, unit: 'reps' },
                { event: 'Strikeout', exercise: 'Burpees', amount: 12, unit: 'reps' },
                { event: 'Walk', exercise: 'Squats', amount: 14, unit: 'reps' },
                { event: 'Double Play', exercise: 'Mountain Climbers', amount: 18, unit: 'reps' },
                { event: 'Stolen Base', exercise: 'Jumping Jacks', amount: 24, unit: 'reps' },
                { event: 'Extra Innings', exercise: 'Plank Hold', amount: 40, unit: 'seconds' }
            ]
        }
    }
};

const defaultSeasonName = `${new Date().getFullYear()} Season`;

const defaultState = {
    sportKey: 'football',
    teamId: 'buffalo-bills',
    goalPerGame: 4,
    seasonName: defaultSeasonName,
    gamesTracked: 0,
    dueWorkouts: [],
    completedWorkouts: [],
    seasonHistory: [],
    lastBatchSize: 0,
    lastGeneratedAt: null
};

const elements = {};

let catalog = fallbackCatalog;
let state = loadState();

function cloneDefaultState() {
    return JSON.parse(JSON.stringify(defaultState));
}

function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadState() {
    try {
        const rawState = window.localStorage.getItem(STORAGE_KEY);
        if (!rawState) {
            return cloneDefaultState();
        }

        const parsedState = JSON.parse(rawState);
        return {
            ...cloneDefaultState(),
            ...parsedState,
            dueWorkouts: Array.isArray(parsedState.dueWorkouts) ? parsedState.dueWorkouts : [],
            completedWorkouts: Array.isArray(parsedState.completedWorkouts) ? parsedState.completedWorkouts : [],
            seasonHistory: Array.isArray(parsedState.seasonHistory) ? parsedState.seasonHistory : []
        };
    } catch {
        return cloneDefaultState();
    }
}

function saveState() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function loadCatalog() {
    try {
        const response = await fetch('../teams.json', { cache: 'no-store' });
        if (!response.ok) {
            return fallbackCatalog;
        }

        const data = await response.json();
        if (!data?.sports) {
            return fallbackCatalog;
        }

        return data;
    } catch {
        return fallbackCatalog;
    }
}

function getSportKeys() {
    return Object.keys(catalog.sports);
}

function getSportData(sportKey = state.sportKey) {
    return catalog.sports[sportKey] ?? catalog.sports[getSportKeys()[0]];
}

function getTeamData(sportKey = state.sportKey, teamId = state.teamId) {
    const sport = getSportData(sportKey);
    return sport.teams.find((team) => team.id === teamId) ?? sport.teams[0];
}

function syncStateToCatalog() {
    const sportKeys = getSportKeys();
    if (!sportKeys.includes(state.sportKey)) {
        state.sportKey = sportKeys[0];
    }

    const sport = getSportData();
    if (!sport.teams.some((team) => team.id === state.teamId)) {
        state.teamId = sport.teams[0].id;
    }

    if (!state.seasonName) {
        state.seasonName = defaultSeasonName;
    }

    state.goalPerGame = clampGoal(state.goalPerGame);
}

function clampGoal(value) {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
        return defaultState.goalPerGame;
    }

    return Math.min(12, Math.max(1, Math.round(numericValue)));
}

function formatDate(timestamp) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    }).format(new Date(timestamp));
}

function formatWorkout(workout) {
    return `${workout.amount} ${workout.exercise}`;
}

function setAccentFromSport() {
    const sport = getSportData();
    document.documentElement.style.setProperty('--accent', sport.accent);
}

function renderSportCards() {
    const sportCards = Object.entries(catalog.sports)
        .map(([sportKey, sport]) => {
            const isActive = sportKey === state.sportKey;
            return `
				<button class="sport-card ${isActive ? 'active' : ''}" type="button" data-sport="${sportKey}">
					<span>${sport.label}</span>
					<span>${sport.teams.length} teams ready</span>
				</button>
			`;
        })
        .join('');

    elements.sportCards.innerHTML = sportCards;
    elements.sportCards.querySelectorAll('[data-sport]').forEach((button) => {
        button.addEventListener('click', () => setSport(button.dataset.sport));
    });
}

function renderTeamOptions() {
    const sport = getSportData();
    elements.teamSelect.innerHTML = sport.teams
        .map((team) => `<option value="${team.id}">${team.name}</option>`)
        .join('');
    elements.teamSelect.value = state.teamId;
}

function renderStats() {
    elements.dueCount.textContent = state.dueWorkouts.length;
    elements.completedCount.textContent = state.completedWorkouts.length;
    elements.gamesCount.textContent = state.gamesTracked;
    elements.goalCount.textContent = state.goalPerGame;

    elements.dueBadge.textContent = `${state.dueWorkouts.length} due`;
    elements.completedBadge.textContent = `${state.completedWorkouts.length} done`;
    elements.historyBadge.textContent = `${state.seasonHistory.length} saved`;
}

function renderSelectionSummary() {
    const sport = getSportData();
    const team = getTeamData();

    elements.selectionSummary.textContent = `${sport.label} / ${team.name} / ${state.goalPerGame} workouts per game`;
    elements.summaryText.textContent = `${state.seasonName} is tracking ${team.name} in ${sport.label}. ${state.dueWorkouts.length} workouts are due, ${state.completedWorkouts.length} are complete, and the browser is saving everything locally.`;
}

function renderLatestBatch() {
    if (!state.lastGeneratedAt || state.lastBatchSize === 0) {
        elements.latestBatch.textContent = 'No workout batch has been generated yet.';
        return;
    }

    elements.latestBatch.innerHTML = `
		<strong>Latest batch</strong>
		<span>Generated ${formatDate(state.lastGeneratedAt)} for ${state.lastBatchSize} workout${state.lastBatchSize === 1 ? '' : 's'}.</span>
	`;
}

function renderWorkoutList() {
    if (state.dueWorkouts.length === 0) {
        elements.workoutList.innerHTML = '';
        elements.emptyWorkoutState.classList.remove('hidden');
        return;
    }

    elements.emptyWorkoutState.classList.add('hidden');
    elements.workoutList.innerHTML = state.dueWorkouts
        .map((workout) => `
			<li class="workout-item">
				<div class="workout-meta">
					<span class="event-chip">${workout.event}</span>
					<span class="workout-title">${formatWorkout(workout)}</span>
					<span class="workout-subtitle">${workout.teamName} generated this from a ${workout.sportLabel.toLowerCase()} event.</span>
				</div>
				<button class="complete-button" type="button" data-complete-id="${workout.id}">Mark complete</button>
			</li>
		`)
        .join('');

    elements.workoutList.querySelectorAll('[data-complete-id]').forEach((button) => {
        button.addEventListener('click', () => completeWorkout(button.dataset.completeId));
    });
}

function renderCompletedList() {
    if (state.completedWorkouts.length === 0) {
        elements.completedList.innerHTML = '';
        return;
    }

    elements.completedList.innerHTML = state.completedWorkouts
        .slice(0, 8)
        .map((workout) => `
			<li class="completed-item">
				<strong>${formatWorkout(workout)}</strong>
				<span>${workout.event} for ${workout.teamName} · completed ${formatDate(workout.completedAt)}</span>
			</li>
		`)
        .join('');
}

function renderHistory() {
    if (state.seasonHistory.length === 0) {
        elements.seasonHistory.innerHTML = '';
        elements.emptyHistoryState.classList.remove('hidden');
        return;
    }

    elements.emptyHistoryState.classList.add('hidden');
    elements.seasonHistory.innerHTML = state.seasonHistory
        .slice()
        .reverse()
        .map((entry) => `
			<li class="history-item">
				<div class="history-meta">
					<span class="history-chip">${entry.seasonName}</span>
					<strong>${entry.teamName} · ${entry.sportLabel}</strong>
					<span>${entry.completedCount} completed, ${entry.generatedCount} generated, ${entry.gamesTracked ?? 0} game${(entry.gamesTracked ?? 0) === 1 ? '' : 's'} tracked, archived ${formatDate(entry.archivedAt)}</span>
				</div>
			</li>
		`)
        .join('');
}

function renderFormValues() {
    elements.goalInput.value = state.goalPerGame;
    elements.seasonNameInput.value = state.seasonName;
}

function renderAll() {
    setAccentFromSport();
    renderSportCards();
    renderTeamOptions();
    renderStats();
    renderSelectionSummary();
    renderLatestBatch();
    renderWorkoutList();
    renderCompletedList();
    renderHistory();
    renderFormValues();
}

function setStatus(message) {
    elements.statusMessage.textContent = message;
}

function setSport(sportKey) {
    if (!catalog.sports[sportKey] || sportKey === state.sportKey) {
        return;
    }

    state.sportKey = sportKey;
    state.teamId = getSportData(sportKey).teams[0].id;
    state.dueWorkouts = [];
    state.completedWorkouts = [];
    state.gamesTracked = 0;
    state.lastBatchSize = 0;
    state.lastGeneratedAt = null;

    saveState();
    renderAll();
    setStatus(`Switched to ${getSportData().label}. Pick a team and generate a new workout.`);
}

function setTeam(teamId) {
    if (state.teamId === teamId) {
        return;
    }

    state.teamId = teamId;
    saveState();
    renderAll();
    setStatus(`Favorite team saved as ${getTeamData().name}.`);
}

function updateGoal(value) {
    state.goalPerGame = clampGoal(value);
    saveState();
    renderStats();
    renderSelectionSummary();
    renderFormValues();
}

function updateSeasonName(value) {
    const trimmedValue = value.trim();
    state.seasonName = trimmedValue || defaultSeasonName;
    saveState();
    renderSelectionSummary();
    renderHistory();
}

function createWorkoutBatch() {
    const sport = getSportData();
    const team = getTeamData();
    const workoutCount = clampGoal(elements.goalInput.value || state.goalPerGame);
    const batch = [];

    for (let index = 0; index < workoutCount; index += 1) {
        const rule = sport.rules[(index + Math.floor(Math.random() * sport.rules.length)) % sport.rules.length];
        const variation = rule.unit === 'seconds' ? 0 : index % 3;

        batch.push({
            id: createId(),
            sportKey: state.sportKey,
            sportLabel: sport.label,
            teamId: team.id,
            teamName: team.name,
            event: rule.event,
            exercise: rule.exercise,
            amount: rule.amount + variation,
            unit: rule.unit,
            createdAt: new Date().toISOString()
        });
    }

    return batch;
}

function generateWorkout() {
    const batch = createWorkoutBatch();
    state.dueWorkouts = [...batch, ...state.dueWorkouts];
    state.gamesTracked += 1;
    state.lastBatchSize = batch.length;
    state.lastGeneratedAt = new Date().toISOString();

    saveState();
    renderAll();

    setStatus(`Generated ${batch.length} workout${batch.length === 1 ? '' : 's'} for ${getTeamData().name}.`);
}

function completeWorkout(workoutId) {
    const workoutIndex = state.dueWorkouts.findIndex((workout) => workout.id === workoutId);
    if (workoutIndex === -1) {
        return;
    }

    const [workout] = state.dueWorkouts.splice(workoutIndex, 1);
    state.completedWorkouts.unshift({
        ...workout,
        completedAt: new Date().toISOString()
    });

    saveState();
    renderAll();
    setStatus(`${workout.exercise} logged as complete.`);
}

function startNewSeason() {
    const completedCount = state.completedWorkouts.length;
    const generatedCount = state.completedWorkouts.length + state.dueWorkouts.length;

    if (generatedCount > 0) {
        state.seasonHistory.push({
            id: createId(),
            seasonName: state.seasonName,
            sportLabel: getSportData().label,
            teamName: getTeamData().name,
            gamesTracked: state.gamesTracked,
            generatedCount,
            completedCount,
            archivedAt: new Date().toISOString()
        });
    }

    state.dueWorkouts = [];
    state.completedWorkouts = [];
    state.gamesTracked = 0;
    state.lastBatchSize = 0;
    state.lastGeneratedAt = null;

    const nextSeasonNumber = state.seasonHistory.length + 1;
    state.seasonName = `${new Date().getFullYear()} Season ${nextSeasonNumber}`;

    saveState();
    renderAll();
    setStatus('Season archived. Your workout queue has been cleared for the next run.');
}

function bindEvents() {
    elements.generateWorkoutBtn.addEventListener('click', generateWorkout);
    elements.newSeasonBtn.addEventListener('click', startNewSeason);
    elements.teamSelect.addEventListener('change', (event) => setTeam(event.target.value));
    elements.goalInput.addEventListener('change', (event) => updateGoal(event.target.value));
    elements.goalInput.addEventListener('input', (event) => updateGoal(event.target.value));
    elements.seasonNameInput.addEventListener('change', (event) => updateSeasonName(event.target.value));
}

function cacheElements() {
    elements.sportCards = document.getElementById('sportCards');
    elements.teamSelect = document.getElementById('teamSelect');
    elements.goalInput = document.getElementById('goalInput');
    elements.seasonNameInput = document.getElementById('seasonNameInput');
    elements.generateWorkoutBtn = document.getElementById('generateWorkoutBtn');
    elements.newSeasonBtn = document.getElementById('newSeasonBtn');
    elements.statusMessage = document.getElementById('statusMessage');
    elements.selectionSummary = document.getElementById('selectionSummary');
    elements.dueCount = document.getElementById('dueCount');
    elements.completedCount = document.getElementById('completedCount');
    elements.gamesCount = document.getElementById('gamesCount');
    elements.goalCount = document.getElementById('goalCount');
    elements.dueBadge = document.getElementById('dueBadge');
    elements.completedBadge = document.getElementById('completedBadge');
    elements.historyBadge = document.getElementById('historyBadge');
    elements.latestBatch = document.getElementById('latestBatch');
    elements.workoutList = document.getElementById('workoutList');
    elements.completedList = document.getElementById('completedList');
    elements.emptyWorkoutState = document.getElementById('emptyWorkoutState');
    elements.summaryText = document.getElementById('summaryText');
    elements.seasonHistory = document.getElementById('seasonHistory');
    elements.emptyHistoryState = document.getElementById('emptyHistoryState');
}

async function init() {
    cacheElements();
    catalog = await loadCatalog();
    syncStateToCatalog();
    bindEvents();
    renderAll();
    saveState();

    setStatus('Select a team, generate a workout, and start logging your season progress.');
}

init();
