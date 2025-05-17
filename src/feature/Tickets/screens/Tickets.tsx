import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './Tickets.module.css';
import { RootState } from '../../../redux/store';
import Header from '../../Header/Header';
import { IoFilter, IoCloseCircleOutline, IoBan, IoLocationOutline } from 'react-icons/io5';
import { API_BASE_URL } from "../../../redux/Api/apiService.ts";

interface Ticket {
    id: number;
    user_id: number;
    restaurant_id: number;
    listing_title: string;
    quantity: number;
    total_price: string;
    purchase_date: string;
    status: string;
    is_delivery: boolean;
}

interface Restaurant {
    id: number;
    restaurantName: string;
    restaurantDescription: string;
    image_url: string;
    rating: number | null;
    category: string;
    distance_km: number;
}

// Default coordinates for Turkey (Ankara)
const TURKEY_COORDS = {
    latitude: 39.9334,
    longitude: 32.8597
};

const TicketsPage: React.FC = () => {
    const navigate = useNavigate();
    const { token, role } = useSelector((state: RootState) => state.user);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchRadius, setSearchRadius] = useState<number>(50); // Default 50km radius

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

    // Fetch tickets data
    useEffect(() => {
        const fetchTickets = async () => {
            if (!token) return; // Ensure token exists before making request

            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/tickets`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch tickets');
                }

                const data = await response.json();
                setTickets(data.tickets || []);
                setError(null);
            } catch (err) {
                console.error('Error fetching tickets:', err);
                setError('Failed to load tickets. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (token && role === 'support') {
            fetchTickets();
        }
    }, [token, role]);

    // Fetch initial restaurants in Turkey with token
    useEffect(() => {
        const fetchRestaurantsInTurkey = async () => {
            if (!token) return; // Don't proceed without token

            try {
                setLoading(true);

                console.log('Fetching restaurants with token:', token);

                const response = await fetch(`${API_BASE_URL}/restaurants/proximity`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Important: Include token in Authorization header
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        latitude: TURKEY_COORDS.latitude,
                        longitude: TURKEY_COORDS.longitude,
                        radius: searchRadius
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API error response:', errorText);
                    throw new Error(`Failed to fetch restaurants: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Restaurants data:', data);

                if (data.restaurants && Array.isArray(data.restaurants)) {
                    setRestaurants(data.restaurants);
                } else {
                    setRestaurants([]);
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching restaurants:', err);
                setError('Failed to load restaurants. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurantsInTurkey();
    }, [token, searchRadius]);

    const handleSearchRadiusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSearchRadius(Number(e.target.value));
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
    };

    const handleDisregardTicket = async (ticketId: number) => {
        if (!token || !window.confirm('Are you sure you want to disregard this ticket?')) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/disregard`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Pass token in the header
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to disregard ticket');
            }

            // Update ticket in the list
            setTickets(tickets.map(ticket =>
                ticket.id === ticketId ? { ...ticket, status: 'REJECTED' } : ticket
            ));

            setError(null);
        } catch (err) {
            console.error('Error disregarding ticket:', err);
            setError('Failed to disregard ticket. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status: string | undefined | null) => {
        if (!status) return '';
        try {
            const statusLower = status.toLowerCase();
            return styles[statusLower] || '';
        } catch (e) {
            console.error("Error getting status class:", e);
            return '';
        }
    };

    const handlePunishRestaurant = (restaurantId: number) => {
        navigate(`/punish-restaurant/${restaurantId}`);
    };

    // Filter tickets based on selected status
    const filteredTickets = statusFilter === 'all'
        ? tickets
        : tickets.filter(ticket => ticket.status === statusFilter);

    return (
        <div className={styles.ticketsPage}>
            <Header />

            <div className={styles.contentContainer}>
                <div className={styles.pageHeader}>
                    <h1>Support Tickets Dashboard</h1>

                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.restaurantsSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Restaurants in Turkey</h2>
                        <div className={styles.radiusSelector}>
                            <IoLocationOutline className={styles.locationIcon} />
                            <label htmlFor="radius">Search radius:</label>
                            <select
                                id="radius"
                                value={searchRadius}
                                onChange={handleSearchRadiusChange}
                                className={styles.radiusSelect}
                            >
                                <option value={100}>10 km</option>
                                <option value={250}>25 km</option>
                                <option value={500}>50 km</option>
                                <option value={1000}>100 km</option>
                                <option value={2000}>200 km</option>
                            </select>
                        </div>
                    </div>

                    {loading && restaurants.length === 0 ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.loadingSpinner}></div>
                            <p>Loading restaurants...</p>
                        </div>
                    ) : restaurants.length === 0 ? (
                        <div className={styles.noResults}>
                            <p>No restaurants found within {searchRadius} km radius. Try increasing the search radius.</p>
                        </div>
                    ) : (
                        <div className={styles.restaurantList}>
                            {restaurants.map(restaurant => (
                                <div key={restaurant.id} className={styles.restaurantCard}>
                                    <div className={styles.restaurantImageWrapper}>
                                        {restaurant.image_url && (
                                            <img
                                                src={restaurant.image_url}
                                                alt={restaurant.restaurantName}
                                                className={styles.restaurantImage}
                                            />
                                        )}
                                    </div>
                                    <div className={styles.restaurantInfo}>
                                        <h3>{restaurant.restaurantName}</h3>
                                        <p className={styles.restaurantDescription}>{restaurant.restaurantDescription}</p>
                                        <p className={styles.restaurantCategory}>{restaurant.category}</p>
                                        <div className={styles.restaurantMeta}>
                                            <span className={styles.rating}>
                                                Rating: {restaurant.rating ? restaurant.rating.toFixed(1) : "No ratings"}
                                            </span>
                                            <span className={styles.distance}>
                                                {restaurant.distance_km.toFixed(1)} km away
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.restaurantActions}>
                                        <button
                                            className={styles.punishButton}
                                            onClick={() => handlePunishRestaurant(restaurant.id)}
                                        >
                                            <IoBan /> Punish Restaurant
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.ticketsSection}>
                    <div className={styles.ticketsHeader}>
                        <h2>Tickets</h2>
                        <div className={styles.statusFilters}>
                            <div className={styles.filterLabel}>
                                <IoFilter /> Filter by status:
                            </div>
                            <div className={styles.filterOptions}>
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
                                    Pending
                                </button>
                                <button
                                    className={`${styles.filterButton} ${statusFilter === 'ACCEPTED' ? styles.active : ''}`}
                                    onClick={() => handleStatusFilterChange('ACCEPTED')}
                                >
                                    Accepted
                                </button>
                                <button
                                    className={`${styles.filterButton} ${statusFilter === 'COMPLETED' ? styles.active : ''}`}
                                    onClick={() => handleStatusFilterChange('COMPLETED')}
                                >
                                    Completed
                                </button>
                                <button
                                    className={`${styles.filterButton} ${statusFilter === 'REJECTED' ? styles.active : ''}`}
                                    onClick={() => handleStatusFilterChange('REJECTED')}
                                >
                                    Rejected
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading && tickets.length === 0 ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.loadingSpinner}></div>
                            <p>Loading tickets...</p>
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className={styles.noTickets}>
                            <p>No tickets found</p>
                        </div>
                    ) : (
                        <div className={styles.ticketsList}>
                            {filteredTickets.map(ticket => (
                                <div
                                    key={ticket.id}
                                    className={`${styles.ticketCard} ${getStatusClass(ticket.status)}`}
                                >
                                    <div className={styles.ticketHeader}>
                                        <div className={styles.ticketId}>Ticket #{ticket.id}</div>
                                        <div className={styles.ticketStatus}>
                                            {ticket.status === 'PENDING' && <span className={styles.pendingStatus}>Pending</span>}
                                            {ticket.status === 'ACCEPTED' && <span className={styles.acceptedStatus}>Accepted</span>}
                                            {ticket.status === 'COMPLETED' && <span className={styles.completedStatus}>Completed</span>}
                                            {ticket.status === 'REJECTED' && <span className={styles.rejectedStatus}>Rejected</span>}
                                        </div>
                                    </div>
                                    <div className={styles.ticketBody}>
                                        <div className={styles.ticketDetail}>
                                            <span className={styles.detailLabel}>Order</span>
                                            <span className={styles.detailValue}>{ticket.listing_title}</span>
                                        </div>
                                        <div className={styles.ticketDetail}>
                                            <span className={styles.detailLabel}>Quantity</span>
                                            <span className={styles.detailValue}>{ticket.quantity}</span>
                                        </div>
                                        <div className={styles.ticketDetail}>
                                            <span className={styles.detailLabel}>Total</span>
                                            <span className={styles.detailValue}>${ticket.total_price}</span>
                                        </div>
                                        <div className={styles.ticketDetail}>
                                            <span className={styles.detailLabel}>Date</span>
                                            <span className={styles.detailValue}>
                                                {new Date(ticket.purchase_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className={styles.ticketDetail}>
                                            <span className={styles.detailLabel}>User ID</span>
                                            <span className={styles.detailValue}>{ticket.user_id}</span>
                                        </div>
                                        <div className={styles.ticketDetail}>
                                            <span className={styles.detailLabel}>Restaurant ID</span>
                                            <span className={styles.detailValue}>{ticket.restaurant_id}</span>
                                        </div>
                                        <div className={styles.ticketDetail}>
                                            <span className={styles.detailLabel}>Delivery</span>
                                            <span className={styles.detailValue}>
                                                {ticket.is_delivery ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.ticketActions}>
                                        {ticket.status === 'PENDING' && (
                                            <button
                                                className={styles.disregardButton}
                                                onClick={() => handleDisregardTicket(ticket.id)}
                                            >
                                                <IoCloseCircleOutline /> Disregard Ticket
                                            </button>
                                        )}
                                        <button
                                            className={styles.punishButton}
                                            onClick={() => handlePunishRestaurant(ticket.restaurant_id)}
                                        >
                                            <IoBan /> Punish Restaurant
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TicketsPage;