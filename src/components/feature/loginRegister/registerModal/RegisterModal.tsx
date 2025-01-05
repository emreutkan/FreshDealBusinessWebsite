import React, { useEffect, useState } from "react";
import styles from "./registerModal.module.css";
import { registerUser } from "../../../../Api/apiService";
import InputField from "../InputField/InputField";
import SubmitButton from "../SubmitButton/SubmitButton";
import CloseButton from "../CloseButton/CloseButton";

interface RegisterModalProps {
    onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose }) => {

    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [nameValid, setNameValid] = useState<boolean>(true);
    const [emailValid, setEmailValid] = useState<boolean>(true);
    const [passwordValid, setPasswordValid] = useState<boolean>(true);
    const [userRegistered, setUserRegistered] = useState<boolean>(false);
    const [showRegisterInfo, setShowRegisterInfo] = useState<boolean>(false);

    useEffect(() => {
        if (name.trim().length > 0) {
            setNameValid(name.trim().length >= 3);
        }
        if (email.trim().length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setEmailValid(emailRegex.test(email));
        }
        if (password.trim().length > 0) {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            setPasswordValid(passwordRegex.test(password));
        }
        setShowRegisterInfo(false);
    }, [name, email, password]);

    const handleRegister = async () => {
        if (name.trim().length === 0) setNameValid(false);
        if (email.trim().length === 0) setEmailValid(false);
        if (password.trim().length === 0) setPasswordValid(false);

        if (nameValid && emailValid && passwordValid) {
            try {
                const userData = {
                    name,
                    email,
                    password,
                };
                const response = await registerUser(userData);

                if (response.message === "User registered successfully") {
                    setUserRegistered(true);
                } else {
                    console.error("User already exists!");
                    setUserRegistered(false);
                }
            } catch (error) {
                console.error("Registration failed:", error);
                setUserRegistered(false);
            } finally {
                setShowRegisterInfo(true);
            }
        } else {
            console.error("Validation errors exist");
            setUserRegistered(false);
            setShowRegisterInfo(true);
        }
    };

    return (
        <div className={styles.registerModal}>
            <CloseButton onClick={onClose} />
            <InputField
                type="text"
                placeholder="Name Surname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                isValid={nameValid}
                errorMessage="Enter Your Name!"
            />
            <InputField
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isValid={emailValid}
                errorMessage="Enter a valid Email Address"
            />
            <InputField
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isValid={passwordValid}
                errorMessage="Enter a valid Password (8+ chars, letters & numbers)!"
            />

            {showRegisterInfo && (
                <span
                    className={
                        userRegistered
                            ? styles.registerFeedback
                            : styles.registerFeedbackFail
                    }
                >
                    {userRegistered ? "User Registered" : "Registration Failed"}
                </span>
            )}
            <SubmitButton onClick={handleRegister} text="Register" />
        </div>
    );
};

export default RegisterModal;
