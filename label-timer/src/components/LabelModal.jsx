import React from 'react';

const LabelModal = ({ modalRef, labelOptions, addQuickLabel }) => {
  return (
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
  );
};

export default LabelModal;