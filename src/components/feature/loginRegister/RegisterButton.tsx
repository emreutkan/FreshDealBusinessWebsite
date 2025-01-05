import React from "react";
import styles from "./registerButton.module.css";

interface RegisterButtonProps {
    modalType?: string;
}

const RegisterButton: React.FC<RegisterButtonProps> = ({ modalType = "RegisterModal" }) => {
    return (
        <div>
            <button className={styles.registerButton}>
                {modalType.replace("Modal", "")}
            </button>
        </div>
    );
};

export default RegisterButton;
