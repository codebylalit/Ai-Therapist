import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../App';

const NameInputPopup = ({ isOpen, onClose, onSubmit, userName = '' }) => {
  const { theme } = useTheme();
  const [name, setName] = useState(userName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(name.trim());
    } catch (error) {
      console.error('Error saving name:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div 
        className={`relative w-full max-w-sm rounded-xl shadow-lg transform transition-all duration-300 animate-scale-in ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className={`text-lg font-bold lowercase ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              what should we call you?
            </h2>
            <button
              onClick={onClose}
              className={`text-gray-400 hover:text-gray-600 transition-colors ${
                theme === 'dark' && 'hover:text-gray-200'
              }`}
            >
              <X size={20} />
            </button>
          </div>
          
          <p className={`mb-6 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            this will help create a more personalized experience for you. how would you like to be addressed?
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Alex"
              className={`w-full px-4 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-6 ${
                theme === 'dark'
                  ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-yellow-500'
              }`}
              autoFocus
              required
              minLength={2}
              maxLength={50}
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className={`px-5 py-2 text-sm rounded-lg font-semibold transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || isSubmitting}
                className={`px-5 py-2 text-sm rounded-lg font-semibold transition-colors flex items-center justify-center ${
                  !name.trim() || isSubmitting
                    ? 'bg-yellow-400/50 text-yellow-900/60 cursor-not-allowed'
                    : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-yellow-900 border-t-transparent rounded-full animate-spin mr-2"></div>
                    saving...
                  </>
                ) : (
                  'confirm'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NameInputPopup; 