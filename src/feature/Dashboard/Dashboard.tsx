// src/feature/Dashboard/screens/Dashboard.tsx
import React from 'react';

import Header from '../Header/Header';
import styles from './Dashboard.module.css';


const Dashboard: React.FC = () => {

    return (
        <div className={styles.dashboardContainer}>
            <Header />


        </div>
    );
};

export default Dashboard;