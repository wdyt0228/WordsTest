import React, { useRef, useEffect, useState } from 'react';

const ListeningQuizCard=({index,word,sound,userInput,isCorrect,onAnswer,total})=>{
    const inputRef=useRef(null)
    const audioRef=useRef(null)
    const [error,setError]=useState('') // New state for the error message

    useEffect(()=>{
        if(inputRef.current){
            inputRef.current.focus()
        }
    },[isCorrect])

    const handleReplay=()=>{
        if (audioRef.current){
            audioRef.current.play()
        }
    }

    const handleChange=event=>{
        onAnswer(event.target.value)
        setError('')
    }

    const handleSubmit=event=>{
        event.preventDefault()
        if(userInput.trim()===''){
            setError('입력창이 비어있습니다. 값을 입력해주세요.'); // Set the error when the input is empty
        }else{
            onAnswer(userInput.toLowerCase()===word.toLowerCase())
        }
    }

    return(
        <div>
            <div className='question clear'>
                <span className='index'>Question {index + 1}</span>
                <span className='index-length'>of {total}</span>
                <button className='btn-sound f-l' onClick={handleReplay}>듣기</button>
            </div>
            <audio ref={audioRef} src={sound} preload="auto" />
            {isCorrect === true && <p className='a-correct'>{userInput}, 정답임</p>}
            {isCorrect === false && <p className='a-correct'><span className='crimson'>{userInput}, 틀림.</span> <span>정답은 {word}.</span></p>}
            {isCorrect === null && (
                <form id='form' onSubmit={handleSubmit}>
                    <input className='textbox' type="text" placeholder="답 적으셈." onChange={handleChange} value={userInput} ref={inputRef} />
                    <button className='btn' type="submit">확인</button>
                    {error && <p>{error}</p>}  {/* Conditionally render the error message */}
                </form>
            )}
        </div>
    )
}

export default ListeningQuizCard;
