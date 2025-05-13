import './questionUtils.css';
import { uploadFileToCloudinary } from "../cloudinaryUtils.jsx";



function QuestionUtils({ typeForm, questions, setQuestions, youtubeLink, setYoutubeLink, handleConfirm, setIsExpand, isExpand,  audioLink, setAudioLink, pictures = [], setPictures }) {

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("Vui lòng chọn một tệp.");
      return;
    }
  
    if (!file.type.startsWith("image/")) {
      alert("Tệp không phải là ảnh. Vui lòng chọn một tệp ảnh.");
      return;
    }
  
    try {
      const uploadedUrl = await uploadFileToCloudinary(file, "pictures"); // Đặt folder là "pictures"
      setPictures((prev) => [...prev, uploadedUrl]);
      alert("Tải ảnh lên thành công!");
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên Cloudinary:", error.response?.data || error.message);
      alert("Lỗi khi tải ảnh lên Cloudinary.");
    }
  };

  const handleDeletePicture = (index) => {
    setPictures((prev) => prev.filter((_, i) => i !== index)); 

  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadFileToCloudinary(file, "audio");
      setAudioLink(uploadedUrl);
      alert("Tải tệp lên thành công!");
    } catch (error) {
      alert("Lỗi khi tải tệp lên Cloudinary.");
    }
  };

  const getYoutubeId = (url) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleExpand = () => {
    setIsExpand((prev) => !prev); 
  };

  const handleQuestionChange = (questions, index, newValue) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = newValue;
    return updatedQuestions;
  };

  const deleteQuestion = (questions, index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    console.log("Updated Questions:", updatedQuestions); // Kiểm tra danh sách câu hỏi sau khi xóa
    return updatedQuestions;
  };

  const handleAnswerSelect = (questions, questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answerIndex = optionIndex;
    return updatedQuestions;
  };

  const handleOptionChange = (questions, questionIndex, optionIndex, newValue) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = newValue;
    return updatedQuestions;
  };

  const addOption = (questions, questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push('');
    return updatedQuestions;
  };

  const removeOption = (questions, questionIndex) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options.length > 2) {
      updatedQuestions[questionIndex].options.pop();
    }
    return updatedQuestions;
  };

  const addMultipleChoiceQuestion = (questions) => {
    return [
      ...questions,
      {
        type: 'multiple',
        question: '',
        options: ['', ''],
        answerIndex: null,
      },
    ];
  };

  const addEssayQuestion = (questions) => {
    return [
      ...questions,
      {
        type: 'essay',
        question: '',
      },
    ];
  };

  const addFillBlankQuestion = (questions) => {
    return [
      ...questions,
      {
        type: 'fill',
        question: '',
        content: '',
        correctAnswers: [],
      },
    ];
  };

  const renderForm = () => {
    switch (typeForm) {
      case 'scene':
        return (
          <>
            <p>Title:</p>
            <input type="text" id="sceneTitle" placeholder="Title" />
            <p>YouTube link:</p>
            <input
              type="text"
              value={youtubeLink}
              placeholder="Youtube link"
              onChange={(e) => setYoutubeLink(e.target.value)}
            />
            {youtubeLink && (
              <iframe
                src={`https://www.youtube.com/embed/${getYoutubeId(youtubeLink)}`}
                width="300"
                height="200"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            )}
          </>
        );
      case 'reading':
        return (
          <>
            <p>Title:</p>
            <input type="text" id="readingTitle" placeholder="Title" maxLength={30}/>
            <p>Content:</p>
            <textarea id="readingContent" placeholder="Content" value={youtubeLink} onChange={(e) => setYoutubeLink(e.target.value)} ></textarea>
          </>
        );  
      case "listening":
        return (
          <>
            <p>Title:</p>
            <input type="text" id="listeningTitle" placeholder="Title" maxLength={30} />
            <p>Upload MP3:</p>
            <input type="file" accept="audio/mp3" onChange={handleFileUpload} />
            {audioLink && (
              <div className="audioContainer">
                <p>Audio Preview:</p>
                <audio controls>
                  <source src={audioLink} type="audio/mp3" />
                </audio>
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className={`editForm ${isExpand ? 'show' : ''}`}>
        {renderForm()}
        <p>Upload Pictures:</p>
        <input type="file" accept="image/*" onChange={handlePictureUpload} />
        {pictures.length > 0 && (
          <div className="picturesPreview">
            {pictures.map((picture, index) => (
              <div key={index} className="pictureItem">
                <img
                  src={picture}
                  alt={`Uploaded ${index}`}
                  onLoad={(e) => {
                    const img = e.target;
                    const aspectRatio = img.naturalWidth / img.naturalHeight;
                    img.style.aspectRatio = aspectRatio; // Áp dụng aspect ratio
                  }}
                  style={{ height: "100%", objectFit: "cover" }}
                />
                <button className="deleteButton" onClick={() => handleDeletePicture(index)}><i className='bx bxs-trash'></i></button>
              </div>
            ))}
          </div>
        )}
        <p>Questions:</p>
        <div className="questionContainer">
          {questions.map((q, index) => (
            <div className="question" key={index}>
              <div className="questionLabel">
                <input
                  type="text"
                  placeholder="Nhập câu hỏi"
                  value={q.question}
                  onChange={(e) => setQuestions(handleQuestionChange(questions, index, e.target.value))}
                />
                <span>
                    {q.type === 'multiple' && (
                      <>
                        <button onClick={() => setQuestions(addOption(questions, index))}>
                          <i className="bx bx-plus"></i>
                        </button>
                        <button onClick={() => setQuestions(removeOption(questions, index))}>
                          <i className="bx bx-minus"></i>
                        </button>
                      </>
                    )}

                    <button onClick={() => setQuestions(deleteQuestion(questions, index))}><i className="bx bxs-trash"></i></button> 
                </span>
              </div>
              {q.type === 'multiple' && (
                <>
                  {q.options.map((opt, optIndex) => (
                    <div className="option" key={optIndex} style={{ display: 'flex', width: '100%' }}>
                      <input
                        className="ratio"
                        type="radio"
                        checked={q.answerIndex === optIndex}
                        onChange={() => setQuestions(handleAnswerSelect(questions, index, optIndex))}
                      />
                      <input
                        className="text"
                        type="text"
                        value={opt}
                        placeholder={`Lựa chọn ${optIndex + 1}`}
                        onChange={(e) => setQuestions(handleOptionChange(questions, index, optIndex, e.target.value))}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
        <div className="addQuestionBtn">
          <button onClick={() => setQuestions(addMultipleChoiceQuestion(questions))}><i className='bx bxs-check-circle'></i></button>
          <button onClick={() => setQuestions(addEssayQuestion(questions))}><i className='bx bxs-edit-alt'></i></button>
          <button onClick={() => setQuestions(addFillBlankQuestion(questions))}><i className='bx bx-space-bar'></i></button>
        </div>
      </div>

      <div className={`addBtnContainer ${isExpand ? 'expand' : ''}`}>
        <div className={`button confirmAdd`} onClick={handleConfirm}>
          <i className="bx bx-check"></i>
        </div>
        <div className={`button addToogle`} onClick={handleExpand}>
          <i className={`bx bx-plus ${isExpand ? 'rotate' : ''}`}></i>
        </div>
      </div>
    </>
  );
}

export default QuestionUtils;






