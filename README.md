# FanFit Tracker

FanFit Tracker turns live sports data into a workout builder. Users pick a sport and team, then create workouts based on custom game events like fouls, power plays, hat tricks, or the live score from ESPN.

## Key Features

- Load teams for football, hockey, baseball, and basketball from ESPN
- Create custom workouts with a base rep count and a custom event label
- Multiply workouts by a manual event count or the live score for the selected team or opponent
- Store workouts locally per sport and team
- Track due and completed reps in a dark-mode friendly interface

## How It Works

1. The user selects a sport and then chooses a team from the ESPN team list.
2. The app shows current games and scores for that team.
3. The user creates workouts with either a custom event count or the live score as the multiplier.
4. Workouts are saved in localStorage and can be marked complete, edited, or removed.

## Project Files

- [README.md](README.md) - Project overview
- [UI_sketch.html](UI_sketch.html) - Early UI sketch and layout idea for the app
- [source/index.html](source/index.html) - Main page structure
- [source/script.js](source/script.js) - ESPN data loading and workout logic
- [source/style.css](source/style.css) - Responsive styling

## Notes

- The app no longer uses a local team JSON file.
- ESPN is the only team data source.