import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

// Import components
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import HistoryComponent from './HistoryComponent';
import TimerInterface from './TimerInterface';
import LabelModal from './LabelModal';
import Notification from './Notification';

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
  
  // Timer settings
  const [intervalTime, setIntervalTime] = useState(60);
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
          if (activeMenu === 'countdown') {
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

      // Auto labeling for Mode 1
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
  }, [isRunning, mode, intervalTime, activeMenu]);

  // Global keyboard handling
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

  // Utility functions
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  // Project management
  const createProject = async () => {
    const { value: projectName } = await Swal.fire({
      title: '🎯 สร้างโปรเจคใหม่',
      text: 'กรอกชื่อโปรเจคที่ต้องการ',
      input: 'text',
      inputPlaceholder: 'เช่น: การศึกษาพฤติกรรม, งานวิจัย, โปรเจค A',
      showCancelButton: true,
      confirmButtonText: '✅ สร้าง',
      cancelButtonText: '❌ ยกเลิก',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.4)',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-xl font-bold text-gray-800',
        confirmButton: 'px-6 py-3 rounded-xl shadow-lg',
        cancelButton: 'px-6 py-3 rounded-xl'
      },
      inputValidator: (value) => {
        if (!value) {
          return 'กรุณากรอกชื่อโปรเจค!';
        }
        if (value.length < 2) {
          return 'ชื่อโปรเจคต้องมีอย่างน้อย 2 ตัวอักษร';
        }
        if (value.length > 50) {
          return 'ชื่อโปรเจคต้องไม่เกิน 50 ตัวอักษร';
        }
        if (projects.some(p => p.name.toLowerCase() === value.toLowerCase())) {
          return 'ชื่อโปรเจคนี้มีอยู่แล้ว!';
        }
      }
    });

    if (projectName) {
      const newProject = {
        id: Date.now(),
        name: projectName.trim(),
        createdAt: new Date().toISOString(),
        logs: []
      };
      
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      setCurrentProject(newProject);
      localStorage.setItem('labelTimerProjects', JSON.stringify(updatedProjects));
      
      Swal.fire({
        title: '🎉 สำเร็จ!',
        text: `สร้างโปรเจค "${projectName}" เรียบร้อยแล้ว`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: '#ffffff',
        customClass: {
          popup: 'rounded-2xl shadow-2xl'
        }
      });
      
      showNotificationMessage(`สร้างโปรเจค: ${projectName} สำเร็จ! 🎉`);
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

  const deleteProject = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    
    const result = await Swal.fire({
      title: '⚠️ ยืนยันการลบ',
      html: `
        <div class="text-center">
          <p class="text-lg mb-3">คุณต้องการลบโปรเจค</p>
          <p class="text-xl font-bold text-red-600 mb-3">"${project?.name}"</p>
          <p class="text-sm text-gray-600">ข้อมูลทั้งหมดจะหายไปและไม่สามารถกู้คืนได้</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '🗑️ ลบเลย',
      cancelButtonText: '📋 เก็บไว้',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.4)',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-xl font-bold text-gray-800',
        confirmButton: 'px-6 py-3 rounded-xl shadow-lg',
        cancelButton: 'px-6 py-3 rounded-xl'
      }
    });

    if (result.isConfirmed) {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      localStorage.setItem('labelTimerProjects', JSON.stringify(updatedProjects));
      
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
        setLabels([]);
        setLogs([]);
      }
      
      Swal.fire({
        title: '🗑️ ลบสำเร็จ!',
        text: `ลบโปรเจค "${project?.name}" เรียบร้อยแล้ว`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: '#ffffff',
        customClass: {
          popup: 'rounded-2xl shadow-2xl'
        }
      });
      
      showNotificationMessage('ลบโปรเจคสำเร็จ! 🗑️');
    }
  };

  // Label management
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
      projectId: currentProject?.id,
      timerType: activeMenu
    };
    
    const newLabels = [...labels, newLabel];
    setLabels(newLabels);
    
    const newLogs = [...logs, newLabel];
    setLogs(newLogs);
    
    modalRef.current?.close();
    showNotificationMessage(`เพิ่ม ${option.emoji} ${option.label} สำเร็จ!`);
    
    setTimeout(saveProjectData, 100);
  };

  const deleteLabel = async (labelId) => {
    const label = labels.find(l => l.id === labelId);
    
    const result = await Swal.fire({
      title: '🏷️ ลบ Label',
      html: `
        <div class="text-center">
          <div class="text-4xl mb-3">${label?.emoji}</div>
          <p class="text-lg">คุณต้องการลบ label</p>
          <p class="text-xl font-bold text-blue-600">"${label?.text}"</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '🗑️ ลบ',
      cancelButtonText: '📋 เก็บไว้',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        confirmButton: 'px-6 py-3 rounded-xl',
        cancelButton: 'px-6 py-3 rounded-xl'
      }
    });

    if (result.isConfirmed) {
      const updatedLabels = labels.filter(l => l.id !== labelId);
      const updatedLogs = logs.filter(l => l.id !== labelId);
      
      setLabels(updatedLabels);
      setLogs(updatedLogs);
      
      Swal.fire({
        title: '✅ ลบสำเร็จ!',
        text: 'ลบ label เรียบร้อยแล้ว',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#ffffff',
        customClass: {
          popup: 'rounded-2xl shadow-2xl'
        }
      });
      
      showNotificationMessage('ลบ label สำเร็จ! 🗑️');
      setTimeout(saveProjectData, 100);
    }
  };

  const deleteLog = async (logId) => {
    const log = logs.find(l => l.id === logId);
    
    const result = await Swal.fire({
      title: '📜 ลบรายการ',
      html: `
        <div class="text-center">
          ${log?.emoji ? `<div class="text-4xl mb-3">${log.emoji}</div>` : ''}
          <p class="text-lg">คุณต้องการลบรายการ</p>
          <p class="text-xl font-bold text-purple-600">"${log?.text || log?.action?.replace('_', ' ')}"</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '🗑️ ลบ',
      cancelButtonText: '📋 เก็บไว้',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        confirmButton: 'px-6 py-3 rounded-xl',
        cancelButton: 'px-6 py-3 rounded-xl'
      }
    });

    if (result.isConfirmed) {
      const updatedLogs = logs.filter(l => l.id !== logId);
      setLogs(updatedLogs);
      
      const updatedLabels = labels.filter(l => l.id !== logId);
      setLabels(updatedLabels);
      
      Swal.fire({
        title: '✅ ลบสำเร็จ!',
        text: 'ลบรายการเรียบร้อยแล้ว',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#ffffff',
        customClass: {
          popup: 'rounded-2xl shadow-2xl'
        }
      });
      
      showNotificationMessage('ลบรายการสำเร็จ! 🗑️');
      setTimeout(saveProjectData, 100);
    }
  };

  // Timer controls
  const handleStart = () => {
    if (activeMenu === 'countdown' && currentTime === 0) {
      setCurrentTime(countdownTime);
    }
    setIsRunning(true);
    
    const logEntry = {
      id: Date.now(),
      action: 'timer_started',
      time: currentTime,
      timestamp: new Date().toISOString(),
      mode: mode,
      projectId: currentProject?.id,
      timerType: activeMenu
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
      projectId: currentProject?.id,
      timerType: activeMenu
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
      projectId: currentProject?.id,
      timerType: activeMenu
    };
    setLogs([...logs, logEntry]);
    showNotificationMessage('หยุดจับเวลา ⏹️ (กด Export CSV เพื่อดาวน์โหลด)');
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentTime(activeMenu === 'countdown' ? countdownTime : 0);
    showNotificationMessage('รีเซ็ตเรียบร้อย 🔄');
  };

  // CSV Export
  const generateCSV = () => {
    if (labels.length === 0) return;

    const csvHeaders = ['Timestamp', 'Time (seconds)', 'Time (HH:MM:SS)', 'Emoji', 'Label', 'Mode', 'Timer Type'];
    const csvData = labels.map(label => [
      label.timestamp,
      label.time,
      formatTime(label.time),
      label.emoji,
      label.text,
      `Mode ${label.mode}`,
      label.timerType || 'stopwatch'
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

  // Render content based on active menu
  const renderContent = () => {
    switch(activeMenu) {
      case 'dashboard':
        return (
          <Dashboard 
            currentTime={currentTime}
            isRunning={isRunning}
            labels={labels}
            projects={projects}
            createProject={createProject}
            setCurrentProject={setCurrentProject}
            loadProjectData={loadProjectData}
            deleteProject={deleteProject}
            showNotificationMessage={showNotificationMessage}
            formatTimeForDisplay={formatTimeForDisplay}
          />
        );
      case 'history':
        return (
          <HistoryComponent 
            logs={logs}
            formatTime={formatTime}
            deleteLog={deleteLog}
          />
        );
      case 'stopwatch':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Stopwatch</h2>
            <TimerInterface 
              timerType="stopwatch"
              currentProject={currentProject}
              mode={mode}
              setMode={setMode}
              intervalTime={intervalTime}
              setIntervalTime={setIntervalTime}
              countdownTime={countdownTime}
              setCountdownTime={setCountdownTime}
              currentTime={currentTime}
              formatTime={formatTime}
              isRunning={isRunning}
              handleStart={handleStart}
              handlePause={handlePause}
              handleStop={handleStop}
              handleReset={handleReset}
              requestLabel={requestLabel}
              labels={labels}
              generateCSV={generateCSV}
              deleteLabel={deleteLabel}
              createProject={createProject}
            />
          </div>
        );
      case 'countdown':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Countdown Timer</h2>
            <TimerInterface 
              timerType="countdown"
              currentProject={currentProject}
              mode={mode}
              setMode={setMode}
              intervalTime={intervalTime}
              setIntervalTime={setIntervalTime}
              countdownTime={countdownTime}
              setCountdownTime={setCountdownTime}
              currentTime={currentTime}
              formatTime={formatTime}
              isRunning={isRunning}
              handleStart={handleStart}
              handlePause={handlePause}
              handleStop={handleStop}
              handleReset={handleReset}
              requestLabel={requestLabel}
              labels={labels}
              generateCSV={generateCSV}
              deleteLabel={deleteLabel}
              createProject={createProject}
            />
          </div>
        );
      default:
        return (
          <Dashboard 
            currentTime={currentTime}
            isRunning={isRunning}
            labels={labels}
            projects={projects}
            createProject={createProject}
            setCurrentProject={setCurrentProject}
            loadProjectData={loadProjectData}
            deleteProject={deleteProject}
            showNotificationMessage={showNotificationMessage}
            formatTimeForDisplay={formatTimeForDisplay}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Notification */}
      <Notification 
        showNotification={showNotification}
        notificationMessage={notificationMessage}
      />

      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar 
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          currentProject={currentProject}
          projects={projects}
          setCurrentProject={setCurrentProject}
          loadProjectData={loadProjectData}
          deleteProject={deleteProject}
          isRunning={isRunning}
          countdownTime={countdownTime}
          setCurrentTime={setCurrentTime}
          setIsRunning={setIsRunning}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Label Modal */}
      <LabelModal 
        modalRef={modalRef}
        labelOptions={labelOptions}
        addQuickLabel={addQuickLabel}
      />
    </div>
  );
};

export default LabelTimerApp;