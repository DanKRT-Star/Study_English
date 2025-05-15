import './NavigationBar.css'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../authContext.jsx';
import { saveData } from '../firebaseconfig';

function NavigationBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const handleMouseEnter = () => {
        document.querySelector('.NavContainer').classList.add('hovered');
    };

    const handleMouseLeave = () => {
        document.querySelector('.NavContainer').classList.remove('hovered');
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
            
            <div className='List'>
                <ul>
                    <li className='Item homepage' onClick={() => changePage('homepage')} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                        <div className='icon'><i className='bx bxs-home'></i></div>
                        <span>Home</span>
                    </li>
                    <li className='Item scene' onClick={() => changePage('scene')} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                        <div className="icon"><i className='bx bxs-movie-play'></i></div>
                        <span>Scene</span>
                    </li>

                    <li className='Item listening' onClick={() => changePage('listening')} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                        <div className="icon"><i className='bx bxs-playlist'></i></div>
                        <span>Listening</span>
                    </li>

                    <li className='Item reading' onClick={() => changePage('reading')} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                        <div className="icon"><i className='bx bx-book-bookmark'></i></div>
                        <span>Reading</span>
                    </li>
                    
                    {user?.isTeacher ? (
                        <li className='Item studentManagement' onClick={() => changePage('studentManagement')} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                            <div className="icon"><i className='bx bxs-contact'></i></div>
                            <span>Student Manage</span>
                        </li>
                    ) : null} 

                    <li className='Item logout' onClick={handleLogout} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                        <div className="icon"><i className='bx bx-log-out'></i></div>
                        <span>Log out</span>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default NavigationBar;
