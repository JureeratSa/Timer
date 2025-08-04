import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Plus, Download, Clock, Target, History, CheckCircle, Calendar, Settings, User, BarChart3 } from 'lucide-react';

const LabelTimerApp = () => {
  // State management
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [mode, setMode] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [labels, setLabels] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  // Mode 1 settings
  const [intervalTime, setIntervalTime] = useState(60);
  const [timerMode, setTimerMode] = useState('stopwatch');
  const [countdownTime, setCountdownTime] = useState(300);
  
  // Refs
  const intervalRef = useRef(null);
  const labelIntervalRef = useRef(null);
  const modalRef = useRef(null);

  // Label options with emojis
  const labelOptions = [
    { key: '1', emoji: '😴', label: 'ไม่มีอาการ', color: 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100' },
    { key: '2', emoji: '😊', label: 'ปกติ', color: 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100' },
    { key: '3', emoji: '😣', label: 'เจ็บ', color: 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100' },
    { key: '4', emoji: '😰', label: 'เจ็บมาก', color: 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100' }
  ];

  // Initialize projects
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('labelTimerProjects') || '[]');
    setProjects(saved);
    if (saved.length > 0 && !currentProject) {
      setCurrentProject(saved[0]);
      loadProjectData(saved[0]);
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (timerMode === 'countdown') {
            const newTime = prev - 1;
            if (newTime <= 0) {
              handleStop();
              return 0;
            }
            return newTime;
          } else {
            return prev + 1;
          }
        });
      }, 1000);

      if (mode === 1) {
        labelIntervalRef.current = setInterval(() => {
          requestLabel();
        }, intervalTime * 1000);
      }
    } else {
      clearInterval(intervalRef.current);
      clearInterval(labelIntervalRef.current);
    }

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(labelIntervalRef.current);
    };
  }, [isRunning, mode, intervalTime, timerMode]);

  // Global keyboard handling for quick labeling
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isRunning || !currentProject) return;
      
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      const option = labelOptions.find(opt => opt.key === e.key);
      if (option) {
        e.preventDefault();
        addQuickLabel(option);
        
        if (modalRef.current && modalRef.current.open) {
          modalRef.current.close();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, currentProject, currentTime, labels, logs]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins.toString().padStart(2, '0')}m`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeForDisplay = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const showNotificationMessage = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const createProject = () => {
    const projectName = prompt('ชื่อโปรเจค:');
    if (projectName) {
      const newProject = {
        id: Date.now(),
        name: projectName,
        createdAt: new Date().toISOString(),
        logs: []
      };
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      setCurrentProject(newProject);
      localStorage.setItem('labelTimerProjects', JSON.stringify(updatedProjects));
      showNotificationMessage('สร้างโปรเจคสำเร็จ! 🎉');
    }
  };

  const loadProjectData = (project) => {
    const savedLogs = project.logs || [];
    setLogs(savedLogs);
    const savedLabels = savedLogs.filter(log => log.action === 'label_added');
    setLabels(savedLabels);
  };

  const saveProjectData = () => {
    if (currentProject) {
      const updatedProjects = projects.map(p => 
        p.id === currentProject.id ? { ...p, logs: logs } : p
      );
      setProjects(updatedProjects);
      localStorage.setItem('labelTimerProjects', JSON.stringify(updatedProjects));
    }
  };

  const requestLabel = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D1uncsccP');
    audio.play().catch(() => {});
    
    showNotificationMessage('🎯 กดปุ่ม 1-4 เพื่อเลือก Label ด่วน!');
    
    if (mode === 2) {
      modalRef.current?.showModal();
    }
  };

  const addQuickLabel = (option) => {
    const newLabel = {
      id: Date.now(),
      text: option.label,
      emoji: option.emoji,
      time: currentTime,
      timestamp: new Date().toISOString(),
      mode: mode,
      action: 'label_added',
      projectId: currentProject?.id
    };
    
    const newLabels = [...labels, newLabel];
    setLabels(newLabels);
    
    const newLogs = [...logs, newLabel];
    setLogs(newLogs);
    
    modalRef.current?.close();
    showNotificationMessage(`เพิ่ม ${option.emoji} ${option.label} สำเร็จ!`);
    
    setTimeout(saveProjectData, 100);
  };

  const handleStart = () => {
    if (timerMode === 'countdown' && currentTime === 0) {
      setCurrentTime(countdownTime);
    }
    setIsRunning(true);
    
    const logEntry = {
      id: Date.now(),
      action: 'timer_started',
      time: currentTime,
      timestamp: new Date().toISOString(),
      mode: mode,
      projectId: currentProject?.id
    };
    setLogs([...logs, logEntry]);
    showNotificationMessage('เริ่มจับเวลา ⏰');
  };

  const handlePause = () => {
    setIsRunning(false);
    
    const logEntry = {
      id: Date.now(),
      action: 'timer_paused',
      time: currentTime,
      timestamp: new Date().toISOString(),
      mode: mode,
      projectId: currentProject?.id
    };
    setLogs([...logs, logEntry]);
    showNotificationMessage('หยุดชั่วคราว ⏸️');
  };

  const handleStop = () => {
    setIsRunning(false);
    
    const logEntry = {
      id: Date.now(),
      action: 'timer_stopped',
      time: currentTime,
      timestamp: new Date().toISOString(),
      mode: mode,
      projectId: currentProject?.id
    };
    setLogs([...logs, logEntry]);
    showNotificationMessage('หยุดจับเวลา ⏹️');
    
    setTimeout(generateCSV, 500);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentTime(timerMode === 'countdown' ? countdownTime : 0);
    setLabels([]);
    showNotificationMessage('รีเซ็ตเรียบร้อย 🔄');
  };

  const generateCSV = () => {
    if (labels.length === 0) return;

    const csvHeaders = ['Timestamp', 'Time (seconds)', 'Time (MM:SS)', 'Emoji', 'Label', 'Mode'];
    const csvData = labels.map(label => [
      label.timestamp,
      label.time,
      formatTime(label.time),
      label.emoji,
      label.text,
      `Mode ${label.mode}`
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentProject?.name || 'timer'}_labels_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotificationMessage('ดาวน์โหลด CSV สำเร็จ! 📁');
  };

  const getTodayDate = () => {
    const today = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    return {
      day: today.getDate(),
      month: months[today.getMonth()],
      dayName: days[today.getDay()]
    };
  };

  const today = getTodayDate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50">
          <div className="alert alert-success bg-white shadow-lg border border-green-200 rounded-xl">
            <CheckCircle size={20} className="text-green-500" />
            <span className="text-gray-800">{notificationMessage}</span>
          </div>
        </div>
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-xl border-r border-gray-100">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Clock size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Label Timer</h1>
              </div>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveMenu('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeMenu === 'dashboard' 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BarChart3 size={20} />
                Dashboard
              </button>
              <button
                onClick={() => setActiveMenu('history')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeMenu === 'history' 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <History size={20} />
                History
              </button>
              <button
                onClick={() => setActiveMenu('calendar')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeMenu === 'calendar' 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Calendar size={20} />
                Calendar
              </button>
              <button
                onClick={() => setActiveMenu('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeMenu === 'settings' 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Settings size={20} />
                Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Hello, Timer!</h2>
                    <p className="text-gray-500">{today.day} {today.month}, <span className="text-blue-500">{today.dayName}</span></p>
                  </div>
                </div>
              </div>
              <button 
                onClick={createProject} 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <Plus size={18} />
                โปรเจคใหม่
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Timer Card */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-blue-100 text-sm">Current Session</p>
                    <h3 className="text-3xl font-bold">{formatTimeForDisplay(currentTime)}</h3>
                  </div>
                  <div className="text-blue-200">
                    <Clock size={32} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-blue-100">
                    {isRunning ? 'Running' : 'Stopped'}
                  </span>
                </div>
              </div>

              {/* Labels Count */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-500 text-sm">Labels Today</p>
                    <h3 className="text-3xl font-bold text-gray-800">{labels.length}</h3>
                  </div>
                  <div className="text-gray-400">
                    <Target size={32} />
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {labels.length > 0 ? 'Great progress!' : 'Start labeling'}
                </div>
              </div>

              {/* Projects Count */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-500 text-sm">Total Projects</p>
                    <h3 className="text-3xl font-bold text-gray-800">{projects.length}</h3>
                  </div>
                  <div className="text-gray-400">
                    <History size={32} />
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {projects.length > 0 ? 'Active workspace' : 'Create your first project'}
                </div>
              </div>
            </div>

            {currentProject && (
              <>
                {/* Project Selector */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    📁 Current Project
                  </label>
                  <select 
                    value={currentProject?.id || ''} 
                    onChange={(e) => {
                      const project = projects.find(p => p.id === parseInt(e.target.value));
                      setCurrentProject(project);
                      if (project) loadProjectData(project);
                    }}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- เลือกโปรเจค --</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({new Date(project.createdAt).toLocaleDateString('th-TH')})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mode Selection */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Mode</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setMode(1)}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                        mode === 1 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Clock size={24} className="mx-auto mb-2" />
                      <div className="font-medium">Auto Label</div>
                      <div className="text-sm opacity-70">Automatic intervals</div>
                    </button>
                    <button
                      onClick={() => setMode(2)}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                        mode === 2 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Target size={24} className="mx-auto mb-2" />
                      <div className="font-medium">Manual Label</div>
                      <div className="text-sm opacity-70">Manual control</div>
                    </button>
                  </div>
                </div>

                {/* Timer Display */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-6 text-center">
                  <div className="text-8xl font-mono font-bold text-gray-800 mb-6">
                    {formatTime(currentTime)}
                  </div>
                  
                  <div className="flex justify-center gap-4 flex-wrap">
                    {!isRunning ? (
                      <button 
                        onClick={handleStart} 
                        className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl flex items-center gap-3 shadow-lg transition-all duration-200 hover:shadow-xl"
                      >
                        <Play size={24} />
                        Start
                      </button>
                    ) : (
                      <button 
                        onClick={handlePause} 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-xl flex items-center gap-3 shadow-lg transition-all duration-200 hover:shadow-xl"
                      >
                        <Pause size={24} />
                        Pause
                      </button>
                    )}
                    
                    <button 
                      onClick={handleStop} 
                      className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl flex items-center gap-3 shadow-lg transition-all duration-200 hover:shadow-xl"
                    >
                      <Square size={24} />
                      Stop
                    </button>
                    
                    <button 
                      onClick={handleReset} 
                      className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                    >
                      🔄 Reset
                    </button>
                  </div>

                  {/* Keyboard Shortcuts */}
                  {isRunning && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="text-sm text-blue-800">
                        <span className="font-medium">Quick Keys:</span>
                        <span className="ml-2">Press 1-4 for instant labeling</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Labels Display */}
                {labels.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Recent Labels ({labels.length})
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {labels.slice(-5).reverse().map((label) => (
                          <div key={label.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{label.emoji}</div>
                              <div>
                                <div className="font-medium text-gray-800">{label.text}</div>
                                <div className="text-sm text-gray-500">
                                  {new Date(label.timestamp).toLocaleTimeString('th-TH')}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono text-gray-800">{formatTime(label.time)}</div>
                              <div className="text-xs text-gray-500">Mode {label.mode}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Download Button */}
                {labels.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
                    <button 
                      onClick={generateCSV} 
                      className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl flex items-center gap-3 mx-auto shadow-lg transition-all duration-200 hover:shadow-xl"
                    >
                      <Download size={20} />
                      ดาวน์โหลด CSV
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Label Modal */}
      <dialog ref={modalRef} className="modal">
        <div className="modal-box max-w-md bg-white rounded-2xl shadow-2xl">
          <h3 className="font-bold text-xl mb-4 text-gray-800">⚡ เลือก Label ด่วน</h3>
          <p className="mb-6 text-center text-gray-600">
            เลือก Label ที่ต้องการ หรือกดปุ่ม 1-4 ในคีย์บอร์ด
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {labelOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => addQuickLabel(option)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 ${option.color}`}
              >
                <div className="text-3xl">{option.emoji}</div>
                <div className="font-medium">{option.label}</div>
                <div className="text-xs opacity-70">กด {option.key}</div>
              </button>
            ))}
          </div>
          
          <div className="modal-action">
            <button 
              className="btn btn-ghost" 
              onClick={() => modalRef.current?.close()}
            >
              ยกเลิก
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default LabelTimerApp;