import React from "react";
import styles from "./submitButton.module.css";

interface SubmitButtonProps {
    onClick?: () => void;
    text: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ onClick, text }) => {
    return (
        <div className={styles.submitButtonField}>
            <button
                className={styles.submitButton}
                type="submit"
                onClick={onClick}
            >
                {text}
            </button>
        </div>
    );
};

export default SubmitButton;
