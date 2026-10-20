const QUEUE_KEY = "farmzy_offline_tasks";

export const saveOfflineTask = (taskData) => {
  const existing = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  existing.push({ ...taskData, local_id: Date.now() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(existing));
};

export const getOfflineTasks = () => {
  return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
};

export const clearOfflineTasks = () => {
  localStorage.removeItem(QUEUE_KEY);
};