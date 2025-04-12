'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaUserCircle, FaSignOutAlt, FaChartLine, FaPiggyBank, FaListAlt, FaBell } from 'react-icons/fa';
import AmazingNavbar from '../AmazingNavbar/page';
import { Line } from 'react-chartjs-2';
import { useRouter } from 'next/navigation';

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

// New interfaces for alert system
interface UserFinancialState {
    daily_spending: number;
    savings_progress: number;
    debt_ratio: number;
    bill_due_in_days: number;
    profile: 'calm' | 'aggressive' | 'moderate';
}

interface AlertResult {
    anomaly_detected: boolean;
    behavior_context: string;
    nudge_message: string;
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
    const [userProfile, setUserProfile] = useState<'calm' | 'aggressive' | 'moderate'>('moderate');
    const [alertResult, setAlertResult] = useState<AlertResult | null>(null);
    const [showAlert, setShowAlert] = useState(false);
    const chartSectionRef = useRef<HTMLElement>(null);

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

    useEffect(() => {
        updateChartData();
    }, [pastExpenses]);

    useEffect(() => {
        setDisplayedExpenses(pastExpenses.slice(-daysToShow));
        
        // Calculate financial metrics whenever expenses change
        calculateFinancialMetrics();
    }, [daysToShow, pastExpenses]);

    // New effect to check alerts when expenseAmount changes
    useEffect(() => {
        if (expenseAmount && parseFloat(expenseAmount) > 0) {
            // Create a temporary expense to simulate the effect
            const tempExpense = {
                date: expenseDate || new Date().toISOString().split('T')[0],
                amount: parseFloat(expenseAmount),
                name: expenseName || 'New Expense',
            };
            
            // Create a temporary array with the new expense
            const tempExpenses = [...pastExpenses, tempExpense];
            
            // Call a modified version of calculateFinancialMetrics
            simulateFinancialMetricsWithNewExpense(tempExpenses);
        }
    }, [expenseAmount]);

    const updateChartData = () => {
        setChartData({
            labels: pastExpenses.map(exp => exp.date),
            datasets: [
                {
                    label: 'Daily Expenditure',
                    data: pastExpenses.map(exp => exp.amount),
                    borderColor: 'rgba(75,192,192,1)',
                    fill: false,
                },
            ],
        });
    };

    const handleExpenseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newExpense = {
            date: expenseDate,
            amount: parseFloat(expenseAmount),
            name: expenseName,
        };
        setPastExpenses([...pastExpenses, newExpense]);
        setExpenseName('');
        setExpenseAmount('');
        setExpenseDate('');

        // Scroll to the chart section
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

    // New function to simulate metrics with a new expense
    const simulateFinancialMetricsWithNewExpense = (expensesArray: Expense[]) => {
        // Calculate daily spending (average of last 7 days)
        const recentExpenses = expensesArray.slice(-7);
        const totalSpending = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const dailySpending = totalSpending / (recentExpenses.length || 1);

        // Calculate savings progress (simplified for demo)
        const savingsGoalTotal = futureGoals.reduce((sum, goal) => sum + goal.target, 0);
        const currentSavingsTotal = futureGoals.reduce((sum, goal) => sum + goal.current, 0);
        const savingsProgress = savingsGoalTotal > 0 ? currentSavingsTotal / savingsGoalTotal : 0;

        // Calculate debt ratio (simplified)
        const totalAssets = 25000 + 8000; // Savings + Checking
        const totalDebt = 2500; // Credit card debt
        const debtRatio = totalAssets > 0 ? totalDebt / totalAssets : 0;

        // Bill due in days (mock data - would come from bills database)
        const billDueInDays = 5;

        const userState: UserFinancialState = {
            daily_spending: dailySpending,
            savings_progress: savingsProgress,
            debt_ratio: debtRatio,
            bill_due_in_days: billDueInDays,
            profile: userProfile
        };

        // Check for alerts
        const alertCheck = checkForAlerts(userState);
        setAlertResult(alertCheck);
        
        // Show alert if anomaly detected
        if (alertCheck.anomaly_detected) {
            setShowAlert(true);
        }
    };

