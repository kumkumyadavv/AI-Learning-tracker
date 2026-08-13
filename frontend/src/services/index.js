import request from './api';

export function registerUser(input) {
  return request('/auth/register', { method: 'POST', body: input, auth: false });
}

export function loginUser(email, password) {
  const formBody = new URLSearchParams({ username: email, password }).toString();
  return request('/auth/login', { method: 'POST', formBody, auth: false });
}

export function getCurrentUser() {
  return request('/users/me');
}

export function getGoals() {
  return request('/goals');
}

export function getGoal(goalId) {
  return request(`/goals/${goalId}`);
}

export function createGoal(input) {
  return request('/goals', { method: 'POST', body: input });
}

export function updateGoal(goalId, input) {
  return request(`/goals/${goalId}`, { method: 'PATCH', body: input });
}

export function deleteGoal(goalId) {
  return request(`/goals/${goalId}`, { method: 'DELETE' });
}

export function generateRoadmap(goalId, prefs) {
  return request(`/ai/goals/${goalId}/generate-roadmap`, {
    method: 'POST',
    body: prefs,
  });
}

export function getRoadmap(goalId) {
  return request(`/ai/goals/${goalId}/roadmap`);
}

export function updateSubtask(subtaskId, completed) {
  return request(`/ai/subtasks/${subtaskId}`, { method: 'PATCH', body: { completed } });
}
