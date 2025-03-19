export default function Avatar({ userId, username, online }) {
  const colors = [
    'bg-teal-200', 'bg-red-200', 'bg-green-200', 'bg-purple-200',
    'bg-blue-200', 'bg-yellow-200', 'bg-orange-200', 'bg-pink-200',
    'bg-fuchsia-200', 'bg-rose-200'
  ];

  const userIdBase10 = parseInt(userId.substring(10), 16);
  const colorIndex = userIdBase10 % colors.length;
  const color = colors[colorIndex];

  return (
    <div className={"w-10 h-10 relative rounded-full flex items-center justify-center shadow-lg " + color + " transition-all duration-300 hover:scale-110"}>
      <div className="text-center w-full text-lg font-semibold text-gray-800 opacity-80">{username[0]}</div>
      {online && (
        <div className="absolute w-3.5 h-3.5 bg-green-400 bottom-0 right-0 rounded-full border-2 border-white shadow-md"></div>
      )}
      {!online && (
        <div className="absolute w-3.5 h-3.5 bg-gray-400 bottom-0 right-0 rounded-full border-2 border-white shadow-md"></div>
      )}
    </div>
  );
}
