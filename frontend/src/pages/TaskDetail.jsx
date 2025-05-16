import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

function TaskDetail() {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [task, setTask] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const [editedTask, setEditedTask] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    team: '',
    due_date: '',
    assigned_to: ''
  })
  
  useEffect(() => {
    fetchTaskDetails()
    fetchTeams()
    fetchUsers()
  }, [taskId])
  
  const fetchTaskDetails = async () => {
    try {
      setLoading(true)
      
      // Fetch task details
      const taskResponse = await axios.get(`/api/tasks/${taskId}/`)
      setTask(taskResponse.data)
      setEditedTask({
        title: taskResponse.data.title,
        description: taskResponse.data.description || '',
        status: taskResponse.data.status,
        priority: taskResponse.data.priority,
        team: taskResponse.data.team?.id || '',
        due_date: taskResponse.data.due_date ? taskResponse.data.due_date.split('T')[0] : '',
        assigned_to: taskResponse.data.assigned_to?.id || ''
      })
      
      // Fetch task comments
      const commentsResponse = await axios.get(`/api/tasks/${taskId}/comments/`)
      setComments(commentsResponse.data.results || commentsResponse.data)
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching task details:', error)
      setError('Failed to load task details')
      setLoading(false)
    }
  }
  
  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams/')
      setTeams(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
  }
  
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users/')
      setUsers(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }
  
  const handleEditTask = async (e) => {
    e.preventDefault()
    
    try {
      const response = await axios.put(`/api/tasks/${taskId}/`, editedTask)
      setTask(response.data)
      setShowEditModal(false)
    } catch (error) {
      console.error('Error updating task:', error)
      setError('Failed to update task')
    }
  }
  
  const handleAddComment = async (e) => {
    e.preventDefault()
    
    if (!newComment.trim()) return
    
    try {
      const response = await axios.post(`/api/tasks/${taskId}/comments/`, {
        content: newComment
      })
      
      setComments([...comments, response.data])
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
      setError('Failed to add comment')
    }
  }
  
  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) return
    
    try {
      await axios.delete(`/api/tasks/${taskId}/`)
      navigate('/tasks')
    } catch (error) {
      console.error('Error deleting task:', error)
      setError('Failed to delete task')
    }
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedTask(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'review': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading task details...</p>
      </div>
    )
  }
  
  if (!task) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">Task not found.</span>
        <div className="mt-3">
          <Link to="/tasks" className="text-blue-500 hover:underline">Back to Tasks</Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link to="/tasks" className="text-indigo-600 hover:text-indigo-900 mr-4">
            &larr; Back to Tasks
          </Link>
          <h1 className="text-2xl font-bold mt-2">{task.title}</h1>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            Edit Task
          </button>
          {task.created_by?.id === currentUser.id && (
            <button
              onClick={handleDeleteTask}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Task Information</h2>
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Status:</span>{' '}
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(task.status)}`}>
                {task.status.replace('_', ' ')}
              </span>
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Priority:</span>{' '}
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeClass(task.priority)}`}>
                {task.priority}
              </span>
            </p>
            {task.team && (
              <p className="text-gray-700 mb-2">
                <span className="font-medium">Team:</span>{' '}
                <Link to={`/teams/${task.team.id}`} className="text-indigo-600 hover:text-indigo-900">
                  {task.team.name}
                </Link>
              </p>
            )}
            {task.assigned_to && (
              <p className="text-gray-700 mb-2">
                <span className="font-medium">Assigned to:</span>{' '}
                {task.assigned_to.first_name} {task.assigned_to.last_name || task.assigned_to.username}
              </p>
            )}
            {task.due_date && (
              <p className="text-gray-700 mb-2">
                <span className="font-medium">Due Date:</span>{' '}
                {new Date(task.due_date).toLocaleDateString()}
              </p>
            )}
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Created:</span>{' '}
              {new Date(task.created_at).toLocaleDateString()}
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Created by:</span>{' '}
              {task.created_by?.username || 'Unknown'}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
          </div>
        </div>
      </div>
      
      {/* Comments Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Comments</h3>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {comments.length === 0 ? (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                No comments yet.
              </li>
            ) : (
              comments.map(comment => (
                <li key={comment.id} className="px-4 py-4 sm:px-6">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-medium">
                          {comment.user?.first_name ? comment.user.first_name.charAt(0) : comment.user?.username.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {comment.user?.first_name} {comment.user?.last_name || comment.user?.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </p>
                      <div className="mt-2 text-sm text-gray-700">
                        <p>{comment.content}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
        
        {/* Add Comment Form */}
        <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
          <form onSubmit={handleAddComment}>
            <div>
              <label htmlFor="comment" className="sr-only">Comment</label>
              <textarea
                id="comment"
                name="comment"
                rows="3"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Add a comment..."
              ></textarea>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Comment
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Edit Task Modal */}
      {showEditModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleEditTask}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Edit Task
                      </h3>
                      <div className="mt-2 space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            value={editedTask.title}
                            onChange={handleInputChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description (optional)
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            rows="3"
                            value={editedTask.description}
                            onChange={handleInputChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          ></textarea>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                              Status
                            </label>
                            <select
                              id="status"
                              name="status"
                              value={editedTask.status}
                              onChange={handleInputChange}
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="review">In Review</option>
                              <option value="done">Done</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                              Priority
                            </label>
                            <select
                              id="priority"
                              name="priority"
                              value={editedTask.priority}
                              onChange={handleInputChange}
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="team" className="block text-sm font-medium text-gray-700">
                              Team
                            </label>
                            <select
                              id="team"
                              name="team"
                              value={editedTask.team}
                              onChange={handleInputChange}
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="">No Team</option>
                              {teams.map(team => (
                                <option key={team.id} value={team.id}>{team.name}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">
                              Assigned To
                            </label>
                            <select
                              id="assigned_to"
                              name="assigned_to"
                              value={editedTask.assigned_to}
                              onChange={handleInputChange}
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="">Unassigned</option>
                              {users.map(user => (
                                <option key={user.id} value={user.id}>
                                  {user.first_name} {user.last_name || user.username}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                              Due Date (optional)
                            </label>
                            <input
                              type="date"
                              name="due_date"
                              id="due_date"
                              value={editedTask.due_date}
                              onChange={handleInputChange}
                              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskDetail