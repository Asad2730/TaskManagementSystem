import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Auth from '../pages/auth/auth';
import TaskList from '../pages/task/list';
import TaskForm from '../pages/task/add';
import { selectIsAuthenticated } from '../store/authSlice'

const AppRouter = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Auth />} />
                <Route path="/task" element={isAuthenticated ? <TaskList /> : <Navigate to="/" />} />
                <Route path="/task/add" element={isAuthenticated ? <TaskForm /> : <Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
