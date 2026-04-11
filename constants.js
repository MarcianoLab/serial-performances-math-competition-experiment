window.TASK_DEFAULTS = Object.freeze({
  APP_NAME: "Addition Task",
  TASK_VERSION: "1.1.1",

  WORK_PERIOD_SECONDS: 30,
  PERFORMANCE_TARGET_CORRECT: 5,

  ENABLE_PRACTICE_BLOCK: true,
  PRACTICE_TRIAL_COUNT: 5,
  SHOW_IMMEDIATE_FEEDBACK: true,
  FEEDBACK_DURATION_MS: 700,

  MIN_ADDENDS: 5,
  MAX_ADDENDS: 5,
  MIN_NUMBER: 10,
  MAX_NUMBER: 99,

  ALLOW_RESTART: true,
  AUTO_FOCUS_INPUT: true,
  INPUT_MAX_LENGTH: 5,
  COUNTDOWN_WARNING_SECONDS: 15,

  POST_MESSAGE_NAMESPACE: "addition-task",
  POST_MESSAGE_TARGET_ORIGIN: "*",

  INTRO_TEXT: "",
  PRACTICE_TEXT:
    "Use the practice block to get comfortable with the response format before the timed block begins.",
  SUMMARY_TEXT: "",

  SHOW_PROGRESS_BAR: true,
  SHOW_ACCURACY_PANEL: false,
  SHOW_TRIALS_PANEL: false,
  SHOW_TRIAL_NUMBER_LABEL: false,

  SHOW_INTRO_TIMED_WORK_PERIOD: true,
  SHOW_INTRO_PERFORMANCE_TARGET: true,
  SHOW_INTRO_ITEM_FORMAT: false,
  SHOW_INTRO_IMMEDIATE_FEEDBACK: false,
  SHOW_INTRO_INSTRUCTIONS: false,

  SHOW_SUMMARY_CORRECT_CARD: true,
  SHOW_SUMMARY_TARGET_MET_CARD: false,

  URL_PARAM_MAP: Object.freeze({
    workSeconds: "WORK_PERIOD_SECONDS",
    target: "PERFORMANCE_TARGET_CORRECT",
    practice: "ENABLE_PRACTICE_BLOCK",
    practiceTrials: "PRACTICE_TRIAL_COUNT",
    feedback: "SHOW_IMMEDIATE_FEEDBACK",
    minAddends: "MIN_ADDENDS",
    maxAddends: "MAX_ADDENDS",
    minNumber: "MIN_NUMBER",
    maxNumber: "MAX_NUMBER",
    showIntroTimed: "SHOW_INTRO_TIMED_WORK_PERIOD",
    showIntroTarget: "SHOW_INTRO_PERFORMANCE_TARGET",
    showIntroFormat: "SHOW_INTRO_ITEM_FORMAT",
    showIntroFeedback: "SHOW_INTRO_IMMEDIATE_FEEDBACK",
    showInstructions: "SHOW_INTRO_INSTRUCTIONS",
    showTrials: "SHOW_TRIALS_PANEL",
    showTrialNumber: "SHOW_TRIAL_NUMBER_LABEL",
    showSummaryCorrect: "SHOW_SUMMARY_CORRECT_CARD",
    showSummaryTarget: "SHOW_SUMMARY_TARGET_MET_CARD",
    targetOrigin: "POST_MESSAGE_TARGET_ORIGIN"
  })
});
