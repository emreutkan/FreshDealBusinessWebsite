import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styles from './Header.module.css';
import logo from '../../assets/fresh-deal-logo.svg';
import { RootState, AppDispatch } from '../../redux/store';
import { logout } from '../../redux/slices/userSlice';
import { IoLogOutOutline, IoSettingsOutline } from 'react-icons/io5';
import { IoMdNotificationsOutline, IoMdNotifications } from 'react-icons/io';
import NotificationModal from './components/NotificationModal';
import AccountSettingsModal from '../AccountSettings/AccountSettingsModal';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { token, name_surname} = useSelector((state: RootState) => state.user);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [notificationStatus, setNotificationStatus] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            dispatch({ type: 'user/setToken', payload: token });
        }
        else {
            console.error('Could not find token');
        }

        // Check notification permission on load
        if ('Notification' in window && navigator.serviceWorker) {
            checkNotificationStatus();
        }
    }, []);

    const checkNotificationStatus = async () => {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                setNotificationStatus(!!subscription);
            } catch (error) {
                console.error('Error checking notification status:', error);
            }
        }
    };

    const handleNotificationToggle = () => {
        setIsNotificationModalOpen(!isNotificationModalOpen);
    };

    const handleCloseModal = () => {
        setIsNotificationModalOpen(false);
        // Check notification status again after modal is closed
        checkNotificationStatus();
    };

    const handleLogout = async () => {
        try {
            localStorage.removeItem('userToken');
            dispatch(logout());
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleAccountSettings = () => {
        setIsAccountModalOpen(true);
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link to="/" className={styles.logo}>
                    <img src={logo} alt="Fresh Deal" className={styles.logoImage} />
                </Link>

                <div className={styles.auth}>
                    {token && (
                        <>
                            <button
                                onClick={handleNotificationToggle}
                                className={styles.notificationButton}
                                title="Notification Settings"
                            >
                                {notificationStatus ?
                                    <IoMdNotifications className={styles.notificationIcon} /> :
                                    <IoMdNotificationsOutline className={styles.notificationIcon} />
                                }
                            </button>

                            <button
                                onClick={handleAccountSettings}
                                className={styles.accountButton}
                                title="Account Settings"
                            >
                                <IoSettingsOutline className={styles.settingsIcon} />
                            </button>
                        </>
                    )}

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

            <NotificationModal
                isOpen={isNotificationModalOpen}
                onClose={handleCloseModal}
            />

            <AccountSettingsModal
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
            />
        </header>
    );
};

export default Header;