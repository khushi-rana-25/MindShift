import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.js';
import Alert from './Alert.jsx';

function SignUp({ onTogglePage }){
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alertInfo, setAlertInfo] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try{
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            setAlertInfo({ message: 'Sign up successful!', type: 'success' });

            setName('');
            setEmail('');
            setPassword('');
        }
        catch(error){
            setAlertInfo({ message: `Error: ${error.message}`, type: 'error' });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900">
            {alertInfo && (
                <Alert 
                    message={alertInfo.message}
                    type={alertInfo.type}
                    onClose={() => setAlertInfo(null)} 
                />
            )}
            <form onSubmit={handleSubmit} className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-lg shadow-2xl">
            <h1 className="text-5xl font-bold text-center text-white">Sign Up</h1>

            <input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 text-white bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />

            <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 text-white bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />

            <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 text-white bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />

            <button type="submit" className="w-full px-4 py-3 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 transition-colors">Sign Up</button>

            <p className="text-sm text-center text-slate-400">
          Already have an account?{' '}
          <button 
            onClick={onTogglePage} 
            className="font-medium text-cyan-400 hover:underline focus:outline-none"
          >
            Log In
          </button>
        </p>
          </form>
        </div>
    );
}

export default SignUp;