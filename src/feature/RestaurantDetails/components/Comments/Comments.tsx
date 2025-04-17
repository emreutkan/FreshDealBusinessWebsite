import React, { useEffect, useState } from 'react';
import { Card } from '@mui/material';
import { getRestaurantCommentsAPI, getRestaurantBadgesAPI } from '../../../../redux/Api/restaurantApi';
import styles from './Comments.module.css';
import { IoFastFoodOutline, IoSpeedometerOutline, IoPersonOutline } from 'react-icons/io5';

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

interface BadgePoints {
    fresh: number;
    not_fresh: number;
    fast_delivery: number;
    slow_delivery: number;
    customer_friendly: number;
    not_customer_friendly: number;
}

const BADGE_CONFIG = {
    fresh: {
        icon: <IoFastFoodOutline />,
        label: 'Fresh Food',
        negativeName: 'not_fresh',
    },
    fast_delivery: {
        icon: <IoSpeedometerOutline />,
        label: 'Fast Delivery',
        negativeName: 'slow_delivery',
    },
    customer_friendly: {
        icon: <IoPersonOutline />,
        label: 'Customer Friendly',
        negativeName: 'not_customer_friendly',
    }
};

const Comments: React.FC<CommentsProps> = ({ restaurantId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [badgePoints, setBadgePoints] = useState<BadgePoints | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [commentsResponse, badgesResponse] = await Promise.all([
                    getRestaurantCommentsAPI(restaurantId),
                    getRestaurantBadgesAPI(restaurantId)
                ]);

                setComments(commentsResponse.comments);
                setBadgePoints(badgesResponse.badge_points);
            } catch (err) {
                setError('Failed to load comments and badges');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [restaurantId]);

    const getBadgeScore = (badgeName: string): { score: number; total: number } => {
        if (!badgePoints) return { score: 0, total: 0 };

        switch (badgeName) {
            case 'fresh': {
                const positive = badgePoints.fresh || 0;
                const negative = badgePoints.not_fresh || 0;
                return {
                    score: positive - negative,
                    total: positive + negative
                };
            }
            case 'fast_delivery': {
                const positive = badgePoints.fast_delivery || 0;
                const negative = badgePoints.slow_delivery || 0;
                return {
                    score: positive - negative,
                    total: positive + negative
                };
            }
            case 'customer_friendly': {
                const positive = badgePoints.customer_friendly || 0;
                const negative = badgePoints.not_customer_friendly || 0;
                return {
                    score: positive - negative,
                    total: positive + negative
                };
            }
            default:
                return { score: 0, total: 0 };
        }
    };

    const isBadgeEarned = (badgeName: string): boolean => {
        const { score } = getBadgeScore(badgeName);
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
                {Object.entries(BADGE_CONFIG).map(([badgeName, config]) => {
                    const positiveCount = badgePoints?.[badgeName] || 0;
                    const negativeCount = badgePoints?.[config.negativeName] || 0;
                    const { score, total } = getBadgeScore(badgeName);

                    return (
                        <div key={badgeName} className={styles.badgeCard}>
                            <div className={`${styles.badgeIcon} ${isBadgeEarned(badgeName) ? styles.earned : ''}`}>
                                {config.icon}
                            </div>
                            <div className={styles.badgeLabel}>{config.label}</div>
                            <div className={styles.badgeCounts}>
                                <span className={styles.positiveCount}>{positiveCount}</span>
                                <span className={styles.negativeCount}>{negativeCount}</span>
                            </div>
                            <div className={styles.badgeScore}>
                                Score: {score} ({total} total)
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