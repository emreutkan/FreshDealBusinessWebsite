// src/components/Navbar/Navbar.tsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./navbar.module.css";
import AccountMenu from "./AccountMenu/AccountMenu";
import { logout } from "../../../redux/slices/userSlice";
import { RootState } from "../../../redux/store";
import { Link, useNavigate } from 'react-router-dom';
import {Image} from "@mui/icons-material";
import logo from "../../../../public/fresh-deal-logo.svg";

const Navbar: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token, name_surname } = useSelector((state: RootState) => state.user);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Automatically navigate to restaurants page when user logs in
    useEffect(() => {
        if (token) {
            navigate('/restaurants');
        }
    }, [token, navigate]);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/'); // Redirect to login page after logout
    };

    return (
        <nav className={styles.navbar}>
            <img src={logo} alt="logo" width={205} height={57}/>

            {token && (
                <div className={styles.navbarLinks}>
                    <Link to="/restaurants" className={styles.navbarLink}>
                        Restaurants
                    </Link>
                    <span className={styles.navbarLink}>Listings</span>
                </div>
            )}

            <div className={styles.navbarRight}>
                {token ? (
                    <div className={styles.accountDropdown}>
                        <span
                            className={styles.username}
                            onClick={toggleDropdown}
                        >
                            {name_surname || "User"}
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
                    <AccountMenu />
                )}
            </div>
        </nav>
    );
};

export default Navbar;
