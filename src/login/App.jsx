import { useState } from 'react';
import './App.css'
import { auth, saveData } from '../firebaseconfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import mashmallow from '../assets/mashmallow1.gif'
import milk from '../assets/milk.gif'

function App() {
  const navigate = useNavigate();

  const [currentForm, setCurrentForm] = useState('loginContainer')

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    fullName: '',
    age: '',
  });

  function handleFormChange() {
    const loginContainer = document.getElementById('loginContainer');
    const registerContainer = document.getElementById('registerContainer');
    const mashmallow1 = document.getElementById('mashmallow1');
    const milk = document.getElementById('milk');

    if (currentForm == 'loginContainer') {
      loginContainer.classList.add('slideFadeOutToRight');
      setTimeout(() => {
        loginContainer.classList.add('invisible');
        mashmallow1.classList.add('invisible');
        milk.classList.remove('invisible');
        registerContainer.classList.remove('invisible');
        setCurrentForm('registerContainer');
      },500);
      setTimeout(() => {
        loginContainer.classList.remove('slideFadeOutToRight');
      }, 600);
      
    }

    else if (currentForm == 'registerContainer') {
      registerContainer.classList.add('slideFadeOutToLeft');
      setTimeout(() => {
        registerContainer.classList.add('invisible');
        milk.classList.add('invisible');
        loginContainer.classList.remove('invisible');
        mashmallow1.classList.remove('invisible');
        setCurrentForm('loginContainer');
      }, 500);
      setTimeout(() => {
        registerContainer.classList.remove('slideFadeOutToLeft');
      }, 600);
    }
  }

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        registerData.email,
        registerData.password
      );


      await saveData(`users/${user.uid}`, {
        fullName: registerData.fullName,
        age: registerData.age,
        email: registerData.email,
        isTeacher: false
      });

      alert("Đăng ký thành công!");
    } catch (err) {
      alert("Lỗi đăng ký: " + err.message);
    }
  };


  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      alert("Đăng nhập thành công!");

      navigate('/homepage');
    } catch (err) {
      alert("Lỗi đăng nhập: " + err.message);
    }
  };

  return (
    <>
      <div className="loginContainer" id='loginContainer'>
        <h2>Login</h2>

        <div className="loginInputForm">
          <input type="email" name="email" placeholder="Email" value={loginData.email} onChange={handleLoginChange} />
          <input type="password" name="password" placeholder="Password" value={loginData.password} onChange={handleLoginChange} />
          <button onClick={handleLogin}>Submit</button>
        </div>
        
        <button onClick={handleFormChange} className='changeToRegister'>Don't have an account yet?</button>
      </div>

      <div className='mashmallow1' id='mashmallow1'>
        <img src={mashmallow} alt="" />
      </div>

      <div className='milk invisible' id='milk'>
        <img src={milk} alt="" />
      </div>

      <div className="registerContainer invisible" id='registerContainer'>
        <h2>Register</h2>
        <div className="registerInputForm">
          <input type="email" name="email" placeholder="Email" value={registerData.email} onChange={handleRegisterChange} />
          <input type="password" name="password" placeholder="Password" value={registerData.password} onChange={handleRegisterChange} />
          <input type="text" name="fullName" placeholder="Full name" value={registerData.fullName} onChange={handleRegisterChange} />
          <input type="number" name="age" placeholder="Age" value={registerData.age} onChange={handleRegisterChange} />
          <button onClick={handleRegister}>Submit</button>

        </div>
        <button onClick={handleFormChange} className='changeToLogin'>Back to login</button>

      </div>
    </>
  );
}

export default App;
