// src/components/Navbar/Navbar.tsx
import React, {useEffect, useState} from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./Header.module.css";
import AccountMenu from "./AccountMenu/AccountMenu.tsx";
import {logout, setToken} from "../../redux/slices/userSlice.ts";
import {AppDispatch, RootState} from "../../redux/store.ts";
import logo from "../../assets/fresh-deal-logo.svg";
import {useNavigate} from "react-router-dom";
import {getUserData} from "../../redux/thunks/userThunks.ts";
import {getRestaurantsOfUserThunk} from "../../redux/thunks/restaurantThunk.ts";

interface NavbarProps  {
    activePage?: string;
    setActivePage?: (page: string) => void;
}

const Header: React.FC<NavbarProps> = ({activePage, setActivePage}) => {
    const { token } = useSelector((state: RootState) => state.user);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };


    const navigate = useNavigate();

    const handleLogout = () => {
        toggleDropdown();
        dispatch(logout());
        navigate(`/`);
    };


    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user);

    //
    const ownedRestaurants = useSelector((state: RootState) => state.restaurant.ownedRestaurants);




    useEffect(() => {
        const storedToken = localStorage.getItem('userToken');
        if (storedToken) {
            // 1) Put that token into Redux store
            dispatch(setToken(storedToken));

            // 2) Then fetch user data with that token
            dispatch(getUserData({ token: storedToken }));
            dispatch(getRestaurantsOfUserThunk());
            // window.location.reload();

        }

        console.log('asdasddsa')
    }, [dispatch]);

    useEffect(() => {

    }, [ownedRestaurants, user.role]);

    return (
        <nav className={styles.navbar}>
            <img src={logo} alt="logo" width={205} height={57}
                 onClick={() => navigate(`/`)}

            />
            {token ? (
                <div className={styles.navbarLinks}>
                    <span className={
                        activePage === 'Partnership'
                            ? `${styles.navbarLinkActive}`
                            : styles.navbarLink
                    }
                          onClick={() => navigate(`/Partnership`)}
                    >Partnership</span>
                    <span className={
                        activePage === 'Restaurants'
                            ? `${styles.navbarLinkActive}`
                            : styles.navbarLink
                    }
                          onClick={() => navigate(`/Restaurants`)}
                    >Restaurants</span>
                </div>
            ) : (
                <div className={styles.navbarLinks}>
                    <span className={
                        activePage === 'AboutUs'
                            ? `${styles.navbarLinkActive}`
                            : styles.navbarLink
                    }
                          onClick={() => setActivePage('AboutUs')}
                    >About Us</span>
                    <span className={
                        activePage === 'OurServices'
                            ? `${styles.navbarLinkActive}`
                            : styles.navbarLink
                    }
                          onClick={() => setActivePage('OurServices')}
                    >OurServices</span>
                    <span className={
                        activePage === 'Contact'
                            ? `${styles.navbarLinkActive}`
                            : styles.navbarLink
                    }
                          onClick={() => setActivePage('Contact')}
                    >Contact</span>

                </div>
            )}

            <div className={styles.navbarRight}>
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
                    <AccountMenu/>
                )}
            </div>
        </nav>
    );
};

export default Header;
