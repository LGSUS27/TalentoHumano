import { useState } from 'react';

function Protected() {
  const [message, setMessage] = useState('');

  const handleFetchProtected = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3000/protected', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Acceso permitido: ${JSON.stringify(data.user)}`);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error('Error al acceder a ruta protegida:', error);
      setMessage('Error al conectar con el servidor');
    }
  };

  return (
    <div>
      <h2>Ruta protegida</h2>
      <button onClick={handleFetchProtected}>Probar acceso protegido</button>
      <p>{message}</p>
    </div>
  );
}

export default Protected;
