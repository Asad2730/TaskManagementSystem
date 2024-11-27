import React, { useState, useEffect, useCallback, useMemo } from "react";
import { app } from "../../db/db";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useSelector } from "react-redux";
import { CustomDropdown, CustomTextInput } from "./components/UiInputs";
import { useNavigate } from "react-router-dom";



const db = getFirestore(app)

const TaskForm = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Low",
    dueDate: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showStorageDialog, setShowStorageDialog] = useState(false);

  useEffect(() => {
    if (!user) setError("Please login to add tasks.");
  }, [user]);

  const handleChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) setFormData((prev) => ({ ...prev, image: file }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const { title, description, dueDate, priority, image } = formData;
      if (!title || !description || !dueDate || !priority) {
        setError("Please fill all the fields.");
        return;
      }

      setLoading(true);
      try {
        let imageUrl = "https://www.shareicon.net/data/128x128/2015/05/20/41190_empty_256x256.png";
        if (image) {
          const storage = getStorage();
          const imageRef = ref(storage, `tasks/${image.name}`);
          try {
            await uploadBytes(imageRef, image);
            imageUrl = await getDownloadURL(imageRef);
          } catch (imgError) {
            if (imgError.code === "storage/unauthorized") {
              setShowStorageDialog(true);
            } else {
              console.log('img auth erorr',imgError)
              setShowStorageDialog(true);
            }
          }
        }

        const res_doc = await addDoc(collection(db, "tasks"), {
          title,
          description,
          priority,
          dueDate:new Date(dueDate),
          imageUrl,
          userId: user?.uid,
          createdAt: new Date(),
        });
        
        console.log('res is',res_doc)
        setFormData({ title: "", description: "", priority: "Low", dueDate: "", image: null });
        alert("Task added successfully!");
      } catch (err) {
        setError(`Error submitting task. Please try again later.${err}`);
      } finally {
        setLoading(false);
      }
    },
    [formData, user]
  );

  const buttonLabel = useMemo(() => (loading ? "Submitting..." : "Add Task"), [loading]);

  const priorityOptions = useMemo(() => ["Low", "Medium", "High"], []);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 px-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8 relative">
        <span
          onClick={() => navigate("/task")}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 cursor-pointer flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </span>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Add New Task</h2>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <CustomTextInput
            id="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Task Title"
            required
          />
          <CustomTextInput
            id="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Task Description"
            required
            type="textarea"
          />
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Add Image
            </label>
            <input
              type="file"
              id="image"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={handleImageChange}
            />
          </div>
          <CustomTextInput
            id="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            placeholder="Due Date"
            required
            type="date"
          />
          <CustomDropdown
            id="priority"
            value={formData.priority}
            onChange={handleChange}
            options={priorityOptions}
            placeholder="Select Priority"
            required
          />
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md font-medium transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed text-gray-200"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            disabled={loading}
          >
            {buttonLabel}
          </button>
        </form>
      </div>

      {showStorageDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-sm">
            <h3 className="text-xl font-bold">Storage Limit Reached</h3>
            <p className="mt-2">Please upgrade your storage plan to save images.</p>
            <button
              onClick={() => setShowStorageDialog(false)}
              className="mt-4 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskForm;
