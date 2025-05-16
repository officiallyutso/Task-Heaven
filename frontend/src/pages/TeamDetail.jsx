import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

function TeamDetail() {
  const { teamId } = useParams()
  const { currentUser } = useAuth()
  const [team, setTeam] = useState(null)
  const [members, setMembers] = useState([])
  const [teamTasks, setTeamTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [editedTeam, setEditedTeam] = useState({
    name: '',
    description: ''
  })
  
  useEffect(() => {
    fetchTeamDetails()
  }, [teamId])
  
  const fetchTeamDetails = async () => {
    try {
      setLoading(true)
      
      // Fetch team details
      const teamResponse = await axios.get(`/api/teams/${teamId}/`)
      setTeam(teamResponse.data)
      setEditedTeam({
        name: teamResponse.data.name,
        description: teamResponse.data.description || ''
      })
      
      // Fetch team members
      const membersResponse = await axios.get(`/api/teams/${teamId}/members/`)
      setMembers(membersResponse.data.results || membersResponse.data)
      
      // Fetch team tasks
      const tasksResponse = await axios.get(`/api/tasks/?team=${teamId}`)
      setTeamTasks(tasksResponse.data.results || tasksResponse.data)
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching team details:', error)
      setError('Failed to load team details')
      setLoading(false)
    }
  }
  
  const handleEditTeam = async (e) => {
    e.preventDefault()
    
    try {
      const response = await axios.put(`/api/teams/${teamId}/`, editedTeam)
      setTeam(response.data)
      setShowEditModal(false)
    } catch (error) {
      console.error('Error updating team:', error)
      setError('Failed to update team')
    }
  }
  
  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member from the team?')) return
    
    try {
      await axios.delete(`/api/teams/${teamId}/members/${userId}/`)
      setMembers(members.filter(member => member.user.id !== userId))
    } catch (error) {
      console.error('Error removing team member:', error)
      setError('Failed to remove team member')
    }
  }
  
  const handleSearchUsers = async (e) => {
    e.preventDefault()
    
    if (!userSearch.trim()) return
    
    try {
      const response = await axios.get(`/api/users/search/?query=${userSearch}`)
      setSearchResults(response.data.results || response.data)
    } catch (error) {
      console.error('Error searching users:', error)
      setError('Failed to search users')
    }
  }
  
  const handleAddMember = async (userId) => {
    try {
      await axios.post(`/api/teams/${teamId}/members/`, {
        user: userId
      })
      
      // Refresh members list
      const membersResponse = await axios.get(`/api/teams/${teamId}/members/`)
      setMembers(membersResponse.data.results || membersResponse.data)
      
      // Clear search
      setUserSearch('')
      setSearchResults([])
      setShowAddMemberModal(false)
    } catch (error) {
      console.error('Error adding team member:', error)
      setError('Failed to add team member')
    }
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedTeam(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading team details...</p>
      </div>
    )
  }
  
  if (!team) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">Team not found.</span>
        <div className="mt-3">
          <Link to="/teams" className="text-blue-500 hover:underline">Back to Teams</Link>
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
          <Link to="/teams" className="text-indigo-600 hover:text-indigo-900 mr-4">
            &larr; Back to Teams
          </Link>
          <h1 className="text-2xl font-bold mt-2">{team.name}</h1>
        </div>
        {team.is_admin && (
          <div className="space-x-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            >
              Edit Team
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Team Information</h2>
        <p className="text-gray-700 mb-2"><span className="font-medium">Created:</span> {new Date(team.created_at).toLocaleDateString()}</p>
        <p className="text-gray-700 mb-2"><span className="font-medium">Created by:</span> {team.created_by?.username || 'Unknown'}</p>
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{team.description || 'No description provided.'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Members */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Team Members</h3>
            {team.is_admin && (
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Member
              </button>
            )}
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {members.length === 0 ? (
                <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                  No members in this team yet.
                </li>
              ) : (
                members.map(member => (
                  <li key={member.user.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-500 font-medium">
                            {member.user.first_name ? member.user.first_name.charAt(0) : member.user.username.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.user.first_name} {member.user.last_name || ''}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.user.username}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {member.is_admin && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 mr-2">
                        Admin
                        </span>
                    )}
                    {team.is_admin && member.user.id !== currentUser.id && (
                        <button
                        onClick={() => handleRemoveMember(member.user.id)}
                        className="text-red-600 hover:text-red-900"
                        >
                        Remove
                        </button>
                    )}
                    </div>
                </div>
                </li>
            ))
            )}
        </ul>
        </div>
    </div>
    
    {/* Team Tasks */}
    <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Team Tasks</h3>
        <Link
            to="/tasks"
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
            View All Tasks
        </Link>
        </div>
        <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
            {teamTasks.length === 0 ? (
            <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                No tasks assigned to this team yet.
            </li>
            ) : (
            teamTasks.slice(0, 5).map(task => (
                <li key={task.id}>
                <Link to={`/tasks/${task.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                        {task.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            task.status === 'done' ? 'bg-green-100 text-green-800' :
                              task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            task.status === 'review' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {task.status.replace('_', ' ')}
                        </p>
                        </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                            {task.assigned_to ? 
                            `Assigned to: ${task.assigned_to.first_name} ${task.assigned_to.last_name || task.assigned_to.username}` : 
                            'Unassigned'}
                        </p>
                        </div>
                        {task.due_date && (
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                            Due: {new Date(task.due_date).toLocaleDateString()}
                            </p>
                        </div>
                        )}
                    </div>
                    </div>
                </Link>
                </li>
            ))
            )}
        </ul>
        {teamTasks.length > 5 && (
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <Link to={`/tasks?team=${teamId}`} className="text-indigo-600 hover:text-indigo-900">
                View all {teamTasks.length} tasks &rarr;
            </Link>
            </div>
        )}
        </div>
    </div>
    </div>
    
    {/* Edit Team Modal */}
    {showEditModal && (
    <div className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <form onSubmit={handleEditTeam}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Edit Team
                    </h3>
                    <div className="mt-2 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Team Name
                        </label>
                        <input
                        type="text"
                        name="name"
                        id="name"
                        value={editedTeam.name}
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
                        value={editedTeam.description}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        ></textarea>
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
    
    {/* Add Member Modal */}
    {showAddMemberModal && (
    <div className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Add Team Member
                </h3>
                <div className="mt-2">
                    <form onSubmit={handleSearchUsers} className="mb-4">
                    <div className="flex">
                        <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="Search users by name or username"
                        />
                        <button
                        type="submit"
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                        Search
                        </button>
                    </div>
                    </form>
                    
                    {searchResults.length > 0 ? (
                    <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                        {searchResults.map(user => (
                        <li key={user.id} className="py-3 flex justify-between items-center">
                            <div>
                            <p className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                            <p className="text-sm text-gray-500">{user.username}</p>
                            </div>
                            <button
                            type="button"
                            onClick={() => handleAddMember(user.id)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                            Add
                            </button>
                        </li>
                        ))}
                    </ul>
                    ) : userSearch ? (
                    <p className="text-sm text-gray-500 text-center py-4">No users found. Try a different search term.</p>
                    ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Search for users to add to this team.</p>
                    )}
                </div>
                </div>
            </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
                Close
            </button>
            </div>
        </div>
        </div>
    </div>
    )}
</div>
)
}

export default TeamDetail