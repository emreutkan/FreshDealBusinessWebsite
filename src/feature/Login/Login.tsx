import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css';
import { AppDispatch, RootState } from '../../redux/store';
import {
    setEmail,
    setPassword,
    setToken,
    setPhoneNumber,
    setSelectedCode,
    setLoginType,
    setPasswordLogin
} from '../../redux/slices/userSlice';
import { loginUser } from '../../redux/thunks/userThunks';
import { IoArrowBack } from 'react-icons/io5';

// Country codes for the dropdown
const countryCodes = [
    { code: '+90', country: 'Turkey' },
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    { code: '+49', country: 'Germany' },
    { code: '+33', country: 'France' },
    { code: '+39', country: 'Italy' },
    { code: '+34', country: 'Spain' },
    { code: '+31', country: 'Netherlands' },
    { code: '+46', country: 'Sweden' },
    { code: '+47', country: 'Norway' },
    // Add more countries as needed
];

const Login: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const {
        email,
        password,
        loading,
        error,
        token,
        role,
        phoneNumber,
        selectedCode,
        login_type
    } = useSelector((state: RootState) => state.user);

    // Local state for form control
    const [showPhoneLogin, setShowPhoneLogin] = useState(login_type === 'phone_number');

    useEffect(() => {
        if (token && role) {
            // Redirect based on role
            if (role === 'support') {
                navigate('/support-dashboard');
            } else if (role === 'owner') {
                navigate('/dashboard');
            }
        }
    }, [token, role, navigate]);

    // Toggle between email and phone login
    const toggleLoginMethod = () => {
        setShowPhoneLogin(prev => {
            const newValue = !prev;
            dispatch(setLoginType(newValue ? 'phone_number' : 'email'));
            return newValue;
        });
    };

    const handleLogin = async () => {
        try {
            // Set password login mode
            dispatch(setPasswordLogin(true));

            let loginPayload;

            if (showPhoneLogin) {
                // For phone number login
                if (!phoneNumber) {
                    alert('Please enter a phone number');
                    return;
                }

                // Prepare phone number with country code
                const fullPhoneNumber = `${selectedCode}${phoneNumber}`;

                loginPayload = {
                    phone_number: fullPhoneNumber,
                    password: password.trim(),
                    login_type: "phone_number",
                    password_login: true
                };
            } else {
                // For email login
                if (!email) {
                    alert('Please enter an email');
                    return;
                }

                loginPayload = {
                    email: email.trim(),
                    password: password.trim(),
                    login_type: "email",
                    password_login: true
                };
            }

            const result = await dispatch(loginUser(loginPayload)).unwrap();

            if (result && result.token) {
                dispatch(setToken(result.token));
                // The useEffect above will handle redirection after the role is set
            }
        } catch (err) {
            console.error("Failed to login:", err);
        }
    };

    const handleGoBack = () => {
        navigate('/');
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.backgroundPattern}>
                <div className={styles.circle1}></div>
                <div className={styles.circle2}></div>
                <div className={styles.circle3}></div>
            </div>
            <button onClick={handleGoBack} className={styles.backButton}>
                <IoArrowBack /> Back
            </button>
            <div className={styles.loginContainer}>
                <h1>Welcome Back</h1>
                <p className={styles.subtitle}>Sign in to your account</p>

                <div className={styles.loginToggle}>
                    <button
                        className={`${styles.toggleButton} ${!showPhoneLogin ? styles.active : ''}`}
                        onClick={() => !showPhoneLogin || toggleLoginMethod()}
                    >
                        Email Login
                    </button>
                    <button
                        className={`${styles.toggleButton} ${showPhoneLogin ? styles.active : ''}`}
                        onClick={() => showPhoneLogin || toggleLoginMethod()}
                    >
                        Phone Login
                    </button>
                </div>

                <div className={styles.form}>
                    {showPhoneLogin ? (
                        <div className={styles.inputGroup}>
                            <label htmlFor="phone">Phone Number</label>
                            <div className={styles.phoneInputGroup}>
                                <select
                                    value={selectedCode}
                                    onChange={(e) => dispatch(setSelectedCode(e.target.value))}
                                    className={styles.countryCodeSelect}
                                >
                                    {countryCodes.map((country) => (
                                        <option key={country.code} value={country.code}>
                                            {country.code} ({country.country})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => dispatch(setPhoneNumber(e.target.value))}
                                    placeholder="5079805011"
                                    className={styles.phoneInput}
                                />
                            </div>
                            <p className={styles.phoneHint}>Enter your phone number without the country code</p>
                        </div>
                    ) : (
                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => dispatch(setEmail(e.target.value))}
                                placeholder="your@email.com"
                            />
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => dispatch(setPassword(e.target.value))}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <button
                        className={styles.submitButton}
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <div className={styles.links}>
                        <Link to="/forgot-password" className={styles.forgotPassword}>
                            Forgot your password?
                        </Link>
                        <div className={styles.registerPrompt}>
                            Don't have an account? <Link to="/register">Sign up</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

