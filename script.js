(() => {
  "use strict";

  const defaults = window.TASK_DEFAULTS;
  const app = document.getElementById("app");

  if (!defaults || !app) {
    console.error("Task failed to initialize: missing configuration or root element.");
    return;
  }

  const config = buildRuntimeConfig(defaults);

  const state = {
    phase: "intro",
    taskStartedAtIso: null,
    mainBlockStartedAtIso: null,
    mainBlockEndedAtIso: null,
    practiceCompleted: false,
    practiceCorrect: 0,
    mainCorrect: 0,
    consecutiveCorrect: 0,
    bestStreak: 0,
    overallTrialCounter: 0,
    practiceTrialCounter: 0,
    mainTrialCounter: 0,
    practiceTrials: [],
    mainTrials: [],
    currentTrial: null,
    mainDeadlinePerf: null,
    mainTimerId: null,
    feedbackTimerId: null,
    taskFinished: false
  };

  const COPY = {
    en: {
      appName: "Addition Task",
      appLoading: "Loading the task...",
      time: "Time",
      itemFormat: "Item format",
      immediateFeedback: "Immediate feedback",
      feedbackOn: "On",
      feedbackOff: "Off",
      previousScores: "Previous Scores",
      bestSoFar: "Best so far",
      performanceTarget: "Performance target",
      instructionsTitle: "Instructions.",
      instructionsBody:
        "Solve each addition problem as quickly and accurately as possible. Submit one whole-number answer per item.",
      beginPractice: "Begin Practice",
      startPractice: "Start Practice",
      start: "Start",
      practice: "Practice",
      practiceComplete: "Practice complete",
      pressBelowMain: "Press below to begin the main block.",
      practiceCorrect: "Practice correct",
      practiceAccuracy: "Practice accuracy",
      correct: "Correct Answers",
      trials: "Trials",
      accuracy: "Accuracy",
      goal: "Goal",
      target: "Target",
      enterSum: "Enter the sum",
      enterSumPlaceholder: "Enter sum",
      submit: "Submit",
      correctFeedback: "correct",
      incorrectFeedback: "incorrect",
      pleaseEnterResponse: "Please enter a response before submitting.",
      wholeNumbersOnly: "Responses must be whole numbers.",
      finalSummary: "Final summary",
      passedBest: "Passed best",
      targetMet: "Target met",
      yes: "Yes",
      no: "No",
      continue: "Continue",
      continueApprovalPrompt: "Has the tester given you permission to continue?",
      callTesterTitle: "Please call the tester now.",
      callTesterEmphasis: "DO NOT PRESS CONTINUE",
      callTesterSuffix: "until the tester arrives, announces your score, and tells you to proceed.",
      defaultPracticeText:
        "Use the practice block to get comfortable with the response format before the timed block begins.",
      practiceLabel: (n) => `Practice ${n}`,
      trialLabel: (n) => `Trial ${n}`,
      competitor: (n) => `Competitor ${n}`,
      formatTwoDigitRange: (min, max) => `${min}-${max} two-digit numbers`,
      secondsShort: "s",
      minutesShort: "min"
    },
    he: {
      appName: "משימת חיבור",
      callTesterEmphasis: 'אין ללחוץ על "המשך"',
      callTesterSuffix: "עד שהנסיין יגיע, יכריז על הציון שלכם ויאשר לכם להמשיך.",
      defaultPracticeText:
        "השתמשו בבלוק התרגול כדי להכיר את אופן המענה לפני שהבלוק המתוזמן מתחיל.",
      callTesterSuffix: "עד שהנסיין יגיע, יכריז על הציון שלכם ויאשר לכם להמשיך.",
      secondsShort: "שניות",
      minutesShort: "דק'",
      appLoading: "טוען את המשימה...",
      time: "זמן",
      itemFormat: "מבנה התרגילים",
      immediateFeedback: "משוב מיידי",
      feedbackOn: "פועל",
      feedbackOff: "כבוי",
      previousScores: "תוצאות קודמות",
      bestSoFar: "השיא עד כה",
      performanceTarget: "יעד ביצוע",
      instructionsTitle: "הוראות.",
      instructionsBody:
        "פתרו כל תרגיל חיבור במהירות ובדיוק המרביים. יש להזין תשובה של מספר שלם אחד לכל תרגיל.",
      beginPractice: "התחל תרגול",
      startPractice: "התחל תרגול",
      start: "התחל",
      practice: "תרגול",
      practiceComplete: "התרגול הושלם",
      pressBelowMain: "לחצו למטה כדי להתחיל את החלק המרכזי.",
      practiceCorrect: "נכון בתרגול",
      practiceAccuracy: "דיוק בתרגול",
      correct: "תשובות נכונות",
      trials: "ניסיונות",
      accuracy: "דיוק",
      goal: "יעד",
      target: "יעד",
      enterSum: "הזן/י סכום",
      enterSumPlaceholder: "הזן/י סכום",
      submit: "הזן",
      correctFeedback: "נכון",
      incorrectFeedback: "לא נכון",
      pleaseEnterResponse: "יש להזין תשובה לפני השליחה.",
      wholeNumbersOnly: "יש להזין מספרים שלמים בלבד.",
      finalSummary: "סיכום סופי",
      passedBest: "עבר את השיא",
      targetMet: "היעד הושג",
      yes: "כן",
      no: "לא",
      continue: "המשך",
      callTesterTitle: "אנא קראו כעת לנסיין.",
      callTesterBody:
        "אין ללחוץ על המשך עד שהנסיין יגיע, יכריז על הציון שלכם ויאשר לכם להמשיך.",
      practiceLabel: (n) => `תרגול ${n}`,
      trialLabel: (n) => `ניסיון ${n}`,
      competitor: (n) => `מתחרה ${n}`,
      formatTwoDigitRange: (min, max) => `${min}-${max} מספרים דו-ספרתיים`
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  function initialize() {
    applyDocumentLanguage();
    app.setAttribute("aria-busy", "false");
    renderIntro();
    postTaskMessage("ready", {
      config: getPublicConfig(),
      participant: getParticipantMeta()
    });
  }

  function applyDocumentLanguage() {
    const lang = isHebrewMode() ? "he" : "en";
    const dir = isHebrewMode() ? "rtl" : "ltr";

    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.body.dir = dir;
    document.body.classList.toggle("is-rtl", isHebrewMode());

    const loadingText = document.querySelector(".loading-state p");
    if (loadingText) {
      loadingText.textContent = t("appLoading");
    }
  }

  function buildRuntimeConfig(baseConfig) {
    const runtimeConfig = { ...baseConfig, URL_PARAM_MAP: { ...(baseConfig.URL_PARAM_MAP || {}) } };
    const params = new URLSearchParams(window.location.search);

    Object.entries(baseConfig.URL_PARAM_MAP || {}).forEach(([paramName, configKey]) => {
      if (!params.has(paramName)) {
        return;
      }

      const rawValue = params.get(paramName);
      const currentValue = runtimeConfig[configKey];

      if (typeof currentValue === "boolean") {
        runtimeConfig[configKey] = parseBoolean(rawValue, currentValue);
      } else if (typeof currentValue === "number") {
        runtimeConfig[configKey] = parseInteger(rawValue, currentValue);
      } else {
        runtimeConfig[configKey] = rawValue;
      }
    });

    runtimeConfig.MIN_ADDENDS = clampInteger(runtimeConfig.MIN_ADDENDS, 2, 12);
    runtimeConfig.MAX_ADDENDS = clampInteger(runtimeConfig.MAX_ADDENDS, runtimeConfig.MIN_ADDENDS, 12);
    runtimeConfig.MIN_NUMBER = clampInteger(runtimeConfig.MIN_NUMBER, 10, 99);
    runtimeConfig.MAX_NUMBER = clampInteger(runtimeConfig.MAX_NUMBER, runtimeConfig.MIN_NUMBER, 99);
    runtimeConfig.WORK_PERIOD_SECONDS = clampInteger(runtimeConfig.WORK_PERIOD_SECONDS, 5, 3600);
    runtimeConfig.PRACTICE_PERIOD_SECONDS = clampInteger(runtimeConfig.PRACTICE_PERIOD_SECONDS, 5, 3600);
    runtimeConfig.PERFORMANCE_TARGET_CORRECT = clampInteger(runtimeConfig.PERFORMANCE_TARGET_CORRECT, 1, 10000);
    runtimeConfig.FEEDBACK_DURATION_MS = clampInteger(runtimeConfig.FEEDBACK_DURATION_MS, 0, 10000);
    runtimeConfig.INPUT_MAX_LENGTH = clampInteger(runtimeConfig.INPUT_MAX_LENGTH, 2, 8);

    const longestBlockSeconds = Math.max(runtimeConfig.WORK_PERIOD_SECONDS, runtimeConfig.PRACTICE_PERIOD_SECONDS);
    runtimeConfig.COUNTDOWN_WARNING_SECONDS = clampInteger(
      runtimeConfig.COUNTDOWN_WARNING_SECONDS,
      1,
      longestBlockSeconds
    );

    runtimeConfig.PARTICIPANT_ID = params.get("participantId") || "";
    runtimeConfig.SESSION_ID = params.get("sessionId") || "";
    runtimeConfig.CONDITION = params.get("condition") || "";
    runtimeConfig.PREVIOUS_SCORES = Object.freeze(
      parsePreviousScores(params.get("previousScores"), runtimeConfig.HEBREW_MODE)
    );

    return Object.freeze(runtimeConfig);
  }

  function renderIntro() {
    state.phase = "intro";
    clearTimers();

    const introCards = [];
    const selectedBlockSeconds =
      config.BLOCK_TYPE === "practice" ? config.PRACTICE_PERIOD_SECONDS : config.WORK_PERIOD_SECONDS;

    if (config.SHOW_INTRO_TIMED_WORK_PERIOD) {
      introCards.push(createInfoCard(t("time"), formatSeconds(selectedBlockSeconds)));
    }

    if (config.SHOW_INTRO_PERFORMANCE_TARGET && config.BLOCK_TYPE !== "practice" && !config.PREVIOUS_SCORES.length) {
      introCards.push(createInfoCard(getTargetLabelText(), `${getEffectiveTargetCorrect()} ${t("correct").toLowerCase()}`));
    }

    if (config.SHOW_INTRO_ITEM_FORMAT) {
      introCards.push(createInfoCard(t("itemFormat"), t("formatTwoDigitRange", config.MIN_ADDENDS, config.MAX_ADDENDS)));
    }

    if (config.SHOW_INTRO_IMMEDIATE_FEEDBACK) {
      const feedbackOn =
        config.BLOCK_TYPE === "practice"
          ? config.SHOW_PRACTICE_FEEDBACK
          : config.BLOCK_TYPE === "main"
          ? config.SHOW_MAIN_FEEDBACK
          : config.SHOW_PRACTICE_FEEDBACK || config.SHOW_MAIN_FEEDBACK;

      introCards.push(createInfoCard(t("immediateFeedback"), feedbackOn ? t("feedbackOn") : t("feedbackOff")));
    }

    app.innerHTML = `
      <h1 class="panel-title">${escapeHtml(getAppNameText())}</h1>
      ${getIntroText() ? `<p class="panel-copy">${escapeHtml(getIntroText())}</p>` : ""}

      ${introCards.length ? `<div class="info-grid">${introCards.join("")}</div>` : ""}

      ${
        config.PREVIOUS_SCORES.length && config.BLOCK_TYPE !== "practice"
          ? renderPreviousScoresBoard({ inIntro: true })
          : ""
      }

      ${
        config.SHOW_INTRO_INSTRUCTIONS
          ? `<div class="callout"><strong>${escapeHtml(t("instructionsTitle"))}</strong> ${escapeHtml(t("instructionsBody"))}</div>`
          : ""
      }

      ${
        config.BLOCK_TYPE === "sequence" && config.ENABLE_PRACTICE_BLOCK
          ? `<div class="callout subtle-callout">${escapeHtml(getPracticeText())}</div>`
          : ""
      }

      <div class="actions-row">
        <button class="btn btn-primary" id="start-task-btn" type="button">
          ${getStartButtonLabel()}
        </button>
      </div>
    `;

    document.getElementById("start-task-btn").addEventListener("click", () => {
      if (!state.taskStartedAtIso) {
        state.taskStartedAtIso = nowIso();
      }

      postTaskMessage("started", {
        config: getPublicConfig(),
        participant: getParticipantMeta(),
        startedAtIso: state.taskStartedAtIso
      });

      if (config.BLOCK_TYPE === "practice") {
        startPracticeBlock();
      } else if (config.BLOCK_TYPE === "main") {
        startMainBlock();
      } else if (config.ENABLE_PRACTICE_BLOCK) {
        startPracticeBlock();
      } else {
        startMainBlock();
      }
    });
  }

  function createInfoCard(label, value) {
    return `
      <div class="info-card">
        <div class="info-label">${escapeHtml(label)}</div>
        <div class="info-value">${escapeHtml(value)}</div>
      </div>
    `;
  }

  function startPracticeBlock() {
    clearTimers();
    state.phase = "practice";
    state.mainDeadlinePerf = performance.now() + config.PRACTICE_PERIOD_SECONDS * 1000;

    renderTaskScaffold({
      title: t("practice"),
      subtitle: "",
      timerText: formatCountdown(config.PRACTICE_PERIOD_SECONDS),
      statusClass: "is-neutral"
    });

    updateMainPanels();
    state.mainTimerId = window.setInterval(updateMainTimer, 100);
    presentNextTrial("practice");
  }

  function startMainBlock() {
    clearTimers();
    state.phase = "main";
    state.mainBlockStartedAtIso = nowIso();
    state.mainDeadlinePerf = performance.now() + config.WORK_PERIOD_SECONDS * 1000;

    renderTaskScaffold({
      title: "",
      subtitle: "",
      timerText: formatCountdown(config.WORK_PERIOD_SECONDS),
      statusClass: "is-active"
    });

    updateMainPanels();
    state.mainTimerId = window.setInterval(updateMainTimer, 100);
    presentNextTrial("main");
  }

  function renderTaskScaffold({ title, subtitle, timerText, statusClass }) {
    const showTrialsPanel = Boolean(config.SHOW_TRIALS_PANEL);
    const showAccuracyPanel = Boolean(config.SHOW_ACCURACY_PANEL);
    const showTrialNumberLabel = Boolean(config.SHOW_TRIAL_NUMBER_LABEL);
    const showTargetPanel = Boolean(config.SHOW_PROGRESS_BAR && config.SHOW_TARGET_PANEL);
    const showPreviousScoresBoard = shouldShowPreviousScoresBoard();

    app.innerHTML = `
      <div class="task-header">
        <div>
          ${title ? `<h1 class="panel-title compact-title">${escapeHtml(title)}</h1>` : ""}
          ${subtitle ? `<p class="panel-copy compact-copy">${escapeHtml(subtitle)}</p>` : ""}
        </div>
        <div class="status-pill ${statusClass}" id="timer-pill">${timerText}</div>
      </div>

      <div class="task-main">
        <div class="task-overview ${showPreviousScoresBoard ? "has-board" : ""}">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">${escapeHtml(t("correct"))}</div>
              <div class="stat-value" id="correct-count">0</div>
            </div>
            ${
              showTrialsPanel
                ? `<div class="stat-card"><div class="stat-label">${escapeHtml(t("trials"))}</div><div class="stat-value" id="trial-count">0</div></div>`
                : ""
            }
            ${
              showAccuracyPanel
                ? `<div class="stat-card"><div class="stat-label">${escapeHtml(t("accuracy"))}</div><div class="stat-value" id="accuracy-value">-</div></div>`
                : ""
            }
          </div>

          ${showPreviousScoresBoard ? renderPreviousScoresBoard() : ""}
        </div>

        ${
          showTargetPanel
            ? `
              <div class="target-panel">
                <div class="target-row">
                  <span>${escapeHtml(getTargetProgressLabel())}</span>
                  <span id="target-label">0 / ${getEffectiveTargetCorrect()}</span>
                </div>
                <div class="target-track" aria-hidden="true">
                  <div class="target-fill" id="target-fill"></div>
                </div>
              </div>
            `
            : ""
        }

        <section class="trial-panel">
          ${
            showTrialNumberLabel
              ? `<div class="trial-meta"><span id="trial-number-label">1</span></div>`
              : ""
          }

          <div class="equation" id="equation-display" dir="ltr">&nbsp;</div>

          <form id="answer-form" class="answer-form" novalidate>
            <label class="visually-hidden" for="answer-input">${escapeHtml(t("enterSum"))}</label>
            <input
              id="answer-input"
              name="answer"
              class="answer-input"
              type="number"
              inputmode="numeric"
              autocomplete="off"
              spellcheck="false"
              maxlength="${config.INPUT_MAX_LENGTH}"
              placeholder="${escapeHtml(t("enterSumPlaceholder"))}"
              required
            />
            <button class="btn btn-primary icon-btn" id="submit-btn" type="submit" aria-label="${escapeHtml(t("enterSum"))}">
              <span aria-hidden="true">➜</span>
            </button>
          </form>

          <div class="feedback" id="feedback" aria-live="assertive"></div>
        </section>
      </div>
    `;

    const answerForm = document.getElementById("answer-form");
    answerForm.addEventListener("submit", handleAnswerSubmit);

    const answerInput = document.getElementById("answer-input");
    answerInput.addEventListener("input", () => {
      answerInput.setCustomValidity("");
    });

    if (config.AUTO_FOCUS_INPUT) {
      window.requestAnimationFrame(() => answerInput.focus());
    }
  }

  function presentNextTrial(phase) {
    if (state.taskFinished) {
      return;
    }

    const answerInput = document.getElementById("answer-input");
    const submitButton = document.getElementById("submit-btn");
    const feedback = document.getElementById("feedback");

    if (!answerInput || !submitButton || !feedback) {
      return;
    }

    feedback.textContent = "";
    feedback.className = "feedback";

    answerInput.value = "";
    answerInput.disabled = false;
    submitButton.disabled = false;

    const trial = makeTrial(phase);
    state.currentTrial = trial;

    document.getElementById("equation-display").textContent = trial.prompt;

    const trialNumberLabel = document.getElementById("trial-number-label");
    if (trialNumberLabel) {
      trialNumberLabel.textContent =
        phase === "practice"
          ? t("practiceLabel", state.practiceTrialCounter + 1)
          : t("trialLabel", state.mainTrialCounter + 1);
    }

    if (config.AUTO_FOCUS_INPUT) {
      window.requestAnimationFrame(() => answerInput.focus());
    }
  }

  function makeTrial(phase) {
    const addendCount = randomInteger(config.MIN_ADDENDS, config.MAX_ADDENDS);
    const addends = Array.from({ length: addendCount }, () => randomInteger(config.MIN_NUMBER, config.MAX_NUMBER));
    const correctAnswer = addends.reduce((sum, value) => sum + value, 0);

    return {
      phase,
      displayedAtIso: nowIso(),
      displayedAtPerf: performance.now(),
      addends,
      prompt: addends.join(" + "),
      correctAnswer
    };
  }

  function shouldShowFeedbackForPhase(phase) {
    return phase === "practice" ? config.SHOW_PRACTICE_FEEDBACK : config.SHOW_MAIN_FEEDBACK;
  }

  function handleAnswerSubmit(event) {
    event.preventDefault();

    if (!state.currentTrial || state.taskFinished) {
      return;
    }

    const answerInput = document.getElementById("answer-input");
    const submitButton = document.getElementById("submit-btn");
    const rawValue = answerInput.value.trim();

    if (rawValue === "") {
      answerInput.setCustomValidity(t("pleaseEnterResponse"));
      answerInput.reportValidity();
      return;
    }

    const responseValue = Number.parseInt(rawValue, 10);

    if (!Number.isInteger(responseValue)) {
      answerInput.setCustomValidity(t("wholeNumbersOnly"));
      answerInput.reportValidity();
      return;
    }

    answerInput.disabled = true;
    submitButton.disabled = true;

    const trialRecord = finalizeCurrentTrial({
      response: responseValue,
      timedOut: false
    });

    const feedback = document.getElementById("feedback");
    const advance = () => {
      if (isBlockExpired()) {
        if (state.phase === "practice" && config.BLOCK_TYPE === "sequence") {
          finishPracticeBlock();
        } else {
          finishTask();
        }
        return;
      }

      presentNextTrial(trialRecord.phase);
    };

    if (shouldShowFeedbackForPhase(trialRecord.phase)) {
      feedback.textContent = trialRecord.isCorrect ? t("correctFeedback") : t("incorrectFeedback");
      feedback.className = `feedback ${trialRecord.isCorrect ? "is-correct" : "is-incorrect"}`;
      state.feedbackTimerId = window.setTimeout(advance, config.FEEDBACK_DURATION_MS);
    } else {
      feedback.textContent = "";
      feedback.className = "feedback";
      window.setTimeout(advance, 0);
    }
  }

  function finalizeCurrentTrial({ response, timedOut }) {
    const current = state.currentTrial;

    if (!current) {
      return null;
    }

    state.overallTrialCounter += 1;

    if (current.phase === "practice") {
      state.practiceTrialCounter += 1;
    } else {
      state.mainTrialCounter += 1;
    }

    const submittedAtPerf = performance.now();
    const submittedAtIso = nowIso();
    const rtMs = timedOut ? null : Math.round(submittedAtPerf - current.displayedAtPerf);
    const isCorrect = timedOut ? false : response === current.correctAnswer;

    if (current.phase === "practice") {
      if (isCorrect) {
        state.practiceCorrect += 1;
      }
    } else if (isCorrect) {
      state.mainCorrect += 1;
      state.consecutiveCorrect += 1;
      state.bestStreak = Math.max(state.bestStreak, state.consecutiveCorrect);
    } else {
      state.consecutiveCorrect = 0;
    }

    const trialRecord = {
      taskName: config.APP_NAME,
      taskVersion: config.TASK_VERSION,
      participantId: config.PARTICIPANT_ID,
      sessionId: config.SESSION_ID,
      condition: config.CONDITION,
      overallTrialIndex: state.overallTrialCounter,
      phase: current.phase,
      phaseTrialIndex: current.phase === "practice" ? state.practiceTrialCounter : state.mainTrialCounter,
      displayedAtIso: current.displayedAtIso,
      submittedAtIso,
      prompt: current.prompt,
      addends: current.addends,
      setSize: current.addends.length,
      correctAnswer: current.correctAnswer,
      response,
      isCorrect,
      timedOut,
      rtMs,
      remainingTimeMs: current.phase === "main" || current.phase === "practice" ? getRemainingTimeMs() : null,
      targetCorrect: current.phase === "main" ? getEffectiveTargetCorrect() : null,
      scoreToBeat: current.phase === "main" ? getEffectiveTargetCorrect() : null,
      previousScores: current.phase === "main" ? config.PREVIOUS_SCORES : []
    };

    if (current.phase === "practice") {
      state.practiceTrials.push(trialRecord);
    } else {
      state.mainTrials.push(trialRecord);
    }

    state.currentTrial = null;
    updateMainPanels();
    postTaskMessage("trial", trialRecord);

    return trialRecord;
  }

  function finishPracticeBlock() {
    state.practiceCompleted = true;
    state.phase = "practice-summary";
    clearFeedbackTimer();
    clearMainTimer();

    if (config.BLOCK_TYPE === "sequence") {
      const accuracy = getAccuracy(state.practiceTrials);

      app.innerHTML = `
        <h1 class="panel-title">${escapeHtml(t("practiceComplete"))}</h1>
        <p class="panel-copy">${escapeHtml(t("pressBelowMain"))}</p>

        <div class="summary-grid narrow-grid">
          <div class="summary-card">
            <div class="summary-label">${escapeHtml(t("practiceCorrect"))}</div>
            <div class="summary-value">${state.practiceCorrect}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">${escapeHtml(t("practiceAccuracy"))}</div>
            <div class="summary-value">${accuracy}</div>
          </div>
        </div>

        <div class="actions-row">
          <button class="btn btn-primary" id="start-main-btn" type="button">${escapeHtml(t("start"))}</button>
        </div>
      `;

      document.getElementById("start-main-btn").addEventListener("click", startMainBlock);
      return;
    }

    finishTask();
  }

  function updateMainTimer() {
    if ((state.phase !== "main" && state.phase !== "practice") || state.taskFinished) {
      return;
    }

    const remainingMs = getRemainingTimeMs();
    const timerPill = document.getElementById("timer-pill");

    if (timerPill) {
      timerPill.textContent = formatCountdownFromMs(remainingMs);
      timerPill.classList.toggle("is-warning", remainingMs <= config.COUNTDOWN_WARNING_SECONDS * 1000);
    }

    if (remainingMs <= 0) {
      handleBlockTimeExpired();
    }
  }

  function handleBlockTimeExpired() {
    clearMainTimer();

    if ((state.phase !== "main" && state.phase !== "practice") || state.taskFinished) {
      return;
    }

    if (state.currentTrial) {
      finalizeCurrentTrial({ response: null, timedOut: true });
    }

    if (state.phase === "practice" && config.BLOCK_TYPE === "sequence") {
      finishPracticeBlock();
    } else {
      finishTask();
    }
  }

  function finishTask() {
    if (state.taskFinished) {
      return;
    }

    clearTimers();
    state.taskFinished = true;
    state.phase = "summary";
    state.mainBlockEndedAtIso = nowIso();

    const summary = buildSummary();
    const summaryCards = [];

    if (config.SHOW_SUMMARY_CORRECT_CARD) {
      summaryCards.push(`
        <div class="summary-card">
          <div class="summary-label">${escapeHtml(t("correct"))}</div>
          <div class="summary-value">${summary.correct}</div>
        </div>
      `);
    }

    if (config.SHOW_SUMMARY_TARGET_MET_CARD && summary.targetMet !== null) {
      summaryCards.push(`
        <div class="summary-card ${summary.targetMet ? "is-success" : "is-neutral"}">
          <div class="summary-label">${escapeHtml(config.PREVIOUS_SCORES.length ? t("passedBest") : t("targetMet"))}</div>
          <div class="summary-value">${summary.targetMet ? escapeHtml(t("yes")) : escapeHtml(t("no"))}</div>
        </div>
      `);
    }

    app.innerHTML = `
      <h1 class="panel-title">${escapeHtml(t("finalSummary"))}</h1>
      ${getSummaryText() ? `<p class="panel-copy">${escapeHtml(getSummaryText())}</p>` : ""}

      ${summaryCards.length ? `<div class="summary-grid narrow-grid">${summaryCards.join("")}</div>` : ""}

      <div class="callout alert-callout">
        <strong class="alert-callout-title">${escapeHtml(t("callTesterTitle"))}</strong>
        <div class="alert-callout-line">
          <strong>${escapeHtml(t("callTesterEmphasis"))}</strong>${escapeHtml(` ${t("callTesterSuffix")}`)}
        </div>
      </div>

      <div class="actions-row">
        <button class="btn btn-primary" id="continue-btn" type="button">${escapeHtml(t("continue"))}</button>
      </div>
    `;

    document.getElementById("continue-btn").addEventListener("click", handleContinueClick);

    postTaskMessage("completed", {
      participant: getParticipantMeta(),
      config: getPublicConfig(),
      summary,
      trials: state.mainTrials,
      practiceTrials: state.practiceTrials,
      taskStartedAtIso: state.taskStartedAtIso,
      mainBlockStartedAtIso: state.mainBlockStartedAtIso,
      mainBlockEndedAtIso: state.mainBlockEndedAtIso
    });
  }

  function buildSummary() {
    const summarizePracticeOnly = config.BLOCK_TYPE === "practice";
    const sourceTrials = summarizePracticeOnly ? state.practiceTrials : state.mainTrials;
    const attemptedTrials = sourceTrials.filter((trial) => !trial.timedOut);
    const correctCount = summarizePracticeOnly ? state.practiceCorrect : state.mainCorrect;
    const accuracy = getAccuracy(attemptedTrials);
    const meanRtMs = attemptedTrials.length
      ? Math.round(
          attemptedTrials.reduce((total, trial) => total + (typeof trial.rtMs === "number" ? trial.rtMs : 0), 0) /
            attemptedTrials.length
        )
      : null;

    return {
      taskName: config.APP_NAME,
      taskVersion: config.TASK_VERSION,
      blockType: config.BLOCK_TYPE,
      workPeriodSeconds: summarizePracticeOnly ? config.PRACTICE_PERIOD_SECONDS : config.WORK_PERIOD_SECONDS,
      targetCorrect: summarizePracticeOnly ? null : getEffectiveTargetCorrect(),
      scoreToBeat: summarizePracticeOnly ? null : getEffectiveTargetCorrect(),
      attempted: attemptedTrials.length,
      correct: correctCount,
      incorrect: attemptedTrials.length - correctCount,
      accuracy,
      meanRtMs,
      bestStreak: summarizePracticeOnly ? null : state.bestStreak,
      targetMet: summarizePracticeOnly ? null : didMeetTarget(state.mainCorrect),
      previousScores: summarizePracticeOnly ? [] : config.PREVIOUS_SCORES,
      practiceEnabled: config.ENABLE_PRACTICE_BLOCK,
      practiceCorrect: state.practiceCorrect,
      practiceAttempted: state.practiceTrials.length,
      hebrewMode: config.HEBREW_MODE
    };
  }

  function continueToQualtrics() {
    postTaskMessage("continue", {
      participant: getParticipantMeta(),
      summary: buildSummary(),
      taskStartedAtIso: state.taskStartedAtIso,
      mainBlockStartedAtIso: state.mainBlockStartedAtIso,
      mainBlockEndedAtIso: state.mainBlockEndedAtIso
    });

    if (window.parent === window) {
      restartTask();
    }
  }

  function handleContinueClick() {
    showContinueApprovalDialog((approved) => {
      if (approved) {
        continueToQualtrics();
      }
    });
  }

  function showContinueApprovalDialog(onDecision) {
    const existingDialog = document.getElementById("continue-approval-dialog");
    if (existingDialog) {
      existingDialog.remove();
    }

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "continue-approval-dialog";

    overlay.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="continue-approval-title">
        <div class="modal-title" id="continue-approval-title">${escapeHtml(getContinueApprovalPrompt())}</div>
        <div class="modal-actions">
          <button class="btn btn-primary" id="continue-approval-yes" type="button">${escapeHtml(t("yes"))}</button>
          <button class="btn btn-secondary" id="continue-approval-no" type="button">${escapeHtml(t("no"))}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeDialog = (approved) => {
      overlay.remove();
      onDecision(approved);
    };

    overlay.querySelector("#continue-approval-yes").addEventListener("click", () => closeDialog(true));
    overlay.querySelector("#continue-approval-no").addEventListener("click", () => closeDialog(false));
  }

  function updateMainPanels() {
    const isPractice = state.phase === "practice";
    const correctCount = document.getElementById("correct-count");
    const trialCount = document.getElementById("trial-count");
    const accuracyValue = document.getElementById("accuracy-value");
    const targetLabel = document.getElementById("target-label");
    const targetFill = document.getElementById("target-fill");

    const relevantTrials = isPractice ? state.practiceTrials : state.mainTrials;
    const correct = isPractice ? state.practiceCorrect : state.mainCorrect;
    const accuracy = getAccuracy(relevantTrials.filter((trial) => !trial.timedOut));

    if (correctCount) {
      correctCount.textContent = String(correct);
    }

    if (trialCount) {
      trialCount.textContent = String(relevantTrials.length);
    }

    if (accuracyValue) {
      accuracyValue.textContent = accuracy;
    }

    if (targetLabel) {
      targetLabel.textContent = `${state.mainCorrect} / ${getEffectiveTargetCorrect()}`;
    }

    if (targetFill) {
      const percent = Math.min((state.mainCorrect / getEffectiveTargetCorrect()) * 100, 100);
      targetFill.style.width = `${Number.isFinite(percent) ? percent : 0}%`;
    }
  }

  function restartTask() {
    clearTimers();

    state.phase = "intro";
    state.taskStartedAtIso = null;
    state.mainBlockStartedAtIso = null;
    state.mainBlockEndedAtIso = null;
    state.practiceCompleted = false;
    state.practiceCorrect = 0;
    state.mainCorrect = 0;
    state.consecutiveCorrect = 0;
    state.bestStreak = 0;
    state.overallTrialCounter = 0;
    state.practiceTrialCounter = 0;
    state.mainTrialCounter = 0;
    state.practiceTrials = [];
    state.mainTrials = [];
    state.currentTrial = null;
    state.mainDeadlinePerf = null;
    state.mainTimerId = null;
    state.feedbackTimerId = null;
    state.taskFinished = false;

    renderIntro();
  }

  function postTaskMessage(eventType, payload) {
    const message = {
      source: config.POST_MESSAGE_NAMESPACE,
      eventType,
      type: `${config.POST_MESSAGE_NAMESPACE}:${eventType}`,
      sentAtIso: nowIso(),
      payload
    };

    const targetWindow = window.parent && window.parent !== window ? window.parent : window;

    try {
      targetWindow.postMessage(message, config.POST_MESSAGE_TARGET_ORIGIN);
    } catch (error) {
      console.warn("postMessage failed", error);
    }
  }

  function getPublicConfig() {
    return {
      appName: config.APP_NAME,
      taskVersion: config.TASK_VERSION,
      workPeriodSeconds: config.WORK_PERIOD_SECONDS,
      practicePeriodSeconds: config.PRACTICE_PERIOD_SECONDS,
      blockType: config.BLOCK_TYPE,
      performanceTargetCorrect: getEffectiveTargetCorrect(),
      previousScores: config.PREVIOUS_SCORES,
      previousScoresCount: config.PREVIOUS_SCORES.length,
      showPreviousScoresBoard: config.SHOW_PREVIOUS_SCORES_BOARD,
      practiceEnabled: config.ENABLE_PRACTICE_BLOCK,
      practiceFeedback: config.SHOW_PRACTICE_FEEDBACK,
      mainFeedback: config.SHOW_MAIN_FEEDBACK,
      minAddends: config.MIN_ADDENDS,
      maxAddends: config.MAX_ADDENDS,
      minNumber: config.MIN_NUMBER,
      maxNumber: config.MAX_NUMBER,
      showIntroTimedWorkPeriod: config.SHOW_INTRO_TIMED_WORK_PERIOD,
      showIntroPerformanceTarget: config.SHOW_INTRO_PERFORMANCE_TARGET,
      showIntroItemFormat: config.SHOW_INTRO_ITEM_FORMAT,
      showIntroImmediateFeedback: config.SHOW_INTRO_IMMEDIATE_FEEDBACK,
      showIntroInstructions: config.SHOW_INTRO_INSTRUCTIONS,
      showTrialsPanel: config.SHOW_TRIALS_PANEL,
      showTrialNumberLabel: config.SHOW_TRIAL_NUMBER_LABEL,
      showSummaryCorrectCard: config.SHOW_SUMMARY_CORRECT_CARD,
      showSummaryTargetMetCard: config.SHOW_SUMMARY_TARGET_MET_CARD,
      hebrewMode: config.HEBREW_MODE
    };
  }

  function getEffectiveTargetCorrect() {
    if (!config.PREVIOUS_SCORES.length) {
      return clampInteger(config.PERFORMANCE_TARGET_CORRECT, 1, 10000);
    }

    return getHighestPreviousScore();
  }

  function getTargetLabelText() {
    return config.PREVIOUS_SCORES.length ? t("bestSoFar") : t("performanceTarget");
  }

  function getTargetProgressLabel() {
    return config.PREVIOUS_SCORES.length ? t("goal") : t("target");
  }

  function shouldShowPreviousScoresBoard() {
    return Boolean(state.phase === "main" && config.SHOW_PREVIOUS_SCORES_BOARD && config.PREVIOUS_SCORES.length);
  }

  function didMeetTarget(score) {
    return config.PREVIOUS_SCORES.length ? score > getHighestPreviousScore() : score >= getEffectiveTargetCorrect();
  }

  function getHighestPreviousScore() {
    return config.PREVIOUS_SCORES.reduce((maxScore, entry) => Math.max(maxScore, entry.score), 0);
  }

  function getAppNameText() {
    if (isHebrewMode() && config.APP_NAME === defaults.APP_NAME) {
      return t("appName");
    }

    return config.APP_NAME;
  }

  function getIntroText() {
    return config.INTRO_TEXT;
  }

  function getPracticeText() {
    if (isHebrewMode() && config.PRACTICE_TEXT === defaults.PRACTICE_TEXT) {
      return t("defaultPracticeText");
    }

    return config.PRACTICE_TEXT;
  }

  function getSummaryText() {
    return config.SUMMARY_TEXT;
  }

  function getContinueApprovalPrompt() {
    return isHebrewMode() ? "האם הנסיין אישר לכם להמשיך?" : t("continueApprovalPrompt");
  }

  function renderPreviousScoresBoard(options = {}) {
    const { inIntro = false } = options;
    const leadingIndex = getLeadingPreviousScoreIndex();
    const rows = config.PREVIOUS_SCORES.map((entry, index) => {
      return `
        <li class="leaderboard-item ${index === leadingIndex ? "is-leading" : ""}">
          <div class="leaderboard-name">${escapeHtml(entry.label)}</div>
          <div class="leaderboard-score">${entry.score}</div>
        </li>
      `;
    }).join("");

    return `
      <aside class="leaderboard-panel ${inIntro ? "is-intro" : ""}" aria-label="${escapeHtml(t("previousScores"))}">
        <div class="leaderboard-title">${escapeHtml(t("previousScores"))}</div>
        <ol class="leaderboard-list">
          ${rows}
        </ol>
      </aside>
    `;
  }

  function getLeadingPreviousScoreIndex() {
    if (!config.PREVIOUS_SCORES.length) {
      return -1;
    }

    let leadingIndex = 0;
    let leadingScore = config.PREVIOUS_SCORES[0].score;

    config.PREVIOUS_SCORES.forEach((entry, index) => {
      if (entry.score > leadingScore) {
        leadingScore = entry.score;
        leadingIndex = index;
      }
    });

    return leadingIndex;
  }

  function getParticipantMeta() {
    return {
      participantId: config.PARTICIPANT_ID,
      sessionId: config.SESSION_ID,
      condition: config.CONDITION
    };
  }

  function clearTimers() {
    clearMainTimer();
    clearFeedbackTimer();
  }

  function clearMainTimer() {
    if (state.mainTimerId !== null) {
      window.clearInterval(state.mainTimerId);
      state.mainTimerId = null;
    }
  }

  function clearFeedbackTimer() {
    if (state.feedbackTimerId !== null) {
      window.clearTimeout(state.feedbackTimerId);
      state.feedbackTimerId = null;
    }
  }

  function getRemainingTimeMs() {
    if (!state.mainDeadlinePerf) {
      return state.phase === "practice"
        ? config.PRACTICE_PERIOD_SECONDS * 1000
        : config.WORK_PERIOD_SECONDS * 1000;
    }
    return Math.max(0, Math.round(state.mainDeadlinePerf - performance.now()));
  }

  function isBlockExpired() {
    return getRemainingTimeMs() <= 0;
  }

  function getAccuracy(trials) {
    if (!trials.length) {
      return "-";
    }

    const correctCount = trials.filter((trial) => trial.isCorrect).length;
    return `${Math.round((correctCount / trials.length) * 100)}%`;
  }

  function parseBoolean(value, fallbackValue) {
    if (value === null) {
      return fallbackValue;
    }

    const normalized = value.trim().toLowerCase();

    if (["1", "true", "yes", "y", "on"].includes(normalized)) {
      return true;
    }

    if (["0", "false", "no", "n", "off"].includes(normalized)) {
      return false;
    }

    return fallbackValue;
  }

  function parseInteger(value, fallbackValue) {
    const parsed = Number.parseInt(String(value), 10);
    return Number.isInteger(parsed) ? parsed : fallbackValue;
  }

  function parsePreviousScores(rawValue, hebrewMode = false) {
    if (!rawValue) {
      return [];
    }

    const value = String(rawValue).trim();
    if (!value) {
      return [];
    }

    try {
      const parsedJson = JSON.parse(value);
      if (Array.isArray(parsedJson)) {
        return normalizePreviousScores(parsedJson, hebrewMode);
      }
    } catch (error) {
      // Fall through to delimited parsing.
    }

    const tokens = value.split(/[|;]/).map((token) => token.trim()).filter(Boolean);
    return normalizePreviousScores(tokens, hebrewMode);
  }

  function normalizePreviousScores(entries, hebrewMode = false) {
    return entries
      .map((entry, index) => normalizePreviousScoreEntry(entry, index, hebrewMode))
      .filter(Boolean);
  }

  function normalizePreviousScoreEntry(entry, index, hebrewMode = false) {
    if (entry && typeof entry === "object") {
      const label = normalizeCompetitorLabel(entry.label || entry.name, index, hebrewMode);
      return {
        label,
        score: clampInteger(entry.score, 0, 10000)
      };
    }

    const rawEntry = String(entry || "").trim();
    if (!rawEntry) {
      return null;
    }

    const namedMatch = rawEntry.match(/^(.*?)[=:]\s*(-?\d+)$/);
    if (namedMatch) {
      return {
        label: normalizeCompetitorLabel(namedMatch[1], index, hebrewMode),
        score: clampInteger(namedMatch[2], 0, 10000)
      };
    }

    if (/^-?\d+$/.test(rawEntry)) {
      return {
        label: getCompetitorLabel(index + 1, hebrewMode),
        score: clampInteger(rawEntry, 0, 10000)
      };
    }

    return null;
  }

  function normalizeCompetitorLabel(value, index, hebrewMode = false) {
    const rawLabel = String(value || "").trim();

    if (!rawLabel) {
      return getCompetitorLabel(index + 1, hebrewMode);
    }

    if (hebrewMode) {
      if (/^(participant|competitor)\b/i.test(rawLabel)) {
        return rawLabel
          .replace(/^participant\b/i, "מתחרה")
          .replace(/^competitor\b/i, "מתחרה");
      }
      return rawLabel;
    }

    return rawLabel.replace(/^participant\b/i, "Competitor");
  }

  function getCompetitorLabel(index, hebrewMode = isHebrewMode()) {
    return hebrewMode ? `מתחרה ${index}` : `Competitor ${index}`;
  }

  function clampInteger(value, min, max) {
    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isInteger(parsed)) {
      return min;
    }
    return Math.min(Math.max(parsed, min), max);
  }

  function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function formatCountdown(seconds) {
    const wholeSeconds = Math.max(0, Math.ceil(seconds));
    const minutes = Math.floor(wholeSeconds / 60);
    const remainder = wholeSeconds % 60;
    return `${minutes}:${String(remainder).padStart(2, "0")}`;
  }

  function formatCountdownFromMs(milliseconds) {
    return formatCountdown(milliseconds / 1000);
  }

  function formatSeconds(totalSeconds) {
    if (totalSeconds < 60) {
      return `${totalSeconds} ${t("secondsShort")}`;
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return seconds === 0
      ? `${minutes} ${t("minutesShort")}`
      : `${minutes} ${t("minutesShort")} ${seconds} ${t("secondsShort")}`;
  }

  function getStartButtonLabel() {
    if (config.BLOCK_TYPE === "practice") {
      return t("startPractice");
    }

    if (config.BLOCK_TYPE === "main") {
      return t("start");
    }

    return t("beginPractice");
  }

  function isHebrewMode() {
    return Boolean(config.HEBREW_MODE);
  }

  function t(key, ...args) {
    const locale = isHebrewMode() ? "he" : "en";
    const value = COPY[locale][key];
    return typeof value === "function" ? value(...args) : value;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
