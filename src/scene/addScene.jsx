import { useState, useEffect } from "react";
import './addScene.css';
import { saveData, deleteData, readData } from "../firebaseconfig";
import { useAuth } from '../authContext.jsx';
import QuestionUtils from "../questionUtils/questionUtils.jsx";
import dayjs from 'dayjs';
import AnswerUtils from "../answerUtils/answerUtils.jsx";
import LoadingIndicator from '../loadingIndicator/LoadingIndicator.jsx';



function AddScene() {
    const [isExpand, setIsExpand] = useState(false);
    const [editingSceneTitle, setEditingSceneTitle] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [youtubeLink, setYoutubeLink] = useState('');
    const [sceneList, setSceneList] = useState([]);
    const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);
    const [currentPlayScene, setCurrentPlayScene] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [pictures, setPictures] = useState([]);
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);


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

    const getYoutubeId = (url) => {
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleConfirm = async () => {
        const titleInput = document.getElementById('sceneTitle');
        const title = titleInput.value.trim();
        if (!title) {
          alert("Vui lòng nhập tiêu đề");
          return;
        }
      
        const youtubeId = getYoutubeId(youtubeLink);
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
      
        const sceneData = {
          title,
          time: formattedTime,
          youtubeId,
          ...formattedQuestions,
          pictures: formattedPictures,
        };
      
        try {
          if (editingSceneTitle && editingSceneTitle !== title) {
            const usersData = await readData('users');
            if (usersData) {
                for (const [userId, userData] of Object.entries(usersData)) {
                    if (userData.history) {
                        for (const [date, dateData] of Object.entries(userData.history)) {
                            for (const [typeForm, typeData] of Object.entries(dateData)) {
                                if (typeForm === 'scene') {
                                    for (const [timeSubmit, submissionData] of Object.entries(typeData)) {
                                        if (submissionData.title === editingSceneTitle) {
                                            submissionData.title = title;
                                            await saveData(`users/${userId}/history/${date}/${typeForm}/${timeSubmit}`, submissionData);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            await deleteData(`scenes/${editingSceneTitle}`);
            await saveData(`scenes/${title}`, sceneData);
          } else {
            await saveData(`scenes/${title}`, sceneData);
          }
      
          alert("Đã lưu scene thành công!");
          setQuestions([]);
          setYoutubeLink('');
          titleInput.value = '';
          setEditingSceneTitle(null);
        } catch (err) {
          console.error("Lỗi khi lưu scene:", err);
          alert("Có lỗi xảy ra khi lưu scene.");
        }
    };     

    const handleDelete = async (title) => {
        const confirm = window.confirm(`Bạn có chắc muốn xoá "${title}" không?`);
        if (!confirm) return;
    
        try {
            await deleteData(`scenes/${title}`);
            alert("Đã xoá scene!");
            setSceneList(prev => prev.filter(s => s.title !== title));
        } catch (err) {
            console.error("Lỗi khi xoá scene:", err);
            alert("Lỗi khi xoá scene.");
        }
    };
    
    const handleEdit = (scene) => {
        setYoutubeLink(`https://www.youtube.com/watch?v=${scene.youtubeId}`);
        const titleInput = document.getElementById('sceneTitle');
        if (titleInput) titleInput.value = scene.title;

        const picturesArray = scene.pictures
            ? Object.values(scene.pictures)
            : [];
        setPictures(picturesArray);

        const loadedQuestions = Object.entries(scene)
            .filter(([key]) => key.endsWith("Question")) 
            .flatMap(([_, questionGroup]) =>
                Object.entries(questionGroup).map(([_, q]) =>
                    q.options
                        ? { type: 'multiple', question: q.question, options: q.options, answerIndex: q.correctIndex ?? null }
                        : { type: 'essay', question: q.question }
                )
            );

        setQuestions(loadedQuestions);
        setEditingSceneTitle(scene.title);
        setIsExpand(true);
        document.querySelector('.editForm').classList.add('show');
        document.querySelector('.addToogle i').classList.add('rotate');
        document.getElementsByClassName('addBtnContainer')[0].classList.add('expand');
    };
    
    const handlePlay = (scene) => {
        setCurrentPlayScene(scene);
        setIsPlayModalOpen(true);
    };
    
    const closeModal = () => {
        setIsPlayModalOpen(false);
        setCurrentPlayScene(null);
    }

    if (isLoading) {
        return <LoadingIndicator />;
    };

    return (
        <>
            <div className="sceneItems">
                {sceneList.map((scene, index) => (
                    <div className="sceneCard" key={index} alt={scene.title}>
                        <div className="picture">
                            <img
                                src={`https://img.youtube.com/vi/${scene.youtubeId}/hqdefault.jpg`}
                                title={scene.title}
                                frameBorder="0"
                                allowFullScreen
                            ></img>
                        </div>
                        <div className="content">
                            <div className="title" >
                                <h3>{scene.title}</h3><span><p>{scene.time}</p></span>
                            </div>

                            <div className="manage">
                                {user?.isTeacher && (
                                    <>
                                      <button>
                                        <i className="bx bxs-edit-alt" onClick={() => handleEdit(scene)}></i>
                                      </button>
                                      <button>
                                        <i className="bx bxs-trash" onClick={() => handleDelete(scene.title)}></i>
                                      </button>
                                    </>
                                )}
                                <button><i className='bx bx-play-circle' onClick={() => handlePlay(scene) }></i></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {user?.isTeacher && (
                <>
                    <QuestionUtils
                        typeForm="scene"
                        questions={questions}
                        setQuestions={setQuestions}
                        youtubeLink={youtubeLink}
                        setYoutubeLink={setYoutubeLink}
                        handleConfirm={handleConfirm}
                        setIsExpand={setIsExpand}
                        isExpand={isExpand}
                    />
                </> 
            )}

            <AnswerUtils
              typeForm={"scene"}
              isPlayModalOpen={isPlayModalOpen}
              currentPlay={currentPlayScene}
              user={user}
              elapsedTime={elapsedTime}
              setElapsedTime={setElapsedTime}
              saveData={saveData}
              onClose={closeModal}
            />
        </> 
    )
}

export default AddScene;
