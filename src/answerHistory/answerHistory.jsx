import { useState, useEffect } from "react";
import { readData } from "../firebaseconfig";
import './answerHistory.css';
import LoadingIndicator from "../loadingIndicator/loadingIndicator";

function AnswerHistory({student, typeForm, date, time, onClose}) {
    const [answerHistory, setAnswerHistory] = useState([]);
    const [test, setTest] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    useEffect(() => {
        const fetchAnswerHistory = async () => {
            setIsLoading(true);
            const data = await readData(`users`);
            if (data) {
                const user = Object.values(data).find(user => user.fullName === student);
                if (user) {
                    const history = user.history[date][typeForm][time];
                    setAnswerHistory(history);
                } else {
                    setAnswerHistory(null);
                }
            };
            setIsLoading(false);
        };
        fetchAnswerHistory();
    }, [student]);

    useEffect(() => {  
        const fetchTest = async () => {
            setIsLoading(true);
            if (!answerHistory || !answerHistory.title) {
                setIsLoading(false);
                return; 
            }
            const data = await readData(`${typeForm}s`);
            if (data) {
                const testArray = Object.values(data).find(test => test.title === answerHistory.title);
                setTest(testArray);
            }
            setIsLoading(false);
        };
        fetchTest();
    }, [answerHistory?.title]);

    return (
        <div className="answerHistoryContainer">
            {isLoading ? (
                <LoadingIndicator />
            ) : (
                <div className="answerHistoryList">

                    <div className="Session Info ">
                        <h3>{answerHistory?.submittedAt} | {date}</h3>
                        <h3>{answerHistory?.title}</h3>
                        <h3>Total time: {answerHistory?.totalTime}</h3>
                    </div>

                    <div className="Session Result">
                        <div className="Multiple">
                            <h3>Multiple Choice Answers</h3>
                            <div className="answerContainer">
                                {Object.keys(test?.multipleQuestion || {}).map((key, index) => (
                                    <div
                                        key={key}
                                        className={
                                            answerHistory?.multipleAnswers?.[index]?.selectedIndex === null
                                                ? 'item blank'
                                                : answerHistory?.multipleAnswers?.[index]?.isCorrect
                                                ? 'item correct'
                                                : 'item incorrect'
                                        }
                                        onClick={() => setSelectedQuestion(index)}
                                    >
                                        {index + 1}
                                    </div>
                                ))}
                            </div>
                            {selectedQuestion !== null && (
                                <div className="answerDetails">
                                    <h3>Question {selectedQuestion + 1}: {test?.multipleQuestion?.[`question${selectedQuestion + 1}`]?.question || 'No question content available'} </h3>
                                    <div className="options">
                                        {test?.multipleQuestion?.[`question${selectedQuestion + 1}`]?.options?.map((option, i) => (
                                            <div
                                                key={i}
                                                className={
                                                    answerHistory?.multipleAnswers?.[selectedQuestion]?.selectedIndex !== undefined
                                                        ? answerHistory?.multipleAnswers?.[selectedQuestion]?.selectedIndex === i
                                                            ? answerHistory?.multipleAnswers?.[selectedQuestion]?.isCorrect
                                                                ? 'option correct'
                                                                : 'option incorrect'
                                                            : 'option'
                                                        : 'option blank'
                                                }
                                            >
                                                 {option}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="Essay">
                            <h3>Essay Answers</h3>
                            <div className="answerContainer">
                                {answerHistory?.essayAnswers?.map((answer, index) => (
                                    <div key={index} className="questionItem">
                                        <h3>Question {index + 1}: {test?.essayQuestion?.[`question${index + 1}`]?.question || 'No question content available'}</h3>
                                        <p>{answer.answer || 'No answer provided'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>  
                    </div>          

                    <button onClick={onClose}>Close</button>
                </div>
            )}
        </div>
    );
}
export default AnswerHistory;
