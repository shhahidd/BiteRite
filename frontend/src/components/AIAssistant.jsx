import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, Trash2, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

const AIAssistant = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Namaste! I am your AI Nutritional Assistant. How can I help you reach your health goals today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e, text = null) => {
        if (e) e.preventDefault();
        const messageText = text || input;
        if (!messageText.trim()) return;

        const newMessages = [...messages, { role: 'user', content: messageText }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:5000/api/ai/chat', {
                messages: newMessages
            });
            setMessages([...newMessages, response.data]);
        } catch (err) {
            console.error("AI Error:", err);
            setError(err.response?.data?.error || "Failed to connect to the AI Assistant.");
        } finally {
            setLoading(false);
        }
    };

    const quickPrompts = [
        "Suggest a high protein vegetarian dinner",
        "Benefits of intermittent fasting",
        "Healthy Indian snacks under 200 kcal",
        "How to improve my sleep quality?"
    ];

    return (
        <div className="container" style={{ maxWidth: '900px', height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="title" style={{ margin: 0, textAlign: 'left', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="icon-wrapper" style={{ background: 'var(--neon-purple)', padding: '10px', borderRadius: '12px' }}>
                            <Bot size={28} color="white" />
                        </div>
                        AI Assistant <span style={{ fontSize: '0.8rem', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--neon-purple)', padding: '4px 10px', borderRadius: '20px', marginLeft: '10px' }}>PHI-3</span>
                    </h1>
                </div>
                <button
                    onClick={() => setMessages([{ role: 'assistant', content: 'Chat history cleared. How can I help you now?' }])}
                    className="nav-item"
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
                >
                    <Trash2 size={16} /> Clear Chat
                </button>
            </div>

            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Chat History */}
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '10px' }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                maxWidth: '80%',
                                display: 'flex',
                                gap: '12px',
                                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: msg.role === 'user' ? 'var(--neon-blue)' : 'var(--neon-purple)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {msg.role === 'user' ? <User size={16} color="white" /> : <Bot size={16} color="white" />}
                                </div>
                                <div style={{
                                    padding: '1rem',
                                    borderRadius: '20px',
                                    background: msg.role === 'user' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                                    border: `1px solid ${msg.role === 'user' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(168, 85, 247, 0.2)'}`,
                                    color: 'white',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.5',
                                    boxShadow: msg.role === 'user' ? 'none' : '0 4px 15px rgba(168, 85, 247, 0.05)'
                                }}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--neon-purple)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Loader2 size={16} color="white" className="spin" />
                            </div>
                            <div className="pulse-animation" style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Assistant is thinking...
                            </div>
                        </div>
                    )}
                    {error && (
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--neon-red)',
                                background: 'rgba(239, 68, 68, 0.1)',
                                padding: '10px 20px',
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                border: '1px solid var(--neon-red)'
                            }}>
                                <AlertCircle size={18} /> {error}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                {!loading && messages.length <= 1 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Sparkles size={14} color="var(--neon-purple)" /> TRY THESE:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {quickPrompts.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(null, prompt)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        ':hover': { background: 'rgba(168, 85, 247, 0.1)', borderColor: 'var(--neon-purple)' }
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.background = 'rgba(168, 85, 247, 0.1)';
                                        e.target.style.borderColor = 'var(--neon-purple)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.05)';
                                        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                    }}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything about your diet or health..."
                        className="input-field"
                        style={{ flex: 1, margin: 0, padding: '15px 20px', borderRadius: '15px' }}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '60px', borderRadius: '15px', marginTop: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        disabled={loading || !input.trim()}
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AIAssistant;
