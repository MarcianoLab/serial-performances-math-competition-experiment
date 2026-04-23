# Qualtrics Embed Example

This guide shows one practical way to run the arithmetic task inside Qualtrics.

Use this file if you need to hand the setup to another researcher or programmer.

## Overview

The task is hosted outside Qualtrics, usually on GitHub Pages. Qualtrics embeds it in an iframe and passes values through the URL.

Qualtrics is responsible for:

- passing participant metadata
- passing the list of previous competitors' scores
- receiving `postMessage` events from the task
- saving summary fields into Embedded Data
- deciding when to advance the survey

The task is responsible for:

- rendering the arithmetic task
- showing previous scores
- timing the block
- computing summary values
- posting trial and completion data back to Qualtrics

## 1. Create the Embedded Data Fields in Qualtrics

Before using the task, add these Embedded Data fields to your survey flow.

Minimum recommended fields:

- `SessionID`
- `Condition`
- `PreviousScoresBoard`
- `apt_last_trial_json`
- `apt_trial_count`
- `apt_summary_json`
- `apt_correct`
- `apt_accuracy`
- `apt_trials_json`
- `apt_practice_trials_json`

Notes:

- `ResponseID` is built into Qualtrics already. You do not create it manually.
- `PreviousScoresBoard` should hold the previous competitors in display order, for example:

```text
Competitor 1:12|Competitor 2:5|Competitor 3:9
```

## 2. Add the Question HTML

Put this in the Qualtrics question HTML.

```html
<div id="apt-container-wrapper" style="display:none; background:#f3f6fb; justify-content:center; align-items:center; width:100%; height:auto;">
  <div id="apt-wrapper" style="width:100%; max-width:900px; padding:10px;">
    <iframe
      id="apt-frame"
      title="Arithmetic Performance Task"
      src="https://marcianolab.github.io/serial-performances-math-competition-experiment/?participantId=${e://Field/ResponseID}&sessionId=${e://Field/SessionID}&condition=${e://Field/Condition}&previousScores=${e://Field/PreviousScoresBoard}"
      style="width:100%; height:600px; border:0; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.08); background:#fff;"
      allow="fullscreen"
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
  </div>
</div>
```

### What This URL Does

- `participantId=${e://Field/ResponseID}` passes the Qualtrics response ID into the task
- `sessionId=${e://Field/SessionID}` passes your session or wave label
- `condition=${e://Field/Condition}` passes your study condition label
- `previousScores=${e://Field/PreviousScoresBoard}` passes the visible row of previous competitors' scores

If you want the task to run in Hebrew, add:

```text
&hebrewMode=1
```

Full Hebrew example:

```text
https://marcianolab.github.io/serial-performances-math-competition-experiment/?participantId=${e://Field/ResponseID}&sessionId=${e://Field/SessionID}&condition=${e://Field/Condition}&hebrewMode=1&previousScores=${e://Field/PreviousScoresBoard}
```

If you want to test with hard-coded values first, replace the last part with something like:

```text
&previousScores=Competitor%201:12|Competitor%202:5|Competitor%203:9
```

## 3. Add the Question JavaScript

Put this in the Qualtrics question JavaScript.

