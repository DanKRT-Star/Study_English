import { useState, useEffect } from "react";
import { readData } from "../../firebaseconfig";
import './listeningTable.css';
import WhiteLoadingIndicator from "../../loadingIndicator/whiteLoadingIndicator";
import AnswerHistory from "../../answerHistory/answerHistory";
import dics from '../../assets/dics.png';

function ListeningTable({students}) {
    const [listeningList, setListeningList] = useState([]);
    const [selectedListening, setSelectedListening] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        const fetchListenings = async () => {
            const data = await readData('listenings');
            if (data) {
                const listeningArray = Object.values(data);
                setListeningList(listeningArray);
            }
            setIsLoading(false);
        };

        fetchListenings();
    }, []);

    useEffect(() => {
        const fetchHistoryForListening = async (listeningTitle) => {
            const allHistory = [];
            let totalQuestions = 0;
            let currentListening = null;

            const listeningsData = await readData('listenings');
            if (listeningsData) {
                currentListening = Object.values(listeningsData).find(listening => listening.title === listeningTitle);
                if (currentListening) {
                    const questions = Object.values(currentListening.questions || {});
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
                                if (typeForm === "listening") {
                                    Object.entries(typeData).forEach(([timeSubmit, submissionData]) => {
                                        if (submissionData.title === listeningTitle) {
                                            allHistory.push({
                                                date,
                                                time: timeSubmit,
                                                user: userName,
                                                multipleAnswers: submissionData.multipleAnswers || [],
                                                essayAnswers: submissionData.essayAnswers || [],
                                                totalQuestions,
                                                listening: currentListening
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

        if (selectedListening) {
            fetchHistoryForListening(selectedListening.title);
        }
    }, [students, selectedListening]);

    const calculateCompletionPercentage = (multipleAnswers, essayAnswers, listening) => {

        const totalMultipleQuestions = Object.keys(listening.multipleQuestion || {}).length;
        const totalEssayQuestions = Object.keys(listening.essayQuestion || {}).length;
        const totalQuestions = totalMultipleQuestions + totalEssayQuestions;


        const correctMultipleChoice = multipleAnswers.filter(answer => answer.isCorrect).length;


        const completedEssays = essayAnswers.filter(answer => answer.answer.trim() !== "").length;

        if (totalQuestions === 0) return 0;
        return Math.floor(((correctMultipleChoice + completedEssays) / totalQuestions) * 100);
    };

    const handleListeningClick = (listening) => {
        if (selectedListening === listening) {
            setSelectedListening(null);
            setHistoryData([]);
        } else {
            setSelectedListening(listening);
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
        <div className="listeningListContainer">
                {listeningList.map((listening, index) => (
                    <div key={index} className="listeningItem">
                        <div className="listeningHeader">
                            <img
                                src={dics}
                            ></img>
                            <div className="listeningDetails">
                                <h3>{listening.title}</h3>
                                <p>{listening.time}</p>
                                <button onClick={() => handleListeningClick(listening)}>
                                    <i className='bx bx-filter' ></i>
                                    {students.length > 0 ? `Filtered ${students.length}` : 'No filter'}
                                </button>
                            </div>
                        </div>
                        {selectedListening === listening && (
                            <div className="historyTable">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Submit date</th>
                                            <th>Submit time</th>
                                            <th>Submit student</th>
                                            <th>Completed</th>
                                            <th>Details</th>
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
                                                    entry.listening
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
                        typeForm="listening"
                        date={selectedSubmission.date}
                        time={selectedSubmission.time}
                        onClose={handleCloseModal}
                    />
                )}
            </div>
    );
}

export default ListeningTable;