import React, { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "../../db/db";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useSelector } from "react-redux";
import { CustomTextInput, CustomDropdown } from "./components/UiInputs"; 


const TaskList = () => {
  const { user } = useSelector((state) => state.auth);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ search: "", priority: "", date: "" });

  const fetchTasks = useCallback(async () => {
    if (user) {
      try {
        const q = query(collection(db, "tasks"), where("userId", "==", user?.uid));
        const querySnapshot = await getDocs(q);
        const tasksList = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setTasks(tasksList);
      } catch (error) {
        console.error("Error fetching tasks: ", error);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                            task.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchesPriority = !filters.priority || task.priority === filters.priority;
      const matchesDate = !filters.date || task.dueDate === filters.date;
      return matchesSearch && matchesPriority && matchesDate;
    });
  }, [tasks, filters]);

  const taskCards = useMemo(() => {
    return filteredTasks.map((task) => (
      <div key={task.id} className="bg-white p-4 rounded-lg shadow-md w-full sm:w-1/2 md:w-1/3 lg:w-1/4 mb-4">
        {task.imageUrl && (
          <img src={task.imageUrl} alt={task.title} className="w-full h-48 object-cover rounded-md mb-4" />
        )}
        <h3 className="font-semibold text-lg text-gray-800">{task.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{task.description}</p>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{task.dueDate}</span>
          <span className={`px-2 py-1 rounded-full ${getPriorityClass(task.priority)}`}>
            {task.priority}
          </span>
        </div>
      </div>
    ));
  }, [filteredTasks]);

  const getPriorityClass = useCallback((priority) => {
    switch (priority) {
      case "High":
        return "bg-red-200 text-red-700";
      case "Medium":
        return "bg-yellow-200 text-yellow-700";
      case "Low":
        return "bg-green-200 text-green-700";
      default:
        return "";
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <CustomTextInput
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search by Title/Description"
          required
          className="w-full sm:w-1/2 md:w-1/3"
        />
      </div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <CustomDropdown
          name="priority"
          value={filters.priority}
          onChange={handleFilterChange}
          options={["", "Low", "Medium", "High"]}
          placeholder="Select Priority"
          required
          className="w-full sm:w-1/2 md:w-1/4"
        />
        <CustomTextInput
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
          type="date"
          required
          className="w-full sm:w-1/2 md:w-1/4"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {taskCards}
      </div>
    </div>
  );
};

export default TaskList;
