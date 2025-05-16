import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
function Teams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/teams/')
      
      const teamsData = response.data.results || response.data
      
      setTeams(Array.isArray(teamsData) ? teamsData : [])
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching teams:', error)
      setError('Failed to load teams')
      setLoading(false)
    }
  }

  const handleCreateTeam = async (e) => {
    e.preventDefault()
    
    try {
      const response = await axios.post('/api/teams/', newTeam)
      
      // Add the new team to the teams list
      setTeams([...teams, response.data])
      
      // Reset form and close modal
      setNewTeam({ name: '', description: '' })
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating team:', error)
      setError('Failed to create team')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewTeam(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teams</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          Create Team
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading teams...</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500 mb-4">No teams found.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Create your first team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <Link key={team.id} to={`/teams/${team.id}`} className="block">
              <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold mb-2 text-indigo-600">{team.name}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{team.description || 'No description'}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{team.members_count || 0} members</span>
                  <span>Created: {new Date(team.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateTeam}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Create New Team
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
                            value={newTeam.name}
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
                            value={newTeam.description}
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
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
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

export default Teams