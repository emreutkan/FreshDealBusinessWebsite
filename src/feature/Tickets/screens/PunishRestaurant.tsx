import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styles from './PunishRestaurant.module.css';
import { RootState, AppDispatch } from '../../../redux/store';
import Header from '../../Header/Header';
import { IoArrowBack } from 'react-icons/io5';
import { API_BASE_URL } from "../../../redux/Api/apiService.ts";
import { punishRestaurant } from "../../../redux/slices/punishmentSlice";

interface Restaurant {
    id: number;
    restaurantName: string;
    restaurantDescription: string;
    longitude: number;
    latitude: number;
    category: string;
    image_url: string;
    rating: number | null;
    workingDays: string[];
    restaurantEmail: string | null;
    restaurantPhone: string | null;
}

interface LocationState {
    reportId?: number;
}

const PunishRestaurantPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { token, role } = useSelector((state: RootState) => state.user);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [durationType, setDurationType] = useState<string>('ONE_WEEK');
    const [reason, setReason] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    // Get reportId from location state if available
    const [reportId, setReportId] = useState<number | undefined>(undefined);

    // Get the reportId if passed through navigation
    useEffect(() => {
        // Check if we have location state with reportId
        const locationState = window.history.state?.usr as LocationState | undefined;
        if (locationState?.reportId) {
            setReportId(locationState.reportId);
        }
    }, []);

    // Check if user is support
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        if (role !== 'support') {
            navigate('/dashboard');
        }
    }, [token, role, navigate]);

    // Fetch restaurant details
    useEffect(() => {
        const fetchRestaurant = async () => {
            if (!id || !token) return;

            try {
                setLoading(true);
                console.log('Fetching restaurant details for ID:', id, 'with token:', token);

                // Use the direct restaurant endpoint for detailed info
                const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (response.status === 404) {
                    throw new Error('Restaurant not found');
                }

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API error response:', errorText);
                    throw new Error(`Failed to fetch restaurant: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Restaurant data:', data);
                setRestaurant(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching restaurant:', err);
                setError('Failed to load restaurant details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurant();
    }, [token, id]);

    const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setReason(e.target.value);
    };

    const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDurationType(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!reason.trim() || !token || !id) {
            setError('Please provide a reason for punishment');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            // Prepare the punishment data
            const punishmentData = {
                duration_type: durationType,
                reason: reason
            };


            // Dispatch the punishRestaurant action
            const result = await dispatch(punishRestaurant({
                restaurantId: parseInt(id),
                data: punishmentData,
                reportId: reportId
            })).unwrap();

            if (result.success) {
                setSuccess(true);
                // Redirect after delay
                setTimeout(() => {
                    navigate('/support-dashboard');
                }, 2000);
            } else {
                setError(result.message || 'Failed to punish restaurant');
            }
        } catch (err) {
            console.error('Error punishing restaurant:', err);
            setError(err instanceof Error ? err.message : 'Failed to punish restaurant');
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoBack = () => {
        navigate('/support-dashboard');
    };

    return (
        <div className={styles.punishPage}>
            <Header />

            <div className={styles.contentContainer}>
                <div className={styles.navigationHeader}>
                    <button className={styles.backButton} onClick={handleGoBack}>
                        <IoArrowBack /> Back to Dashboard
                    </button>
                </div>

                <h1>Issue Restaurant Punishment</h1>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>Restaurant punished successfully! Redirecting...</div>}

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner}></div>
                        <p>Loading restaurant details...</p>
                    </div>
                ) : restaurant ? (
                    <div className={styles.punishmentContainer}>
                        <div className={styles.restaurantCard}>
                            {restaurant.image_url && (
                                <div className={styles.restaurantImageContainer}>
                                    <img
                                        src={restaurant.image_url}
                                        alt={restaurant.restaurantName}
                                        className={styles.restaurantImage}
                                    />
                                </div>
                            )}

                            <div className={styles.restaurantDetails}>
                                <h2>{restaurant.restaurantName}</h2>
                                <div className={styles.restaurantInfo}>
                                    <p><strong>ID:</strong> {restaurant.id}</p>
                                    <p><strong>Category:</strong> {restaurant.category}</p>
                                    <p><strong>Working Days:</strong> {restaurant.workingDays?.join(', ') || 'N/A'}</p>
                                    {restaurant.rating !== null && <p><strong>Rating:</strong> {restaurant.rating.toFixed(1)}</p>}
                                    {restaurant.restaurantEmail && <p><strong>Email:</strong> {restaurant.restaurantEmail}</p>}
                                    {restaurant.restaurantPhone && <p><strong>Phone:</strong> {restaurant.restaurantPhone}</p>}
                                    <p><strong>Location:</strong> {restaurant.latitude}, {restaurant.longitude}</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.punishmentForm}>
                            {reportId && (
                                <div className={styles.reportInfo}>
                                    <p><strong>Associated Report ID:</strong> {reportId}</p>
                                </div>
                            )}

                            <div className={styles.formGroup}>
                                <label htmlFor="duration">Punishment Duration:</label>
                                <select
                                    id="duration"
                                    value={durationType}
                                    onChange={handleDurationChange}
                                    disabled={submitting || success}
                                >
                                    <option value="THREE_DAYS">3 Days</option>
                                    <option value="ONE_WEEK">1 Week</option>
                                    <option value="ONE_MONTH">1 Month</option>
                                    <option value="THREE_MONTHS">3 Months</option>
                                    <option value="PERMANENT">Permanent</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="reason">Reason for Punishment:</label>
                                <textarea
                                    id="reason"
                                    value={reason}
                                    onChange={handleReasonChange}
                                    placeholder="Explain the reason for this punishment..."
                                    rows={4}
                                    disabled={submitting || success}
                                ></textarea>
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    onClick={handleGoBack}
                                    className={styles.cancelButton}
                                    disabled={submitting || success}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={submitting || success || !reason.trim()}
                                >
                                    {submitting ? 'Processing...' : 'Issue Punishment'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className={styles.notFound}>Restaurant not found</div>
                )}
            </div>
        </div>
    );
};

export default PunishRestaurantPage;