import React from "react";
import styles from "./closeButton.module.css";

interface CloseButtonProps {
    onClick: () => void;
}

const CloseButton: React.FC<CloseButtonProps> = ({ onClick }) => {
    return (
        <div className={styles.closeButtonContainer}>
            <button className={styles.closeButton} onClick={onClick}>
                x
            </button>
        </div>
    );
};

export default CloseButton;
