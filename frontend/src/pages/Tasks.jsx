import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    team: '',
    search: ''
  })
  const [teams, setTeams] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    team: '',
    assigned_to_id: '',
    due_date: ''
  })
  const [teamMembers, setTeamMembers] = useState([])
  const [createTaskError, setCreateTaskError] = useState('')
  const modalRef = useRef(null)
  
  useEffect(() => {
    fetchTasks()
    fetchTeams()
  }, [])
  
  useEffect(() => {
    if (newTask.team) {
      fetchTeamMembers(newTask.team)
    } else {
      setTeamMembers([])
    }
  }, [newTask.team])
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowCreateModal(false)
      }
    }
    
    if (showCreateModal) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCreateModal])
  
  const fetchTasks = async () => {
    try {
      setLoading(true)
      let url = '/api/tasks/?ordering=-created_at'
      
      if (filters.status) url += `&status=${filters.status}`
      if (filters.priority) url += `&priority=${filters.priority}`
      if (filters.team) url += `&team=${filters.team}`
      if (filters.search) url += `&search=${filters.search}`
      
      const response = await axios.get(url)
      setTasks(response.data.results || response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setError('Failed to load tasks')
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
  
  const fetchTeamMembers = async (teamId) => {
    try {
      const response = await axios.get(`/api/teams/${teamId}/members`)
      setTeamMembers(response.data)
    } catch (error) {
      console.error('Error fetching team members:', error)
    }
  }
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleTaskInputChange = (e) => {
    const { name, value } = e.target
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const applyFilters = (e) => {
    e.preventDefault()
    fetchTasks()
  }
  
  const resetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      team: '',
      search: ''
    })
    setTimeout(fetchTasks, 0)
  }
  
  
  const createTask = async (e) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) {
      setCreateTaskError('Task title is required');
      return;
    }
    
    if (!newTask.team) {
      setCreateTaskError('Please select a team');
      return;
    }
    
    try {
      // Prepare the data for submission
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority,
        team_id: newTask.team,
        due_date: newTask.due_date || null
      };
      
      if (newTask.assigned_to_id) {
        taskData.assigned_to_id = newTask.assigned_to_id;
      }
      
      const response = await axios.post('/api/tasks/', taskData);
      setTasks([response.data, ...tasks]);
      
      // Reset form and close modal
      setNewTask({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        team: '',
        assigned_to_id: '',
        due_date: ''
      });
      setShowCreateModal(false);
      setCreateTaskError('');
    } catch (error) {
      console.error('Error creating task:', error);
      setCreateTaskError('Failed to create task. Please try again.');
    }
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'done': return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
      case 'in_progress': return 'bg-amber-100 text-amber-800 border border-amber-200'
      case 'review': return 'bg-sky-100 text-sky-800 border border-sky-200'
      default: return 'bg-slate-100 text-slate-800 border border-slate-200'
    }
  }
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'todo': return 'To Do'
      case 'in_progress': return 'In Progress'
      case 'review': return 'In Review'
      case 'done': return 'Done'
      default: return status
    }
  }
  
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-rose-100 text-rose-800 border border-rose-200'
      case 'high': return 'bg-orange-100 text-orange-800 border border-orange-200'
      case 'medium': return 'bg-blue-100 text-blue-800 border border-blue-200'
      default: return 'bg-slate-100 text-slate-800 border border-slate-200'
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-medium">Loading tasks...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Tasks</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Task
          </button>
          <Link
            to="/teams"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Manage Teams
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filter Form */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-8 border border-slate-200">
        <form onSubmit={applyFilters}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                id="priority"
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="team" className="block text-sm font-medium text-slate-700 mb-1">Team</label>
              <select
                id="team"
                name="team"
                value={filters.team}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Teams</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-1">Search</label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search tasks..."
                  className="block w-full rounded-md border-slate-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Reset
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Apply Filters
            </button>
          </div>
        </form>
      </div>
      
      {/* Tasks List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-slate-200">
        {tasks.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-4 text-slate-500 text-lg">No tasks found</p>
            <p className="mt-2 text-slate-400">Try adjusting your filters or create a new task</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {tasks.map(task => (
              <li key={task.id} className="animate-fade-in">
                <Link to={`/tasks/${task.id}`} className="block hover:bg-slate-50 transition-colors duration-150">
                  <div className="px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-base font-medium text-indigo-600 truncate">
                          {task.title}
                        </h3>
                        <div className="flex space-x-2">
                          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusBadgeClass(task.status)}`}>
                            {getStatusLabel(task.status)}
                          </span>
                          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getPriorityBadgeClass(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {task.due_date && (
                          <div className="flex items-center text-sm text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 sm:flex sm:justify-between">
                      <div className="flex items-center text-sm text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {task.team?.name || 'No team'}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {task.assigned_to ? 
                          `${task.assigned_to.first_name} ${task.assigned_to.last_name || task.assigned_to.username}` : 
                          'Unassigned'}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div 
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              ref={modalRef}
            >
              <form onSubmit={createTask}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-slate-900 mb-6">
                        Create New Task
                      </h3>
                      
                      {createTaskError && (
                        <div className="mb-4 rounded-md bg-red-50 p-4 border border-red-200">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm text-red-700">
                                <p>{createTaskError}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-5">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                            Title *
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            value={newTask.title}
                            onChange={handleTaskInputChange}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                            Description
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            rows="3"
                            value={newTask.description}
                            onChange={handleTaskInputChange}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          ></textarea>
                        </div>
                        
                        <div>
                          <label htmlFor="team" className="block text-sm font-medium text-slate-700 mb-1">
                            Team *
                          </label>
                          <select
                            id="team"
                            name="team"
                            value={newTask.team}
                            onChange={handleTaskInputChange}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                          >
                            <option value="">Select Team</option>
                            {teams.map(team => (
                              <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="assigned_to_id" className="block text-sm font-medium text-slate-700 mb-1">
                            Assign To
                          </label>
                          <select
                            id="assigned_to_id"
                            name="assigned_to_id"
                            value={newTask.assigned_to_id}
                            onChange={handleTaskInputChange}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200"
                            disabled={!newTask.team}
                          >
                            <option value="">Unassigned</option>
                            {teamMembers.map(member => (
                              <option key={member.user?.id || member.id} value={member.user?.id || member.id}>
                                {member.user ? 
                                  `${member.user.first_name || ''} ${member.user.last_name || member.user.username}` : 
                                  `${member.first_name || ''} ${member.last_name || member.username}`}
                              </option>
                            ))}
                          </select>
                          {!newTask.team && (
                            <p className="mt-1 text-sm text-slate-500">Select a team first to see members</p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                              Status
                            </label>
                            <select
                              id="status"
                              name="status"
                              value={newTask.status}
                              onChange={handleTaskInputChange}
                              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="review">In Review</option>
                              <option value="done">Done</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1">
                              Priority
                            </label>
                            <select
                              id="priority"
                              name="priority"
                              value={newTask.priority}
                              onChange={handleTaskInputChange}
                              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="due_date" className="block text-sm font-medium text-slate-700 mb-1">
                            Due Date
                          </label>
                          <input
                            type="date"
                            name="due_date"
                            id="due_date"
                            value={newTask.due_date}
                            onChange={handleTaskInputChange}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  >
                    Create Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
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

export default Tasks