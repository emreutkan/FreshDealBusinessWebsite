import React, {useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styles from './Header.module.css';
import logo from '../../assets/fresh-deal-logo.svg';
import { RootState, AppDispatch } from '../../redux/store';
import { logout } from '../../redux/slices/userSlice';
import { IoLogOutOutline } from 'react-icons/io5';

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
                    <img src={logo} alt="Fresh Deal" className={styles.logoImage} />
                </Link>

                <div className={styles.auth}>
                    {token ? (
                        <div className={styles.userMenu}>
                            <span className={styles.username}>{name_surname}</span>
                            <button
                                onClick={handleLogout}
                                className={styles.logoutButton}
                            >
                                <IoLogOutOutline />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className={styles.loginButton}>
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;