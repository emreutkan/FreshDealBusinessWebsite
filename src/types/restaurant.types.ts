export interface Badge {
    name: string;
    is_positive: boolean;
}

export interface Comment {
    id: number;
    user_id: number;
    comment: string;
    rating: number;
    timestamp: string;
    badges: Badge[];
}

export interface BadgePoints {
    fresh: number;
    not_fresh: number;
    fast_delivery: number;
    slow_delivery: number;
    customer_friendly: number;
    not_customer_friendly: number;
}

export interface RestaurantBadges {
    restaurant_id: number;
    badge_points: BadgePoints;
}