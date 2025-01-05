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
    const [closeButtonClicked, setCloseButtonClicked] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLoginModalOpen = () => {
        setIsLoginModalOpen(!isLoginModalOpen);
        if (isRegisterModalOpen) setIsRegisterModalOpen(false);
    };

    const handleRegisterModalOpen = () => {
        setIsRegisterModalOpen(!isRegisterModalOpen);
        if (isLoginModalOpen) setIsLoginModalOpen(false);
    };

    const toggleSelector = () => {
        setIsSelectorOpen(!isSelectorOpen);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsSelectorOpen(false);
            setIsLoginModalOpen(false);
            setIsRegisterModalOpen(false);
        }
    };

    useEffect(() => {
        if (closeButtonClicked) {
            setIsSelectorOpen(false);
            setIsLoginModalOpen(false);
            setIsRegisterModalOpen(false);
            setCloseButtonClicked(false);
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [closeButtonClicked]);

    return (
        <div className={styles.accountMenu} ref={dropdownRef}>
            <div className={styles.iconGroup}>
                <button className={styles.menuButton} onClick={toggleSelector}>
                    <span className={styles.menuIcon}>≡</span>
                    <span className={styles.profileIcon}>👤</span>
                </button>

                {isSelectorOpen && (
                    <div className={styles.dropdownModal}>
                        {!user && (
                            <>
                                <div onClick={handleLoginModalOpen} className={styles.loginButton}>
                                    <RegisterButton modalType="LoginModal" />
                                </div>
                                <div onClick={handleRegisterModalOpen}>
                                    <RegisterButton modalType="RegisterModal" />
                                </div>
                            </>
                        )}
                        {user && (
                            <div onClick={logout}>
                                <RegisterButton modalType="Log outModal" />
                            </div>
                        )}

                        {isLoginModalOpen && (
                            <LoginModal
                                onClose={() => setCloseButtonClicked(true)}
                            />
                        )}
                        {isRegisterModalOpen && (
                            <RegisterModal
                                onClose={() => setCloseButtonClicked(true)}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountMenu;