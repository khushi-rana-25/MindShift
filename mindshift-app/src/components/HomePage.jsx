
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import Alert from "./Alert"; 
import { useState, useRef, useEffect } from "react";
import { callGeminiAPI } from '../gemini';
import LoadingIndicator from "./LoadingIndicator";
import ReactMarkdown from 'react-markdown';

import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, arrayUnion } from "firebase/firestore";

function HomePage({user}) {
    const [alertInfo, setAlertInfo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const chatEndRef = useRef(null); // pointer to the end of the chat
    const [isLoading, setIsLoading] = useState(false);
    const [currentConvoId, setCurrentConvoId] = useState(null); // Track current conversation ID

    useEffect(() => {
        if (!user) return; // Don't do anything if the user isn't loaded yet

        // This is our database query: "Get all conversations for the current user"
        const q = query(collection(db, "conversations"), where("userId", "==", user.uid));
        
        // onSnapshot is the magic part. It's a real-time listener from Firebase.
        // It runs once when the page loads, and then automatically runs again if the data ever changes.
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            if (!querySnapshot.empty) {
                // If the user has conversations, we'll take the first one for now.
                const conversationDoc = querySnapshot.docs[0];
                setMessages(conversationDoc.data().messages);
                setCurrentConvoId(conversationDoc.id);
            } else {
                // If the user has no conversations, start with the default welcome message.
                setMessages([{ text: "Welcome. Let's reframe a thought. What's on your mind today?", sender: 'app' }]);
                setCurrentConvoId(null);
            }
        });

        // This cleans up the listener when the component is removed, preventing memory leaks
        return () => unsubscribe();
    }, [user]); // The [user] means this effect will re-run if the user logs in or out.

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

        const newUserMessage = { text: userInput, sender: 'user', timestamp: new Date() };
        const updatedMessages = [...messages, newUserMessage];

        // 1. Update the UI with the user's message and start loading
        setMessages(updatedMessages);
        setUserInput('');
        setIsLoading(true);

        let currentId = currentConvoId;
        let aiResponseMessage;

        try {
            // --- This entire block is now wrapped in the main try...catch ---

            // 2. Save the user's message to the database
            if (currentId) {
                // If we're in an existing conversation, update it
                const convoRef = doc(db, "conversations", currentId);
                await updateDoc(convoRef, { messages: arrayUnion(newUserMessage) });
            } else {
                // If it's a new conversation, create it
                const newConvoRef = await addDoc(collection(db, "conversations"), {
                    userId: user.uid,
                    title: userInput.substring(0, 30) + "...",
                    createdAt: serverTimestamp(),
                    messages: updatedMessages // Start with the full history
                });
                setCurrentConvoId(newConvoRef.id); // Save the new ID to state
                currentId = newConvoRef.id; // Also use it in this function run
            }

            // 3. Call the AI
            const aiResponseText = await callGeminiAPI(updatedMessages);
            aiResponseMessage = { text: aiResponseText, sender: 'app', timestamp: new Date() };
            
            // 4. Save the AI's response to the database
            const convoRef = doc(db, "conversations", currentId);
            await updateDoc(convoRef, { messages: arrayUnion(aiResponseMessage) });

        } catch (error) {
            // If anything fails (AI call or DB save), create an error message
            console.error("Error during message send process:", error);
            aiResponseMessage = { text: "Sorry, something went wrong. Please check your connection and try again.", sender: 'app' };
        } finally {
            // 5. THIS IS THE KEY: This block now runs no matter what.
            // It updates the UI with the AI's response (or the error message)
            // and ALWAYS turns off the loading indicator.
            setIsLoading(false);
            // setMessages(prev => [...prev, aiResponseMessage]);
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