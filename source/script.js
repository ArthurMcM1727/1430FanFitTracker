

function LoadTeams() {
    fetch('teams.json')
        .then(response => response.json())
        .then(data => {
            const teamSelect = document.getElementById('teamSelect');
            data.teams.forEach(team => {
                const option = document.createElement('option');
                option.value = team.id;
                option.textContent = team.name;
                teamSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading teams:', error));
}