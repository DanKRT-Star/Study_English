import { useState, useEffect } from "react";
import { readData } from "../../firebaseconfig";
import './sceneTable.css';
import WhiteLoadingIndicator from "../../loadingIndicator/whiteLoadingIndicator";
import AnswerHistory from "../../answerHistory/answerHistory.jsx";

function SceneTable({ students = [] }) {
    const [sceneList, setSceneList] = useState([]);
    const [selectedScene, setSelectedScene] = useState(null); 
    const [historyData, setHistoryData] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    
    useEffect(() => {
        setIsLoading(true);
        const fetchScenes = async () => {
            const data = await readData('scenes');
            if (data) {
                const sceneArray = Object.values(data);
                setSceneList(sceneArray);
            }
            setIsLoading(false);
        };

        fetchScenes();
    }, []);
    
    useEffect(() => {
        const fetchHistoryForScene = async (sceneTitle) => {
            const allHistory = [];
            let totalQuestions = 0;
            let currentScene = null;

            const scenesData = await readData('scenes');
            if (scenesData) {
                currentScene = Object.values(scenesData).find(scene => scene.title === sceneTitle);
                if (currentScene) {
                    const questions = Object.values(currentScene.questions || {});
                    totalQuestions = questions.length;
                }
            }

            const usersData = await readData('users');
            if (usersData) {
                Object.entries(usersData).forEach(([userId, userData]) => {
                    if (students.length > 0 && !students.includes(userData.fullName)) {
                        return;
                    }

                    const userName = userData.fullName || "Unknown User";
                    const historyData = userData.history;
                    if (historyData) {
                        Object.entries(historyData).forEach(([date, dateData]) => {
                            Object.entries(dateData).forEach(([typeForm, typeData]) => {
                                if (typeForm === "scene") {
                                    Object.entries(typeData).forEach(([timeSubmit, submissionData]) => {
                                        if (submissionData.title === sceneTitle) {
                                            allHistory.push({
                                                date,
                                                time: timeSubmit,
                                                user: userName,
                                                multipleAnswers: submissionData.multipleAnswers || [],
                                                essayAnswers: submissionData.essayAnswers || [],
                                                totalQuestions,
                                                scene: currentScene
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
            }

            setHistoryData(allHistory);
        };

        if (selectedScene) {
            fetchHistoryForScene(selectedScene.title);
        }
    }, [students, selectedScene]);
    
    const calculateCompletionPercentage = (multipleAnswers, essayAnswers, scene) => {

        const totalMultipleQuestions = Object.keys(scene.multipleQuestion || {}).length;
        const totalEssayQuestions = Object.keys(scene.essayQuestion || {}).length;
        const totalQuestions = totalMultipleQuestions + totalEssayQuestions;


        const correctMultipleChoice = multipleAnswers.filter(answer => answer.isCorrect).length;


        const completedEssays = essayAnswers.filter(answer => answer.answer.trim() !== "").length;

        if (totalQuestions === 0) return 0;
        return Math.floor(((correctMultipleChoice + completedEssays) / totalQuestions) * 100);
    };
    
    const handleSceneClick = (scene) => {
        if (selectedScene === scene) {
            setSelectedScene(null);
            setHistoryData([]);
        } else {
            setSelectedScene(scene);
        }
    };
    
    const handleViewSubmission = (submission) => {
        setSelectedSubmission(submission);
        console.log("Selected Submission:", submission);
    };
    
    const handleCloseModal = () => {
        setSelectedSubmission(null);
    };
    
    if (isLoading) {
        return (
            <div className="loadingContainer">
                <WhiteLoadingIndicator />
            </div>
        );
    };   

    return (
        <div className="sceneListContainer">
                {sceneList.map((scene, index) => (
                    <div key={index} className="sceneItem">
                        <div className="sceneHeader">
                            <img
                                src={`https://img.youtube.com/vi/${scene.youtubeId}/hqdefault.jpg`}
                                title={scene.title}
                                frameBorder="0"
                                allowFullScreen
                            ></img>
                            <div className="sceneDetails">
                                <h3>{scene.title}</h3>
                                <p>{scene.time}</p>
                                <button onClick={() => handleSceneClick(scene)}>
                                    <i className='bx bx-filter'></i>
                                    {students.length > 0 ? `Filtered ${students.length}` : 'No filter'}
                                </button>
                            </div>
                        </div>
                        {selectedScene === scene && (
                            <div className="historyTable">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Submit date</th>
                                            <th>Submit time</th>
                                            <th>Submit student</th>
                                            <th>Completed</th>
                                            <th>Result</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyData.length === 0 ? (
                                            <tr>
                                                <td colSpan="5">No submission data</td>
                                            </tr>
                                        ) : (
                                            historyData.map((entry, index) => {
                                                const completionPercentage = calculateCompletionPercentage(
                                                    entry.multipleAnswers || [],
                                                    entry.essayAnswers || [],
                                                    entry.scene
                                                );
                                                return (
                                                    <tr key={index}>
                                                        <td>{entry.date}</td>
                                                        <td>{entry.time}</td>
                                                        <td>{entry.user}</td>
                                                        <td>{completionPercentage}%</td>
                                                        <td>
                                                            <button onClick={() => handleViewSubmission(entry)}>
                                                                <i className='bx bx-window-open'></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}

                {selectedSubmission && (
                    <AnswerHistory
                        student={selectedSubmission.user}
                        typeForm="scene"
                        date={selectedSubmission.date}
                        time={selectedSubmission.time}
                        onClose={handleCloseModal}
                    />
                )}
            </div>
    );
}

export default SceneTable;