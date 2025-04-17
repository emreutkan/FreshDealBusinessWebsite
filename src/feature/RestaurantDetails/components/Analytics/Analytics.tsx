import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import styles from './Analytics.module.css';
import axios from 'axios';
import { API_BASE_URL } from '../../../../redux/Api/apiService';

interface AnalyticsProps {
    restaurantId: string;
}

interface Comment {
    user_name: string;
    rating: number;
    comment: string;
    timestamp: string;
    badges: Array<{
        name: string;
        is_positive: boolean;
    }>;
}

interface AnalyticsData {
    monthly_stats: {
        total_products_sold: number;
        total_revenue: string;
        period: string;
    };
    regional_distribution: Record<string, number>;
    restaurant_stats: {
        id: number;
        name: string;
        average_rating: number;
        total_ratings: number;
        recent_comments: Comment[];
    };
}

const Analytics: React.FC<AnalyticsProps> = ({ restaurantId }) => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = useSelector((state: RootState) => state.user.token);
    const user = useSelector((state: RootState) => state.user);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                console.log('User Details:', {
                    token,
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                    name: user.name_surname
                });

                console.log('Request Details:', {
                    url: `${API_BASE_URL}/analytics/restaurants/${restaurantId}`,
                    headers: { Authorization: `Bearer ${token}` },
                    timestamp: new Date().toISOString()
                });

                const response = await axios.get(
                    `${API_BASE_URL}/analytics/restaurants/${restaurantId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                console.log('Analytics Response:', response.data);
                setAnalyticsData(response.data.data);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    console.error('Analytics Error:', {
                        status: err.response?.status,
                        data: err.response?.data,
                        config: err.config,
                        user: user.email
                    });
                    setError(err.response?.data?.message || 'Failed to load analytics data');
                } else {
                    console.error('Unexpected Error:', err);
                    setError('An unexpected error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [restaurantId, token, user]);

    if (loading) {
        return <div className={styles.loading}>Loading analytics...</div>;
    }

    if (error || !analyticsData) {
        return <div className={styles.error}>{error || 'Failed to load data'}</div>;
    }

    return (
        <div className={styles.analyticsContainer}>
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <h3>Monthly Revenue</h3>
                    <div className={styles.statValue}>
                        ${parseFloat(analyticsData.monthly_stats.total_revenue).toFixed(2)}
                    </div>
                    <div className={styles.statPeriod}>
                        Period: {analyticsData.monthly_stats.period}
                    </div>
                </div>

                <div className={styles.statCard}>
                    <h3>Products Sold</h3>
                    <div className={styles.statValue}>
                        {analyticsData.monthly_stats.total_products_sold}
                    </div>
                    <div className={styles.statPeriod}>
                        Period: {analyticsData.monthly_stats.period}
                    </div>
                </div>

                <div className={styles.statCard}>
                    <h3>Average Rating</h3>
                    <div className={styles.statValue}>
                        {analyticsData.restaurant_stats.average_rating.toFixed(1)}
                    </div>
                    <div className={styles.statPeriod}>
                        Total Ratings: {analyticsData.restaurant_stats.total_ratings}
                    </div>
                </div>
            </div>

            <div className={styles.sections}>
                <div className={styles.section}>
                    <h3>Regional Distribution</h3>
                    <div className={styles.regionGrid}>
                        {Object.entries(analyticsData.regional_distribution).map(([region, count]) => (
                            <div key={region} className={styles.regionCard}>
                                <div className={styles.regionName}>{region}</div>
                                <div className={styles.regionCount}>{count} orders</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.section}>
                    <h3>Recent Comments</h3>
                    <div className={styles.commentsList}>
                        {analyticsData.restaurant_stats.recent_comments.map((comment, index) => (
                            <div key={index} className={styles.commentCard}>
                                <div className={styles.commentHeader}>
                                    <span className={styles.userName}>{comment.user_name}</span>
                                    <div className={styles.rating}>
                                        {[...Array(5)].map((_, i) => (
                                            <span
                                                key={i}
                                                className={`${styles.star} ${
                                                    i < comment.rating ? styles.filled : ''
                                                }`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.commentText}>{comment.comment}</div>
                                {comment.badges.length > 0 && (
                                    <div className={styles.badgeList}>
                                        {comment.badges.map((badge, badgeIndex) => (
                                            <span
                                                key={badgeIndex}
                                                className={`${styles.badge} ${
                                                    badge.is_positive ? styles.positive : styles.negative
                                                }`}
                                            >
                                                {badge.name.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className={styles.timestamp}>
                                    {new Date(comment.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;