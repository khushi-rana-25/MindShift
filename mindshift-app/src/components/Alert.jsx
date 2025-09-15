function Alert({ message, type, onClose }) {
  const isSuccess = type === 'success';

  const SuccessIcon = () => (
    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  );

  const ErrorIcon = () => (
    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-slate-800/50 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="relative w-full max-w-md p-6 bg-slate-800/50 rounded-xl shadow-2xl border border-white/10 animate-fade-in">
        
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {isSuccess ? <SuccessIcon /> : <ErrorIcon />}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-100">
              {isSuccess ? 'Success!' : 'Something went wrong'}
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
          >
            OK
          </button>
        </div>
        
      </div>
    </div>
  );
}

export default Alert;