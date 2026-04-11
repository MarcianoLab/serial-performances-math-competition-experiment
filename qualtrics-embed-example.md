# Example Qualtrics Embed Code

This example assumes the task is hosted on GitHub Pages and embedded in a Qualtrics question using an iframe.

## 1) Question HTML

```html
<div id="apt-wrapper" style="width:100%;max-width:980px;margin:0 auto;">
  <iframe
    id="apt-frame"
    title="Arithmetic Performance Task"
    src="https://marcianolab.github.io/serial-performances-math-competition-experiment/?participantId=${e://Field/ResponseID}&sessionId=${e://Field/SessionID}&condition=${e://Field/Condition}"
    style="width:100%;height:760px;border:0;border-radius:18px;overflow:hidden;background:#fff;"
    allow="fullscreen"
    referrerpolicy="strict-origin-when-cross-origin"
  ></iframe>
</div>
```

## 2) Question JavaScript

```javascript
Qualtrics.SurveyEngine.addOnload(function () {
  var nextButton = document.getElementById("NextButton");
  var trialLogs = [];

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
    document.body.style.background = "#f3f6fb";

    if (nextButton) {
      nextButton.style.display = "none";
    }
  }

  function restoreQualtricsChrome() {
    setDisplay("#Header", "");
    setDisplay("#Buttons", "");
    setDisplay("#ProgressBar", "");
    setDisplay(".Separator", "");
    document.body.style.background = "";

    if (nextButton) {
      nextButton.style.display = "";
    }
  }

  function onTaskMessage(event) {
    var data = event.data;

    if (!data || data.source !== "arithmetic-task") {
      return;
    }

    if (data.eventType === "trial") {
      trialLogs.push(data.payload);

      Qualtrics.SurveyEngine.setEmbeddedData(
        "apt_last_trial_json",
        JSON.stringify(data.payload)
      );
      Qualtrics.SurveyEngine.setEmbeddedData(
        "apt_trial_count",
        String(trialLogs.length)
      );
      Qualtrics.SurveyEngine.setEmbeddedData(
        "apt_last_prompt",
        data.payload.prompt || ""
      );
      Qualtrics.SurveyEngine.setEmbeddedData(
        "apt_last_accuracy",
        data.payload.isCorrect ? "1" : "0"
      );

      return;
    }

    if (data.eventType === "completed") {
      var summary = data.payload.summary || {};

      Qualtrics.SurveyEngine.setEmbeddedData(
        "apt_summary_json",
        JSON.stringify(summary)
      );
      Qualtrics.SurveyEngine.setEmbeddedData(
        "apt_correct",
        String(summary.correct || 0)
      );
      Qualtrics.SurveyEngine.setEmbeddedData(
        "apt_attempted",
        String(summary.attempted || 0)
      );
      Qualtrics.SurveyEngine.setEmbeddedData(
        "apt_accuracy",
        summary.accuracy || ""
      );
      Qualtrics.SurveyEngine.setEmbeddedData(
        "apt_mean_rt_ms",
        String(summary.meanRtMs || "")
      );
      Qualtrics.SurveyEngine.setEmbeddedData(
        "apt_target_met",
        summary.targetMet ? "1" : "0"
      );
      Qualtrics.SurveyEngine.setEmbeddedData(
        "apt_trials_json",
        JSON.stringify(data.payload.trials || [])
      );
      Qualtrics.SurveyEngine.setEmbeddedData(
        "apt_practice_trials_json",
        JSON.stringify(data.payload.practiceTrials || [])
      );

      return;
    }

    if (data.eventType === "continue") {
      restoreQualtricsChrome();
      window.removeEventListener("message", onTaskMessage);

      if (nextButton) {
        nextButton.click();
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

## 3) Embedded Data Variables (add to qualtrics)

```
| Variable                   | What it stores                        |
| -------------------------- | ------------------------------------- |
| `SessionID`                | Your session or wave label            |
| `Condition`                | Your experimental condition           |
| `apt_last_trial_json`      | Full data for the most recent trial   |
| `apt_trial_count`          | Number of completed trials so far     |
| `apt_last_prompt`          | Most recent arithmetic item shown     |
| `apt_last_accuracy`        | Whether most recent trial was correct |
| `apt_summary_json`         | Full final summary object             |
| `apt_correct`              | Total correct in main block           |
| `apt_attempted`            | Total attempted in main block         |
| `apt_accuracy`             | Accuracy in main block                |
| `apt_mean_rt_ms`           | Mean RT in milliseconds               |
| `apt_target_met`           | Whether target was met                |
| `apt_trials_json`          | All main-block trials                 |
| `apt_practice_trials_json` | All practice trials                   |


SessionID
A session or batch identifier you define. Useful if you want to mark participants as belonging to a specific wave, run, lab session, or dataset.

Condition
An experimental condition label you define, such as A, B, feedback_on, feedback_off, target_high, and so on.

ResponseID
You do not need to create this one manually. It is built into Qualtrics already. It uniquely identifies the participant’s survey response and is often passed into the task as participantId.

apt_last_trial_json
A JSON string containing the full data from the most recent trial. Useful for debugging or checking exactly what happened on the latest item.

apt_trial_count
The number of trials completed so far. In your current Qualtrics script, this grows with each received "trial" message.

apt_last_prompt
The arithmetic prompt from the most recent trial, for example something like 24 + 51 + 38.

apt_last_accuracy
Whether the most recent response was correct. In your current setup this is stored as:
1 = correct
0 = incorrect

apt_summary_json
A JSON string containing the final summary object for the main timed block. This is the most complete summary field.

apt_correct
Number of correct responses in the main timed block.

apt_attempted
Number of non-timeout trials attempted in the main timed block.

apt_accuracy
Accuracy in the main timed block, usually as a formatted percentage string such as 83%.

apt_mean_rt_ms
Mean response time for attempted main-block trials, in milliseconds.

apt_target_met
Whether the participant met the performance target.
In your current setup:
1 = yes
0 = no
```

