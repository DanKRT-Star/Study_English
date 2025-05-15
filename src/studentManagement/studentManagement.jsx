import { useState, useEffect, use } from "react";
import './studentManagement.css';
import NavigationBar from "../NavigationBar/NavigationBar";
import { getDatabase, ref, onValue } from "firebase/database";
import { useAuth } from '../authContext.jsx';
import SceneTable from "./sceneTable/sceneTable.jsx";
import ReadingTable from "./readingTable/readingTable.jsx";
import ListeningTable from "./listeningTable/listeningTable.jsx";
import LoadingIndicator from "../loadingIndicator/loadingIndicator.jsx";

function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [activeTab, setActiveTab] = useState('reading');
    const [isLoading, setIsLoading] = useState(true);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [isLeftColumnVisible, setIsLeftColumnVisible] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const db = getDatabase();
        const usersRef = ref(db, 'users');

        const unsubscribe = onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const studentArray = Object.values(data);
                setStudents(studentArray);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setStudents((prevStudents) => [...prevStudents]); 
        }, 60000); 

        return () => clearInterval(interval); 
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 989) {
                setIsLeftColumnVisible(false); 
            } else {
                setIsLeftColumnVisible(true); 
            }
        };

        window.addEventListener("resize", handleResize);

        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const formatOfflineTime = (lastOffline) => {
        if (!lastOffline) return "Offline";

        const now = Date.now();
        const diffInSeconds = Math.floor((now - lastOffline) / 1000);

        if (diffInSeconds < 60) {
            return "Offline";
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `Offline ${minutes} minute${minutes > 1 ? "s" : ""} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `Offline ${hours} hour${hours > 1 ? "s" : ""} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `Offline ${days} day${days > 1 ? "s" : ""} ago`;
        }
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelector(`.tab.${tab}`).classList.add('active');
    };

    const handleFilterChange = (student, isChecked) => {
        setFilteredStudents((prev) => {
            const updatedFilteredStudents = isChecked
                ? [...prev, student.fullName]
                : prev.filter((name) => name !== student.fullName);

            console.log("Filtered Students:", updatedFilteredStudents);
            return updatedFilteredStudents;
        });
    };

    const handleToggleLeftColumn = () => {
        setIsLeftColumnVisible((prev) => !prev);
    };
    
    const user = useAuth();

    if (isLoading) {
        return <LoadingIndicator />;
    };

    return (
        <>
            <NavigationBar></NavigationBar>
            <div className="studentManagementContainer">
                <div className={`leftColumn ${isLeftColumnVisible ? 'visible' : ''}`}>
                    <div className="studentList">
                        <h2>Students list</h2>
                        <table className="studentTable">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Age</th>
                                    <th>Filter</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => (
                                    <tr key={index}>
                                        <td className="studentName">{student.fullName}</td>
                                        <td className="studentStatus">
                                            {student.status === "online" ? (
                                                <span className="onlineStatus">Online</span>
                                            ) : (
                                                <span className="offlineStatus">{formatOfflineTime(student.lastOffline)}</span>
                                            )}
                                        </td>
                                        <td className="studentAge">{student.age || "Chưa cập nhật"}</td>
                                        <td>
                                            <input
                                                type="checkbox"
                                                className="studentCheckbox"
                                                onChange={(e) => handleFilterChange(student, e.target.checked)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rightColumn">
                    <div className="topSection">
                        <div className="tab reading active" onClick={() => handleTabClick('reading')}>reading</div>
                        <div className="tab listening" onClick={() => handleTabClick('listening')}>listening</div>
                        <div className="tab scene" onClick={() => handleTabClick('scene')}>scene</div>    
                    </div>

                    <div className="bottomSection">
                        {activeTab === 'scene' && <SceneTable students={filteredStudents} />}
                        {activeTab === 'reading' && <ReadingTable students={filteredStudents} />}
                        {activeTab === 'listening' && <ListeningTable students={filteredStudents} />}
                    </div>
                </div>

            </div>
            <button className={`toggleLeftColumnBtn ${isLeftColumnVisible ? '✖' : '☰'}`} onClick={handleToggleLeftColumn}>
                {isLeftColumnVisible ? '✖' : '☰'}
            </button>
        </>
    )
}

export default StudentManagement
