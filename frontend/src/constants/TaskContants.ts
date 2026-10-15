export const TASK_STATUSES = {
  NOT_VOTED: 0,
  VOTED: 1,
  TODO: 2,
  IN_PROGRESS: 3,
  DONE: 4,
};

export const STATUS_LABELS = {
  0: 'Not Voted',
  1: 'Voted',
  2: 'To Do',
  3: 'In Progress',
  4: 'Done',
};

export const PRIORITY_COLOR_LABELS: Record<number, string> = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
};

export const STORY_POINTS = [1, 2, 3, 5, 8, 13, 20, 40, 100];
