import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import QuizCard from './QuizCard';
import ListeningQuizCard from './ListeningQuizCard';
import './App.css';
import score100 from './images/perfect.png';
import score50to100 from './images/yet.png';
import under50score from './images/poor.gif';

const App = () => {
    const [allWords, setAllWords] = useState([]);
    const [words, setWords] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [quizType, setQuizType] = useState(null); // 'word' or 'listening'
    const [fileUploaded, setFileUploaded] = useState(false); // new state
    const [quizCount, setQuizCount] = useState(5); // '5', '15', or '25'
    const [showScoreImage, setShowScoreImage] = useState(true); // Add this line

    useEffect(() => {
        if (allWords.length > 0) {
            setWords(allWords.slice(0, quizCount)); // slice array based on quizCount
            setCurrentQuizIndex(0);
        }
    }, [quizCount, allWords]);

    const handleQuizCountChange = event => {
      setQuizCount(Number(event.target.value));
    };

    const onFileUpload = async () => {
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = async (e) => { 
                const text = (e.target.result);
                const results = Papa.parse(text, { header: true, skipEmptyLines: true });
                const words = results.data.map(word => ({ ...word, userInput: '', isCorrect: null }));
                setAllWords(words);
                setFileUploaded(true);
            };
            reader.readAsText(selectedFile);
        } else {
            alert("파일을 선택해주세요.");
        }
    };

    const shuffleArray = array => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const onFileChange = event => {
        setSelectedFile(event.target.files[0]);
    };

    const handleQuizStart = (type) => {
        setWords(prevWords => shuffleArray(prevWords));
        setQuizType(type);
        setCurrentQuizIndex(0);
    }
    

    const handleAnswer = (index, answer) => {
        setWords(prevWords => prevWords.map((word, i) => {
            if (i === index) {
                if (typeof answer === 'boolean') {
                    return { ...word, isCorrect: answer };
                } else {
                    return { ...word, userInput: answer };
                }
            } else {
                return word;
            }
        }));
        if (typeof answer === 'boolean') {
            setCurrentQuizIndex(prevIndex => prevIndex + 1);
        }
    };

    const renderQuiz = () => {
        return words.map((wordData, index) => {
            if (index <= currentQuizIndex) {
                if (quizType === 'word') {
                    return (
                        <QuizCard
                            key={index}
                            index={index}
                            word={wordData.word}
                            meaning={wordData.meaning}
                            userInput={wordData.userInput}
                            isCorrect={wordData.isCorrect}
                            onAnswer={answer => handleAnswer(index, answer)}
                            total={words.length}
                        />
                    );
                } else if (quizType === 'listening') {
                    return (
                        <ListeningQuizCard
                            key={index}
                            index={index}
                            word={wordData.word}
                            sound={wordData.sound}
                            userInput={wordData.userInput}
                            isCorrect={wordData.isCorrect}
                            onAnswer={answer => handleAnswer(index, answer)}
                            total={words.length}
                        />
                    );
                }
            }
            return null;
        });
    };

    const handleRetest = () => {
      return new Promise(resolve => {
          setWords(prevWords => shuffleArray(prevWords.map(word => ({ ...word, userInput: '', isCorrect: null }))));
          setCurrentQuizIndex(0);
          setShowScoreImage(true);
          resolve();
      });
    };
    
    // 모든 문제를 다 풀었을 때
    const renderScoreImage = () => {
        if (words.length !== 0 && currentQuizIndex === words.length && showScoreImage) {
            const score = words.filter(word => word.isCorrect === true).length;
            const percentageScore = Math.round((score / words.length) * 100);
    
            let scoreImage;
            if (percentageScore === 100) {
                scoreImage = <img src={score100} alt='100 score' />;
            } else if (percentageScore >= 50) {
                scoreImage = <img src={score50to100} alt='50 to 100 score' />;
            } else {
                scoreImage = <img src={under50score} alt='Under 50 score' />;
            }
    
            return (
                <>
                    <div className='score-image-container' onClick={() => setShowScoreImage(false)}>  {/* Modify this line */}
                        {scoreImage}
                    </div>
                </>
            )
        }
        return null;
    };

    // 모든 문제를 다 풀었을 때
    const renderScore = () => {
        if (words.length !== 0 && currentQuizIndex === words.length) {
            const score = words.filter(word => word.isCorrect === true).length;
            const percentageScore = Math.round((score / words.length) * 100);
    
    
            return (
                <>
                    <div className='score clear'>
                        <p className='f-l'><strong>총 {words.length}문제 중 {score} 문제 맞춤 ({percentageScore}점)</strong></p>
                        <button className='btn-start btn-retest w-25 f-l' onClick={handleRetest}>재시험</button>
                        {quizType === 'word' ? (
                          <button className='btn-start btn-retest w-25 f-l' onClick={async () => { await handleRetest(); handleQuizStart('listening'); }}>듣기시험으로</button>
                        ) : (
                          <button className='btn-start btn-retest w-25 f-l' onClick={async () => { await handleRetest(); handleQuizStart('word'); }}>단어시험으로</button>
                        )}
                    </div>
                </>
            )
        }
        return null;
    };
    
    const score = renderScore();
    return (
        <>
        <div id='wrap'>
            <div className='bg-merryma'></div>
            <div id='container'>
                <div id='txt'>
                {!fileUploaded && (
                    <>
                        <div className='step-1'>
                            <p className='txt'>단어 파일을 불러오셈...</p>
                            <div className='gnb'>
                                <label>
                                    <input className='input-file' type="file" onChange={onFileChange} />
                                </label>
                                <button className='btn-start' onClick={onFileUpload}>불러오기</button>
                            </div>
                        </div>
                    </>
                )}
                {selectedFile && (
                    <>
                        <div>
                            {words.length > 0 && (
                                <div className='step-2'>
                                    {!quizType && (
                                        <>
                                            <p className='txt'>문제 갯수를 셀렉하셈...</p>
                                            <div>
                                                <label className='radio' htmlFor="five">
                                                    <input type="radio" id="five" name="quizCount" value="5" checked={quizCount === 5} onChange={handleQuizCountChange} />
                                                    <span>5문제</span>
                                                </label>
                                                <label className='radio' htmlFor="fifteen">
                                                    <input type="radio" id="fifteen" name="quizCount" value="15" checked={quizCount === 15} onChange={handleQuizCountChange} />
                                                    <span>15문제</span>
                                                </label>
                                                <label className='radio' htmlFor="twentyfive">
                                                    <input type="radio" id="twentyfive" name="quizCount" value="25" checked={quizCount === 25} onChange={handleQuizCountChange} />
                                                    <span>25문제</span>
                                                </label>
                                            
                                            </div>
                                            <div className='clear'>
                                                <button className='btn-start f-l w-50' onClick={() => handleQuizStart('word')}>단어시험</button>
                                                <button className='btn-start f-r w-50' onClick={() => handleQuizStart('listening')}>듣기시험</button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                            {renderQuiz()}
                            
                        </div>
                    </>
                )}
                </div>
                {renderScore()}
            </div>
        </div>
        {renderScoreImage()}
        </>
    );
    
};

export default App;
