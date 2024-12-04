import React, { useState, useEffect, useCallback, useMemo } from "react";
import { app } from "../../db/db";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { useSelector } from "react-redux";
import { CustomDropdown, CustomTextInput } from "./components/UiInputs";
import { useNavigate } from "react-router-dom";

const db = getFirestore(app);

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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!user) setErrors((prev) => ({ ...prev, global: "Please login to add tasks." }));
  }, [user]);

  const handleChange = (e, key) => {
    setFormData({ ...formData, [key]: e.target.value });
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  }, []);

  const validateFields = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required.";
    if (!formData.description) newErrors.description = "Description is required.";
    if (!formData.dueDate) newErrors.dueDate = "Due date is required.";
    if (!formData.image) newErrors.image = "Image is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async (e) => {
      e.preventDefault();
      if (!validateFields()) return;

      const { title, description, dueDate, priority, image } = formData;

      setLoading(true);
      try {
        let imageUrl = "";
        if (image) {
          const formData = new FormData();
        

          const response = await fetch("https://file.io", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();

          if (data.success) {
            console.log('IMG HERE', JSON.stringify(data, null, 2));
            imageUrl = data.link;
          } else {
            console.log('Failed to upload image ')
          }
        }

        await addDoc(collection(db, "tasks"), {
          title,
          description,
          priority,
          dueDate: new Date(dueDate),
          imageUrl,
          userId: user?.uid,
          createdAt: new Date(),
        });

        setFormData({ title: "", description: "", priority: "Low", dueDate: "", image: null });
        alert("Task added successfully!");
      } catch (err) {
        setErrors((prev) => ({ ...prev, global: `Error submitting task: ${err.message}` }));
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
        {errors.global && <p className="text-sm text-red-500 mb-4">{errors.global}</p>}
        <section className="space-y-5">
          <div>
            <CustomTextInput
              id="title"
              value={formData.title}
              onChange={(e) => handleChange(e, "title")}
              placeholder="Task Title"
              required
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>
          <div>
            <CustomTextInput
              id="description"
              value={formData.description}
              onChange={(e) => handleChange(e, "description")}
              placeholder="Task Description"
              required
              type="textarea"
            />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
          </div>
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
            {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image}</p>}
          </div>
          <div>
            <CustomTextInput
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => handleChange(e, "dueDate")}
              placeholder="Due Date"
              required
              type="date"
            />
            {errors.dueDate && <p className="text-sm text-red-500 mt-1">{errors.dueDate}</p>}
          </div>
          <CustomDropdown
            id="priority"
            value={formData.priority}
            onChange={(e) => handleChange(e, "priority")}
            options={priorityOptions}
            placeholder="Select Priority"
            required
          />
          <button
            type="submit"
            onClick={(e)=>handleSubmit(e)}
            className={`w-full py-2 px-4 rounded-md font-medium transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed text-gray-200"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            disabled={loading}
          >
            {buttonLabel}
          </button>
        </section>
      </div>
    </div>
  );
};

export default TaskForm;
