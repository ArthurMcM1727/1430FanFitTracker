# WEB 1430 FanFitTracker

FanFit Tracker is a fitness program that turns what happens in a sports game into a workout plan. Users pick a favorite team, watch the game, and then receive a short workout built from game events such as touchdowns, penalties, fouls, or other match moments. The app also tracks what exercises are due, what has been completed, and a season total so users can review their progress over time.

## Key Features

- Add a favorite team for your sport from the following 3 sports: 
    - Football
    - Hockey
    - Baseball
    - Basketball
- Generate a short workout list based on events from a game
- Track total exercises due and total exercises completed
- Store the user's favorite team, customized workout goals, due work, and completed work with JavaScript
- Show a season review so users can see their workout progress at the end of each season
- Use CSS to make creating workouts, logging workouts, and checking workout progress easy to use

## How It Works

1. The user selects a sport and chooses a favorite team.
2. Game events are used to create workout items.
3. The app shows how many exercises are still due and how many have been completed.
4. The user can log workouts as they finish them.
5. At the end of the season, the app provides a summary of total progress.

## Project Files

- [README.md](README.md) - Project overview and instructions
- [UI_sketch.html](UI_sketch.html) - Early UI sketch and layout idea for the app
- [teams.json](teams.json) - Team data placeholder for favorite team information

## Tech Stack

- HTML
- CSS
- JavaScript

## Current Status

This project is in an early build stage. The UI sketch shows the planned layout, and the data file is ready for team information. The README describes the intended feature set for the final project.

We will be using the ESPN API to pull real-time game scores, but the fouls and other events will be tracked manually by the user, because it is difficult to pull that data from the API.

We are currently implementing a JSON 

## Future Improvements

- Connect the team selector to real team data using the ESPN API
    - https://github.com/pseudo-r/Public-ESPN-API
- Automatically create workouts from game events
- Save completed workouts between sessions
- Add a clearer season summary page for user review