import React, { useState, useRef, useEffect } from "react";
import { FaTelegramPlane, FaSync, FaHistory } from "react-icons/fa";
import historyData from "./history.json"; // ✅ imported JSON file

interface ChatMessage {
  sender: "user" | "bot";
  text: React.ReactNode; // <== THE KEY FIX!
}

const ChatPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (input.trim() !== "") {
      const userMessage: ChatMessage = { sender: "user", text: input };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      setTimeout(() => {
        const botReply: ChatMessage = {
          sender: "bot",
          text: getBotReply(input),
        };
        setMessages((prev) => [...prev, botReply]);
      }, 1000);
    }
  };

  const getBotReply = (userText: string): React.ReactNode => {
    const lower = userText.toLowerCase();
    if (lower.includes("headache")) {
      return (
        <div className="text-left space-y-3 text-base leading-relaxed text-gray-800">
          <p><strong>Ugh, headaches are the worst. Here are a few ways to get some relief:</strong></p>
          <ul className="list-disc list-inside">
            <li><strong>Drink Water</strong> – Dehydration is a sneaky cause of headaches.</li>
            <li><strong>Rest Your Eyes</strong> – Take a break from screens.</li>
            <li><strong>Massage</strong> – Rub temples and neck gently.</li>
          </ul>
          <p><strong className="text-red-500">Seek help if severe.</strong></p>
        </div>
      );
    }
    return "I'm here for you. Please tell me more.";
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-start pt-24 text-gray-800 relative">
      {/* Logo */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <img src="/assets/logo.jpg" alt="PiKrous Logo" className="h-12 w-auto object-contain" />
      </div>

      {/* Top right */}
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <FaHistory
          className="text-xl text-gray-600 hover:text-gray-800 cursor-pointer"
          onClick={() => setSidebarOpen((prev) => !prev)}
          title="Chat History"
        />
        <FaSync
          className="text-xl text-gray-600 hover:text-gray-800 cursor-pointer"
          onClick={() => {
            setMessages([]);
            setInput("");
          }}
          title="Restart Chat"
        />
        <div className="relative">
          <img
            src="/assets/User.png"
            alt="User Profile"
            className="h-8 w-8 rounded-full border object-cover cursor-pointer hover:ring-2 hover:ring-blue-400"
            onClick={() => setMenuOpen((o) => !o)}
          />
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg ring-1 ring-gray-200 z-50">
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Settings</button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Log Out</button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Title */}
      <h1 className="text-xl font-semibold mb-4 text-blue-600">Ain't you feel good?</h1>

      {/* Chat + Input container with shift when sidebar open */}
      <div className={`w-[95%] max-w-4xl transition-all duration-300 ${sidebarOpen ? "mr-[25%]" : "mr-0"}`}>
        {/* Chat Window */}
        <div className="bg-white rounded-lg shadow-md p-6 h-[500px] overflow-y-auto mb-6">
          {messages.length === 0 && (
            <p className="text-center text-sm text-gray-400">No messages yet. Say something!</p>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`w-full flex mb-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-6 py-4 rounded-xl ${
                  msg.sender === "user"
                    ? "bg-blue-100 text-gray-800"
                    : "bg-white border border-blue-200 text-gray-800"
                } w-full max-w-[98%] text-lg leading-relaxed`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Box */}
        <div className="bg-white rounded-full px-4 py-2 flex items-center shadow-md">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Don't worry, just let me know."
            className="flex-grow bg-transparent outline-none placeholder-gray-500 text-gray-800 text-base"
          />
          <button onClick={handleSend} className="text-blue-600 hover:text-blue-700 ml-2">
            <FaTelegramPlane className="text-xl" />
          </button>
        </div>
      </div>

      {/* Sidebar - Recently */}
      <aside
        className={`fixed top-16 right-0 h-[calc(100vh-64px)] w-full md:w-1/4 bg-white p-4 sm:p-6 overflow-y-auto border-l border-gray-200 z-10 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Recently</h3>
        <ul className="space-y-4">
          {historyData.map((item) => (
            <li
              key={item.id}
              className="p-3 bg-white border border-gray-200 rounded-lg"
            >
              <p className="text-base sm:text-lg font-medium text-gray-800">{item.label}</p>
              <p className="text-sm text-gray-500">{item.date}</p>
              <p className="text-sm mt-1 text-gray-600">{item.details}</p>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
};

export default ChatPage;
