import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  deleteUser as deleteAuthUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faEdit,
  faPlus,
  faSearch,
  faFilter,
  faSort,
  faSave,
  faTimes,
  faEye,
  faEyeSlash,
  faUserPlus,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header.jsx';
import '../../assets/styles/manageUser.css';

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [sortOption, setSortOption] = useState({ field: 'name', direction: 'asc' }); // Changed default sort
  const [showPassword, setShowPassword] = useState(false);
  
  // Form data for new/edit user
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'estudiante'
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    // Check if user is admin before loading content
    const checkAdmin = async () => {
      const auth = getAuth();
      if (auth.currentUser) {
        const db = getFirestore();
        try {
          const userDoc = await getDocs(query(
            collection(db, 'users'), 
            where('email', '==', auth.currentUser.email)
          ));
          
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            if (userData.role !== 'admin') {
              navigate('/'); // Redirect non-admins
              return;
            }
            fetchUsers(); // Load users if admin
          } else {
            navigate('/login');
          }
        } catch (err) {
          console.error("Error checking admin status:", err);
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };
    
    checkAdmin();
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const db = getFirestore();
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUsers(usersList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Error al cargar usuarios. Por favor intenta de nuevo.");
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setLoading(true);
    try {
      const db = getFirestore();
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', userToDelete.id));
      
      // Update local state
      setUsers(users.filter(user => user.id !== userToDelete.id));
      
      // Close confirmation modal
      setShowDeleteConfirmation(false);
      setUserToDelete(null);
      
      // Show success message
      alert("Usuario eliminado con éxito");
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Error al eliminar usuario. Es posible que necesites eliminar primero las actividades o reservaciones asociadas a este usuario.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear validation errors when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) errors.email = "El email es requerido";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) 
      errors.email = "El formato del email es inválido";
    
    if (!showEditModal) { // Only validate password for new users
      if (!formData.password) errors.password = "La contraseña es requerida";
      else if (formData.password.length < 6) 
        errors.password = "La contraseña debe tener al menos 6 caracteres";
      
      if (formData.password !== formData.confirmPassword) 
        errors.confirmPassword = "Las contraseñas no coinciden";
    }
    
    if (!formData.name) errors.name = "El nombre es requerido";
    if (!formData.role) errors.role = "El rol es requerido";
    
    return errors;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setLoading(true);
    try {
      const auth = getAuth();
      const db = getFirestore();
      
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        createdAt: serverTimestamp()
      });
      
      // Add new user to state
      const newUser = {
        id: userCredential.user.uid,
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      
      setUsers([...users, newUser]);
      
      // Reset form and close modal
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        role: 'estudiante'
      });
      setShowAddModal(false);
      
      // Show success message
      alert("Usuario creado con éxito");
      
    } catch (err) {
      console.error("Error adding user:", err);
      if (err.code === 'auth/email-already-in-use') {
        setFormErrors({ ...formErrors, email: "Este email ya está en uso" });
      } else {
        setError("Error al crear usuario: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setFormData({
      email: user.email || '',
      password: '',
      confirmPassword: '',
      name: user.name || '',
      role: user.role || 'estudiante'
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    // Validate form (except password for existing users)
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setLoading(true);
    try {
      const db = getFirestore();
      
      // Update user document in Firestore
      await updateDoc(doc(db, 'users', currentUser.id), {
        name: formData.name,
        role: formData.role,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === currentUser.id 
          ? {
              ...user,
              name: formData.name,
              role: formData.role
            } 
          : user
      ));
      
      // Reset and close modal
      setShowEditModal(false);
      setCurrentUser(null);
      
      // Show success message
      alert("Usuario actualizado con éxito");
      
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Error al actualizar usuario: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirmation(true);
  };

  const handleSort = (field) => {
    setSortOption(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filter and sort users based on search term, role filter, and sort option
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      const field = sortOption.field;
      
      // Handle undefined values
      const valueA = a[field] !== undefined ? a[field] : '';
      const valueB = b[field] !== undefined ? b[field] : '';
      
      // Regular string comparison
      if (valueA < valueB) return sortOption.direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOption.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const getSortIndicator = (field) => {
    if (sortOption.field === field) {
      return sortOption.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };

  const translateRole = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'guia':
        return 'Guía';
      case 'estudiante':
        return 'Estudiante';
      default:
        return role;
    }
  };

  return (
    <div className="manage-users-page">
      <Header />
      
      <div className="manage-users-container">
        <h1 className="page-title">Gestión de Usuarios</h1>
        
        <div className="controls-container">
          <div className="search-filter-container">
            <div className="search-bar">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-dropdown">
              <FontAwesomeIcon icon={faFilter} className="filter-icon" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Todos los roles</option>
                <option value="admin">Administradores</option>
                <option value="guia">Guías</option>
                <option value="estudiante">Estudiantes</option>
              </select>
            </div>
          </div>
          
          <button 
            className="add-user-button"
            onClick={() => setShowAddModal(true)}
          >
            <FontAwesomeIcon icon={faUserPlus} />
            <span>Nuevo Usuario</span>
          </button>
        </div>
        
        {loading && users.length === 0 ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando usuarios...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
            <p>{error}</p>
            <button onClick={fetchUsers} className="retry-button">
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')} className="sortable-header">
                      Nombre {getSortIndicator('name')}
                    </th>
                    <th onClick={() => handleSort('email')} className="sortable-header">
                      Email {getSortIndicator('email')}
                    </th>
                    <th onClick={() => handleSort('role')} className="sortable-header">
                      Rol {getSortIndicator('role')}
                    </th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-name-cell">
                            {user.profilePic ? (
                              <img 
                                src={user.profilePic} 
                                alt={user.name} 
                                className="user-avatar"
                              />
                            ) : (
                              <div className="user-avatar-placeholder">
                                {user.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {translateRole(user.role)}
                          </span>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button 
                              onClick={() => handleEditUser(user)}
                              className="action-button edit-button"
                              title="Editar usuario"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button 
                              onClick={() => confirmDeleteUser(user)}
                              className="action-button delete-button"
                              title="Eliminar usuario"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="no-users-message">
                        No se encontraron usuarios con los criterios de búsqueda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="pagination-container">
              <p className="user-count">
                Mostrando {filteredUsers.length} de {users.length} usuarios
              </p>
            </div>
          </>
        )}
      </div>
      
      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Crear Nuevo Usuario</h2>
              <button 
                className="close-modal-button"
                onClick={() => setShowAddModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="user-form">
              <div className="form-group">
                <label htmlFor="name">Nombre Completo *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.name && (
                  <span className="form-error">{formErrors.name}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.email && (
                  <span className="form-error">{formErrors.email}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Contraseña *</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button 
                    type="button"
                    className="toggle-password-button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {formErrors.password && (
                  <span className="form-error">{formErrors.password}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.confirmPassword && (
                  <span className="form-error">{formErrors.confirmPassword}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Rol *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="estudiante">Estudiante</option>
                  <option value="guia">Guía</option>
                  <option value="admin">Administrador</option>
                </select>
                {formErrors.role && (
                  <span className="form-error">{formErrors.role}</span>
                )}
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit User Modal */}
      {showEditModal && currentUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Editar Usuario</h2>
              <button 
                className="close-modal-button"
                onClick={() => setShowEditModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="user-form">
              <div className="form-group">
                <label htmlFor="name">Nombre Completo *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.name && (
                  <span className="form-error">{formErrors.name}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled // Email can't be changed
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Rol *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="estudiante">Estudiante</option>
                  <option value="guia">Guía</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && userToDelete && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirmation-modal">
            <div className="modal-header">
              <h2>Confirmar Eliminación</h2>
              <button 
                className="close-modal-button"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="confirmation-content">
              <FontAwesomeIcon icon={faExclamationTriangle} className="warning-icon" />
              <p>¿Estás seguro que deseas eliminar al usuario <strong>{userToDelete.name}</strong>?</p>
              <p className="warning-text">Esta acción no se puede deshacer y eliminará todos los datos del usuario.</p>
            </div>
            
            <div className="confirmation-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancelar
              </button>
              <button 
                className="delete-button"
                onClick={handleDeleteUser}
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Eliminar Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;