import React from 'react';
import styles from './Features.module.css';
import {
    IoWalletOutline,
    IoPeopleOutline,
    IoStatsChartOutline,
    IoTimeOutline,
    IoLeafOutline,
    IoPhonePortraitOutline
} from 'react-icons/io5';

const Features: React.FC = () => {
    return (
        <section id="benefits-section" className={styles.featuresSection}>
            <h2 className={styles.sectionTitle}>Why Partner with Fresh Deal?</h2>

            <div className={styles.featuresGrid}>
                <div className={styles.featureCard}>
                    <div className={styles.iconContainer}>
                        <IoWalletOutline className={styles.icon} />
                    </div>
                    <h3>Additional Revenue Stream</h3>
                    <p>Generate extra income from surplus food that would otherwise go to waste</p>
                    <div className={styles.metric}>
                        <span className={styles.metricNumber}>+25%</span>
                        <span className={styles.metricLabel}>Monthly Revenue</span>
                    </div>
                </div>

                <div className={styles.featureCard}>
                    <div className={styles.iconContainer}>
                        <IoPeopleOutline className={styles.icon} />
                    </div>
                    <h3>New Customer Base</h3>
                    <p>Reach thousands of quality-conscious customers looking for premium dining experiences</p>
                    <div className={styles.metric}>
                        <span className={styles.metricNumber}>2000+</span>
                        <span className={styles.metricLabel}>Daily Active Users</span>
                    </div>
                </div>

                <div className={styles.featureCard}>
                    <div className={styles.iconContainer}>
                        <IoStatsChartOutline className={styles.icon} />
                    </div>
                    <h3>Smart Analytics</h3>
                    <p>Access detailed insights about your surplus inventory and customer preferences</p>
                    <div className={styles.metric}>
                        <span className={styles.metricNumber}>Real-time</span>
                        <span className={styles.metricLabel}>Data Dashboard</span>
                    </div>
                </div>

                <div className={styles.featureCard}>
                    <div className={styles.iconContainer}>
                        <IoTimeOutline className={styles.icon} />
                    </div>
                    <h3>Easy Integration</h3>
                    <p>Set up in minutes with our user-friendly business dashboard and mobile app</p>
                    <div className={styles.metric}>
                        <span className={styles.metricNumber}>15 min</span>
                        <span className={styles.metricLabel}>Average Setup Time</span>
                    </div>
                </div>

                <div className={styles.featureCard}>
                    <div className={styles.iconContainer}>
                        <IoLeafOutline className={styles.icon} />
                    </div>
                    <h3>Sustainability Impact</h3>
                    <p>Demonstrate your commitment to sustainability and attract eco-conscious customers</p>
                    <div className={styles.metric}>
                        <span className={styles.metricNumber}>-30%</span>
                        <span className={styles.metricLabel}>Food Waste</span>
                    </div>
                </div>

                <div className={styles.featureCard}>
                    <div className={styles.iconContainer}>
                        <IoPhonePortraitOutline className={styles.icon} />
                    </div>
                    <h3>Full Control</h3>
                    <p>Manage your offerings, prices, and availability in real-time through our platform</p>
                    <div className={styles.metric}>
                        <span className={styles.metricNumber}>24/7</span>
                        <span className={styles.metricLabel}>Platform Access</span>
                    </div>
                </div>
            </div>

            <div className={styles.actionContainer}>
                <h3 className={styles.actionTitle}>Ready to reduce waste and increase profits?</h3>
                <button className={styles.actionButton} onClick={() => window.location.href = '/business/register'}>
                    Join Fresh Deal Today
                </button>
                <p className={styles.actionSubtext}>No commitment required - Try it free for 30 days</p>
            </div>
        </section>
    );
};

export default Features;