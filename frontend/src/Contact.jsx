import { useEffect, useState } from "react";
import Avatar from "./Avatar.jsx";

export default function Contact({ id, username, onClick, selected, online, lastMessage, isTyping }) {
  const [bgColor, setBgColor] = useState(""); // State to track background color

  // Function to handle click event and change color based on online status
  const handleClick = () => {
    setBgColor(online ? "bg-pink-200" : "bg-blue-200");
    onClick(id); // Ensure original click functionality remains
  };

  return (
    <div
      key={id}
      onClick={handleClick}
      className={`border border-gray-300 flex items-center gap-4 cursor-pointer transition-all duration-300 rounded-xl overflow-hidden shadow-2xl 
        transform hover:scale-105 hover:shadow-2xl ${selected ? "bg-white text-gray-900 scale-105" : "hover:bg-teal-200"} ${bgColor}`}
    >
      {selected && <div className="w-2 bg-purple-600 h-full rounded-r-full animate-pulse"></div>}
      <div className="flex gap-5 py-5 px-6 items-center w-full bg-opacity-90 relative">
        <Avatar online={online} username={username} userId={id} />
        <div className="flex flex-col w-full">
          <span className="text-gray-900 font-semibold text-lg tracking-wide transition-all duration-200">
            {username}
          </span>
          <span className={`text-sm font-medium transition-all duration-200 ${online ? "text-green-300 animate-pulse" : "text-gray-500"}`}>
            {online ? "Online" : "Offline"}
          </span>
          {isTyping && <span className="text-yellow-400 text-xs italic animate-bounce">Typing...</span>}
        </div>
      </div>
    </div>
  );
}
