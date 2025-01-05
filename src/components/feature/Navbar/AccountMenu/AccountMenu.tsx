import React, { useState, useEffect, useRef } from "react";
import RegisterButton from "../../loginRegister/RegisterButton";
import styles from "./accountMenu.module.css";
import RegisterModal from "../../loginRegister/registerModal/RegisterModal";
import LoginModal from "../../loginRegister/loginModal/loginModal.tsx";
import { useUser } from "../../../../context/UserContext";

const AccountMenu: React.FC = () => {
    const { user, logout } = useUser();
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleSelector = () => setIsSelectorOpen(!isSelectorOpen);

    const handleLoginModalOpen = () => {
        setIsLoginModalOpen(!isLoginModalOpen);
        setIsRegisterModalOpen(false);
    };

    const handleRegisterModalOpen = () => {
        setIsRegisterModalOpen(!isRegisterModalOpen);
        setIsLoginModalOpen(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsSelectorOpen(false);
            setIsLoginModalOpen(false);
            setIsRegisterModalOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.accountMenu} ref={dropdownRef}>
            <div className={styles.iconGroup}>
                <button className={styles.menuButton} onClick={toggleSelector}>
                    <span className={styles.menuIcon}>≡</span>
                    <span className={styles.profileIcon}>
                        {user ? user.username : "👤"}
                    </span>
                </button>

                {isSelectorOpen && (
                    <div className={styles.dropdownModal}>
                        {!user ? (
                            <>
                                <div onClick={handleLoginModalOpen} className={styles.loginButton}>
                                    <RegisterButton modalType="LoginModal" />
                                </div>
                                <div onClick={handleRegisterModalOpen}>
                                    <RegisterButton modalType="RegisterModal" />
                                </div>
                            </>
                        ) : (
                            <div onClick={logout} className={styles.logoutButton}>
                                <button>Log Out</button>
                            </div>
                        )}

                        {isLoginModalOpen && (
                            <LoginModal
                                onClose={() => setIsLoginModalOpen(false)}
                            />
                        )}
                        {isRegisterModalOpen && (
                            <RegisterModal
                                onClose={() => setIsRegisterModalOpen(false)}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountMenu;
