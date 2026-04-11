# Example Qualtrics Embed Code

This example assumes the task is hosted on GitHub Pages and embedded in a Qualtrics question using an iframe.

## 1) Question HTML

Paste this into the Qualtrics question HTML view.

```html
<div id="apt-wrapper" style="width:100%;max-width:980px;margin:0 auto;">
  <iframe
    id="apt-frame"
    title="Arithmetic Performance Task"
    src="https://YOUR-USERNAME.github.io/YOUR-REPO/?participantId=${e://Field/ResponseID}&sessionId=${e://Field/SessionID}&condition=${e://Field/Condition}"
    style="width:100%;height:760px;border:0;border-radius:18px;overflow:hidden;background:#fff;"
    allow="fullscreen"
    referrerpolicy="strict-origin-when-cross-origin"
  ></iframe>
</div>
```

## 2) Question JavaScript

Open the Qualtrics question JavaScript editor and paste the following.

```javascript
Qualtrics.SurveyEngine.addOnload(function () {
  var qThis = this;
  var frame = document.getElementById("apt-frame");
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

      Qualtrics.SurveyEngine.setEmbeddedData("apt_last_trial_json", JSON.stringify(data.payload));
      Qualtrics.SurveyEngine.setEmbeddedData("apt_trial_count", String(trialLogs.length));
      Qualtrics.SurveyEngine.setEmbeddedData("apt_last_prompt", data.payload.prompt || "");
      Qualtrics.SurveyEngine.setEmbeddedData("apt_last_accuracy", data.payload.isCorrect ? "1" : "0");
    }

    if (data.eventType === "completed") {
      var summary = data.payload.summary || {};

      Qualtrics.SurveyEngine.setEmbeddedData("apt_summary_json", JSON.stringify(summary));
      Qualtrics.SurveyEngine.setEmbeddedData("apt_correct", String(summary.correct || 0));
      Qualtrics.SurveyEngine.setEmbeddedData("apt_attempted", String(summary.attempted || 0));
      Qualtrics.SurveyEngine.setEmbeddedData("apt_accuracy", summary.accuracy || "");
      Qualtrics.SurveyEngine.setEmbeddedData("apt_mean_rt_ms", String(summary.meanRtMs || ""));
      Qualtrics.SurveyEngine.setEmbeddedData("apt_target_met", summary.targetMet ? "1" : "0");

      /*
        Optional: store the full arrays only if your task is short enough.
        Large JSON payloads can exceed practical Qualtrics limits.
      */
      Qualtrics.SurveyEngine.setEmbeddedData("apt_trials_json", JSON.stringify(data.payload.trials || []));
      Qualtrics.SurveyEngine.setEmbeddedData("apt_practice_trials_json", JSON.stringify(data.payload.practiceTrials || []));

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

## 3) Suggested embedded-data fields

Create these in your Survey Flow if you want to store the key outputs:

- `Condition`
- `apt_trial_count`
- `apt_last_trial_json`
- `apt_last_prompt`
- `apt_last_accuracy`
- `apt_summary_json`
- `apt_correct`
- `apt_attempted`
- `apt_accuracy`
- `apt_mean_rt_ms`
- `apt_target_met`
- `apt_trials_json`
- `apt_practice_trials_json`

## 4) Recommended preview checks

- Preview the question in Qualtrics.
- Confirm the Qualtrics header and buttons disappear when the page loads.
- Complete at least one trial and confirm trial messages arrive.
- Finish the task and confirm the Qualtrics UI is restored.
- Confirm the survey automatically advances after the completion message.
