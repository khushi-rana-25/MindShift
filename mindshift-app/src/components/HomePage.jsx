
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import Alert from "./Alert";
import { useState, useRef, useEffect } from "react";
import { callGeminiAPI } from '../gemini';
import LoadingIndicator from "./LoadingIndicator";
import ReactMarkdown from 'react-markdown';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, arrayUnion, orderBy } from "firebase/firestore";

function HomePage({user}) {
    const [alertInfo, setAlertInfo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);
    
    // --- 1. NEW STATE MANAGEMENT ---
    const [conversationList, setConversationList] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);

    // --- 2. NEW LOGIC: This effect fetches the LIST of conversations for the sidebar ---
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "conversations"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const conversations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setConversationList(conversations);
            // If no conversation is selected, automatically select the most recent one.
            if (!activeConversationId && conversations.length > 0) {
                setActiveConversationId(conversations[0].id);
            }
        });
        return () => unsubscribe();
    }, [user]); // Runs when the user logs in

    // --- 3. NEW LOGIC: This effect loads the MESSAGES for the selected conversation ---
    useEffect(() => {
        if (!activeConversationId) {
            setMessages([{ text: "Welcome. Start a new conversation or select one from your history.", sender: 'app' }]);
            return;
        }
        const unsub = onSnapshot(doc(db, "conversations", activeConversationId), (doc) => {
            setMessages(doc.data()?.messages || []);
        });
        return () => unsub();
    }, [activeConversationId]); // Re-runs whenever the active conversation changes

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleLogout = async () => { /* ...no changes... */ };

    const handleSendMessage = async (event) => {
        event.preventDefault();
        if (!userInput.trim()) return;

        const newUserMessage = { text: userInput, sender: 'user', timestamp: new Date() };
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);
        setUserInput('');
        setIsLoading(true);

        let currentId = activeConversationId;
        
        try {
            if (currentId) {
                const convoRef = doc(db, "conversations", currentId);
                await updateDoc(convoRef, { messages: arrayUnion(newUserMessage) });
            } else {
                const newConvoRef = await addDoc(collection(db, "conversations"), {
                    userId: user.uid,
                    title: userInput.substring(0, 30) + "...",
                    createdAt: serverTimestamp(),
                    messages: updatedMessages
                });
                setActiveConversationId(newConvoRef.id);
                currentId = newConvoRef.id;
            }

            const aiResponseText = await callGeminiAPI(updatedMessages);
            const aiResponseMessage = { text: aiResponseText, sender: 'app', timestamp: new Date() };
            const convoRef = doc(db, "conversations", currentId);
            await updateDoc(convoRef, { messages: arrayUnion(aiResponseMessage) });
        } catch (error) {
            console.error("Error sending message:", error);
            setAlertInfo({ type: 'error', message: 'Failed to send message.' });
        } finally {
            setIsLoading(false);
        }
    };

    const startNewChat = () => {
        setActiveConversationId(null);
        setMessages([{ text: "Welcome. Let's reframe a thought. What's on your mind today?", sender: 'app' }]);
    }


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
                    <button onClick={startNewChat} className="w-full px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700">
                        + New Chat
                    </button>
    
                </div>
                <nav className="flex-grow p-2 space-y-1 overflow-y-auto">
                    {conversationList.map(convo => (
                        <button 
                          key={convo.id}
                          onClick={() => setActiveConversationId(convo.id)}
                          className={`w-full text-left block px-4 py-2 text-sm rounded-md truncate ${
                            convo.id === activeConversationId ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                            {convo.title}
                        </button>
                    ))}
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