import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {RootState} from "../../../redux/store.ts";
import { setEmail, setPassword } from "../../../redux/slices/userSlice.ts";
import {loginUser} from "../../../redux/thunks/userThunks.ts";
import styles from "./loginModal.module.css";
import InputField from "../InputField/InputField.tsx";
import SubmitButton from "../SubmitButton/SubmitButton.tsx";
import CloseButton from "../CloseButton/CloseButton.tsx";
import {AppDispatch} from "../../../redux/store.ts";

interface LoginModalProps {
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const {email, password, loading, error} = useSelector((state: RootState) => state.user);
    const [emailValid, setEmailValid] = useState(true);
    const [passwordValid, setPasswordValid] = useState(true);

    useEffect(() => {
        if (email.trim().length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setEmailValid(emailRegex.test(email));
        }
        if (password.trim().length > 0) {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            setPasswordValid(passwordRegex.test(password));
        }
    }, [email, password]);

    const handleLogin = async () => {
        if (!email.trim()) setEmailValid(false);
        if (!password.trim()) setPasswordValid(false);

        // if (!emailValid && !passwordValid) {
        //     return;
        // }
        try {
             await dispatch(
                loginUser({
                    email: email,
                    password: password,
                    login_type: "email",
                    password_login: true,
                })
            ).unwrap(); // Use unwrap() to handle fulfilled/rejected states
        } catch (err) {
            console.error("Failed to login:", err);
        }
    }

    return (
        <div className={styles.loginModal}>
            <CloseButton onClick={onClose}/>
            <InputField
                isValid={emailValid}
                placeholder="Email"
                type="text"
                value={email}
                onChange={(e) => dispatch(setEmail(e.target.value))}
                errorMessage="Enter a valid Email Address"
            />
            <InputField
                isValid={passwordValid}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => dispatch(setPassword(e.target.value))}
                errorMessage="Enter a valid Password (8+ chars, letters & numbers)!"
            />

            <SubmitButton text={loading ? "Logging in..." : "Login"} onClick={handleLogin}/>
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
};

export default LoginModal;
