import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

const Create = () => {
    const [task, setTask] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const createTask = () => {
        // Clear previous errors
        setError('');
        
        // Validate empty input
        if (!task.trim()) {
            setError('Task cannot be empty');
            return;
        }

        setLoading(true);
        axios.post('http://localhost:5000/add', { task: task.trim() })
            .then(result => {
                console.log(result.data);
                setTask('');
                window.location.reload();
            })
            .catch(err => {
                console.log(err);
                setError('Failed to add task');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            createTask();
        }
    };

    return (
        <main>
            <h1 data-testid="app-title">Todo List</h1>
            <div className='create-form'>
                <input
                    type='text'
                    placeholder='Enter a task'
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    onKeyPress={handleKeyPress}
                    data-testid="task-input"
                    disabled={loading}
                    required
                />
                <button 
                    onClick={createTask}
                    data-testid="add-task-btn"
                    disabled={loading || !task.trim()}
                >
                    {loading ? 'Adding...' : 'ADD'}
                </button>
            </div>
            {error && (
                <div className="error-message" data-testid="error-message">
                    {error}
                </div>
            )}
        </main>
    );
};

export default Create;