    // Alert system functions
    const calculateFinancialMetrics = () => {
        // Calculate daily spending (average of last 7 days)
        const recentExpenses = pastExpenses.slice(-7);
        const totalSpending = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const dailySpending = totalSpending / (recentExpenses.length || 1);

        // Calculate savings progress (simplified for demo)
        // This would be based on actual savings goals and current savings
        const savingsGoalTotal = futureGoals.reduce((sum, goal) => sum + goal.target, 0);
        const currentSavingsTotal = futureGoals.reduce((sum, goal) => sum + goal.current, 0);
        const savingsProgress = savingsGoalTotal > 0 ? currentSavingsTotal / savingsGoalTotal : 0;

        // Calculate debt ratio (simplified)
        // This would be based on actual debt and assets
        const totalAssets = 25000 + 8000; // Savings + Checking
        const totalDebt = 2500; // Credit card debt
        const debtRatio = totalAssets > 0 ? totalDebt / totalAssets : 0;

        // Bill due in days (mock data - would come from bills database)
        const billDueInDays = 5;

        const userState: UserFinancialState = {
            daily_spending: dailySpending,
            savings_progress: savingsProgress,
            debt_ratio: debtRatio,
            bill_due_in_days: billDueInDays,
            profile: userProfile
        };

        // Check for alerts
        const alertCheck = checkForAlerts(userState);
        setAlertResult(alertCheck);
        
        // Show alert if anomaly detected
        if (alertCheck.anomaly_detected) {
            setShowAlert(true);
        }
    };

    const checkForAlerts = (financialState: UserFinancialState): AlertResult => {
        // This is a simplified version of the model in the notebook
        // In a real app, you'd call an API endpoint with the trained model
        
        // Simplified anomaly detection logic
        const isAnomaly = 
            (financialState.daily_spending > 700 && financialState.savings_progress < 0.3) ||
            (financialState.debt_ratio > 0.7) ||
            (financialState.bill_due_in_days < 3 && financialState.daily_spending > 500);
        
        // Check for immediate high expense alert (for real-time input feedback)
        const currentExpenseAmount = expenseAmount ? parseFloat(expenseAmount) : 0;
        const isImmediateHighExpense = currentExpenseAmount > 500;
        
        // Classify behavior
        let behaviorContext = "Normal";
        if (isImmediateHighExpense) {
            behaviorContext = "High Immediate Expense";
        } else if (financialState.daily_spending > 700 && financialState.savings_progress < 0.3) {
            behaviorContext = "Overspending & Under-saving";
        } else if (financialState.debt_ratio > 0.7) {
            behaviorContext = "Debt Risk Spike";
        } else if (financialState.bill_due_in_days < 3) {
            behaviorContext = "Bill Due Soon";
        } else if (financialState.savings_progress > 0.8 && financialState.daily_spending < 300) {
            behaviorContext = "Excellent Budgeting";
        }
        
        // Generate personalized nudge
        const nudgeMessage = generateNudge(financialState.profile, behaviorContext);
        
        return {
            anomaly_detected: isAnomaly || isImmediateHighExpense,
            behavior_context: behaviorContext,
            nudge_message: nudgeMessage
        };
    };

    const generateNudge = (profile: string, context: string): string => {
        const nudges: Record<string, Record<string, string>> = {
            calm: {
                "Overspending & Under-saving": "Keep calm and track each expense. You're just a tweak away from balance.",
                "Debt Risk Spike": "You've taken a bold step. Let's not let debt win the race.",
                "Bill Due Soon": "You're organized. Just a gentle reminder: bill due soon.",
                "Excellent Budgeting": "Peaceful and powerful — you're managing finances beautifully.",
                "Normal": "You're on track. Stay balanced and mindful.",
                "High Immediate Expense": "This is a significant expense. Consider its impact on your monthly budget."
            },
            aggressive: {
                "Overspending & Under-saving": "Yo! Time to rein it in. Cash is bleeding fast.",
                "Debt Risk Spike": "Red alert! You're gearing into debt mode.",
                "Bill Due Soon": "Get ahead of the game. Smash those bills now!",
                "Excellent Budgeting": "Legend move. You're optimizing like a pro.",
                "Normal": "Doing good — but can you push for more savings?",
                "High Immediate Expense": "WHOA! That's a big hit to your wallet! Sure about this?"
            },
            moderate: {
                "Overspending & Under-saving": "Looks like spending went wild. Maybe revisit your goals?",
                "Debt Risk Spike": "Debt curve's rising — maybe pause a moment?",
                "Bill Due Soon": "Bill ahead — no stress if you're prepped!",
                "Excellent Budgeting": "You're setting a good rhythm — keep it up!",
                "Normal": "Things are balanced — maybe think of a saving boost?",
                "High Immediate Expense": "This expense is on the higher side. Does it align with your budget plan?"
            }
        };
        
        return nudges[profile][context] || "Keep an eye on your finances.";
    };

    const closeAlert = () => {
        setShowAlert(false);
    };
    
    const changeUserProfile = (profile: 'calm' | 'aggressive' | 'moderate') => {
        setUserProfile(profile);
        // Recalculate metrics with the new profile
        setTimeout(calculateFinancialMetrics, 0);
    };

