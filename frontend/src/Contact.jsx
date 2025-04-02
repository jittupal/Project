import { useState } from "react";
import Avatar from "./Avatar.jsx";
import {  useEffect } from "react";
import confetti from "canvas-confetti";

export default function Contact({ id, username, onClick, selected, online, isTyping, darkMode }) {
  const [bgColor, setBgColor] = useState("");

  

  useEffect(() => {
    setBgColor(
      darkMode
        ? online
          ? "bg-gradient-to-r from-purple-600 to-indigo-500"
          : "bg-gradient-to-r from-gray-800 to-gray-900"
        : online
        ? "bg-gradient-to-r from-emerald-400 to-teal-300"
        : "bg-gradient-to-r from-blue-500 to-indigo-400"
    );
  }, [online, darkMode]); // Depend on `online` and `darkMode` props


  const handleClick = () => {
    // const emojis = ["🔥", "💖", "🚀", "🎉", "✨", "🌟"];
    // const randomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];
  
    // for (let i = 0; i < 10; i++) {
    //   setTimeout(() => {
    //     const el = document.createElement("div");
    //     el.innerText = randomEmoji();
    //     el.style.position = "fixed";
    //     el.style.left = `${Math.random() * 100}vw`;
    //     el.style.top = `${Math.random() * 100}vh`;
    //     el.style.fontSize = "2rem";
    //     el.style.transition = "transform 1s ease-out, opacity 1s ease-out";
    //     el.style.opacity = "1";
    //     document.body.appendChild(el);
  
    //     setTimeout(() => {
    //       el.style.transform = "translateY(-100px)";
    //       el.style.opacity = "0";
    //       setTimeout(() => el.remove(), 1000);
    //     }, 100);
    //   }, i * 100);
    // }
  
    onClick(id);
  };



  const [animatedUsername, setAnimatedUsername] = useState("");

useEffect(() => {
  let i = 0;
  const interval = setInterval(() => {
    if (i < username.length) {
      setAnimatedUsername(username.substring(0, i + 1));
      i++;
    } else {
      clearInterval(interval);
    }
  }, 100);

  return () => clearInterval(interval);
}, [username]);

  return (
    <div
      key={id}
      onClick={handleClick}
      className={`relative flex items-center gap-4 cursor-pointer transition-all duration-300 rounded-xl overflow-hidden shadow-lg transform hover:scale-[1.03] backdrop-blur-lg
        ${selected ? (darkMode ? "bg-gradient-to-r from-gray-800 to-gray-400 text-white" : "bg-gradient-to-r from-white to-gray-200 text-gray-900") : darkMode ? "hover:bg-gray-800/80" : "hover:bg-gray-100"} ${bgColor}
        ${darkMode ? "border border-gray-700/70" : "border border-gray-300/60"}`}
    >
      {selected && <div className="w-2 bg-pink-500 h-full rounded-r-full animate-pulse"></div>}
      <div className={`flex gap-5 py-5 px-6 items-center w-full relative backdrop-blur-md ${darkMode ? "bg-gray-900/40" : "bg-white/40"}`}>
        <Avatar online={online} username={username} userId={id} />
        <div className="flex flex-col w-full">
          <span className={`font-semibold text-lg tracking-wide transition-all ${darkMode ? "text-gray-200" : "text-gray-900"}`}>
          {animatedUsername}
          </span>
          <span className={`text-sm font-medium transition-all ${online ? "text-black animate-pulse text-" : "text-red-400 opacity-900"}`}>
  {online ? "✅ Available" : "❌ Away from keyboard"}
</span>
         {/* Conditionally render typing indicator */}
         {online && isTyping && (
            <span className="text-yellow-300 text-xs italic animate-pulse">Typing...</span>
          )}
        </div>
      </div>
    </div>
  );
}
