import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./Header.module.css";
import AccountMenu from "./AccountMenu/AccountMenu.tsx";
import { logout, setToken } from "../../redux/slices/userSlice.ts";
import { AppDispatch, RootState } from "../../redux/store.ts";
import logo from "../../assets/fresh-deal-logo.svg";
import { useNavigate } from "react-router-dom";
import { getUserData } from "../../redux/thunks/userThunks.ts";
import { getRestaurantsOfUserThunk } from "../../redux/thunks/restaurantThunk.ts";

interface NavbarProps {
    activePage?: string;
    setActivePage?: (page: string) => void;
}

const Header: React.FC<NavbarProps> = ({ activePage, setActivePage }) => {


    const { token } = useSelector((state: RootState) => state.user);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user);

    // Initialize user session
    useEffect(() => {
        const initializeUserSession = async () => {
            try {
                const storedToken = localStorage.getItem('userToken');

                if (storedToken && !isInitialized) {
                    console.log('Initializing user session...');
                    console.log('Stored token:', storedToken);
                    await dispatch(setToken(storedToken));

                    // Fetch user data
                    const userData = await dispatch(getUserData({ token: storedToken })).unwrap();

                    // If user is authenticated and is an owner, fetch their restaurants
                    if (userData?.user_data?.role === 'owner') {
                        await dispatch(getRestaurantsOfUserThunk());
                    }

                    setIsInitialized(true);
                }
                else {
                    console.log("token not found");
                }
            } catch (error) {
                console.error('Failed to initialize user session:', error);
                // If there's an error, clear the invalid token
                localStorage.removeItem('userToken');
                dispatch(logout());
            }
        };

        initializeUserSession();
    }, [dispatch, isInitialized]);



    const handleLogout = async () => {
        try {
            // Close dropdowns
            setIsDropdownOpen(false);
            setIsMobileMenuOpen(false);

            // Remove token from localStorage
            localStorage.removeItem('userToken');

            // Dispatch logout action
            await dispatch(logout());

            // Reset initialization flag
            setIsInitialized(false);

            // Navigate to home page
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        setIsMobileMenuOpen(false);
        document.body.style.overflow = 'unset';
    };

    // Cleanup effect for body overflow
    useEffect(() => {
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Click outside handlers
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            if (!target.closest(`.${styles.accountDropdown}`)) {
                setIsDropdownOpen(false);
            }

            if (!target.closest(`.${styles.mobileMenuButton}`) &&
                !target.closest(`.${styles.mobileMenuContent}`)) {
                setIsMobileMenuOpen(false);
                document.body.style.overflow = 'unset';
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        // Prevent scrolling when mobile menu is open
        if (!isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    };



    useEffect(() => {
        const storedToken = localStorage.getItem('userToken');
        if (storedToken) {
            dispatch(setToken(storedToken));
            dispatch(getUserData({ token: storedToken }));
            dispatch(getRestaurantsOfUserThunk());
        }
    }, [dispatch]);

    return (
        <header className={styles.headerContainer}>
            <nav className={styles.navbar}>
                {/* Logo Section */}
                <div className={styles.logoSection}>
                    <img
                        src={logo}
                        alt="logo"
                        width={205}
                        height={57}
                        onClick={() => handleNavigation('/')}
                        className={styles.logoImage}
                    />
                </div>

                {/* Navigation Links Section */}
                <div className={styles.desktopNav}>
                    {token ? (
                        <div className={styles.navLinks}>
                            <span
                                className={activePage === 'Partnership' ? styles.navbarLinkActive : styles.navbarLink}
                                onClick={() => handleNavigation('/Partnership')}
                            >
                                Partnership
                            </span>
                            <span
                                className={activePage === 'Restaurants' ? styles.navbarLinkActive : styles.navbarLink}
                                onClick={() => handleNavigation('/Restaurants')}
                            >
                                Restaurants
                            </span>
                        </div>
                    ) : (
                        <div className={styles.navLinks}>
                            <span
                                className={activePage === 'AboutUs' ? styles.navbarLinkActive : styles.navbarLink}
                                onClick={() => setActivePage?.('AboutUs')}
                            >
                                About Us
                            </span>
                            <span
                                className={activePage === 'OurServices' ? styles.navbarLinkActive : styles.navbarLink}
                                onClick={() => setActivePage?.('OurServices')}
                            >
                                Our Services
                            </span>
                            <span
                                className={activePage === 'Contact' ? styles.navbarLinkActive : styles.navbarLink}
                                onClick={() => setActivePage?.('Contact')}
                            >
                                Contact
                            </span>
                        </div>
                    )}
                </div>

                {/* Right Section */}
                <div className={styles.navbarRight}>
                    <button
                        className={styles.mobileMenuButton}
                        onClick={toggleMobileMenu}
                        aria-label="Toggle menu"
                    >
                        <span className={styles.hamburgerIcon}>≡</span>
                    </button>

                    {token ? (
                        <div className={styles.accountDropdown}>
                            <span
                                className={styles.username}
                                onClick={toggleDropdown}
                            >
                                {user.name_surname || "User"}
                            </span>
                            {isDropdownOpen && (
                                <div className={styles.dropdownMenu}>
                                    <button onClick={handleLogout} className={styles.logoutButton}>
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={styles.accountMenuWrapper}>
                            <AccountMenu />
                        </div>
                    )}
                </div>
            </nav>

            {/* Mobile Menu Modal */}
            {/* Mobile Menu Modal */}
            {isMobileMenuOpen && (
                <div className={styles.mobileMenuOverlay}>
                    <div className={styles.mobileMenuContent}>
                        <button
                            className={styles.closeButton}
                            onClick={toggleMobileMenu}
                        >
                            ×
                        </button>
                        {token ? (
                            <>
                    <span
                        className={styles.mobileMenuItem}
                        onClick={() => handleNavigation('/Partnership')}
                    >
                        Partnership
                    </span>
                                <span
                                    className={styles.mobileMenuItem}
                                    onClick={() => handleNavigation('/Restaurants')}
                                >
                        Restaurants
                    </span>
                            </>
                        ) : (
                            <>
                    <span
                        className={styles.mobileMenuItem}
                        onClick={() => {
                            setActivePage?.('AboutUs');
                            toggleMobileMenu();
                        }}
                    >
                        About Us
                    </span>
                                <span
                                    className={styles.mobileMenuItem}
                                    onClick={() => {
                                        setActivePage?.('OurServices');
                                        toggleMobileMenu();
                                    }}
                                >
                        Our Services
                    </span>
                                <span
                                    className={styles.mobileMenuItem}
                                    onClick={() => {
                                        setActivePage?.('Contact');
                                        toggleMobileMenu();
                                    }}
                                >
                        Contact
                    </span>
                                <div className={styles.mobileAccountMenu}>
                                    <AccountMenu />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;