```javascript
Qualtrics.SurveyEngine.addOnload(function () {
  var q = this;
  var nextButton = document.getElementById("NextButton");
  var trialLogs = [];

  // Prevent the task from taking over the page while editing in the Qualtrics builder.
  var isEditor =
    document.body.classList.contains("ControlPanel") ||
    document.body.classList.contains("Builder") ||
    window.location.href.indexOf("ControlPanel") !== -1;

  if (isEditor) {
    var editorContainer = document.getElementById("apt-container-wrapper");
    if (editorContainer) {
      editorContainer.style.display = "block";
      editorContainer.style.position = "relative";
    }
    return;
  }

  function setDisplay(selector, value) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i += 1) {
      nodes[i].style.display = value;
    }
  }

  function hideQualtricsChrome() {
    setDisplay("#Header", "none");
    setDisplay("#Buttons", "none");
    setDisplay("#ProgressBar", "none");
    setDisplay(".Separator", "none");

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    var container = document.getElementById("apt-container-wrapper");
    if (container) {
      container.style.display = "flex";
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "0";
      container.style.width = "100vw";
      container.style.height = "100vh";
      container.style.zIndex = "9999";
    }

    var iframe = document.getElementById("apt-frame");
    if (iframe) {
      iframe.style.height = "96vh";
    }

    if (nextButton) {
      nextButton.style.display = "none";
    }
  }

  function restoreQualtricsChrome() {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    var container = document.getElementById("apt-container-wrapper");
    if (container) {
      container.style.display = "none";
    }

    setDisplay("#Header", "");
    setDisplay("#Buttons", "");
    setDisplay("#ProgressBar", "");
    setDisplay(".Separator", "");

    if (nextButton) {
      nextButton.style.display = "";
    }
  }

  function onTaskMessage(event) {
    var data = event.data;
    if (!data || data.source !== "arithmetic-task") return;

    if (data.eventType === "trial") {
      trialLogs.push(data.payload);
      Qualtrics.SurveyEngine.setEmbeddedData("apt_last_trial_json", JSON.stringify(data.payload));
      Qualtrics.SurveyEngine.setEmbeddedData("apt_trial_count", String(trialLogs.length));
      Qualtrics.SurveyEngine.setEmbeddedData("apt_last_accuracy", data.payload.isCorrect ? "1" : "0");
      return;
    }

    if (data.eventType === "completed") {
      var summary = data.payload.summary || {};
      Qualtrics.SurveyEngine.setEmbeddedData("apt_summary_json", JSON.stringify(summary));
      Qualtrics.SurveyEngine.setEmbeddedData("apt_correct", String(summary.correct || 0));
      Qualtrics.SurveyEngine.setEmbeddedData("apt_accuracy", summary.accuracy || "");
      Qualtrics.SurveyEngine.setEmbeddedData("apt_trials_json", JSON.stringify(data.payload.trials || []));
      Qualtrics.SurveyEngine.setEmbeddedData("apt_practice_trials_json", JSON.stringify(data.payload.practiceTrials || []));
      return;
    }

    if (data.eventType === "continue") {
      restoreQualtricsChrome();
      window.removeEventListener("message", onTaskMessage);
      if (nextButton) {
        q.clickNextButton();
      }
    }
  }

  hideQualtricsChrome();
  window.addEventListener("message", onTaskMessage);

  Qualtrics.SurveyEngine.addOnUnload(function () {
    window.removeEventListener("message", onTaskMessage);
    restoreQualtricsChrome();
  });
});
```

## 4. How to Populate `PreviousScoresBoard`

This field should be prepared before the participant reaches the task question.

Recommended format:

```text
Competitor 1:12|Competitor 2:5|Competitor 3:9|Competitor 4:14
```

Rules:

- Keep the competitors in the exact order you want shown left to right
- Use `|` between competitors
- Use `:` between label and score
- Scores should be whole numbers

Examples:

```text
Competitor 1:12
```

```text
Competitor 1:12|Competitor 2:5
```

```text
Competitor 1:12|Competitor 2:5|Competitor 3:9|Competitor 4:14|Competitor 5:11
```

## 5. What Participants Will See

Intro screen:

- task title
- optional task settings such as time
- a horizontal `Previous Scores` row if `previousScores` was provided

Main task screen:

- `Correct` counter
- `Previous Scores` row
- goal bar
- arithmetic items and response input

Final summary screen:

- final summary values
- a red instruction telling the participant to call the tester before pressing Continue

## 6. What Data You Get Back

The task sends `postMessage` events with:

- trial-level data on every completed trial
- summary data when the task ends

Useful summary fields:

- `correct`
- `attempted`
- `accuracy`
- `meanRtMs`
- `bestStreak`
- `targetMet`
- `scoreToBeat`
- `previousScores`

## 7. Recommended Testing Steps

1. Test the task outside Qualtrics with a hard-coded URL.
2. Test the iframe inside Qualtrics preview with a hard-coded `previousScores` value.
3. Confirm the `Previous Scores` row appears in the expected order.
4. Confirm the highlighted chip matches the highest score.
5. Confirm the summary fields are written into Embedded Data.
6. Confirm the final tester instruction appears.
7. Confirm the page only advances after the participant presses Continue.

## 8. Common Mistakes

- Forgetting to URL-encode spaces in manual test links
- Passing scores in the wrong order, then expecting the task to rearrange them
- Expecting practice to show the previous-scores row
- Forgetting to add `PreviousScoresBoard` to the Qualtrics survey flow
- Trying to store extremely large trial arrays in a single Qualtrics field

## 9. Manual Test URL

Example:

```text
https://marcianolab.github.io/serial-performances-math-competition-experiment/?participantId=test01&sessionId=pilot01&condition=competition&blockType=sequence&previousScores=Competitor%201:12|Competitor%202:5|Competitor%203:9
```
