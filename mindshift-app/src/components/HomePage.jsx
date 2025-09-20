
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import Alert from "./Alert";
import { useState, useRef, useEffect } from "react";
import { callGeminiAPI } from '../gemini';
import LoadingIndicator from "./LoadingIndicator";
import ReactMarkdown from 'react-markdown';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, arrayUnion, orderBy, deleteDoc } from "firebase/firestore";

const NewChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" transform="rotate(90 12 12)" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

function HomePage({user}) {
    const [alertInfo, setAlertInfo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);
    
    
    const [conversationList, setConversationList] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [convoToDelete, setConvoToDelete] = useState(null);

    
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "conversations"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const conversations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setConversationList(conversations);
            
            if (!activeConversationId && conversations.length > 0) {
                setActiveConversationId(conversations[0].id);
            }
        });
        return () => unsubscribe();
    }, [user]);

    
    useEffect(() => {
        if (!activeConversationId) {
            setMessages([{ text: "Welcome. Start a new conversation or select one from your history.", sender: 'app' }]);
            return;
        }
        const unsub = onSnapshot(doc(db, "conversations", activeConversationId), (doc) => {
            setMessages(doc.data()?.messages || []);
        });
        return () => unsub();
    }, [activeConversationId]);


    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error logging out:", error);
            setAlertInfo({ message: `Error: ${error.message}`, type: 'error' });
        }
    };

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

    const handleConfirmDelete = async () => {
    if (!convoToDelete) return;

        
        
        if (convoToDelete === activeConversationId) {
            setActiveConversationId(null);
        }

        try {
            
            await deleteDoc(doc(db, "conversations", convoToDelete));
            setConvoToDelete(null);
        } catch (error) {
            console.error("Error deleting conversation:", error);
            setAlertInfo({ type: 'error', message: 'Failed to delete chat.' });
            setConvoToDelete(null);
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

            
            {convoToDelete && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-lg flex items-center justify-center z-50">
                    <div className="relative w-full max-w-md p-6 bg-slate-800 rounded-xl shadow-2xl border border-white/10 animate-fade-in">
                        <h3 className="text-lg font-semibold text-slate-100">Confirm Deletion</h3>
                        <p className="mt-2 text-sm text-slate-300">
                            Are you sure you want to permanently delete this chat? This action cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                onClick={() => setConvoToDelete(null)}
                                className="px-5 py-2 text-sm font-semibold text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-5 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <aside className="w-64 flex flex-col bg-slate-800/50 backdrop-blur-lg border-r border-white/10">
                <div className="p-4 border-b border-white/10">
                    <button onClick={startNewChat} className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg">
                        <NewChatIcon /> New Chat
                    </button>
                </div>
                <nav className="flex-grow p-2 space-y-1 overflow-y-auto">
                    {conversationList.map(convo => (
                        <div key={convo.id} className="relative group">
                            <button onClick={() => setActiveConversationId(convo.id)} className={`w-full text-left block px-4 py-2 text-sm rounded-md truncate transition-colors ${ convo.id === activeConversationId ? 'bg-slate-700/50 text-white' : 'text-slate-300 hover:bg-slate-700/50' }`}>
                                {convo.title}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setConvoToDelete(convo.id); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 rounded-md opacity-0 group-hover:opacity-100 hover:bg-slate-600/50 hover:text-red-400 transition-opacity">
                                <DeleteIcon />
                            </button>
                        </div>
                    ))}
                </nav>
                <div className="p-4 border-t border-white/10">
                    <p className="text-xs text-slate-400">Logged in as:</p>
                    <p className="text-sm font-semibold text-cyan-300 truncate">{user?.email}</p>
                    <button onClick={handleLogout} className="w-full mt-4 flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-red-600/80 rounded-lg hover:bg-red-600 transition-colors">
                        <LogoutIcon /> Log Out
                    </button>
                </div>
            </aside>

            {/* --- THE CHAT AREA --- */}
            <div className="flex flex-col flex-grow">
                <header className="p-4 bg-slate-800/50 backdrop-blur-lg border-b border-white/10 shadow-md z-10">
                    <h1 className="text-xl font-bold text-center text-cyan-300">MindShift Session</h1>
                </header>
        
                <main className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-bubble-in`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-md ${message.sender === 'user' ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white' : 'bg-slate-700 text-slate-200'}`}>
                                <div className="prose prose-invert prose-p:my-0">
                                    <ReactMarkdown>
                                        {message.text}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && <LoadingIndicator />}
                    <div ref={chatEndRef} />
                </main>
            
                <footer className="p-4 bg-slate-800/50 backdrop-blur-lg border-t border-white/10">
                    <form onSubmit={handleSendMessage} className="flex items-center">
                        <input type="text" placeholder="What's on your mind..." value={userInput} onChange={(e) => setUserInput(e.target.value)} className="w-full px-4 py-3 text-white bg-slate-700/50 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-transparent focus:border-cyan-500" />
                        <button type="submit" className="px-4 py-3 font-semibold text-white bg-gradient-to-br from-cyan-500 to-blue-500 rounded-r-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg">
                            <SendIcon />
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
}

export default HomePage;