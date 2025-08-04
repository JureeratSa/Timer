import React from 'react';
import { History } from 'lucide-react';


const HistoryComponent = ({ logs, formatTime, deleteLog }) => {
  return (
    <div>
      <h2 className="flex text-2xl font-bold text-gray-800 mb-6"> History</h2>
      {logs.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Activity Log</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.slice().reverse().map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {log.emoji && <div className="text-2xl">{log.emoji}</div>}
                    <div>
                      <div className="font-medium text-gray-800">
                        {log.text || log.action.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString('th-TH')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-mono text-gray-800">{formatTime(log.time)}</div>
                      <div className="text-xs text-gray-500">
                        {log.timerType || 'stopwatch'} • Mode {log.mode}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteLog(log.id)}
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
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
          <div className="text-gray-400 mb-4">
            <History size={64} className="mx-auto" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-600">No history yet</h3>
          <p className="text-gray-500">Start a timer to see your activity</p>
        </div>
      )}
    </div>
  );
};

export default HistoryComponent;