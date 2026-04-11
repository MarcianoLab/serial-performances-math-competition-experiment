window.TASK_DEFAULTS = Object.freeze({
  APP_NAME: "Arithmetic Performance Task",
  TASK_VERSION: "1.1.0",

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

  ALLOW_RESTART: true,
  AUTO_FOCUS_INPUT: true,
  INPUT_MAX_LENGTH: 4,
  COUNTDOWN_WARNING_SECONDS: 15,

  POST_MESSAGE_NAMESPACE: "arithmetic-task",
  POST_MESSAGE_TARGET_ORIGIN: "*",

  INTRO_TEXT:
    "Add the displayed two-digit numbers as quickly and accurately as you can during the timed block.",
  PRACTICE_TEXT:
    "Use the practice block to get comfortable with the response format before the timed block begins.",
  SUMMARY_TEXT:
    "The task is complete. Please wait for the survey page to continue or use the restart button below in standalone mode.",

  SHOW_PROGRESS_BAR: true,
  SHOW_ACCURACY_PANEL: true,
  SHOW_TRIALS_PANEL: true,
  SHOW_TRIAL_NUMBER_LABEL: true,

  SHOW_INTRO_TIMED_WORK_PERIOD: true,
  SHOW_INTRO_PERFORMANCE_TARGET: true,
  SHOW_INTRO_ITEM_FORMAT: true,
  SHOW_INTRO_IMMEDIATE_FEEDBACK: true,
  SHOW_INTRO_INSTRUCTIONS: true,

  SHOW_SUMMARY_CORRECT_CARD: true,
  SHOW_SUMMARY_TARGET_MET_CARD: true,

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
