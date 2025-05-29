import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { supabase } from './lib/supabaseClient'
import { Auth } from './components/Auth'
import type { Todo } from './types/todo'
import './App.css'

function App() {
  const { userEmail, logout, isAuthenticated, user } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchTodos()
    }
  }, [user])

  const fetchTodos = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user?.id)

      if (error) throw error
      setTodos(data || [])
    } catch (error) {
      console.error('Error fetching todos:', error)
      setError('Failed to fetch todos')
    } finally {
      setIsLoading(false)
    }
  }

  const addTodo = async () => {
    if (!input.trim() || !user) return

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ task: input.trim(), user_id: user.id, completed: false }])
        .select()
        .single()

      if (error) throw error
      setTodos(prev => [...prev, data])
      setInput('')
    } catch (error) {
      setError('Error adding todo')
      console.error('Error adding todo:', error)
    }
  }

  const toggleTodo = async (id: number) => {
    try {
      const todoToUpdate = todos.find(todo => todo.id === id)
      if (!todoToUpdate) return

      const { error } = await supabase
        .from('todos')
        .update({ completed: !todoToUpdate.completed })
        .eq('id', id)
        .eq('user_id', user?.id)

      if (error) throw error
      setTodos(prev =>
        prev.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      )
    } catch (error) {
      setError('Error updating todo')
      console.error('Error updating todo:', error)
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id)

      if (error) throw error
      setTodos(prev => prev.filter(todo => todo.id !== id))
    } catch (error) {
      setError('Error deleting todo')
      console.error('Error deleting todo:', error)
    }
  }

  // If not authenticated, show auth form
  if (!isAuthenticated) {
    return <Auth />
  }

  // If authenticated, show todo list
  return (
    <div className="app">
      <div className="header">
        <h1 >Quick Todo List</h1>
        <div className="user-info">
          <span>Welcome, {userEmail}!</span>
          <button className="logout-button" onClick={logout}>Logout</button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="dismiss-error">×</button>
        </div>
      )}

      <div className="add-todo">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What do you need to do?"
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo} disabled={!input.trim() || isLoading}>
          {isLoading ? 'Adding...' : 'Add'}
        </button>
      </div>

      {isLoading && todos.length === 0 ? (
        <div className="loading">Loading your todos...</div>
      ) : (
        <ul className="todo-list">
          {todos.map(todo => (
            <li key={todo.id} className={todo.completed ? 'completed' : ''}>
              <div className="todo-content">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span>{todo.task}</span>
              </div>
              <div className="todo-actions">
                <button 
                  onClick={() => deleteTodo(todo.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {!isLoading && todos.length === 0 && (
            <div className="empty-state">
              <p>Your todo list is empty</p>
              <p className="empty-state-subtitle">Add your first todo above to get started!</p>
            </div>
          )}
        </ul>
      )}
    </div>
  )
}

export default App
