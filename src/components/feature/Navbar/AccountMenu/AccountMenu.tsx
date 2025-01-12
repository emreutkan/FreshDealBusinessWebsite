import React, { useState, useEffect, useRef } from "react";
import RegisterModal from "../../loginRegister/registerModal/RegisterModal";
import LoginModal from "../../loginRegister/loginModal/loginModal.tsx";
import styles from "./AccountMenu.module.css";

const AccountMenu: React.FC = () => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
        <div className={styles.container}>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    flex: 1,
                    justifyContent: "space-between",
                    gap: "10px",
                }}
                ref={dropdownRef}
            >
                <button
                    onClick={handleLoginModalOpen}
                    className={styles.btn}
                    style={isLoginModalOpen ? { backgroundColor: "#b0f484" } : {}}
                >
                    <span
                        style={{
                            color: "black",
                            fontSize: "16px",
                        }}
                    >
                        Login
                    </span>
                </button>
                <button
                    onClick={handleRegisterModalOpen}
                    className={styles.btn}
                    style={isRegisterModalOpen ? { backgroundColor: "#b0f484" } : {}}
                >
                    <span
                        style={{
                            color: "black",
                            fontSize: "16px",
                        }}
                    >
                        Register
                    </span>
                </button>
            </div>

            {/* Dark background overlay */}
            {(isLoginModalOpen || isRegisterModalOpen) && (
                <div className={styles.overlay}></div>
            )}

            {/* Modals */}
            {isLoginModalOpen && (
                <div className={styles.modal}>
                    <LoginModal onClose={() => setIsLoginModalOpen(false)} />
                </div>
            )}
            {isRegisterModalOpen && (
                <div className={styles.modal}>
                    <RegisterModal onClose={() => setIsRegisterModalOpen(false)} />
                </div>
            )}
        </div>
    );
};

export default AccountMenu;
