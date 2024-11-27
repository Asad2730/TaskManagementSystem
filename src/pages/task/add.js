import React, { useState, useEffect, useCallback, useMemo } from "react";
import { app } from "../../db/db";
import { addDoc, collection } from "firebase/firestore";
import { getStorage, ref, uploaappytes, getDownloadURL } from "firebase/storage";
import { useSelector } from "react-redux";
import { CustomDropdown, CustomTextInput } from "./components/UiInputs";

const TaskForm = () => {
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
        let imageUrl = "";
        if (image) {
          const storage = getStorage();
          const imageRef = ref(storage, `tasks/${image.name}`);
          await uploaappytes(imageRef, image);
          imageUrl = await getDownloadURL(imageRef);
        }

        await addDoc(collection(app, "tasks"), {
          title,
          description,
          priority,
          dueDate,
          imageUrl,
          userId: user?.uid,
          createdAt: new Date(),
        });

        setFormData({ title: "", description: "", priority: "Low", dueDate: "", image: null });
        alert("Task added successfully!");
      } catch (err) {
        setError("Error submitting task. Please try again later.");
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
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Add New Task</h2>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <CustomTextInput
            id="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title"
            required
            className="w-full"
          />
          
          <CustomTextInput
            id="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            required
            type="textarea"
            className="w-full"
          />
          
          <div className="mb-4">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">Add Image</label>
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
            className="w-full"
          />
          <CustomDropdown
            id="priority"
            value={formData.priority}
            onChange={handleChange}
            options={priorityOptions}
            placeholder="Priority"
            required
            className="w-full"
          />

          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
            disabled={loading}
          >
            {buttonLabel}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
