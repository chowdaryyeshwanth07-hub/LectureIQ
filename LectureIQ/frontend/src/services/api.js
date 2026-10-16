import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 45000,
});

export const getLectures = async () => {
  const res = await api.get('/lectures/');
  return res.data;
};

export const getDashboardStats = async () => {
  const res = await api.get('/lectures/dashboard');
  return res.data;
};

export const seedSampleLectures = async () => {
  const res = await api.post('/lectures/sample-seed');
  return res.data;
};

export const uploadLecture = async (formData) => {
  const res = await api.post('/lectures/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const getLectureDetails = async (id) => {
  const res = await api.get(`/lectures/${id}`);
  return res.data;
};

export const deleteLecture = async (id) => {
  const res = await api.delete(`/lectures/${id}`);
  return res.data;
};

export const generateSummary = async (lectureId) => {
  const res = await api.post(`/summarization/${lectureId}/summary`);
  return res.data;
};

export const generateNotes = async (lectureId) => {
  const res = await api.post(`/summarization/${lectureId}/notes`);
  return res.data;
};

export const generateFlashcards = async (lectureId, count = 6) => {
  const res = await api.post(`/flashcards/generate/${lectureId}?count=${count}`);
  return res.data;
};

export const updateFlashcardMastery = async (cardId, status) => {
  const res = await api.patch(`/flashcards/${cardId}`, { mastery_status: status });
  return res.data;
};

export const generateQuiz = async (lectureId, count = 5) => {
  const res = await api.post(`/quizzes/generate/${lectureId}?count=${count}`);
  return res.data;
};

export const submitQuiz = async (lectureId, answers) => {
  const res = await api.post(`/quizzes/submit/${lectureId}`, { answers });
  return res.data;
};

export const chatWithLecture = async (lectureId, query) => {
  const res = await api.post(`/lectures/${lectureId}/chat`, { query });
  return res.data;
};

export const getChatHistory = async (lectureId) => {
  const res = await api.get(`/lectures/${lectureId}/chat-history`);
  return res.data;
};

export const searchGlobal = async (query) => {
  const res = await api.get(`/search?query=${encodeURIComponent(query)}`);
  return res.data;
};

export const getExportUrl = (lectureId, format = 'markdown') => {
  return `/api/export/${lectureId}?format=${format}`;
};

export const getSettings = async () => {
  const res = await api.get('/settings/');
  return res.data;
};

export const updateSettings = async (data) => {
  const res = await api.post('/settings/', data);
  return res.data;
};

export const runBacktestSuite = async () => {
  const res = await api.get('/backtest/run');
  return res.data;
};

export const runExamSimulation = async () => {
  const res = await api.get('/backtest/exam-simulation');
  return res.data;
};

export default api;
