'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AmazingNavbar from '../AmazingNavbar/page';

const QuizPage = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [quizCompleted, setQuizCompleted] = useState(false);

    // Sample AI-generated questions based on spending patterns
    const questions = [
        {
            id: 1,
            question: "Based on your frequent coffee purchases, which budgeting strategy would maximize savings?",
            options: [
                "Daily coffee shop visits",
                "Weekly meal prep with homemade coffee",
                "Monthly subscription to a premium coffee service",
                "Ignoring coffee expenses entirely"
            ],
            correct: 1
        },
        {
            id: 2,
            question: "Your grocery spending spikes on weekends. What's the best optimization?",
            options: [
                "Switch to weekday shopping",
                "Increase weekend budget",
                "Order takeout instead",
                "Use a shopping list app"
            ],
            correct: 3
        },
        {
            id: 3,
            question: "Based on your transportation costs, which option saves the most?",
            options: [
                "Daily ride-sharing",
                "Public transit pass",
                "Buying a luxury car",
                "Walking occasionally"
            ],
            correct: 1
        },
        {
            id: 4,
            question: "Your frequent online shopping suggests you should:",
            options: [
                "Increase credit limit",
                "Enable purchase alerts",
                "Delete shopping apps",
                "Use cash-only payments"
            ],
            correct: 1
        },
        {
            id: 5,
            question: "Based on your dining-out frequency, the best investment is:",
            options: [
                "Premium restaurant membership",
                "Cooking classes",
                "Food delivery subscription",
                "Better work lunches"
            ],
            correct: 1
        }
    ];

    const handleAnswerSelect = (answerIndex: number) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestion] = answerIndex;
        setSelectedAnswers(newAnswers);
    };

    const handleSubmit = () => {
        let newScore = 0;
        selectedAnswers.forEach((answer, index) => {
            if (answer === questions[index].correct) newScore++;
        });
        setScore(newScore);
        setQuizCompleted(true);
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: 'black', 
            color: 'white', 
            padding: '2rem',
            maxWidth: '800px',
            margin: '0 auto'
        }}>
            <AmazingNavbar />
            {/* Score Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '2rem',
                padding: '1rem',
                marginTop: '50px',
                borderBottom: '2px solid #333'
            }}>
                <h1>Financial Wellness Quiz</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <span>Score: {score}/5</span>
                    <span>Question: {currentQuestion + 1}/5</span>
                </div>
            </div>

            {/* Quiz Content */}
            {!quizCompleted ? (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ 
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        borderLeft: '4px solid #64ffda'
                    }}>
                        {questions[currentQuestion].question}
                    </h3>
                    
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {questions[currentQuestion].options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(index)}
                                style={{
                                    padding: '1rem',
                                    backgroundColor: '#000000',
                                    color: 'white',
                                    border: `1px solid ${selectedAnswers[currentQuestion] === index ? '#64ffda' : '#233554'}`,
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    textAlign: 'left'
                                }}
                                onMouseOver={(e) => {
                                    if (selectedAnswers[currentQuestion] !== index) {
                                        e.currentTarget.style.borderColor = '#64ffda';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (selectedAnswers[currentQuestion] !== index) {
                                        e.currentTarget.style.borderColor = '#233554';
                                    }
                                }}
                            >
                                {option}
                            </button>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div style={{ 
                        marginTop: '2rem',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}>
                        <button
                            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#233554',
                                color: 'white',
                                border: '1px solid #233554',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Previous
                        </button>
                        
                        <button
                            onClick={() => {
                                if (currentQuestion < questions.length - 1) {
                                    setCurrentQuestion(currentQuestion + 1);
                                }
                            }}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#233554',
                                color: 'white',
                                border: '1px solid #233554',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Quiz Complete!</h2>
                    <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
                        Your financial wellness score: {score}/5
                    </p>
                    <button
                        onClick={() => {
                            setCurrentQuestion(0);
                            setScore(0);
                            setSelectedAnswers([]);
                            setQuizCompleted(false);
                        }}
                        style={{
                            padding: '1rem 2rem',
                            backgroundColor: '#64ffda',
                            color: '#0a192f',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Play Again
                    </button>
                </div>
            )}

            {/* Submit Button */}
            {!quizCompleted && currentQuestion === questions.length - 1 && (
                <div style={{ 
                    position: 'fixed',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)'
                }}>
                    <button
                        onClick={handleSubmit}
                        style={{
                            padding: '1rem 3rem',
                            backgroundColor: '#64ffda',
                            color: '#0a192f',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1.1rem'
                        }}
                    >
                        Submit Quiz
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuizPage;
