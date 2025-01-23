import React from "react";
import styles from './AboutUs.module.css';
import Frame from "../../../../assets/Frame.svg";
import OurVisionLogo from "../../../../assets/vision.svg";
import OurValuesLogo from "../../../../assets/values.svg";
import OurMissionLogo from "../../../../assets/mission.svg";

const AboutUs: React.FC = () => {
    return (
        <div className={styles.aboutUsContainer}>
            <img
                src={Frame}
                alt="Frame"
                className={styles.heroImage}
            />

            <div className={styles.cardsContainer}>
                <div className={styles.infoCard}>
                    <div className={styles.cardContent}>
                        <h1>Our Mission</h1>
                        <p className={styles.cardText}>
                            At Fresh Deal, we prevent premium food waste and offer everyone unbeatable prices on
                            high-quality meals and groceries.
                        </p>
                    </div>
                    <img
                        src={OurMissionLogo}
                        alt="Our Mission Logo"
                        className={styles.cardImage}
                    />
                </div>

                <div className={styles.infoCard}>
                    <div className={styles.cardContent}>
                        <h1>Our Vision</h1>
                        <p className={styles.cardText}>
                            By combining sustainability with affordability, we ensure no premium product goes unused, letting everyone enjoy the best at a better price.
                        </p>
                    </div>
                    <img
                        src={OurVisionLogo}
                        alt="Our Vision Logo"
                        className={styles.cardImage}
                    />
                </div>

                <div className={styles.infoCard}>
                    <div className={styles.cardContent}>
                        <h1>Our Values</h1>
                        <p className={styles.cardText}>
                            We preserve premium quality, make it affordable, and reduce waste, creating value for users, businesses, and the planet.
                        </p>
                    </div>
                    <img
                        src={OurValuesLogo}
                        alt="Our Values Logo"
                        className={styles.cardImage}
                    />
                </div>
            </div>
        </div>
    );
};

export default AboutUs;