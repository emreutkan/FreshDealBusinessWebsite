import React, {useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styles from './Header.module.css';
import logo from '../../assets/fresh-deal-logo.svg';
import { RootState, AppDispatch } from '../../redux/store';
import { logout } from '../../redux/slices/userSlice';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { token, name_surname } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            dispatch({ type: 'user/setToken', payload: token });
        }
        else {
            console.error('Could not find token');
        }
    }, []);
    const handleLogout = async () => {
        try {
            localStorage.removeItem('userToken');
            dispatch(logout());
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link to="/" className={styles.logo}>
                    <img src={logo} alt="Fresh Deal" />
                </Link>

                <nav className={styles.nav}>
                    {token ? (
                        <>
                            <Link to="/dashboard" className={styles.link}>
                                Dashboard
                            </Link>
                            <Link to="/restaurants" className={styles.link}>
                                My Restaurants
                            </Link>
                            <Link to="/partnership" className={styles.link}>
                                Partnership
                            </Link>
                        </>
                    ) : (
                        <>

                        </>
                    )}
                </nav>

                <div className={styles.auth}>
                    {token ? (
                        <div className={styles.userMenu}>
                            <span className={styles.username}>{name_surname}</span>
                            <button onClick={handleLogout} className={styles.logoutButton}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className={styles.loginButton}>
                                Login
                            </Link>
                            <Link to="/register" className={styles.registerButton}>
                                Register Your Restaurant
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;