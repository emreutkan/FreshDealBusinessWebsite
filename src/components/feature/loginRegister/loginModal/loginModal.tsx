import React, { useEffect, useState } from "react";
import styles from "./loginModal.module.css";
import InputField from "../InputField/InputField";
import SubmitButton from "../SubmitButton/SubmitButton";
import CloseButton from "../CloseButton/CloseButton";
import { loginUser } from "../../../../Api/apiService";
import { useUser } from "../../../../context/UserContext";

interface LoginModalProps {
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
    const { login } = useUser();

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [emailValid, setEmailValid] = useState<boolean>(true);
    const [passwordValid, setPasswordValid] = useState<boolean>(true);
    const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        if (email.trim().length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setEmailValid(emailRegex.test(email));
        }
        if (password.trim().length > 0) {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            setPasswordValid(passwordRegex.test(password));
        }
        if (userLoggedIn) {
            onClose();
        }
    }, [email, password, userLoggedIn, onClose]);

    const handleLogin = async () => {
        if (email.trim().length === 0) setEmailValid(false);
        if (password.trim().length === 0) setPasswordValid(false);

        if (emailValid && passwordValid) {
            try {
                const loginData = {
                    email,
                    password,
                };
                const response = await loginUser(loginData);

                if (response.message === "User logged in successfully") {
                    const { access_token, user } = response;

                    login({
                        accessToken: access_token,
                        ...user,
                    });

                    localStorage.setItem("accessToken", access_token);
                    setUserLoggedIn(true);
                } else {
                    console.error("Login failed");
                    setUserLoggedIn(false);
                }
            } catch (error) {
                console.error("Login error:", error);
                setUserLoggedIn(false);
            }
        }
    };

    return (
        <div className={styles.loginModal}>
            <CloseButton onClick={onClose} />
            <InputField
                isValid={emailValid}
                placeholder="Email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                errorMessage="Enter a valid Email Address"
            />
            <InputField
                isValid={passwordValid}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                errorMessage="Enter a valid Password (8+ chars, letters & numbers)!"
            />
            <SubmitButton
                text="Login"
                onClick={handleLogin}
            />
        </div>
    );
};

export default LoginModal;
