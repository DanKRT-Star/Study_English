import './NavigationBar.css'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../authContext.jsx';
import { saveData } from '../firebaseconfig';

function NavigationBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();

    const Open = () => {
        const NavigationBar = document.querySelector('.NavContainer');
        if (!NavigationBar) return;

        NavigationBar.classList.toggle("expand");
        setIsOpen(prev => !prev);
    };

    const changePage = (page) => {
        navigate(`/${page}`);
    };

    const handleLogout = async () => {
        if (user) {
            const timestamp = Date.now();
            await saveData(`users/${user.uid}/status`, "offline");
            await saveData(`users/${user.uid}/lastOffline`, timestamp);
        }
        changePage(' ');
    };

    useEffect(() => {
        const allItems = document.getElementsByClassName('Item');
        Array.from(allItems).forEach(item => item.classList.remove('active'));

        const currentPath = location.pathname.replace('/', '') || 'homepage';
        const targetItem = document.querySelector(`.Item.${currentPath}`);
        if (targetItem) {
            targetItem.classList.add('active');
        }
    }, [location]); 

    return (
        <div className='NavContainer'>
            <button className='Toggle' onClick={Open}>
                <i className='bx bxs-grid'></i> 
            </button>
            
            <div className='List'>
                <ul>
                    <li className='Item homepage' onClick={() => changePage('homepage')}>
                        <i className='bx bxs-home'></i>
                        <span>Home</span>
                    </li>
                    <li className='Item scene' onClick={() => changePage('scene')}>
                        <i className='bx bxs-movie-play'></i>
                        <span>Scene</span>
                    </li>

                    <li className='Item listening' onClick={() => changePage('listening')}>
                        <i className='bx bxs-playlist'></i>
                        <span>Listening</span>
                    </li>

                    <li className='Item reading' onClick={() => changePage('reading')}>
                        <i className='bx bx-book-bookmark'></i>
                        <span>Reading</span>
                    </li>
                    
                    {user?.isTeacher ? (
                        <li className='Item studentManagement' onClick={() => changePage('studentManagement')}>
                            <i className='bx bxs-contact'></i>
                            <span>Student Manage</span>
                        </li>
                    ) : null} 

                    <li className='Item logout' onClick={handleLogout}>
                        <i className='bx bx-log-out'></i>
                        <span>Log out</span>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default NavigationBar;
