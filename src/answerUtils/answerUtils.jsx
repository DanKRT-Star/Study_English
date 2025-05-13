import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import "./answerUtils.css";

function AnswerUtils({typeForm, isPlayModalOpen, currentPlay, user, elapsedTime, setElapsedTime, saveData, onClose}) {

    const [multiplePage, setMultiplePage] = useState(0);
    const [essayPage, setEssayPage] = useState(0);
    const essayRef = useRef(null);
    const multipleRef = useRef(null);

    useEffect(() => {
        if (isPlayModalOpen) {
        const start = Date.now();
        const interval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - start) / 1000));
        }, 1000);

        return () => clearInterval(interval);
        }
    }, [isPlayModalOpen, setElapsedTime]);

    const formatTime = (seconds) => {
        const min = String(Math.floor(seconds / 60)).padStart(2, "0");
        const sec = String(seconds % 60).padStart(2, "0");
        return `${min}:${sec}`;
    };

    const handleScrollToQuestion = (type, index) => {
        const container = document.querySelector(
        type === "essay" ? ".essayContainer" : ".multipleContainer"
        );
        if (!container) return;

        const allQuestions = container.querySelectorAll(".questionItem");
        const target = allQuestions[index];
        if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const renderNavButtons = (questions, page, setPage, type) => {
        const perPage = 5;
        const start = page * perPage;
        const end = start + perPage;
        const visible = questions.slice(start, end);

        return (
        <div className={`questionNav ${type}`}>
            {page > 0 && (
            <button onClick={() => setPage(page - 1)}>{"<"}</button>
            )}
            {visible.map((q, idx) => (
            <button
                key={start + idx}
                onClick={() => handleScrollToQuestion(type, start + idx)}
            >
                {start + idx + 1}
            </button>
            ))}
            {end < questions.length && (
            <button onClick={() => setPage(page + 1)}>{">"}</button>
            )}
        </div>
        );
    };

    const renderQuestions = (currentPlay, type) => {
        if (!currentPlay) return []; 

        return Object.entries(currentPlay)
            .filter(([key]) => key.endsWith("Question"))
            .flatMap(([key, questionGroup]) =>
                Object.entries(questionGroup).map(([qKey, q]) => ({
                    key: qKey,
                    ...q,
                    type: q.type || (key === 'multipleQuestion' ? 'multiple' : 'essay') // Infer type if missing
                }))
            )
            .filter(q => q.type === type);
    };

    const multipleQuestions = renderQuestions(currentPlay, 'multiple');
    const essayQuestions = renderQuestions(currentPlay, 'essay');


    const handleSubmitAnswers = async () => {
        if (!user) {
        alert("Bạn chưa đăng nhập!");
        return;
        }
        const timeSubmit = dayjs().format("HH:mm");
        const timestamp = dayjs().format("DD-MM-YYYY");
        const sceneTitle = currentPlay.title;
        const path = `users/${user.uid}/history/${timestamp}/${typeForm}/${timeSubmit}`;

        const multipleAnswers = Array.from(
            document.querySelectorAll(".multipleContainer .questionItem")
        ).map((item, index) => {
            const radios = item.querySelectorAll("input[type='radio']");
            let selectedIndex = null;
            radios.forEach((r, i) => {
                if (r.checked) {
                    selectedIndex = i;
                }
            });
            const questionKey = `question${index + 1}`;
            const correctIndex = currentPlay.multipleQuestion?.[questionKey]?.correctIndex;
            const isCorrect = selectedIndex === correctIndex;
            return { selectedIndex, isCorrect };
        });

        const essayAnswers = Array.from(
        document.querySelectorAll(".essayContainer .questionItem")
        ).map((item) => {
        const text = item.querySelector("textarea")?.value || "";
        return { answer: text };
        });

        const data = {
        title: sceneTitle,    
        submittedAt: timeSubmit,
        totalTime: formatTime(elapsedTime),
        multipleAnswers,
        essayAnswers,
        };

        try {
        await saveData(path, data);
        alert("Nộp bài thành công! Xem kết quả của bạn.");
        onClose();
        } catch (err) {
        alert("Lỗi khi nộp bài: " + err.message);
        }
    };

    if (!isPlayModalOpen || !currentPlay) return null;

    return (
        <div className="playModalOverlay">
            <div className="playModalLayout">
                <div className="leftColumn" ref={essayRef}>
                    {typeForm === "scene" ? (
                        <iframe
                        width="100%"
                        height="50%"
                        src={`https://www.youtube.com/embed/${currentPlay.youtubeId}`}
                        title={currentPlay.title}
                        frameBorder="0"
                        allowFullScreen
                        ></iframe>
                    ) : typeForm === "reading" ? (
                        <>
                            <h2>{currentPlay.title}</h2>
                            <div className="readingContent">
                                <p>{currentPlay.content}</p>
                            </div>
                        </>
                    ) : (
                        <>          
                            <h2>{currentPlay.title}</h2>
                            <audio controls src={currentPlay.content} className="audioPlayer">
                                Your browser does not support the audio element.
                            </audio>
                        </>
                    )}
                    {currentPlay.pictures && (
                        <div className="picturesContainer">
                        {Object.entries(currentPlay.pictures).map(([key, picture], index) => (
                            <img
                            key={key}
                            src={picture}
                            alt={`Picture ${index + 1}`}
                            onLoad={(e) => {
                                const img = e.target;
                                const aspectRatio = img.naturalWidth / img.naturalHeight;
                                img.style.aspectRatio = aspectRatio;
                            }}
                            style={{ width: "100%", objectFit: "cover" }}
                            />
                        ))}
                        </div>
                    )}         
                </div>

                <div className="rightColumn" ref={multipleRef}>
                    <div className="manageTestContainer">
                        <div className="submitContainer">
                            <h3><i className='bx bxs-time'></i>{formatTime(elapsedTime)}</h3>
                                <button onClick={handleSubmitAnswers}>Nộp bài</button>
                        </div>

                        <div className="questionNavContainer">
                            <div className="multiple">
                                <h3>Trắc nghiệm:</h3>
                                {renderNavButtons(
                                    multipleQuestions,
                                    multiplePage,
                                    setMultiplePage,
                                    'multiple'
                                )}
                            </div>

                            <div className="essay">
                                <h3>Tự luận:</h3>
                                    {renderNavButtons(
                                        essayQuestions,
                                        essayPage,
                                        setEssayPage,
                                        'essay'
                                    )}
                            </div>
                        </div>
                    </div>

                    <div className="multipleContainer">
                        <h3>Câu hỏi trắc nghiệm</h3>
                            {multipleQuestions.map((q, index) => (
                            <div className="questionItem" key={q.key}>
                                <p>Câu {index + 1}: {q.question}</p>
                                {q.options.map((opt, i) => (
                                    <div className="option" key={i}>
                                        <input className="ratio" type="radio" id={`${q.key}_opt_${i}`} name={q.key} />
                                        <label htmlFor={`${q.key}_opt_${i}`}>{opt.text || opt}</label>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="essayContainer">
                        <h3>Câu hỏi tự luận</h3>
                        {essayQuestions.map((q, index) => (
                            <div className="questionItem" key={q.key}>
                                <p><b>Câu {index + 1}: {q.question}</b> </p>
                                <textarea placeholder="Nhập câu trả lời..." rows="3" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnswerUtils;
