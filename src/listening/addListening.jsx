import './addListening.css';
import { saveData, deleteData, readData } from "../firebaseconfig";
import { useAuth } from '../authContext.jsx';
import QuestionUtils from "../questionUtils/questionUtils.jsx";
import AnswerUtils from "../answerUtils/answerUtils.jsx";
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import LoadingIndicator from '../loadingIndicator/LoadingIndicator.jsx';
import dics from '../assets/dics.png'


function AddListening() {
    const [isExpand, setIsExpand] = useState(false);
    const [editingListeningTitle, setEditingListeningTitle] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [listeningList, setListeningList] = useState([]);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [audioLink, setAudioLink] = useState("");
    const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);
    const [currentPlayReading, setCurrentPlayReading] = useState(null);
    const { user } = useAuth();
    const [pictures, setPictures] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const handleConfirm = async () => {
        setIsLoading(true);
        const titleInput = document.getElementById("listeningTitle");
        const title = titleInput.value.trim();
        if (!title) {
            alert("Vui lòng nhập tiêu đề");
            return;
        }

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

        const formattedTime = dayjs().format('HH:mm DD/MM/YYYY');
      
        const listeningData = {
          title,
          pictures: formattedPictures, 
          content: audioLink,
          userId: user.uid,
          ...formattedQuestions,
          time: formattedTime
        };

        try {
          await saveData(`listenings/${title}`, listeningData);
          alert("Đã lưu bài nghe thành công!");
          setQuestions([]);
          setPictures([]); 
          setAudioLink("");
          titleInput.value = "";
          setEditingListeningTitle(null);
        } catch (error) {
          console.error("Lỗi khi lưu bài nghe:", error);
          alert("Đã xảy ra lỗi khi lưu bài nghe. Vui lòng thử lại.");
        }

        setIsLoading(false);
    };

    const handleDelete = async (title) => {
        setIsLoading(true);
        if (window.confirm("Bạn có chắc chắn muốn xóa không?")) {
            await deleteData(`listenings/${title}`);
            setListeningList(listeningList.filter((item) => item.title !== title));
        }
        setIsLoading(false);
    };

    const handleEdit = (listening) => {
        const titleInput = document.getElementById('listeningTitle');
        if (titleInput) titleInput.value = listening.title;
        setEditingListeningTitle(listening.title);
        setAudioLink(listening.content);
        const picturesArray = listening.pictures
        ? Object.values(listening.pictures)
        : [];
        setPictures(picturesArray);

        const loadedQuestions = Object.entries(listening)
            .filter(([key]) => key.endsWith("Question")) 
            .flatMap(([_, questionGroup]) =>
                Object.entries(questionGroup).map(([_, q]) =>
                    q.options
                        ? { type: 'multiple', question: q.question, options: q.options, answerIndex: q.correctIndex ?? null }
                        : { type: 'essay', question: q.question }
                )
            );


        setQuestions(loadedQuestions);
        setIsExpand(true);
    };

    const handlePlay = (listening) => {
        setCurrentPlayReading(listening);
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
            <div className="listeningItems">
            {listeningList.map((listening, index) => (
                    <div className="listeningCard" key={index}>
                        <div className="picture">
                            <img src={dics} alt=""/>
                        </div>
                        <div className="content">
                            <div className="title">
                                <h3>{listening.title}</h3><span><p>{listening.time}</p></span>
                            </div>
                            <div className="manage">
                                {user?.isTeacher ? (
                                    <>
                                        <button><i className="bx bxs-edit" onClick={() => handleEdit(listening)}></i></button>
                                        <button><i className="bx bxs-trash" onClick={() => handleDelete(listening.title)}></i></button>
                                    </> 
                                ) : null}
                                <button><i className="bx bx-play" onClick={() => handlePlay(listening)}></i></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div> 

            {user?.isTeacher && (
                <>
                    <QuestionUtils
                        typeForm="listening"
                        questions={questions}
                        setQuestions={setQuestions}
                        handleConfirm={handleConfirm}
                        setIsExpand={setIsExpand}
                        isExpand={isExpand}
                        setAudioLink={setAudioLink}
                        audioLink={audioLink}
                        pictures={pictures}
                        setPictures={setPictures}
                    />  
                </> 
            )} 

            <AnswerUtils
                typeForm="listening"
                isPlayModalOpen={isPlayModalOpen}
                currentPlay={currentPlayReading}
                user={user}
                elapsedTime={elapsedTime}
                setElapsedTime={setElapsedTime}
                saveData={saveData}
                onClose={closeModal}
                pictures={pictures}
                setPictures={setPictures}
            />       
        </>
    );
}

export default AddListening;
