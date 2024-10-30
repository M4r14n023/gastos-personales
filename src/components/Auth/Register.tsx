import React, { useState } from 'react';
import { auth, db } from '../../config/firebase'; // Asegúrate de exportar db desde tu archivo de configuración de Firebase
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Importa setDoc de Firestore
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const initializeUserData = useStore(state => state.initializeUserData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Crear el usuario
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid; // Obtén el UID del nuevo usuario

      // Crea un documento para el nuevo usuario en Firestore
      await setDoc(doc(db, 'users', userId), {
        // Aquí puedes agregar datos iniciales si es necesario
      });

      // Crear subcolecciones vacías (opcional)
      await setDoc(doc(db, 'users', userId, 'gastos', 'placeholder'), { placeholder: true });
      await setDoc(doc(db, 'users', userId, 'categorias', 'placeholder'), { placeholder: true });
      await setDoc(doc(db, 'users', userId, 'mediosPago', 'placeholder'), { placeholder: true });

      // Inicializa los datos del usuario en el estado de tu aplicación
      await initializeUserData();
      
      // Redirige al usuario al dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError('Error al registrarse: ' + err.message);
    }
  };

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Crear Cuenta
            </h2>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Contraseña</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Registrarse
              </button>
            </div>
          </form>
          <div className="text-center">
            <Link to="/login" className="text-blue-600 hover:text-blue-800">
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </div>
      </div>
      <footer className="bg-white shadow-md mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Gestión de Gastos. Desarrollado por Mariano Lumbreras
          </p>
        </div>
      </footer>
    </div>
  );
};

