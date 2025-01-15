import React, { useState, useEffect, useRef } from "react";
import RegisterModal from "../registerModal/RegisterModal.tsx";
import LoginModal from "../loginModal/loginModal.tsx";
import styles from "./AccountMenu.module.css";

const AccountMenu: React.FC = () => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const loginModalRef = useRef<HTMLDivElement>(null);
    const registerModalRef = useRef<HTMLDivElement>(null);

    const handleLoginModalOpen = () => {
        setIsLoginModalOpen(!isLoginModalOpen);
        setIsRegisterModalOpen(false);
    };

    const handleRegisterModalOpen = () => {
        setIsRegisterModalOpen(!isRegisterModalOpen);
        setIsLoginModalOpen(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;

        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(target) &&
            (!loginModalRef.current || !loginModalRef.current.contains(target)) &&
            (!registerModalRef.current || !registerModalRef.current.contains(target))
        ) {
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
        <>
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
                        style={
                            isRegisterModalOpen
                                ? { backgroundColor: "#b0f484", width: "220px" }
                                : { width: "220px" }
                        }
                    >
                        <span
                            style={{
                                color: "black",
                                fontSize: "16px",
                            }}
                        >
                            Become Our Partner
                        </span>
                    </button>
                </div>

                {/* Dark background overlay */}
                {(isLoginModalOpen || isRegisterModalOpen) && (
                    <div className={styles.overlay}></div>
                )}

                {/* Modals */}
            </div>
            {isLoginModalOpen && (
                <div className={styles.modal} ref={loginModalRef}>
                    <LoginModal onClose={() => setIsLoginModalOpen(false)} />
                </div>
            )}
            {isRegisterModalOpen && (
                <div className={styles.modal} ref={registerModalRef}>
                    <RegisterModal onClose={() => setIsRegisterModalOpen(false)} />
                </div>
            )}
        </>
    );
};

export default AccountMenu;
