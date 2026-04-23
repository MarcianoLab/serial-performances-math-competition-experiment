# Arithmetic Performance Task

A static arithmetic task for GitHub Pages and Qualtrics.

Participants solve repeated addition problems under time pressure. The task can optionally show a row of previous competitors' scores during the main block so the current participant knows the score to beat.

## What This Task Does

- Runs as a plain HTML/CSS/JavaScript page
- Supports an optional practice block
- Can show immediate correctness feedback
- Tracks correct answers, trial logs, and summary metrics
- Accepts participant/session metadata through URL parameters
- Accepts a `previousScores` URL parameter to display prior competitors' scores
- Accepts a `hebrewMode` URL parameter to run the full task in Hebrew
- Sends trial-by-trial and completion data through `window.postMessage`
- Works as a standalone page or inside a Qualtrics iframe

## Files

- `index.html`: page shell
- `style.css`: styling
- `script.js`: task logic
- `constants.js`: default configuration
- `qualtrics-embed-example.md`: example Qualtrics setup

## Quick Start

1. Put the files in a GitHub repository.
2. Enable GitHub Pages for that repository.
3. Open the published URL and confirm the task loads.
4. Test a manual URL with `previousScores` before embedding it in Qualtrics.
5. After the standalone version looks right, embed the same URL pattern in Qualtrics.

## Typical Study Flow

1. Participant completes the task.
2. The tester records that participant's final score.
3. Before the next participant starts, Qualtrics passes the list of previous scores into the task URL.
4. The next participant sees those previous scores in the task and tries to beat the best one.

The task does not ask the participant to type previous scores inside the task itself. Those scores should be passed in through the Qualtrics link.

## Main Configuration

Edit [constants.js](/C:/Users/alonh/Documents/Codex/2026-04-23-hey-go-to-my-github-repo/constants.js:1) to change default behavior.

Important defaults:

- `WORK_PERIOD_SECONDS`: duration of the main block
- `PRACTICE_PERIOD_SECONDS`: duration of the practice block
- `BLOCK_TYPE`: `main`, `practice`, or `sequence`
- `PERFORMANCE_TARGET_CORRECT`: fallback target when no previous scores are provided
- `SHOW_PREVIOUS_SCORES_BOARD`: whether to show the previous-scores strip
- `ENABLE_PRACTICE_BLOCK`: whether the practice block is used in sequence mode
- `SHOW_PRACTICE_FEEDBACK` / `SHOW_MAIN_FEEDBACK`: immediate feedback toggles
- `MIN_ADDENDS`, `MAX_ADDENDS`: number of addends in each problem
- `MIN_NUMBER`, `MAX_NUMBER`: numeric range for addends

## URL Parameters

The task can be configured at runtime through URL parameters. This is the recommended way to use it with Qualtrics.

Common parameters:

- `participantId`
- `sessionId`
- `condition`
- `workSeconds`
- `practiceSeconds`
- `blockType`
- `target`
- `practice`
- `practiceFeedback`
- `mainFeedback`
- `minAddends`
- `maxAddends`
- `minNumber`
- `maxNumber`
- `showPreviousScoresBoard`
- `previousScores`
- `hebrewMode`

Example standalone URL:

```text
https://YOUR-USERNAME.github.io/YOUR-REPO/?participantId=R_12345&sessionId=pilot01&condition=competition&blockType=sequence&previousScores=Competitor%201:12|Competitor%202:5|Competitor%203:9
```

Hebrew example:

```text
https://YOUR-USERNAME.github.io/YOUR-REPO/?participantId=R_12345&sessionId=pilot01&condition=competition&blockType=sequence&hebrewMode=1&previousScores=Competitor%201:12|Competitor%202:5|Competitor%203:9
```

## How `previousScores` Works

`previousScores` should contain the earlier competitors in the order you want them shown from left to right.

Recommended simple format:

```text
Competitor 1:12|Competitor 2:5|Competitor 3:9
```

Also supported:

```json
[{"label":"Competitor 1","score":12},{"label":"Competitor 2","score":5}]
```

Behavior:

- The row of previous scores is shown on the intro screen and the main task screen
- Practice does not show the previous-scores strip
- The goal bar uses the highest previous score as its reference point
- The visual highlight is applied to the actual leading score, not simply the first entry
- The task treats beating the highest previous score as success

If no `previousScores` value is provided, the task falls back to `PERFORMANCE_TARGET_CORRECT`.

## Hebrew Mode

Set `hebrewMode=1` in the URL to switch the entire participant-facing task into Hebrew.

What changes in Hebrew mode:

- all interface labels and instructions
- button text
- intro, practice, main task, and summary screens
- final tester instruction
- page direction switches to right-to-left

What does not change:

- task timing
- arithmetic items
- scoring logic
- data fields sent through `postMessage`
- `previousScores` parsing and display order

## Local Testing

Open the file directly:

```text
file:///C:/.../index.html?previousScores=Competitor%201:12|Competitor%202:5
```

Or serve it locally:

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/index.html?previousScores=Competitor%201:12|Competitor%202:5|Competitor%203:9
```

## Data Sent Out Of The Task

The task posts messages using `window.postMessage`.

Events:

- `ready`: task loaded
- `started`: participant started the task
- `trial`: one completed trial
- `completed`: full summary and trial arrays
- `continue`: participant pressed Continue on the final screen

### Trial Payload Example

```js
{
  taskName: "Addition Task",
  taskVersion: "1.2.0",
  participantId: "R_12345",
  sessionId: "pilot01",
  condition: "competition",
  overallTrialIndex: 12,
  phase: "main",
  phaseTrialIndex: 7,
  prompt: "24 + 58 + 39",
  correctAnswer: 121,
  response: 121,
  isCorrect: true,
  rtMs: 1900,
  targetCorrect: 12,
  scoreToBeat: 12,
  previousScores: [
    { label: "Competitor 1", score: 12 },
    { label: "Competitor 2", score: 5 }
  ]
}
```

### Completion Payload Example

```js
{
  summary: {
    correct: 27,
    attempted: 31,
    accuracy: "87%",
    meanRtMs: 1824,
    bestStreak: 8,
    targetMet: true,
    scoreToBeat: 12
  },
  trials: [...],
  practiceTrials: [...]
}
```

## Qualtrics Notes

- The task is meant to be embedded in an iframe.
- Qualtrics should pass participant metadata and previous scores through the iframe URL.
- Qualtrics should listen for `postMessage` events from the iframe.
- The final task screen tells the participant to call the tester before pressing Continue.
- When the participant eventually presses Continue, Qualtrics can advance to the next page.

See [qualtrics-embed-example.md](/C:/Users/alonh/Documents/Codex/2026-04-23-hey-go-to-my-github-repo/qualtrics-embed-example.md:1) for a full example.

## Recommended Researcher Checklist

- Confirm the GitHub Pages URL loads
- Confirm `previousScores` appears in the expected left-to-right order
- Confirm the highlighted chip matches the highest previous score
- Confirm practice behavior matches your chosen `BLOCK_TYPE`
- Confirm Qualtrics receives `trial` and `completed` events
- Confirm the tester instruction appears on the final summary screen
- Confirm the page only advances after the tester allows the participant to continue
