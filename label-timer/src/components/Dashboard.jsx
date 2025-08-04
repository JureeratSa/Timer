import React from 'react';
import { Plus, Clock, Target, History, User } from 'lucide-react';

const Dashboard = ({ 
  currentTime, 
  isRunning, 
  labels, 
  projects, 
  createProject,
  setCurrentProject,
  loadProjectData,
  deleteProject,
  showNotificationMessage,
  formatTimeForDisplay
}) => {
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
    <div>
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

      {/* Recent Projects */}
      {projects.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Recent Projects</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {projects.slice(-3).map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-800">{project.name}</div>
                    <div className="text-sm text-gray-500">
                      Created: {new Date(project.createdAt).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setCurrentProject(project);
                        loadProjectData(project);
                        showNotificationMessage(`เลือกโปรเจค: ${project.name} ✅`);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                    >
                      Select
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;