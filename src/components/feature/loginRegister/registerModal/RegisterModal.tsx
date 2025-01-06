import React, { useEffect, useState } from "react";
import styles from "./registerModal.module.css";
import InputField from "../InputField/InputField";
import SubmitButton from "../SubmitButton/SubmitButton";
import CloseButton from "../CloseButton/CloseButton";
import {getUserData, loginUser, registerUser} from "../../../../redux/thunks/userThunks.ts";
import store, {AppDispatch} from "../../../../redux/store.ts";
import { useDispatch } from "react-redux";
import {setToken} from "../../../../redux/slices/userSlice.ts";
import {Alert} from "@mui/material";

interface RegisterModalProps {
    onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose }) => {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [phone, setPhone] = useState<string>(""); // Added phone state
    const dispatch = useDispatch<AppDispatch>();

    const [nameValid, setNameValid] = useState<boolean>(true);
    const [emailValid, setEmailValid] = useState<boolean>(true);
    const [passwordValid, setPasswordValid] = useState<boolean>(true);
    const [phoneValid, setPhoneValid] = useState<boolean>(true); // Added phone validation state

    useEffect(() => {
        // Validate Name
        if (name.trim().length > 0) {
            setNameValid(name.trim().length >= 3);
        }

        // Validate Email
        if (email.trim().length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setEmailValid(emailRegex.test(email));
        }

        // Validate Password
        if (password.trim().length > 0) {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            setPasswordValid(passwordRegex.test(password));
        }

        // Validate Phone Number
        if (phone.trim().length > 0) {
            // This regex matches international phone numbers with optional '+' and 7 to 15 digits
            const phoneRegex = /^\+?[0-9]{7,15}$/;
            setPhoneValid(phoneRegex.test(phone));
        }
    }, [name, email, password, phone]);

    const handleRegister = async () => {

        // Trimmed values to avoid spaces being considered as valid input
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        const trimmedPhone = phone.trim();

        // Validate fields are not empty
        if (trimmedName.length === 0) setNameValid(false);
        if (trimmedEmail.length === 0) setEmailValid(false);
        if (trimmedPassword.length === 0) setPasswordValid(false);
        if (trimmedPhone.length === 0) setPhoneValid(false); // Check phone is not empty

        // Re-validate all fields
        const isNameValid = trimmedName.length >= 3;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmailValid = emailRegex.test(trimmedEmail);
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        const isPasswordValid = passwordRegex.test(trimmedPassword);
        const phoneRegex = /^\+?[0-9]{7,15}$/;
        const isPhoneValid = phoneRegex.test(trimmedPhone);

        // Update validation states
        setNameValid(isNameValid);
        setEmailValid(isEmailValid);
        setPasswordValid(isPasswordValid);
        setPhoneValid(isPhoneValid);

        // If all fields are valid, proceed with registration
        if (isNameValid && isEmailValid && isPasswordValid && isPhoneValid) {
            try {
                const result = await dispatch(
                    registerUser({
                        name_surname: name,
                        email: email,
                        phone_number: phone,
                        password: password,
                        role: 'owner'
                    })
                ).unwrap(); // Use unwrap() to handle fulfilled/rejected states
                console.log("Login request successful", result);
                if (result.message == "User registered successfully!") {
                    const loginResult = await dispatch(
                        loginUser({
                            email: email,
                            phone_number: phone,
                            password: password,
                            login_type: "email",
                            password_login: true,
                        })
                    ).unwrap(); // Use unwrap() to handle fulfilled/rejected states
                    if (loginResult.success) {
                        console.log('store.getState().user before setToken = ', store.getState().user);
                        dispatch(setToken(loginResult.token));
                        dispatch(getUserData({token: loginResult.token}));
                        console.log('store.getState().user = after setToken', store.getState().user);
                    } else {
                        console.log("Login Failed", loginResult.message || "Something went wrong.");
                    }
                }

            } catch (err) {
                console.error("Login request failed", err);
            }
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
                errorMessage="Enter your name (at least 3 characters)!"
            />
            <InputField
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isValid={emailValid}
                errorMessage="Enter a valid email address."
            />
            <InputField
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isValid={passwordValid}
                errorMessage="Enter a valid password (8+ chars, letters & numbers)."
            />
            {/* Added Phone Number Field */}
            <InputField
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                isValid={phoneValid}
                errorMessage="Enter a valid phone number (7-15 digits, optional '+')."
            />
            <SubmitButton onClick={handleRegister} text="Register" />
        </div>
    );
};

export default RegisterModal;
