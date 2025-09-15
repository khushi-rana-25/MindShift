import { useEffect, useState } from 'react';
import LoginForm from './components/LoginForm';
import SignUp from './components/SignUp';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import HomePage from './components/HomePage';

function App() {
    const [user, setUser] = useState(null);
    const [authPage, setAuthPage] = useState('login');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        
        return () => unsubscribe();
    }, []);

    const togglePage = () => {
       setAuthPage(prevPage => prevPage === 'login' ? 'signup' : 'login');
    };

    if (loading) { 
            return <div className="flex items-center justify-center h-screen bg-slate-900 text-white">Loading...</div>;
    }

    if (user) {
        return <HomePage user={user} />;
    } else
        {

        if (authPage === 'signup') {
            return <SignUp onTogglePage={togglePage} />

        } else {
            return <LoginForm onTogglePage={togglePage} />
        }
   }
}

export default App;
