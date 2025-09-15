
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import Alert from "./Alert"; 
import { useState, useRef, useEffect } from "react";
import { callGeminiAPI } from '../gemini';
import LoadingIndicator from "./LoadingIndicator";
import ReactMarkdown from 'react-markdown';

function HomePage({user}) {
    const [alertInfo, setAlertInfo] = useState(null);
    const [messages, setMessages] = useState([
        { text: "Welcome. Let's reframe a thought. What's on your mind today?", sender: 'app' }
    ]);
    const [userInput, setUserInput] = useState('');

    const chatEndRef = useRef(null); // pointer to the end of the chat
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch(error) {
            setAlertInfo({ message: `Error: ${error.message}`, type: 'error' });
        }
    }

    const handleSendMessage = async (event) => {
        event.preventDefault();
        if (!userInput.trim()) return;

        const newUserMessage = { text: userInput, sender: 'user' };
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);
        setUserInput('');

        setIsLoading(true);
        let aiResponseMessage;

        try{
            const aiResponseText = await callGeminiAPI(updatedMessages);
            aiResponseMessage = { text: aiResponseText, sender: 'app' };
        }catch(error){
            aiResponseMessage = { text: "Sorry, something went wrong. Please try again.", sender: 'app' };
            console.error(error);
        }finally {
            setIsLoading(false);
            setMessages(prevMessages => [...prevMessages, aiResponseMessage]);
        }
    };

    return (
        <div className="flex h-screen bg-slate-900 text-white">

            {alertInfo && (
                <Alert
                    message={alertInfo.message}
                    type={alertInfo.type}
                    onClose={() => setAlertInfo(null)}
                />
            )}

            {/* --- Sidebar --- */}
            <aside className="w-64 flex flex-col bg-slate-800 border-r border-slate-700">
                <div className="p-4 border-b border-slate-700">
                   <h2 className="text-lg font-semibold text-white">History</h2>
                </div>
                <nav className="flex-grow p-2 space-y-1">
                    <a href="#" className="block px-4 py-2 text-sm rounded-md bg-cyan-600 text-white">
                        Trip with friends...
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm rounded-md text-slate-400 hover:bg-slate-700">
                        Feeling anxious about work...
                    </a>
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <p className="text-sm text-slate-400">Logged in as:</p>
                    <p className="text-sm font-semibold text-cyan-400 truncate">{user.email}</p>
                    <button 
                        onClick={handleLogout}
                        className="w-full mt-4 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                        Log Out
                    </button>
                </div>
            </aside>

            {/* --- The Chat Area --- */}
            <div className="flex flex-col flex-grow">
                <header className="p-4 bg-slate-800 border-b border-slate-700 shadow-md">
                    <h1 className="text-xl font-bold text-center text-cyan-400">MindShift Session</h1>
                </header>
        
                <main className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${message.sender === 'user' ? 'bg-cyan-600' : 'bg-slate-700'}`}>
                                          <ReactMarkdown>
                                              {message.text}  
                                          </ReactMarkdown>
                            </div>
                        </div>
                    ))}

                    {isLoading && <LoadingIndicator />}

                    <div ref={chatEndRef} />
                </main>

                <footer className="p-4 bg-slate-800 border-t border-slate-700">
                    <form onSubmit={handleSendMessage} className="flex flex-items-center">
                        <input
                            type="text"
                            placeholder="What's on your mind..."
                            value = {userInput}
                            onChange= {(e) => setUserInput(e.target.value)}
                            className="w-full px-4 py-2 text-white bg-slate-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 font-semibold text-white bg-cyan-600 rounded-r-md hover:bg-cyan-700"
                        >
                            Send
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
}

export default HomePage;