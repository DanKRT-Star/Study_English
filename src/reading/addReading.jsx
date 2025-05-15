import { useState, useEffect } from "react";
import './addReading.css';
import { saveData, deleteData, readData } from "../firebaseconfig";
import { useAuth } from '../authContext.jsx';
import QuestionUtils from "../questionUtils/questionUtils.jsx";
import dayjs from 'dayjs';
import AnswerUtils from "../answerUtils/answerUtils";
import LoadingIndicator from '../loadingIndicator/LoadingIndicator.jsx'
import book from '../assets/book.png'

function AddReading() {
    const [isExpand, setIsExpand] = useState(false);
    const [editingReadingTitle, setEditingReadingTitle] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [readingContent, setReadingContent] = useState('');
    const [readingList, setReadingList] = useState([]);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);
    const [currentPlayReading, setCurrentPlayReading] = useState(null);
    const { user } = useAuth();
    const [pictures, setPictures] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReadings = async () => {
            setIsLoading(true);
            const data = await readData('readings');
            if (data) {
                const readingArray = Object.values(data);
                setReadingList(readingArray);
            }
            setIsLoading(false);
        };

        fetchReadings();
    }, []);

    const handleConfirm = async () => {
        setIsLoading(true);
        const titleInput = document.getElementById('readingTitle');
        const title = titleInput.value.trim();
        if (!title) {
            alert("Vui lòng nhập tiêu đề");
            return;
        }

        const formattedTime = dayjs().format('HH:mm DD/MM/YYYY');

        const formattedPictures = {};
        pictures.forEach((picture, index) => {
            formattedPictures[`picture${index + 1}`] = picture;
        });

        const formattedQuestions = {};
        let multipleCounter = 1;
        let essayCounter = 1;
        questions.forEach((q) => {
            const questionTypeKey = `${q.type}Question`;
            if (!formattedQuestions[questionTypeKey]) {
                formattedQuestions[questionTypeKey] = {};
            }
            const questionIndex = q.type === 'multiple' ? `question${multipleCounter++}` : `question${essayCounter++}`;
            formattedQuestions[questionTypeKey][questionIndex] = {
                question: q.question,
            };
            if (q.type === 'multiple') {
                formattedQuestions[questionTypeKey][questionIndex].options = q.options;
                formattedQuestions[questionTypeKey][questionIndex].correctIndex = q.answerIndex;
            }
            if (q.type === 'fill') {
                formattedQuestions[questionTypeKey][questionIndex].content = q.content;
                formattedQuestions[questionTypeKey][questionIndex].correctAnswers = q.correctAnswers;
            }
        });

        const readingData = {
            title,
            time: formattedTime,
            content: readingContent, 
            ...formattedQuestions,
            pictures: formattedPictures,
        };

        console.log(JSON.stringify(readingContent));

        try {
            if (editingReadingTitle && editingReadingTitle !== title) {
                await deleteData(`readings/${editingReadingTitle}`);
                await saveData(`readings/${title}`, readingData);
            } else {
                await saveData(`readings/${title}`, readingData);
            }

            alert("Đã lưu bài đọc thành công!");
            setQuestions([]);
            setReadingContent('');
            titleInput.value = '';
            setEditingReadingTitle(null);
        } catch (err) {
            console.error("Lỗi khi lưu bài đọc:", err);
            alert("Có lỗi xảy ra khi lưu bài đọc.");
        }
        setIsLoading(false);
    };

    const handleDelete = async (title) => {
        setIsLoading(true);
        const confirm = window.confirm(`Bạn có chắc muốn xoá "${title}" không?`);
        if (!confirm) return;

        try {
            await deleteData(`readings/${title}`);
            alert("Đã xoá bài đọc!");
            setReadingList(prev => prev.filter(r => r.title !== title));
        } catch (err) {
            console.error("Lỗi khi xoá bài đọc:", err);
            alert("Lỗi khi xoá bài đọc.");
        }
        setIsLoading(true);
    };

    const handleEdit = (reading) => {
        const titleInput = document.getElementById('readingTitle');
        if (titleInput) titleInput.value = reading.title;

        setReadingContent(reading.content || '');

        const picturesArray = reading.pictures
        ? Object.values(listening.pictures)
        : [];
        setPictures(picturesArray);

        const loadedQuestions = Object.entries(reading)
            .filter(([key]) => key.endsWith("Question")) 
            .flatMap(([_, questionGroup]) =>
                Object.entries(questionGroup).map(([_, q]) =>
                    q.options
                        ? { type: 'multiple', question: q.question, options: q.options, answerIndex: q.correctIndex ?? null }
                        : { type: 'essay', question: q.question }
                )
            );

        setQuestions(loadedQuestions);
        setEditingReadingTitle(reading.title);
        setIsExpand(true);
    };

    const handlePlay = (reading) => {
        setCurrentPlayReading(reading);
        setIsPlayModalOpen(true);
    };

    const closeModal = () => {
        setIsPlayModalOpen(false);
        setCurrentPlayReading(null);
    };

    if (isLoading) {
        return <LoadingIndicator />;
    };

    return (
        <>
            <div className="readingItems" >
                {readingList.map((reading, index) => (
                    <div className="readingCard" key={index} >
                        <div className="picture">
                            <img src={book} alt={reading.title}/>
                        </div>
                        <div className="content">
                            <div className="title">
                                <h3 title={reading.title}>{reading.title}</h3><span><p>{reading.time}</p></span>
                            </div>
                            <div className="manage">
                                {user?.isTeacher ? (
                                    <>
                                        <button><i className="bx bxs-edit" onClick={() => handleEdit(reading)}></i></button>
                                        <button><i className="bx bxs-trash" onClick={() => handleDelete(reading.title)}></i></button>
                                    </> 
                                ) : null}
                                <button><i className="bx bx-book-open" onClick={() => handlePlay(reading)}></i></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>


            {user?.isTeacher && (
                <>
                    <QuestionUtils
                        typeForm="reading"
                        questions={questions}
                        setQuestions={setQuestions}
                        handleConfirm={handleConfirm}
                        setIsExpand={setIsExpand}
                        isExpand={isExpand}
                        readingContent={readingContent}
                        setReadingContent={setReadingContent}
                    />  
                </> 
            )} 

            <AnswerUtils
                typeForm="reading"
                isPlayModalOpen={isPlayModalOpen}
                currentPlay={currentPlayReading}
                user={user}
                elapsedTime={elapsedTime}
                setElapsedTime={setElapsedTime}
                saveData={saveData}
                onClose={closeModal}
            />
        </>
    );
}

export default AddReading;