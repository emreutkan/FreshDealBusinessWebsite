import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css';
import { AppDispatch, RootState } from '../../redux/store';
import { setEmail, setPassword, setToken } from '../../redux/slices/userSlice';
import { loginUser } from '../../redux/thunks/userThunks';
import { IoArrowBack } from 'react-icons/io5';

const Login: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { email, password, loading, error, token } = useSelector((state: RootState) => state.user);
    const [emailValid, setEmailValid] = useState(true);
    const [passwordValid, setPasswordValid] = useState(true);

    useEffect(() => {
        console.log('Login component token check:', token ? 'Token exists' : 'No token');
        if (token) {
            navigate('/dashboard');
        }
    }, [token, navigate]);

    useEffect(() => {
        if (email.trim().length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setEmailValid(emailRegex.test(email));
        }
        if (password.trim().length > 0) {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            setPasswordValid(passwordRegex.test(password));
        }
    }, [email, password]);

    const handleLogin = async () => {
        if (!email.trim()) setEmailValid(false);
        if (!password.trim()) setPasswordValid(false);

        if (!email.trim() || !password.trim()) {
            return;
        }

        try {
            const result = await dispatch(
                loginUser({
                    email: email,
                    password: password,
                    login_type: "email",
                    password_login: true,
                })
            ).unwrap();

            if (result && result.token) {
                dispatch(setToken(result.token));
            }

            navigate('/dashboard');
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

                <div className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => dispatch(setEmail(e.target.value))}
                            className={!emailValid ? styles.invalidInput : ''}
                        />
                        {!emailValid && (
                            <p className={styles.errorMessage}>Please enter a valid email address</p>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => dispatch(setPassword(e.target.value))}
                            className={!passwordValid ? styles.invalidInput : ''}
                        />
                        {!passwordValid && (
                            <p className={styles.errorMessage}>
                                Password must be at least 8 characters with letters and numbers
                            </p>
                        )}
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