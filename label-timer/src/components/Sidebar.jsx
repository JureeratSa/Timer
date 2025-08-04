import React from 'react';
import { Clock, BarChart3, History, Timer, RotateCcw } from 'lucide-react';

const Sidebar = ({ 
  activeMenu, 
  setActiveMenu, 
  currentProject, 
  projects, 
  setCurrentProject, 
  loadProjectData, 
  deleteProject,
  isRunning,
  countdownTime,
  setCurrentTime,
  setIsRunning
}) => {
  const handleMenuChange = (menuItem) => {
    setActiveMenu(menuItem);
    
    // Stop timer when switching between stopwatch and countdown
    if (isRunning) {
      if ((menuItem === 'countdown' && activeMenu === 'stopwatch') ||
          (menuItem === 'stopwatch' && activeMenu === 'countdown')) {
        setIsRunning(false);
        if (menuItem === 'countdown') {
          setCurrentTime(countdownTime);
        } else {
          setCurrentTime(0);
        }
      }
    }
  };

  return (
    <div className="w-64 bg-white shadow-xl border-r border-gray-100">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Clock size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Label Timer</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <button
            onClick={() => handleMenuChange('dashboard')}
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
            onClick={() => handleMenuChange('history')}
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
            onClick={() => handleMenuChange('stopwatch')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeMenu === 'stopwatch' 
                ? 'bg-green-50 text-green-600 border border-green-200' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Timer size={20} />
            Stopwatch
          </button>
          <button
            onClick={() => handleMenuChange('countdown')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeMenu === 'countdown' 
                ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <RotateCcw size={20} />
            Countdown
          </button>
        </nav>

        {/* Project Selector */}
        {currentProject && (
          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Current Project
            </label>
            <select 
              value={currentProject?.id || ''} 
              onChange={(e) => {
                const project = projects.find(p => p.id === parseInt(e.target.value));
                setCurrentProject(project);
                if (project) loadProjectData(project);
              }}
              className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- เลือกโปรเจค --</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {currentProject && (
              <button
                onClick={() => deleteProject(currentProject.id)}
                className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                ลบ
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;