    // Handle expense amount input change with real-time alert check
    const handleExpenseAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setExpenseAmount(value);
        
        // Alert will be triggered by the useEffect watching expenseAmount
    };


    return (
        <div className="dashboard-container">
            <AmazingNavbar onNavigate={() => { /* No internal navigation on profile page */ }} />
            
            {/* Alert Display */}
            {showAlert && alertResult && (
                <div className="alert-box" style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    backgroundColor: alertResult.anomaly_detected ? '#ff6b6b' : '#4ecdc4',
                    color: '#fff',
                    padding: '15px 20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    maxWidth: '350px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <strong>{alertResult.behavior_context}</strong>
                        <button 
                            onClick={closeAlert}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: '#fff', 
                                cursor: 'pointer', 
                                fontSize: '16px' 
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <p>{alertResult.nudge_message}</p>
                </div>
            )}

            <div className="dashboard-row animate">
                <section className="dashboard-section">
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
                </section>

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

                <section className="dashboard-section">
                    <h2>Your Accounts</h2>
                    <ul>
                        {userAccounts.map((account, index) => (
                            <li key={index} style={{ padding: '0.75rem 0', borderBottom: '1px solid #233554', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{account.name}</span>
                                <span>{account.balance}</span>
                            </li>
                        ))}
                    </ul>
                </section>
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
                                        width: ${calculateGoalProgress(goal.target, goal.current)}%,
                                        borderRadius: '4px'
                                    }}></div>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#a8b2d1', display: 'block', textAlign: 'right' }}>{calculateGoalProgress(goal.target, goal.current)}% Achieved</span>
                            </li>
                        ))}
                        {futureGoals.length === 0 && <p style={{ color: '#a8b2d1' }}>No future goals set yet.</p>}
                    </ul>
                </section>

                <section className="dashboard-section">
                    <h2>Personalized Alerts</h2>
                    <div>
                        <p>Choose your alert style preference:</p>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <button
                                onClick={() => changeUserProfile('calm')}
                                style={{
                                    padding: '8px 15px',
                                    backgroundColor: userProfile === 'calm' ? '#64ffda' : '#233554',
                                    color: userProfile === 'calm' ? '#233554' : '#ccd6f6',
                                    borderRadius: '4px',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                Calm
                            </button>
                            <button
                                onClick={() => changeUserProfile('moderate')}
                                style={{
                                    padding: '8px 15px',
                                    backgroundColor: userProfile === 'moderate' ? '#64ffda' : '#233554',
                                    color: userProfile === 'moderate' ? '#233554' : '#ccd6f6',
                                    borderRadius: '4px',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                Moderate
                            </button>
                            <button
                                onClick={() => changeUserProfile('aggressive')}
                                style={{
                                    padding: '8px 15px',
                                    backgroundColor: userProfile === 'aggressive' ? '#64ffda' : '#233554',
                                    color: userProfile === 'aggressive' ? '#233554' : '#ccd6f6',
                                    borderRadius: '4px',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                Aggressive
                            </button>
                        </div>
                        
                        <div style={{ marginTop: '20px' }}>
                            <h3>Last Alert</h3>
                            {alertResult ? (
                                <div style={{ 
                                    padding: '15px', 
                                    backgroundColor: '#1d293f', 
                                    borderRadius: '6px',
                                    marginTop: '10px'
                                }}>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '5px' }}>
                                        {alertResult.behavior_context}
                                    </p>
                                    <p>{alertResult.nudge_message}</p>
                                </div>
                            ) : (
                                <p>No alerts generated yet. Add expenses to see personalized alerts.</p>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <div className="dashboard-row animate">
                <section className="dashboard-section">
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
                </section>

                <section className="dashboard-section">
                    <h2>Financial Health Score</h2>
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingTop: '20px'
                    }}>
                        <div style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            border: '10px solid #64ffda',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '20px'
                        }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                                {alertResult && alertResult.behavior_context === "Excellent Budgeting" ? "A+" : 
                                 alertResult && alertResult.behavior_context === "Normal" ? "B" : 
                                 alertResult && alertResult.behavior_context === "Bill Due Soon" ? "C" : "D"}
                            </span>
                        </div>
                        <p>Based on your spending habits, savings progress, and debt ratio.</p>
                        <button
                            onClick={calculateFinancialMetrics}
                            style={{
                                marginTop: '15px',
                                padding: '8px 15px',
                                backgroundColor: '#233554',
                                color: '#ccd6f6',
                                borderRadius: '4px',
                                border: '1px solid #495670',
                                cursor: 'pointer',
                            }}
                        >
                            <FaBell style={{ marginRight: '5px' }} />
                            Check For Alerts
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProfilePage;