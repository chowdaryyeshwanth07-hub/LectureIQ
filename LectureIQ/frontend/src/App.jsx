import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import LecturesPage from './pages/LecturesPage';
import LectureDetailPage from './pages/LectureDetailPage';
import BacktestPage from './pages/BacktestPage';
import UploadModal from './components/UploadModal';
import SemanticSearchModal from './components/SemanticSearchModal';
import SettingsModal from './components/SettingsModal';
import { getLectures, getDashboardStats, seedSampleLectures, deleteLecture } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard', 'lectures', 'detail'
  const [selectedLectureId, setSelectedLectureId] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    try {
      const [lecturesData, statsData] = await Promise.all([
        getLectures(),
        getDashboardStats()
      ]);
      setLectures(lecturesData);
      setStats(statsData);

      // Auto-seed if brand new
      if (lecturesData.length === 0) {
        handleSeedDemo(true);
      }
    } catch (e) {
      console.error('Error loading data:', e);
    }
  };

  const handleSeedDemo = async (silent = false) => {
    try {
      setIsSeeding(true);
      await seedSampleLectures();
      setIsSeeding(false);
      const [lecturesData, statsData] = await Promise.all([
        getLectures(),
        getDashboardStats()
      ]);
      setLectures(lecturesData);
      setStats(statsData);
      if (!silent) {
        showToast('Successfully seeded 3 rich sample lectures!');
      }
    } catch (e) {
      setIsSeeding(false);
      console.error(e);
    }
  };

  const handleSelectLecture = (id) => {
    setSelectedLectureId(id);
    setCurrentTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteLecture = async (id) => {
    try {
      await deleteLecture(id);
      showToast('Lecture deleted successfully.');
      loadData();
      if (selectedLectureId === id) {
        setCurrentTab('dashboard');
        setSelectedLectureId(null);
      }
    } catch (e) {
      alert('Failed to delete lecture.');
    }
  };

  const handleUploadSuccess = (newLectureId) => {
    loadData();
    showToast('New lecture analyzed and added to library!');
    handleSelectLecture(newLectureId);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-indigo-600 text-white rounded-2xl shadow-2xl border border-indigo-400/40 text-xs font-bold animate-bounce flex items-center gap-2">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'detail') setSelectedLectureId(null);
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSeedDemo={() => handleSeedDemo(false)}
        isSeeding={isSeeding}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentTab === 'dashboard' && (
          <DashboardPage
            stats={stats}
            recentLectures={lectures.slice(0, 6)}
            onSelectLecture={handleSelectLecture}
            onDeleteLecture={handleDeleteLecture}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onSeedDemo={() => handleSeedDemo(false)}
            isSeeding={isSeeding}
          />
        )}

        {currentTab === 'lectures' && (
          <LecturesPage
            lectures={lectures}
            onSelectLecture={handleSelectLecture}
            onDeleteLecture={handleDeleteLecture}
            onOpenUpload={() => setIsUploadOpen(true)}
            onSeedDemo={() => handleSeedDemo(false)}
            isSeeding={isSeeding}
          />
        )}

        {currentTab === 'backtest' && (
          <BacktestPage />
        )}

        {currentTab === 'detail' && selectedLectureId && (
          <LectureDetailPage
            lectureId={selectedLectureId}
            onBack={() => {
              setCurrentTab('lectures');
              setSelectedLectureId(null);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>
          🎓 <strong>LectureIQ</strong> — AI Lecture-to-Learning Platform • Transcribe, Summarize, Flashcards, Quizzes & Grounded Q&A
        </p>
      </footer>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <SemanticSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLecture={handleSelectLecture}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

    </div>
  );
}
