# Arithmetic Performance Task

A polished, static arithmetic experiment for GitHub Pages and Qualtrics.

The task presents repeated addition items made from sets of two-digit numbers. It includes:

- a timed work period
- optional practice trials
- optional immediate feedback
- a configurable performance target
- trial-by-trial logging
- a final summary screen
- `postMessage` integration for Qualtrics or any parent page

## File structure

```text
arithmetic-task-gh-pages/
├── index.html
├── style.css
├── script.js
├── config/
│   └── constants.js
├── qualtrics-embed-example.md
└── README.md
```

## Quick start

1. Upload the folder to a GitHub repository.
2. Enable GitHub Pages for the repository.
3. Open the published `index.html` URL.
4. For Qualtrics, embed the GitHub Pages URL in an iframe and listen for `postMessage` events from the task.

## Default behavior

By default, the task runs with:

- 180-second timed block
- performance target of 25 correct responses
- 5 practice trials
- immediate correctness feedback turned on
- 3 to 5 addends per item
- two-digit numbers ranging from 10 to 99

## Main configuration

Edit `config/constants.js` to change the default task behavior.

```js
window.TASK_DEFAULTS = Object.freeze({
  WORK_PERIOD_SECONDS: 180,
  PERFORMANCE_TARGET_CORRECT: 25,
  ENABLE_PRACTICE_BLOCK: true,
  PRACTICE_TRIAL_COUNT: 5,
  SHOW_IMMEDIATE_FEEDBACK: true,
  FEEDBACK_DURATION_MS: 700,
  MIN_ADDENDS: 3,
  MAX_ADDENDS: 5,
  MIN_NUMBER: 10,
  MAX_NUMBER: 99,
  POST_MESSAGE_NAMESPACE: "arithmetic-task",
  POST_MESSAGE_TARGET_ORIGIN: "*"
});
```

## URL parameter overrides

The task also supports lightweight runtime overrides through URL parameters, which is handy for Qualtrics conditions.

Example:

```text
https://YOUR-USERNAME.github.io/YOUR-REPO/?participantId=R_12345&condition=feedbackOn&workSeconds=120&target=20&practice=1&practiceTrials=3&feedback=1
```

Supported parameters:

- `participantId`
- `sessionId`
- `condition`
- `workSeconds`
- `target`
- `practice` (`1` or `0`)
- `practiceTrials`
- `feedback` (`1` or `0`)
- `minAddends`
- `maxAddends`
- `minNumber`
- `maxNumber`
- `targetOrigin`

## Trial logging

Each completed trial is posted with `window.postMessage` to the parent page when embedded, or to the same window in standalone mode.

### Trial event

```js
{
  source: "arithmetic-task",
  eventType: "trial",
  type: "arithmetic-task:trial",
  sentAtIso: "2026-04-11T09:15:33.000Z",
  payload: {
    taskName: "Arithmetic Performance Task",
    taskVersion: "1.0.0",
    participantId: "R_12345",
    sessionId: "",
    condition: "feedbackOn",
    overallTrialIndex: 12,
    phase: "main",
    phaseTrialIndex: 7,
    displayedAtIso: "2026-04-11T09:15:31.100Z",
    submittedAtIso: "2026-04-11T09:15:33.000Z",
    prompt: "24 + 58 + 39",
    addends: [24, 58, 39],
    setSize: 3,
    correctAnswer: 121,
    response: 121,
    isCorrect: true,
    timedOut: false,
    rtMs: 1900,
    remainingTimeMs: 74218,
    targetCorrect: 25
  }
}
```

### Completion event

When the task ends, it posts a completion message with a summary plus the main-block and practice-block trial arrays.

```js
{
  source: "arithmetic-task",
  eventType: "completed",
  type: "arithmetic-task:completed",
  payload: {
    summary: {
      correct: 27,
      attempted: 31,
      accuracy: "87%",
      meanRtMs: 1824,
      bestStreak: 8,
      targetMet: true
    },
    trials: [...],
    practiceTrials: [...]
  }
}
```

## Qualtrics integration notes

The example integration is in `qualtrics-embed-example.md`.

Recommended pattern:

- host the task on GitHub Pages
- embed it with an iframe inside a Qualtrics question
- hide the Qualtrics header, buttons, and progress UI while the task runs
- listen for `postMessage` events from the iframe
- write summary fields into embedded data
- restore the Qualtrics UI when the task completes

## Important Qualtrics note

Qualtrics embedded-data fields are not ideal for storing very large trial arrays. For moderate task lengths, storing JSON may be acceptable. For long tasks or larger datasets, keep the trial-level messages in JavaScript or send them to an external endpoint instead of relying on a single large embedded-data field.

## Editing guide

To make the task easier or harder:

- reduce or increase `MIN_ADDENDS` and `MAX_ADDENDS`
- narrow or widen `MIN_NUMBER` and `MAX_NUMBER`
- shorten or lengthen `WORK_PERIOD_SECONDS`
- raise or lower `PERFORMANCE_TARGET_CORRECT`
- turn feedback on or off with `SHOW_IMMEDIATE_FEEDBACK`
- disable practice with `ENABLE_PRACTICE_BLOCK`

## Deployment checklist

- confirm the GitHub Pages URL loads `index.html`
- confirm `config/constants.js` loads before `script.js`
- test one standalone run in the browser
- test one embedded run inside Qualtrics preview
- verify that trial and completion `postMessage` events are received
- verify that the Qualtrics UI is restored after task completion
