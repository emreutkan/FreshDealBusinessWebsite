// src/components/Navbar/Navbar.tsx
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./navbar.module.css";
import AccountMenu from "./AccountMenu/AccountMenu";
import { logout } from "../../../redux/slices/userSlice";
import { RootState } from "../../../redux/store";
import logo from "../../../../public/fresh-deal-logo.svg";

interface NavbarProps  {
    activePage: string;
    setActivePage: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({activePage, setActivePage}) => {
    const dispatch = useDispatch();
    const { token } = useSelector((state: RootState) => state.user);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const user = useSelector((state: RootState) => state.user);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        toggleDropdown();
        dispatch(logout());
        setActivePage('AboutUs');
    };

    return (
        <nav className={styles.navbar}>
            <img src={logo} alt="logo" width={205} height={57}/>


            {token ? (
                <div className={styles.navbarLinks}>


                    <span className={
                        activePage === 'Partnership'
                            ? `${styles.navbarLinkActive}`
                            : styles.navbarLink
                    }
                          onClick={() => setActivePage('Partnership')}
                    >Partnership</span>
                        <span className={
                            activePage === 'Restaurants'
                                ? `${styles.navbarLinkActive}`
                                : styles.navbarLink
                        }
                              onClick={() => setActivePage('Restaurants')}
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

            export default Navbar;
