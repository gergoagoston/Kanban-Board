import { PRIORITY_COLOR_LABELS } from '../constants/TaskContants';

export function getPriorityClass(priority: number | undefined) {
  if (priority != undefined) {
    return PRIORITY_COLOR_LABELS[priority];
  } else {
    return 'Medium';
  }
}
