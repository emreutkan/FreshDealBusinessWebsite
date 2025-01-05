import React, { ChangeEvent } from "react";
import styles from "./inputField.module.css";

interface InputFieldProps {
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    isValid: boolean;
    errorMessage?: string; // Optional, in case there's no error message provided
}

const InputField: React.FC<InputFieldProps> = ({
                                                   type,
                                                   placeholder,
                                                   value,
                                                   onChange,
                                                   isValid,
                                                   errorMessage,
                                               }) => (
    <div className={styles.inputField}>
        <input
            className={`${styles.input} ${!isValid ? styles.fail : ""}`}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
        {!isValid && errorMessage && (
            <div className={styles.errorContainer}>
                <span className={styles.error}>{errorMessage}</span>
            </div>
        )}
    </div>
);

export default InputField;
