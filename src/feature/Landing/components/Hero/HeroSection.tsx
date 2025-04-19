import React from 'react';
import styles from './HeroSection.module.css';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        // Navigate to business registration
        navigate('/register');
    };

    const handleLearnMore = () => {
        document.getElementById('benefits-section')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    return (
        <div className={styles.heroContainer}>
            <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>
                    <span className={styles.highlight}>Grow Your Restaurant</span>
                    <br />
                    Turn Surplus into Profit
                </h1>
                <p className={styles.heroSubtitle}>
                    Join Fresh Deal to reduce waste, attract new customers, and increase your revenue through our premium food marketplace
                </p>
                <div className={styles.ctaContainer}>
                    <button
                        className={styles.primaryButton}
                        onClick={handleGetStarted}
                    >
                        Partner With Us
                    </button>
                    <button
                        className={styles.secondaryButton}
                        onClick={handleLearnMore}
                    >
                        See Benefits
                    </button>
                </div>
            </div>
            <div className={styles.heroStats}>
                <div className={styles.statItem}>
                    <span className={styles.statNumber}>10.000+ TL</span>
                    <span className={styles.statLabel}>Average Annual Revenue</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statNumber}>15K+ </span>
                    <span className={styles.statLabel}>Active Users</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statNumber}>30% </span>
                    <span className={styles.statLabel}>Reduced Food Waste</span>
                </div>
            </div>
            <div className={styles.scrollIndicator}>
                <div className={styles.mouse}></div>
                <span>Explore Partnership Benefits</span>
            </div>
        </div>
    );
};

export default HeroSection;