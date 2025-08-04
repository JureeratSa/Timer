import React from 'react';
import { Play, Pause, Square, Plus, Download, Target, RotateCcw } from 'lucide-react';

const TimerInterface = ({
  timerType,
  currentProject,
  mode,
  setMode,
  intervalTime,
  setIntervalTime,
  countdownTime,
  setCountdownTime,
  currentTime,
  formatTime,
  isRunning,
  handleStart,
  handlePause,
  handleStop,
  handleReset,
  requestLabel,
  labels,
  generateCSV,
  deleteLabel,
  createProject
}) => {
  if (!currentProject) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
        <div className="text-gray-400 mb-4">
          <Target size={64} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">No Project Selected</h3>
        <p className="text-gray-500 mb-4">Create or select a project to start timing</p>
        <button 
          onClick={createProject} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 mx-auto shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          <Plus size={18} />
          Create Project
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Mode & Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Mode Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Label Mode</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="mode"
                value="1"
                checked={mode === 1}
                onChange={(e) => setMode(parseInt(e.target.value))}
                className="text-blue-500"
              />
              <div>
                <div className="font-medium">Auto Label</div>
                <div className="text-sm text-gray-500">Automatic notification intervals</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="mode"
                value="2"
                checked={mode === 2}
                onChange={(e) => setMode(parseInt(e.target.value))}
                className="text-blue-500"
              />
              <div>
                <div className="font-medium">Manual Label</div>
                <div className="text-sm text-gray-500">Manual control only</div>
              </div>
            </label>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Settings</h3>
          <div className="space-y-4">
            {mode === 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔔 Auto Label Interval (seconds)
                </label>
                <input
                  type="number"
                  value={intervalTime}
                  onChange={(e) => setIntervalTime(parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="3600"
                />
              </div>
            )}
            
            {timerType === 'countdown' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⏳ Countdown Duration (seconds)
                </label>
                <input
                  type="number"
                  value={countdownTime}
                  onChange={(e) => setCountdownTime(parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="86400"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timer Display */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-6 text-center">
        <div className="text-8xl font-mono font-bold text-gray-800 mb-6">
          {formatTime(currentTime)}
        </div>
        
        <div className="flex justify-center gap-4 flex-wrap mb-6">
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
            <RotateCcw size={24} />
            Reset
          </button>

          {mode === 2 && (
            <button 
              onClick={requestLabel} 
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-xl flex items-center gap-3 shadow-lg transition-all duration-200 hover:shadow-xl"
              disabled={!isRunning}
            >
              <Plus size={24} />
              Add Label
            </button>
          )}
        </div>

        {/* Keyboard Shortcuts */}
        {isRunning && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
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
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Recent Labels ({labels.length})
              </h3>
              <button 
                onClick={generateCSV} 
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm shadow transition-all duration-200 hover:shadow-lg"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
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
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-mono text-gray-800">{formatTime(label.time)}</div>
                      <div className="text-xs text-gray-500">
                        {label.timerType || 'stopwatch'} • Mode {label.mode}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteLabel(label.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
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

export default TimerInterface;