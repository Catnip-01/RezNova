'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import AmazingNavbar from '../AmazingNavbar/page';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface Expense {
    date: string;
    amount: number;
    name: string;
}

const ProfilePage = () => {
    const [pastExpenses, setPastExpenses] = useState<Expense[]>([
        { date: '2025-04-05', amount: 50, name: 'Groceries' },
        { date: '2025-04-06', amount: 120, name: 'Dining Out' },
        { date: '2025-04-07', amount: 30, name: 'Coffee' },
    ]);
    const [daysToShow, setDaysToShow] = useState(7);
    const [expenseName, setExpenseName] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseDate, setExpenseDate] = useState('');
    const [displayedExpenses, setDisplayedExpenses] = useState<Expense[]>([]);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Daily Expenditure',
                data: [],
                borderColor: 'rgba(75,192,192,1)',
                fill: false,
            },
        ],
    });
    const chartSectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const sorted = [...pastExpenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const recent = sorted.slice(-daysToShow);
        setDisplayedExpenses(recent);
        setChartData({
            labels: recent.map(exp => exp.date),
            datasets: [
                {
                    label: 'Daily Expenditure',
                    data: recent.map(exp => exp.amount),
                    borderColor: 'rgba(75,192,192,1)',
                    fill: false,
                },
            ],
        });
    }, [daysToShow, pastExpenses]);

    const handleExpenseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newExpense: Expense = {
            date: expenseDate,
            amount: parseFloat(expenseAmount),
            name: expenseName,
        };
        setPastExpenses(prev => [...prev, newExpense]);
        setExpenseName('');
        setExpenseAmount('');
        setExpenseDate('');
        chartSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const calculateGoalProgress = (target: number, current: number) => {
        if (target === 0) return 0;
        return Math.min(100, (current / target) * 100);
    };

    const userAccounts = [
        { name: 'Savings', balance: '₹25,000' },
        { name: 'Checking', balance: '₹8,000' },
        { name: 'Credit Card', balance: '-₹2,500' },
    ];

    const futureGoals = [
        { name: 'Down Payment for Car', target: 50000, current: 28000 },
        { name: 'Vacation Fund', target: 30000, current: 15000 },
    ];

    return (
        <div className="dashboard-container">
            <AmazingNavbar onNavigate={() => {}} />

            <div className="dashboard-row animate">
                {/* <section className="dashboard-section">
                    <h2>Add New Expense</h2>
                    <form onSubmit={handleExpenseSubmit} style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label htmlFor="expenseName" style={{ display: 'block', marginBottom: '0.5rem', color: '#a8b2d1' }}>Expense Name:</label>
                            <input
                                type="text"
                                id="expenseName"
                                value={expenseName}
                                onChange={(e) => setExpenseName(e.target.value)}
                                required
                                style={{ padding: '0.75rem', borderRadius: '4px', backgroundColor: '#233554', color: '#ccd6f6', borderColor: '#495670', width: '100%' }}
                            />
                        </div>
                        <div>
                            <label htmlFor="expenseAmount" style={{ display: 'block', marginBottom: '0.5rem', color: '#a8b2d1' }}>Amount:</label>
                            <input
                                type="number"
                                id="expenseAmount"
                                value={expenseAmount}
                                onChange={(e) => setExpenseAmount(e.target.value)}
                                required
                                style={{ padding: '0.75rem', borderRadius: '4px', backgroundColor: '#233554', color: '#ccd6f6', borderColor: '#495670', width: '100%' }}
                            />
                        </div>
                        <div>
                            <label htmlFor="expenseDate" style={{ display: 'block', marginBottom: '0.5rem', color: '#a8b2d1' }}>Date:</label>
                            <input
                                type="date"
                                id="expenseDate"
                                value={expenseDate}
                                onChange={(e) => setExpenseDate(e.target.value)}
                                required
                                style={{ padding: '0.75rem', borderRadius: '4px', backgroundColor: '#233554', color: '#ccd6f6', borderColor: '#495670', width: '100%' }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="add-expense-button"
                        >
                            Add Expense
                        </button>
                    </form>
                </section> */}

                <section className="dashboard-section">
                    <h2>Past {daysToShow} Days Expenses</h2>
                    <label htmlFor="daysToShow" style={{ display: 'inline-block', marginRight: '1rem', color: '#a8b2d1' }}>Show last:</label>
                    <select id="daysToShow" value={daysToShow} onChange={(e) => setDaysToShow(parseInt(e.target.value))} style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: '#233554', color: '#ccd6f6', borderColor: '#495670' }}>
                        <option value={7}>7</option>
                        <option value={30}>30</option>
                        <option value={90}>90</option>
                    </select>
                    <ul>
                        {displayedExpenses.map((expense, index) => (
                            <li key={index} style={{ padding: '0.75rem 0', borderBottom: '1px solid #233554', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{expense.date}</span>
                                <span>₹{expense.amount}</span>
                                <span>{expense.name}</span>
                            </li>
                        ))}
                        {displayedExpenses.length === 0 && <p style={{ color: '#a8b2d1' }}>No expenses recorded for the selected period.</p>}
                    </ul>
                </section>
            </div>

            <div className="dashboard-row animate">
                <section ref={chartSectionRef} className="dashboard-section">
                    <h2>Expenditure Fluctuation</h2>
                    <div style={{ height: '300px' }}>
                        <Line data={chartData} />
                    </div>
                </section>

                {/* <section className="dashboard-section">
                    <h2>Your Accounts</h2>
                    <ul>
                        {userAccounts.map((account, index) => (
                            <li key={index} style={{ padding: '0.75rem 0', borderBottom: '1px solid #233554', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{account.name}</span>
                                <span>{account.balance}</span>
                            </li>
                        ))}
                    </ul>
                </section> */}
            </div>

            <div className="dashboard-row animate">
                <section className="dashboard-section">
                    <h2>Future Goals</h2>
                    <ul>
                        {futureGoals.map((goal, index) => (
                            <li key={index} style={{ padding: '0.75rem 0', borderBottom: '1px solid #233554' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>{goal.name}</span>
                                    <span>{goal.current} / {goal.target}</span>
                                </div>
                                <div style={{ backgroundColor: '#233554', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                                    <div style={{
                                        backgroundColor: '#64ffda',
                                        height: '100%',
                                        width: `${calculateGoalProgress(goal.target, goal.current)}%`,
                                        borderRadius: '4px'
                                    }}></div>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#a8b2d1', display: 'block', textAlign: 'right' }}>{calculateGoalProgress(goal.target, goal.current)}% Achieved</span>
                            </li>
                        ))}
                        {futureGoals.length === 0 && <p style={{ color: '#a8b2d1' }}>No future goals set yet.</p>}
                    </ul>
                </section>

                {/* <section className="dashboard-section">
                    <h2>Chat with Our Assistant</h2>
                    <p>Need help managing your expenses? Chat with our assistant for personalized guidance.</p>
                    <Link href="/chatbot">
                        <button
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#64ffda',
                                color: '#233554',
                                borderRadius: '4px',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            Navigate to Chatbot
                        </button>
                    </Link>
                </section> */}
            </div>
        </div>
    );
};

export default ProfilePage;