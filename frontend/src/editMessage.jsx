import { useState } from "react";
import { FiEdit, FiCheck, FiX } from "react-icons/fi";

const EditMessage = ({ message, onSave, onCancel }) => {
  const [editedText, setEditedText] = useState(message.text);

  const handleSave = () => {
    if (editedText.trim() !== "") {
      onSave(editedText);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="text"
        value={editedText}
        onChange={(e) => setEditedText(e.target.value)}
        className="border rounded px-2 py-1 w-full"
      />
 <button 
  onClick={handleSave} 
  className="text-white bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 p-3 rounded-full shadow-lg hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 focus:outline-none transform transition duration-300 ease-in-out hover:scale-105"
>
  <FiCheck size={18} />
</button>

<button 
  onClick={onCancel} 
  className="text-white bg-gradient-to-r from-pink-400 to-orange-400 p-3 rounded-full shadow-lg hover:bg-gradient-to-r hover:from-pink-500 hover:to-orange-500 focus:outline-none transform transition duration-300 ease-in-out hover:scale-105"
>
  <FiX size={18} />
</button>
    </div>
  );
};

export default EditMessage;