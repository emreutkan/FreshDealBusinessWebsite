import React, { useEffect } from 'react';
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
    const { email, password, loading, error, token, role } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        if (token) {
            // Redirect based on user role
            if (role === 'support') {
                navigate('/tickets');
            } else {
                navigate('/dashboard');
            }
        }
    }, [token, role, navigate]);

    const handleLogin = async () => {
        try {
            const result = await dispatch(
                loginUser({
                    email: email.trim(),
                    password: password.trim(),
                    login_type: "email",
                    password_login: true,
                })
            ).unwrap();

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

                <div className={styles.form}>
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