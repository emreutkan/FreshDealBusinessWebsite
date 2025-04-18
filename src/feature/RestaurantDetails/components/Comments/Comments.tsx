import React, { useEffect, useState } from 'react';
import { Card } from '@mui/material';
import { getRestaurantCommentsAPI } from '../../../../redux/Api/restaurantApi';
import styles from './Comments.module.css';
import { IoFastFoodOutline, IoSpeedometerOutline, IoPersonOutline } from 'react-icons/io5';
import { API_BASE_URL } from '../../../../redux/Api/apiService';
import axios from 'axios';

interface CommentsProps {
    restaurantId: string;
}

interface Badge {
    name: string;
    is_positive: boolean;
}

interface Comment {
    id: number;
    user_id: number;
    comment: string;
    rating: number;
    timestamp: string;
    badges: Badge[];
}

interface BadgeAnalytics {
    freshness: {
        fresh: number;
        not_fresh: number;
    };
    delivery: {
        fast_delivery: number;
        slow_delivery: number;
    };
    customer_service: {
        customer_friendly: number;
        not_customer_friendly: number;
    };
}

const BADGE_CATEGORIES = {
    freshness: {
        icon: <IoFastFoodOutline />,
        label: 'Food Freshness',
        positive: 'fresh',
        negative: 'not_fresh',
    },
    delivery: {
        icon: <IoSpeedometerOutline />,
        label: 'Delivery Speed',
        positive: 'fast_delivery',
        negative: 'slow_delivery',
    },
    customer_service: {
        icon: <IoPersonOutline />,
        label: 'Customer Service',
        positive: 'customer_friendly',
        negative: 'not_customer_friendly',
    }
};

const Comments: React.FC<CommentsProps> = ({ restaurantId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [badgeAnalytics, setBadgeAnalytics] = useState<BadgeAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [commentsResponse, badgeAnalyticsResponse] = await Promise.all([
                    getRestaurantCommentsAPI(restaurantId),
                    axios.get(`${API_BASE_URL}/restaurants/${restaurantId}/badge-analytics`)
                ]);

                setComments(commentsResponse.comments);
                setBadgeAnalytics(badgeAnalyticsResponse.data.badge_analytics);
            } catch (err) {
                setError('Failed to load comments and badges');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [restaurantId]);

    const getBadgeScore = (category: keyof BadgeAnalytics): { score: number; total: number; percentage: number } => {
        if (!badgeAnalytics) return { score: 0, total: 0, percentage: 0 };

        const categoryData = badgeAnalytics[category];
        const positiveKey = Object.keys(categoryData)[0] as keyof typeof categoryData;
        const negativeKey = Object.keys(categoryData)[1] as keyof typeof categoryData;

        const positive = categoryData[positiveKey];
        const negative = categoryData[negativeKey];
        const total = positive + negative;
        const score = positive - negative;
        const percentage = total > 0 ? (positive / total) * 100 : 0;

        return { score, total, percentage };
    };

    const isBadgeEarned = (category: keyof BadgeAnalytics): boolean => {
        const { score } = getBadgeScore(category);
        return score > 100;
    };

    if (loading) {
        return <div className={styles.loading}>Loading comments and badges...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.commentsContainer}>
            <div className={styles.badges}>
                {(Object.entries(BADGE_CATEGORIES) as Array<[keyof BadgeAnalytics, typeof BADGE_CATEGORIES[keyof BadgeAnalytics]]>).map(([category, config]) => {
                    const { score, total, percentage } = getBadgeScore(category);
                    const categoryData = badgeAnalytics?.[category] || { [config.positive]: 0, [config.negative]: 0 };
                    const positiveCount = categoryData[config.positive as keyof typeof categoryData];
                    const negativeCount = categoryData[config.negative as keyof typeof categoryData];

                    return (
                        <div key={category} className={styles.badgeCard}>
                            <div className={`${styles.badgeIcon} ${isBadgeEarned(category) ? styles.earned : ''}`}>
                                {config.icon}
                            </div>
                            <div className={styles.badgeLabel}>{config.label}</div>
                            <div className={styles.badgeCounts}>
                                <span className={styles.positiveCount}>{positiveCount}</span>
                                <span className={styles.negativeCount}>{negativeCount}</span>
                            </div>
                            <div className={styles.badgeScore}>
                                Score: {score} ({percentage.toFixed(1)}% positive)
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={styles.commentsList}>
                <h2>Customer Comments ({comments.length})</h2>
                {comments.map((comment) => (
                    <Card key={comment.id} className={styles.commentCard}>
                        <div className={styles.commentHeader}>
                            <div className={styles.rating}>
                                {[...Array(5)].map((_, index) => (
                                    <span
                                        key={index}
                                        className={`${styles.star} ${index < comment.rating ? styles.filled : ''}`}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <div className={styles.timestamp}>
                                {new Date(comment.timestamp).toLocaleDateString()}
                            </div>
                        </div>
                        <div className={styles.commentText}>{comment.comment}</div>
                        {comment.badges.length > 0 && (
                            <div className={styles.commentBadges}>
                                {comment.badges.map((badge, index) => (
                                    <span
                                        key={index}
                                        className={`${styles.commentBadge} ${badge.is_positive ? styles.positive : styles.negative}`}
                                    >
                                        {badge.name.replace(/_/g, ' ')}
                                    </span>
                                ))}
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Comments;