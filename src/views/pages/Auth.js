import { auth } from "../../services/firebaseConfig.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

// Registrar usuario
export const register = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Usuario registrado:", userCredential.user);
    return userCredential; // Retornamos el resultado en caso de éxito
  } catch (error) {
    console.error("Error en el registro:", error.message);
    throw error; // Re-lanzamos el error para que el componente lo gestione
  }
};

// Iniciar sesión
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Usuario autenticado:", userCredential.user);
    return userCredential;
  } catch (error) {
    console.error("Error en el inicio de sesión:", error.message);
    throw error;
  }
};

// Cerrar sesión
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("Sesión cerrada");
  } catch (error) {
    console.error("Error al cerrar sesión:", error.message);
    throw error;
  }
};