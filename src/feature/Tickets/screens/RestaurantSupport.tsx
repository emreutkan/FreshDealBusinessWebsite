import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { fetchRestaurantTickets, disregardTicket } from '../../../redux/slices/ticketSlice';
import { fetchPunishmentHistory, fetchRestaurantStatus } from '../../../redux/slices/punishmentSlice';
import { IoArrowBack, IoFilter, IoRefresh } from 'react-icons/io5';
import Header from '../../Header/Header';
import styles from './RestaurantSupport.module.css';
import PunishmentHistory from '../components/PunishmentHistory';
import { API_BASE_URL } from "../../../redux/Api/apiService";

interface Restaurant {
    id: number;
    restaurantName: string;
    restaurantDescription: string;
    image_url: string;
    rating: number | null;
    category: string;
    is_active: boolean;
}

const RestaurantSupportPage: React.FC = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { token, role } = useSelector((state: RootState) => state.user);
    const { restaurantTickets, loading: ticketsLoading, error: ticketsError } = useSelector((state: RootState) => state.tickets);
    const { history: punishmentHistory, restaurantStatus, loading: punishmentLoading, error: punishmentError } = useSelector((state: RootState) => state.punishment);

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [activeTab, setActiveTab] = useState<'tickets' | 'punishment'>('tickets');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check if user is support role
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
            if (!restaurantId || !token) return;

            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch restaurant details');
                }

                const data = await response.json();
                setRestaurant(data);

                // Also fetch tickets and punishment history/status using Redux
                dispatch(fetchRestaurantTickets(Number(restaurantId)));
                dispatch(fetchPunishmentHistory(Number(restaurantId)));
                dispatch(fetchRestaurantStatus(Number(restaurantId)));
            } catch (err) {
                console.error('Error fetching restaurant details:', err);
                setError('Failed to load restaurant details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurant();
    }, [restaurantId, token, dispatch]);

    const handleGoBack = () => {
        navigate('/tickets');
    };

    const handlePunishRestaurant = () => {
        navigate(`/punish-restaurant/${restaurantId}`);
    };

    const handleDisregardTicket = async (ticketId: number) => {
        if (!window.confirm('Are you sure you want to disregard this ticket?')) return;

        dispatch(disregardTicket(ticketId));
    };

    const handleTabChange = (tab: 'tickets' | 'punishment') => {
        setActiveTab(tab);
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
    };

    const handleRefreshData = () => {
        if (restaurantId) {
            dispatch(fetchRestaurantTickets(Number(restaurantId)));
            if (activeTab === 'punishment') {
                dispatch(fetchPunishmentHistory(Number(restaurantId)));
                dispatch(fetchRestaurantStatus(Number(restaurantId)));
            }
        }
    };

    // Get tickets for the current restaurant, or an empty array if not loaded yet
    const tickets = (restaurantId && restaurantTickets[restaurantId]) || [];

    // Filter tickets based on selected status
    const filteredTickets = statusFilter === 'all'
        ? tickets
        : tickets.filter(ticket => ticket.status === statusFilter);

    // Split tickets into active and resolved
    const activeTickets = tickets.filter(ticket => ticket.status !== 'RESOLVED');
    const resolvedTickets = tickets.filter(ticket => ticket.status === 'RESOLVED');

    // Get restaurant's punishment history, or an empty array if not loaded yet
    const punishments = (restaurantId && punishmentHistory[restaurantId]) || [];

    // Check if restaurant is active from the status state
    const isRestaurantActive = restaurantId && restaurantStatus[restaurantId]?.is_active;

    // Determine overall loading and error state
    const isLoading = loading || ticketsLoading || punishmentLoading;
    const errorMessage = error || ticketsError || punishmentError;

    return (
        <div className={styles.restaurantSupportPage}>
            <Header />

            <div className={styles.contentContainer}>
                <div className={styles.navigationHeader}>
                    <button className={styles.backButton} onClick={handleGoBack}>
                        <IoArrowBack /> Back to Tickets
                    </button>
                    <button className={styles.refreshButton} onClick={handleRefreshData}>
                        <IoRefresh /> Refresh Data
                    </button>
                </div>

                {isLoading && !restaurant ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner}></div>
                        <p>Loading restaurant details...</p>
                    </div>
                ) : errorMessage ? (
                    <div className={styles.error}>{errorMessage}</div>
                ) : restaurant ? (
                    <>
                        <div className={styles.restaurantHeader}>
                            {restaurant.image_url && (
                                <div className={styles.restaurantImageContainer}>
                                    <img
                                        src={restaurant.image_url}
                                        alt={restaurant.restaurantName}
                                        className={styles.restaurantImage}
                                    />
                                </div>
                            )}

                            <div className={styles.restaurantInfo}>
                                <h1>
                                    {restaurant.restaurantName}
                                    {!isRestaurantActive && (
                                        <span className={styles.suspendedBadge}>SUSPENDED</span>
                                    )}
                                </h1>
                                <p className={styles.restaurantDescription}>{restaurant.restaurantDescription}</p>
                                <p className={styles.restaurantCategory}>Category: {restaurant.category}</p>
                                {restaurant.rating !== null && (
                                    <p className={styles.restaurantRating}>Rating: {restaurant.rating.toFixed(1)}</p>
                                )}
                            </div>

                            <div className={styles.actionButtons}>
                                <button
                                    className={styles.punishButton}
                                    onClick={handlePunishRestaurant}
                                >
                                    Issue Punishment
                                </button>
                            </div>
                        </div>

                        <div className={styles.tabsContainer}>
                            <div className={styles.tabsHeader}>
                                <button
                                    className={`${styles.tabButton} ${activeTab === 'tickets' ? styles.active : ''}`}
                                    onClick={() => handleTabChange('tickets')}
                                >
                                    Tickets ({tickets.length})
                                </button>
                                <button
                                    className={`${styles.tabButton} ${activeTab === 'punishment' ? styles.active : ''}`}
                                    onClick={() => handleTabChange('punishment')}
                                >
                                    Punishment History ({punishments.length})
                                </button>
                            </div>

                            {activeTab === 'tickets' && (
                                <div className={styles.ticketsContainer}>
                                    <div className={styles.ticketStats}>
                                        <div className={styles.statItem}>
                                            <span className={styles.statLabel}>Active Tickets:</span>
                                            <span className={styles.statValue}>{activeTickets.length}</span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <span className={styles.statLabel}>Resolved Tickets:</span>
                                            <span className={styles.statValue}>{resolvedTickets.length}</span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <span className={styles.statLabel}>Total Tickets:</span>
                                            <span className={styles.statValue}>{tickets.length}</span>
                                        </div>
                                    </div>

                                    <div className={styles.statusFilters}>
                                        <span className={styles.filterLabel}><IoFilter /> Filter:</span>
                                        <button
                                            className={`${styles.filterButton} ${statusFilter === 'all' ? styles.active : ''}`}
                                            onClick={() => handleStatusFilterChange('all')}
                                        >
                                            All
                                        </button>
                                        <button
                                            className={`${styles.filterButton} ${statusFilter === 'PENDING' ? styles.active : ''}`}
                                            onClick={() => handleStatusFilterChange('PENDING')}
                                        >
                                            Active
                                        </button>
                                        <button
                                            className={`${styles.filterButton} ${statusFilter === 'RESOLVED' ? styles.active : ''}`}
                                            onClick={() => handleStatusFilterChange('RESOLVED')}
                                        >
                                            Resolved
                                        </button>
                                    </div>

                                    {ticketsLoading ? (
                                        <div className={styles.loadingContainer}>
                                            <div className={styles.loadingSpinner}></div>
                                            <p>Loading tickets...</p>
                                        </div>
                                    ) : tickets.length === 0 ? (
                                        <div className={styles.noTickets}>
                                            <p>No tickets found for this restaurant</p>
                                        </div>
                                    ) : filteredTickets.length === 0 ? (
                                        <div className={styles.noTickets}>
                                            <p>No {statusFilter.toLowerCase() === 'all' ? '' : statusFilter.toLowerCase()} tickets found</p>
                                        </div>
                                    ) : (
                                        <div className={styles.ticketsList}>
                                            {filteredTickets.map((ticket) => (
                                                <div key={ticket.id} className={styles.ticketCard}>
                                                    <div className={styles.ticketHeader}>
                                                        <span className={styles.ticketId}>Ticket #{ticket.id}</span>
                                                        <span className={`${styles.ticketStatus} ${styles[ticket.status?.toLowerCase() || '']}`}>
                              {ticket.status}
                            </span>
                                                    </div>

                                                    <div className={styles.ticketContent}>
                                                        <p className={styles.ticketDescription}>{ticket.description}</p>

                                                        <div className={styles.ticketMeta}>
                                                            <div className={styles.metaItem}>
                                                                <span className={styles.metaLabel}>Reported:</span>
                                                                <span className={styles.metaValue}>
                                  {new Date(ticket.reported_at).toLocaleString()}
                                </span>
                                                            </div>
                                                            <div className={styles.metaItem}>
                                                                <span className={styles.metaLabel}>User:</span>
                                                                <span className={styles.metaValue}>
                                  {ticket.user_name || `ID: ${ticket.user_id}`}
                                </span>
                                                            </div>
                                                            {ticket.listing_title && (
                                                                <div className={styles.metaItem}>
                                                                    <span className={styles.metaLabel}>Listing:</span>
                                                                    <span className={styles.metaValue}>{ticket.listing_title}</span>
                                                                </div>
                                                            )}
                                                            {ticket.resolved_at && (
                                                                <div className={styles.metaItem}>
                                                                    <span className={styles.metaLabel}>Resolved:</span>
                                                                    <span className={styles.metaValue}>
                                    {new Date(ticket.resolved_at).toLocaleString()}
                                  </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {ticket.status !== 'RESOLVED' && (
                                                        <div className={styles.ticketActions}>
                                                            <button
                                                                className={styles.disregardButton}
                                                                onClick={() => handleDisregardTicket(ticket.id)}
                                                            >
                                                                Disregard Ticket
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'punishment' && (
                                <div className={styles.punishmentContainer}>
                                    <PunishmentHistory restaurantId={Number(restaurantId)} />
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className={styles.notFound}>Restaurant not found</div>
                )}
            </div>
        </div>
    );
};

export default RestaurantSupportPage;