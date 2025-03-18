import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus,
  faSearch,
  faSort,
  faEye,
  faEdit,
  faTrash,
  faMountain,
  faImage,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import '../../assets/styles/manageRuta.css';

const ManageRutas = () => {
  const navigate = useNavigate();
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState({ field: 'name', direction: 'asc' });
  const [firstDocument, setFirstDocument] = useState(null);
  
  // Estados para modal de Añadir Ruta
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [newRouteData, setNewRouteData] = useState({
    title: '',
    difficulty: '',
    distance: '',
    map: '',
    about: ''
  });

  // Estados para modal de Editar Ruta
  const [showEditRouteModal, setShowEditRouteModal] = useState(false);
  const [editRouteData, setEditRouteData] = useState(null);
  
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    fetchRutas();
  }, []);
  
  // Fetch routes from Firestore
  const fetchRutas = async () => {
    setLoading(true);
    try {
      console.log("Fetching routes...");
      
      const possibleCollections = ['routes', 'rutas', 'Rutas', 'Routes'];
      let rutasList = [];
      let collectionFound = false;
      
      for (const collectionName of possibleCollections) {
        try {
          console.log(`Trying collection: ${collectionName}`);
          const rutasCollection = collection(db, collectionName);
          const rutasQuery = query(rutasCollection);
          const rutasSnapshot = await getDocs(rutasQuery);
          
          if (!rutasSnapshot.empty) {
            const firstDoc = rutasSnapshot.docs[0];
            setFirstDocument(firstDoc.data());
            console.log("First document fields:", firstDoc.data());
            
            rutasList = rutasSnapshot.docs.map(docSnap => {
              const data = docSnap.data();
              console.log("Document fields for", docSnap.id, ":", Object.keys(data));
              return {
                id: docSnap.id,
                name: data.name || data.nombre || data.title || data.titulo || 'Sin nombre',
                difficulty: data.difficulty || data.dificultad || data.nivel || 'fácil',
                distance: data.distance || data.distancia || data.longitud || 'No especificada',
                description: data.description || data.descripcion || data.desc || '',
                imageUrl: data.imageUrl || data.imagen || data.image || data.imagePath || '',
                ...data
              };
            });
            
            console.log(`Found ${rutasList.length} routes in collection ${collectionName}`);
            collectionFound = true;
            break;
          }
        } catch (innerErr) {
          console.log(`Error with collection ${collectionName}:`, innerErr);
        }
      }
      
      if (!collectionFound) {
        console.log("No routes found in any collection");
        setError("No se encontraron rutas en la base de datos.");
      }
      
      if (rutasList.length === 0) {
        console.log("Adding test route");
        rutasList = [
          {
            id: 'test-route-1',
            name: 'Ruta de Prueba',
            difficulty: 'fácil',
            distance: '5 km',
            description: 'Esta es una ruta de prueba para depuración.',
            imageUrl: ''
          }
        ];
      }
      
      setRutas(rutasList);
      console.log("Routes set in state:", rutasList);
    } catch (err) {
      console.error("Error fetching routes:", err);
      setError("Error al cargar las rutas: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle sorting
  const handleSort = (field) => {
    setSortOption(prevSort => ({
      field,
      direction: prevSort.field === field && prevSort.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const getSortIndicator = (field) => {
    if (sortOption.field === field) {
      return sortOption.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };
  
  // Abrir modal para agregar ruta
  const handleAddRoute = () => {
    setShowAddRouteModal(true);
  };

  // Manejar cambios en inputs del modal de agregar ruta
  const handleNewRouteChange = (e) => {
    const { name, value } = e.target;
    setNewRouteData(prev => ({ ...prev, [name]: value }));
  };

  // Crear nueva ruta en Firestore
  const handleCreateRoute = async () => {
    try {
      const routesCollection = collection(db, 'routes');
      await addDoc(routesCollection, newRouteData);
      console.log("Ruta creada exitosamente");
      setShowAddRouteModal(false);
      setNewRouteData({
        title: '',
        difficulty: '',
        distance: '',
        map: '',
        about: ''
      });
      fetchRutas();
    } catch (error) {
      console.error("Error creando ruta:", error);
    }
  };
  
  // Abrir modal de edición y precargar datos de la ruta
  const openEditRouteModal = (ruta) => {
    setEditRouteData(ruta);
    setShowEditRouteModal(true);
  };

  // Manejar cambios en inputs del modal de edición
  const handleEditRouteChange = (e) => {
    const { name, value } = e.target;
    setEditRouteData(prev => ({ ...prev, [name]: value }));
  };

  // Actualizar la ruta en Firestore
  const handleUpdateRoute = async () => {
    try {
      const routeRef = doc(db, 'routes', editRouteData.id);
      // Excluir la propiedad id del objeto a actualizar
      const { id, ...updateData } = editRouteData;
      await updateDoc(routeRef, updateData);
      console.log("Ruta actualizada:", editRouteData.id);
      setShowEditRouteModal(false);
      setEditRouteData(null);
      fetchRutas();
    } catch (error) {
      console.error("Error actualizando ruta:", error);
    }
  };
  
  // Función para eliminar una ruta
  const handleDeleteRoute = async (id, name) => {
    if(window.confirm(`¿Estás seguro de eliminar la ruta "${name}"?`)) {
      try {
        await deleteDoc(doc(db, 'routes', id));
        console.log("Ruta eliminada:", id);
        fetchRutas();
      } catch (error) {
        console.error("Error eliminando ruta:", error);
      }
    }
  };
  
  // Filter and sort routes
  const filteredRutas = rutas
    .filter(ruta => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = ruta.name && ruta.name.toLowerCase().includes(searchLower);
      const descriptionMatch = ruta.description && ruta.description.toLowerCase().includes(searchLower);
      return nameMatch || descriptionMatch;
    })
    .sort((a, b) => {
      const field = sortOption.field;
      const valueA = a[field] !== undefined ? a[field] : '';
      const valueB = b[field] !== undefined ? b[field] : '';
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOption.direction === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      return sortOption.direction === 'asc'
        ? valueA - valueB
        : valueB - valueA;
    });
  
  const getDifficultyClass = (difficulty) => {
    if (!difficulty) return '';
    const difficultyLower = typeof difficulty === 'string' ? difficulty.toLowerCase() : '';
    const classMap = {
      'facil': 'difficulty-easy',
      'fácil': 'difficulty-easy',
      'moderado': 'difficulty-moderate',
      'moderada': 'difficulty-moderate',
      'medio': 'difficulty-moderate',
      'media': 'difficulty-moderate',
      'intermedio': 'difficulty-moderate',
      'intermedia': 'difficulty-moderate',
      'dificil': 'difficulty-hard',
      'difícil': 'difficulty-hard',
      'muy dificil': 'difficulty-hard',
      'muy difícil': 'difficulty-hard',
      'extremo': 'difficulty-very-hard',
      'extrema': 'difficulty-very-hard'
    };
    return classMap[difficultyLower] || 'difficulty-moderate';
  };
  
  const translateDifficulty = (difficulty) => {
    if (!difficulty) return 'No especificada';
    const difficultyLower = typeof difficulty === 'string' ? difficulty.toLowerCase() : '';
    const difficultyMap = {
      'facil': 'Fácil',
      'fácil': 'Fácil',
      'moderado': 'Moderado',
      'moderada': 'Moderado',
      'medio': 'Moderado',
      'media': 'Moderado',
      'intermedio': 'Moderado',
      'intermedia': 'Moderado',
      'dificil': 'Difícil',
      'difícil': 'Difícil',
      'muy dificil': 'Difícil',
      'muy difícil': 'Difícil',
      'extremo': 'Muy Difícil',
      'extrema': 'Muy Difícil'
    };
    return difficultyMap[difficultyLower] || difficulty;
  };
  
  return (
    <div className="manage-rutas-page">
      <Header />
      
      <div className="manage-rutas-container">
        <h1 className="page-title">Gestión de Rutas</h1>
        
        <div className="controls-container">
          <div className="search-filter-container">
            <div className="search-bar">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar rutas..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          <button 
            className="add-ruta-button"
            onClick={handleAddRoute}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Añadir Ruta</span>
          </button>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando rutas...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span>{error}</span>
            <button onClick={fetchRutas} className="retry-button">Reintentar</button>
          </div>
        ) : (
          <>
            {rutas.length === 0 ? (
              <div className="no-rutas-container">
                <div className="no-data-message">
                  <FontAwesomeIcon icon={faImage} className="no-data-icon" />
                  <h3>No hay rutas disponibles</h3>
                  <p>No se encontraron rutas en la base de datos</p>
                  <button 
                    className="add-ruta-button"
                    onClick={handleAddRoute}
                    style={{ marginTop: '1rem' }}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>Añadir Primera Ruta</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="rutas-table-container">
                  <table className="rutas-table">
                    <thead>
                      <tr>
                        <th className="image-column">Imagen</th>
                        <th 
                          className={`sortable-header ${sortOption.field === 'name' ? 'active' : ''}`}
                          onClick={() => handleSort('name')}
                        >
                          Nombre {getSortIndicator('name')}
                        </th>
                        <th 
                          className={`sortable-header ${sortOption.field === 'difficulty' ? 'active' : ''}`}
                          onClick={() => handleSort('difficulty')}
                        >
                          Dificultad {getSortIndicator('difficulty')}
                        </th>
                        <th 
                          className={`sortable-header ${sortOption.field === 'distance' ? 'active' : ''}`}
                          onClick={() => handleSort('distance')}
                        >
                          Distancia {getSortIndicator('distance')}
                        </th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRutas.length > 0 ? (
                        filteredRutas.map(ruta => (
                          <tr key={ruta.id}>
                            <td className="image-cell">
                              <div className="route-image-thumbnail">
                                {ruta.imageUrl ? (
                                  <img src={ruta.imageUrl} alt={ruta.name} />
                                ) : (
                                  <div className="no-image">
                                    <FontAwesomeIcon icon={faImage} />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>{ruta.name || 'Sin nombre'}</td>
                            <td>
                              <span className={`difficulty-badge ${getDifficultyClass(ruta.difficulty)}`}>
                                <FontAwesomeIcon icon={faMountain} /> {translateDifficulty(ruta.difficulty)}
                              </span>
                            </td>
                            <td>{ruta.distance || 'No especificada'}</td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="edit-button" 
                                  onClick={() => openEditRouteModal(ruta)}
                                  title="Editar ruta"
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button 
                                  className="delete-button" 
                                  onClick={() => handleDeleteRoute(ruta.id, ruta.name)}
                                  title="Eliminar ruta"
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="no-results">
                            No se encontraron rutas que coincidan con tu búsqueda
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="pagination-info">
                  Mostrando {filteredRutas.length} de {rutas.length} rutas
                </div>
              </>
            )}
          </>
        )}
      </div>
      
      {/* Modal para agregar una nueva ruta */}
      {showAddRouteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Añadir Ruta</h2>
            <label>
              Título:
              <input 
                type="text" 
                name="title" 
                value={newRouteData.title} 
                onChange={handleNewRouteChange} 
              />
            </label>
            <label>
              Dificultad:
              <input 
                type="text" 
                name="difficulty" 
                value={newRouteData.difficulty} 
                onChange={handleNewRouteChange} 
              />
            </label>
            <label>
              Distancia:
              <input 
                type="text" 
                name="distance" 
                value={newRouteData.distance} 
                onChange={handleNewRouteChange} 
              />
            </label>
            <label>
              Mapa:
              <input 
                type="text" 
                name="map" 
                value={newRouteData.map} 
                onChange={handleNewRouteChange} 
              />
            </label>
            <label>
              About:
              <input 
                type="text" 
                name="about" 
                value={newRouteData.about} 
                onChange={handleNewRouteChange} 
              />
            </label>
            <div className="modal-buttons">
              <button onClick={handleCreateRoute}>Crear Ruta</button>
              <button onClick={() => setShowAddRouteModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para editar una ruta */}
      {showEditRouteModal && editRouteData && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Editar Ruta</h2>
            <label>
              Título:
              <input 
                type="text" 
                name="title" 
                value={editRouteData.title} 
                onChange={handleEditRouteChange} 
              />
            </label>
            <label>
              Dificultad:
              <input 
                type="text" 
                name="difficulty" 
                value={editRouteData.difficulty} 
                onChange={handleEditRouteChange} 
              />
            </label>
            <label>
              Distancia:
              <input 
                type="text" 
                name="distance" 
                value={editRouteData.distance} 
                onChange={handleEditRouteChange} 
              />
            </label>
            <label>
              Mapa:
              <input 
                type="text" 
                name="map" 
                value={editRouteData.map} 
                onChange={handleEditRouteChange} 
              />
            </label>
            <label>
              About:
              <input 
                type="text" 
                name="about" 
                value={editRouteData.about} 
                onChange={handleEditRouteChange} 
              />
            </label>
            <div className="modal-buttons">
              <button onClick={handleUpdateRoute}>Guardar Cambios</button>
              <button onClick={() => { setShowEditRouteModal(false); setEditRouteData(null); }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRutas;