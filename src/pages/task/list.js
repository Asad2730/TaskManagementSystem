import React, { useState, useEffect, useMemo, useCallback } from "react";
import { app } from "../../db/db";
import { collection, query, where, getDocs, getFirestore } from "firebase/firestore";
import { useSelector } from "react-redux";
import { CustomTextInput, CustomDropdown } from "./components/UiInputs";
import { useNavigate } from "react-router-dom";

const db = getFirestore(app);

const TaskList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ search: "", priority: "", date: "" });

  const fetchTasks = useCallback(async () => {
    if (user) {
      try {
        const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const tasksList = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        console.log('taskList',tasksList)
        setTasks(tasksList);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleFilterChange = (e, key) => setFilters({...filters,[key]:e.target.value})

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        filters.search === "" ||
        task.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesPriority =
        filters.priority === "" || task.priority === filters.priority;

      const matchesDate =
        filters.date === "" || task.dueDate === filters.date;

      return matchesSearch && matchesPriority && matchesDate;
    });
  }, [tasks, filters]);

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-200 text-red-700";
      case "Medium":
        return "bg-yellow-200 text-yellow-700";
      case "Low":
        return "bg-green-200 text-green-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Task Manager</h1>
        <p className="text-sm text-gray-500">
          Filter your tasks by title, priority, or due date. Stay organized and focused.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="mb-6">
          <CustomTextInput
            value={filters.search}
            onChange={(e)=>handleFilterChange(e,'search')}
            placeholder="Search by Title/Description"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <CustomDropdown
            name="priority"
            value={filters.priority}
            onChange={(e)=>handleFilterChange(e,'priority')}
            options={["", "Low", "Medium", "High"]}
            placeholder="Select Priority"
          />
          <CustomTextInput
            type="date"
            value={filters.date}
            onChange={(e)=>handleFilterChange(e,'date')}
            placeholder="Filter by Due Date"
          />
          <button
            onClick={() => navigate("/task/add")}
            className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg shadow hover:bg-blue-600"
          >
            Add Task
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-6 rounded-lg shadow-md flex flex-col space-y-4"
            >
              {task.imageUrl && (
                <img
                  src={task.imageUrl}
                  alt={task.title}
                  className="w-full h-40 object-cover rounded-md"
                />
              )}
              <div className="space-y-2">
                <h3 className="font-semibold text-xl text-gray-800 line-clamp-1">
                  {task.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {task.description}
                </p>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
                <span>
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "No Due Date"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs ${getPriorityClass(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            No tasks found. Try adjusting the filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
