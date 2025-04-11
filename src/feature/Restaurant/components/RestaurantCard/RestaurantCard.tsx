import styles from './RestaurantCard.module.css';
import { Restaurant } from "@/redux/slices/restaurantSlice";

interface RestaurantCardProps {
    restaurant: Restaurant;
    onClick?: () => void;
}

const RestaurantCard = ({ restaurant, onClick }: RestaurantCardProps) => {
    const {
        image_url,
        restaurantName,
        restaurantDescription,
        category,
        workingDays,
        workingHoursStart,
        workingHoursEnd,
        listings,
        rating,
        ratingCount
    } = restaurant;

    const formatWorkingDays = (days: string[]) => {
        const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        // Check if open all week
        if (days.length === 7) {
            return 'Open All Week';
        }

        // Check if only weekdays
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const isWeekdays = weekdays.every(day => days.includes(day)) &&
            days.length === 5;
        if (isWeekdays) {
            return 'Weekdays';
        }

        // Check if only weekends
        const weekends = ['Saturday', 'Sunday'];
        const isWeekends = weekends.every(day => days.includes(day)) &&
            days.length === 2;
        if (isWeekends) {
            return 'Weekends';
        }

        // If it's a continuous range of days
        const dayIndices = days.map(day => allDays.indexOf(day)).sort((a, b) => a - b);
        const isContinuous = dayIndices.every((val, i) =>
            i === 0 || val === dayIndices[i - 1] + 1
        );

        if (isContinuous) {
            return `${allDays[dayIndices[0]].slice(0,3)} - ${allDays[dayIndices[dayIndices.length - 1]].slice(0,3)}`;
        }

        // Default: show abbreviated days with commas
        return days.map(day => day.slice(0, 3)).join(', ');
    };

    return (
        <div className={styles.card} onClick={onClick}>
            {image_url && (
                <div className={styles.imageContainer}>
                    <img
                        src={image_url}
                        alt={restaurantName}
                        loading="lazy"
                    />
                </div>
            )}

            <div className={styles.infoContainer}>
                <div className={styles.headerSection}>
                    <h2 className={styles.restaurantName}>{restaurantName}</h2>
                    <div className={styles.ratingContainer}>
                        <span className={styles.rating}>{rating} ★</span>
                        <span className={styles.ratingCount}>({ratingCount} reviews)</span>
                    </div>
                </div>

                <p className={styles.description}>{restaurantDescription}</p>

                <div className={styles.infoGrid}>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Category</span>
                        <span>{category}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Hours</span>
                        <span>{workingHoursStart} - {workingHoursEnd}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Open</span>
                        <span>{formatWorkingDays(workingDays)}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Listings</span>
                        <span>{listings}</span>
                    </div>
                </div>

                <div className={styles.detailsLink}>
                    <span>View Details</span>
                    <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                        className={styles.arrowIcon}
                    >
                        <path d="M7.646 15.354a.5.5 0 0 0 .708 0l6.708-6.708a1.494 1.494 0 0 0 0-2.084L8.354.646a.5.5 0 1 0-.708.708l6.356 6.356a.497.497 0 0 1 0 .708l-6.356 6.356a.5.5 0 0 0 0 .708z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default RestaurantCard;