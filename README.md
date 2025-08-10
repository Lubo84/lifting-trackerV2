
# 4-Day Lifting Tracker (PWA)

A simple offline-capable web app to track a 12-week, 4-day training program with phase-aware guidance and reminders.

## Fixes
- **Week/Day toggle bug fixed**: added a `render()` helper so the Day selector correctly refreshes the workout.
- **Cache bump**: service worker updated to `lifting-tracker-v2` to force refresh.

## Features
- Weeks 1–12 with automatic phase rules for sets/reps/rest.
- 4 training days preconfigured.
- Save sets, reps, weight, RPE; mark sets complete.
- Rest timer + session volume.
- Reminders panel.
- Local save (browser localStorage), export/import JSON.
- Install as an app (PWA) for offline use.

