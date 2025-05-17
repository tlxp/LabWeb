document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // Toggle to registration form
  window.showRegisterForm = () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
  };

  // Toggle to login form
  window.showLoginForm = () => {
    registerForm.style.display = 'none';
    loginForm.style.display = 'flex';
  };

  // Handle login form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const data = {
      username: formData.get('username'),
      password: formData.get('password')
    };

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem('token', result.token);
        window.location.href = 'dashboard.html';
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      alert('Erro ao fazer login.');
    }
  });

  // Handle registration form submission
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(registerForm);
    const data = {
      username: formData.get('email'), // Usar e-mail como username
      password: formData.get('password'),
      role: 'Cliente'
    };

    try {
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        showLoginForm();
        registerForm.reset();
      }
    } catch (err) {
      console.error('Erro ao registar usuário:', err);
      alert('Erro ao registar usuário.');
    }
  });
});