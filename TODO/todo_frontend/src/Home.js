import React, { useEffect, useState } from 'react';
import Create from './Create';
import './App.css';
import axios from 'axios';
import { BsCircleFill, BsFillCheckCircleFill, BsFillTrashFill, BsPencil } from 'react-icons/bs';

const Home = () => {
    const [todos, setTodos] = useState([]);
    const [updatetask, setUpdatetask] = useState('');
    const [taskid, setTaskid] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = () => {
        axios.get('http://localhost:5000/get')
            .then(result => {
                setTodos(result.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
            });
    };

    const edit = (id) => {
        axios.put(`http://localhost:5000/edit/${id}`)
            .then(result => {
                console.log(result.data);
                const updatedTodos = todos.map(todo => {
                    if (todo._id === id) {
                        return { ...todo, done: !todo.done };
                    }
                    return todo;
                });
                setTodos(updatedTodos);
            })
            .catch(err => console.log(err));
    };

    const Update = (id, updatedTask) => {
        if (!updatedTask.trim()) {
            setTaskid('');
            setUpdatetask('');
            return;
        }

        axios.put(`http://localhost:5000/update/${id}`, { task: updatedTask.trim() })
            .then(result => {
                console.log(result.data);
                const updatedTodos = todos.map(todo => {
                    if (todo._id === id) {
                        return { ...todo, task: updatedTask.trim() };
                    }
                    return todo;
                });
                setTodos(updatedTodos);
                setTaskid('');
                setUpdatetask('');
            })
            .catch(err => console.log(err));
    };

    const Hdelete = (id) => {
        axios.delete(`http://localhost:5000/delete/${id}`)
            .then(result => {
                console.log(result.data);
                const updatedTodos = todos.filter(todo => todo._id !== id);
                setTodos(updatedTodos);
            })
            .catch(err => console.log(err));
    };

    const handleKeyPress = (e, id) => {
        if (e.key === 'Enter') {
            Update(id, updatetask);
        } else if (e.key === 'Escape') {
            setTaskid('');
            setUpdatetask('');
        }
    };

    if (loading) {
        return (
            <main>
                <Create />
                <div className="loading" data-testid="loading">Loading tasks...</div>
            </main>
        );
    }

    return (
        <main data-testid="main-container">
            <Create />
            <div className="task-container" data-testid="task-container">
                {todos.length === 0 ? (
                    <div className='task empty-state' data-testid="empty-state">
                        <h3>No tasks found</h3>
                        <p>Add your first task above!</p>
                    </div>
                ) : (
                    <div className="task-list" data-testid="task-list">
                        <h2>Your Tasks ({todos.length})</h2>
                        {todos.map((todo) => (
                            <div className={`task ${todo.done ? 'completed' : ''}`} key={todo._id} data-testid="task-item">
                                <div className='checkbox'>
                                    {todo.done ? 
                                        <BsFillCheckCircleFill 
                                            className='icon completed-icon' 
                                            data-testid="task-completed-icon"
                                        /> :
                                        <BsCircleFill 
                                            className='icon' 
                                            onClick={() => edit(todo._id)}
                                            data-testid="task-checkbox"
                                        />
                                    }
                                    {taskid === todo._id ? (
                                        <input 
                                            type='text' 
                                            value={updatetask} 
                                            onChange={e => setUpdatetask(e.target.value)}
                                            onKeyPress={e => handleKeyPress(e, todo._id)}
                                            onBlur={() => Update(todo._id, updatetask)}
                                            data-testid="task-edit-input"
                                            autoFocus
                                        />
                                    ) : (
                                        <p 
                                            className={todo.done ? 'through' : 'normal'}
                                            data-testid="task-text"
                                            onDoubleClick={() => {
                                                if (!todo.done) {
                                                    setTaskid(todo._id);
                                                    setUpdatetask(todo.task);
                                                }
                                            }}
                                        >
                                            {todo.task}
                                        </p>
                                    )}
                                </div>
                                <div className="task-actions">
                                    <span>
                                        {!todo.done && (
                                            <BsPencil 
                                                className='icon edit-icon' 
                                                onClick={() => {
                                                    if (taskid === todo._id) {
                                                        Update(todo._id, updatetask);
                                                    } else {
                                                        setTaskid(todo._id);
                                                        setUpdatetask(todo.task);
                                                    }
                                                }}
                                                data-testid="edit-task"
                                            />
                                        )}
                                        <BsFillTrashFill 
                                            className='icon delete-icon' 
                                            onClick={() => Hdelete(todo._id)}
                                            data-testid="delete-task"
                                        />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
};

export default Home;