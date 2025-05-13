import { useState, useEffect } from "react";
import { readData } from "../../firebaseconfig";
import './readingTable.css';
import WhiteLoadingIndicator from "../../loadingIndicator/whiteLoadingIndicator";
import AnswerHistory from "../../answerHistory/answerHistory";

function ReadingTable({students = [] }) {
    const [readingList, setReadingList] = useState([]);
    const [selectedReading, setSelectedReading] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        const fetchReadings = async () => {
            const data = await readData('readings');
            if (data) {
                const readingArray = Object.values(data);
                setReadingList(readingArray);
            }
            setIsLoading(false);
        };

        fetchReadings();
    }, []);

    useEffect(() => {
        const fetchHistoryForReading = async (readingTitle) => {
            const allHistory = [];
            let totalQuestions = 0;
            let currentReading = null;

            const readingsData = await readData('readings');
            if (readingsData) {
                currentReading = Object.values(readingsData).find(reading => reading.title === readingTitle);
                if (currentReading) {
                    const questions = Object.values(currentReading.questions || {});
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
                                if (typeForm === "reading") {
                                    Object.entries(typeData).forEach(([timeSubmit, submissionData]) => {
                                        if (submissionData.title === readingTitle) {
                                            allHistory.push({
                                                date,
                                                time: timeSubmit,
                                                user: userName,
                                                multipleAnswers: submissionData.multipleAnswers || [],
                                                essayAnswers: submissionData.essayAnswers || [],
                                                totalQuestions,
                                                reading: currentReading
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

        if (selectedReading) {
            fetchHistoryForReading(selectedReading.title);
        }
    }, [students, selectedReading]);

    const calculateCompletionPercentage = (multipleAnswers, essayAnswers, reading) => {

        const totalMultipleQuestions = Object.keys(reading.multipleQuestion || {}).length;
        const totalEssayQuestions = Object.keys(reading.essayQuestion || {}).length;
        const totalQuestions = totalMultipleQuestions + totalEssayQuestions;


        const correctMultipleChoice = multipleAnswers.filter(answer => answer.isCorrect).length;


        const completedEssays = essayAnswers.filter(answer => answer.answer.trim() !== "").length;

        if (totalQuestions === 0) return 0;
        return Math.floor(((correctMultipleChoice + completedEssays) / totalQuestions) * 100);
    };

    const handleReadingClick = (reading) => {
        if (selectedReading === reading) {
            setSelectedReading(null);
            setHistoryData([]);
        } else {
            setSelectedReading(reading);
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
        <div className="readingListContainer">
                {readingList.map((reading, index) => (
                    <div key={index} className="readingItem">
                        <div className="readingHeader">
                            <img
                                src="src\assets\book.png"
                            ></img>
                            <div className="readingDetails">
                                <h3>{reading.title}</h3>
                                <p>{reading.time}</p>
                                <button onClick={() => handleReadingClick(reading)}>
                                    <i className='bx bx-filter'></i>
                                    {students.length > 0 ? `Filtered ${students.length}` : 'No filter'}
                                </button>
                            </div>
                        </div>
                        {selectedReading === reading && (
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
                                                                <i class='bx bx-window-open'></i>
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
                        typeForm="reading"
                        date={selectedSubmission.date}
                        time={selectedSubmission.time}
                        onClose={handleCloseModal}
                    />
                )}

            </div>
    );
}

export default ReadingTable;