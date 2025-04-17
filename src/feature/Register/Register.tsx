import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Register.module.css';
import { AppDispatch } from '../../redux/store';
import { registerUser } from '../../redux/thunks/userThunks';
import { IoArrowBack } from 'react-icons/io5';

const Register: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name_surname: '',
        phone_number: '',
        role: 'owner',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'phone_number') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData({
                ...formData,
                [name]: numericValue
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const submitData = {
            ...formData,
            phone_number: `+90${formData.phone_number}`
        };

        try {
            await dispatch(registerUser(submitData)).unwrap();
            navigate('/login');
        } catch (err: any) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoBack = () => {
        navigate("/");
    };

    return (
        <div className={styles.registerPage}>
            <div className={styles.backgroundPattern}>
                <div className={styles.circle1}></div>
                <div className={styles.circle2}></div>
                <div className={styles.circle3}></div>
            </div>
            <button onClick={handleGoBack} className={styles.backButton}>
                <IoArrowBack /> Back
            </button>
            <div className={styles.registerContainer}>
                <h1>Register</h1>
                <p className={styles.subtitle}>Create your account</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.formSection}>
                        <h3>Account Information</h3>
                        <div className={styles.inputGroup}>
                            <label htmlFor="name_surname">Full Name</label>
                            <input
                                type="text"
                                id="name_surname"
                                name="name_surname"
                                value={formData.name_surname}
                                onChange={handleChange}
                                required
                                placeholder="John Doe"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="your@email.com"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="phone_number">Phone Number</label>
                            <div className={styles.phoneInputWrapper}>
                                <span className={styles.phonePrefix}>+90</span>
                                <input
                                    type="tel"
                                    id="phone_number"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    required
                                    placeholder="5xxxxxxxxx"
                                    maxLength={10}
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                minLength={8}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Register Now'}
                    </button>

                    <div className={styles.loginPrompt}>
                        Already have an account?{' '}
                        <Link to="/login">Login here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;