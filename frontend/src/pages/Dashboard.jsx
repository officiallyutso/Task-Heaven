import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

function Dashboard() {
  const { currentUser } = useAuth()
  const [recentTasks, setRecentTasks] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch recent tasks
        const tasksResponse = await axios.get('/api/tasks/?ordering=-created_at&limit=5')
        setRecentTasks(tasksResponse.data.results || tasksResponse.data)
        
        // Fetch teams
        const teamsResponse = await axios.get('/api/teams/')
        setTeams(teamsResponse.data.results || teamsResponse.data)
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data')
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Welcome back, {currentUser?.user?.first_name || currentUser?.user?.username}!
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Here's an overview of your tasks and teams.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Tasks</h3>
            <Link to="/tasks" className="text-sm text-indigo-600 hover:text-indigo-500">
              View all
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {error && <p className="text-red-500 p-4">{error}</p>}
            
            {recentTasks.length === 0 ? (
              <p className="text-gray-500 p-4">No tasks found</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {recentTasks.map(task => (
                  <li key={task.id} className="px-4 py-4 sm:px-6">
                    <Link to={`/tasks/${task.id}`} className="hover:text-indigo-600">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${task.status === 'done' ? 'bg-green-100 text-green-800' : 
                              task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                              task.status === 'review' ? 'bg-blue-100 text-blue-800' : 
                              'bg-gray-100 text-gray-800'}`}>
                            {task.status.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {task.assigned_to ? `Assigned to: ${task.assigned_to.username}` : 'Unassigned'}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Teams */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Your Teams</h3>
            <Link to="/teams" className="text-sm text-indigo-600 hover:text-indigo-500">
              View all
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {error && <p className="text-red-500 p-4">{error}</p>}
            
            {teams.length === 0 ? (
              <div className="p-4">
                <p className="text-gray-500 mb-4">You're not a member of any teams yet.</p>
                <Link 
                  to="/teams" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create a Team
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {teams.map(team => (
                  <li key={team.id} className="px-4 py-4 sm:px-6">
                    <Link to={`/teams/${team.id}`} className="hover:text-indigo-600">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{team.name}</p>
                        <p className="text-sm text-gray-500">
                          {team.members?.length || 0} members
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-gray-500 truncate">
                        {team.description || 'No description'}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard