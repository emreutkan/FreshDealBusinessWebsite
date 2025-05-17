import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styles from './SupportDashboard.module.css';
import { RootState, AppDispatch } from '../../../redux/store';
import Header from '../../Header/Header';
import { IoFilter, IoCloseCircleOutline, IoBan, IoLocationOutline, IoSearch, IoRefresh, IoStatsChartOutline } from 'react-icons/io5';
import { API_BASE_URL } from "../../../redux/Api/apiService.ts";
import { fetchAllTickets, disregardTicket } from '../../../redux/slices/ticketSlice';

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

const SupportDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { token, role } = useSelector((state: RootState) => state.user);
    const { tickets, loading: ticketsLoading, error: ticketsError } = useSelector((state: RootState) => state.tickets);

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchRadius, setSearchRadius] = useState<number>(500); // Default 50km radius
    const [activeTab, setActiveTab] = useState<'restaurants' | 'tickets'>('tickets');
    const [searchQuery, setSearchQuery] = useState<string>('');

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

    // Fetch tickets data using Redux
    useEffect(() => {
        if (token && role === 'support') {
            dispatch(fetchAllTickets());
        }
    }, [token, role, dispatch]);

    // Fetch initial restaurants in Turkey with token
    useEffect(() => {
        const fetchRestaurantsInTurkey = async () => {
            if (!token) return; // Don't proceed without token

            try {
                setLoading(true);

                const response = await fetch(`${API_BASE_URL}/restaurants/proximity`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
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

        if (activeTab === 'restaurants') {
            fetchRestaurantsInTurkey();
        }
    }, [token, searchRadius, activeTab]);

    const handleSearchRadiusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSearchRadius(Number(e.target.value));
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
    };

    const handleTabChange = (tab: 'restaurants' | 'tickets') => {
        setActiveTab(tab);
    };

    const handleDisregardTicket = (ticketId: number) => {
        if (!window.confirm('Are you sure you want to disregard this ticket?')) return;

        dispatch(disregardTicket(ticketId));
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

    const handleViewRestaurantDetails = (restaurantId: number) => {
        navigate(`/restaurant-support/${restaurantId}`);
    };

    const handleRefreshData = () => {
        if (activeTab === 'tickets') {
            dispatch(fetchAllTickets());
        } else {
            // Refresh restaurants data
            if (token) {
                setLoading(true);
                fetch(`${API_BASE_URL}/restaurants/proximity`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        latitude: TURKEY_COORDS.latitude,
                        longitude: TURKEY_COORDS.longitude,
                        radius: searchRadius
                    })
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to fetch restaurants: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.restaurants && Array.isArray(data.restaurants)) {
                            setRestaurants(data.restaurants);
                        } else {
                            setRestaurants([]);
                        }
                        setError(null);
                    })
                    .catch(err => {
                        console.error('Error refreshing restaurants:', err);
                        setError('Failed to refresh restaurants. Please try again.');
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            }
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            // Implement search functionality based on the active tab
            if (activeTab === 'tickets') {
                // Search tickets
                dispatch(searchTickets(searchQuery.trim()));
            } else {
                // Search restaurants - implement this if your API supports restaurant search
                setError('Restaurant search is not implemented yet');
            }
        } else {
            if (activeTab === 'tickets') {
                dispatch(fetchAllTickets());
            }
            // Reset restaurant search if implemented
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        if (activeTab === 'tickets') {
            dispatch(fetchAllTickets());
        }
        // Reset restaurant search if implemented
    };

    // Filter tickets based on selected status
    const filteredTickets = statusFilter === 'all'
        ? tickets
        : tickets.filter(ticket => ticket.status === statusFilter);

    // Separate tickets by status
    const activeTickets = tickets.filter(ticket => ticket.status !== 'RESOLVED' && ticket.status !== 'REJECTED');
    const inactiveTickets = tickets.filter(ticket => ticket.status === 'REJECTED');
    const resolvedTickets = tickets.filter(ticket => ticket.status === 'RESOLVED');

    return (
        <div className={styles.supportDashboardPage}>
            <Header />

            <div className={styles.contentContainer}>
                <div className={styles.pageHeader}>
                    <h1>Support Team Dashboard</h1>
                    <div className={styles.dashboardActions}>
                        <button
                            className={styles.refreshButton}
                            onClick={handleRefreshData}
                        >
                            <IoRefresh /> Refresh Data
                        </button>
                    </div>
                </div>

                {/* Statistics Summary */}
                <div className={styles.statisticsRow}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}><IoStatsChartOutline /></div>
                        <div className={styles.statValue}>{activeTickets.length}</div>
                        <div className={styles.statLabel}>Active Tickets</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}><IoStatsChartOutline /></div>
                        <div className={styles.statValue}>{inactiveTickets.length}</div>
                        <div className={styles.statLabel}>Inactive Tickets</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}><IoStatsChartOutline /></div>
                        <div className={styles.statValue}>{resolvedTickets.length}</div>
                        <div className={styles.statLabel}>Resolved Tickets</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}><IoStatsChartOutline /></div>
                        <div className={styles.statValue}>{restaurants.length}</div>
                        <div className={styles.statLabel}>Restaurants</div>
                    </div>
                </div>

                {/* Search bar */}
                <div className={styles.searchBar}>
                    <div className={styles.searchInputWrapper}>
                        <IoSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab === 'tickets' ? 'tickets' : 'restaurants'}...`}
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyPress={handleKeyPress}
                            className={styles.searchInput}
                        />
                        {searchQuery && (
                            <button className={styles.clearButton} onClick={clearSearch}>
                                <IoClose />
                            </button>
                        )}
                    </div>
                    <button className={styles.searchButton} onClick={handleSearch}>
                        Search
                    </button>
                </div>

                {(error || ticketsError) && <div className={styles.error}>{error || ticketsError}</div>}

                {/* Navigation tabs */}
                <div className={styles.tabsContainer}>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'tickets' ? styles.activeTab : ''}`}
                        onClick={() => handleTabChange('tickets')}
                    >
                        Tickets ({tickets.length})
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'restaurants' ? styles.activeTab : ''}`}
                        onClick={() => handleTabChange('restaurants')}
                    >
                        Restaurants
                    </button>
                </div>

                {/* Tickets Tab Content */}
                {activeTab === 'tickets' && (
                    <div className={styles.ticketsSection}>
                        <div className={styles.ticketsHeader}>
                            <div className={styles.statusFilters}>
                                <div className={styles.filterLabel}>
                                    <IoFilter /> Filter by status:
                                </div>
                                <div className={styles.filterOptions}>
                                    <button
                                        className={`${styles.filterButton} ${statusFilter === 'all' ? styles.active : ''}`}
                                        onClick={() => handleStatusFilterChange('all')}
                                    >
                                        All ({tickets.length})
                                    </button>
                                    <button
                                        className={`${styles.filterButton} ${statusFilter === 'PENDING' ? styles.active : ''}`}
                                        onClick={() => handleStatusFilterChange('PENDING')}
                                    >
                                        Pending ({activeTickets.filter(t => t.status === 'PENDING').length})
                                    </button>
                                    <button
                                        className={`${styles.filterButton} ${statusFilter === 'ACCEPTED' ? styles.active : ''}`}
                                        onClick={() => handleStatusFilterChange('ACCEPTED')}
                                    >
                                        Accepted ({activeTickets.filter(t => t.status === 'ACCEPTED').length})
                                    </button>
                                    <button
                                        className={`${styles.filterButton} ${statusFilter === 'COMPLETED' ? styles.active : ''}`}
                                        onClick={() => handleStatusFilterChange('COMPLETED')}
                                    >
                                        Completed ({activeTickets.filter(t => t.status === 'COMPLETED').length})
                                    </button>
                                    <button
                                        className={`${styles.filterButton} ${statusFilter === 'REJECTED' ? styles.active : ''}`}
                                        onClick={() => handleStatusFilterChange('REJECTED')}
                                    >
                                        Rejected ({inactiveTickets.length})
                                    </button>
                                </div>
                            </div>
                        </div>

                        {ticketsLoading ? (
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
                                                <span className={styles[`${ticket.status?.toLowerCase() || 'pending'}Status`]}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={styles.ticketBody}>
                                            <div className={styles.restaurantInfo}>
                                                <button
                                                    className={styles.viewRestaurantLink}
                                                    onClick={() => handleViewRestaurantDetails(ticket.restaurant_id)}
                                                >
                                                    {ticket.restaurant_name || `Restaurant #${ticket.restaurant_id}`}
                                                </button>
                                            </div>
                                            <div className={styles.ticketDescription}>
                                                {ticket.description}
                                            </div>
                                            <div className={styles.ticketDetails}>
                                                {ticket.listing_title && (
                                                    <div className={styles.ticketDetail}>
                                                        <span className={styles.detailLabel}>Listing:</span>
                                                        <span className={styles.detailValue}>{ticket.listing_title}</span>
                                                    </div>
                                                )}
                                                <div className={styles.ticketDetail}>
                                                    <span className={styles.detailLabel}>Date:</span>
                                                    <span className={styles.detailValue}>
                                                        {new Date(ticket.reported_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className={styles.ticketDetail}>
                                                    <span className={styles.detailLabel}>User:</span>
                                                    <span className={styles.detailValue}>{ticket.user_name || ticket.user_id}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.ticketActions}>
                                            <button
                                                className={styles.viewButton}
                                                onClick={() => handleViewRestaurantDetails(ticket.restaurant_id)}
                                            >
                                                View Restaurant
                                            </button>
                                            {ticket.status === 'PENDING' && (
                                                <button
                                                    className={styles.disregardButton}
                                                    onClick={() => handleDisregardTicket(ticket.id)}
                                                >
                                                    <IoCloseCircleOutline /> Disregard
                                                </button>
                                            )}
                                            {(ticket.status === 'PENDING' || ticket.status === 'ACCEPTED') && (
                                                <button
                                                    className={styles.punishButton}
                                                    onClick={() => handlePunishRestaurant(ticket.restaurant_id)}
                                                >
                                                    <IoBan /> Punish
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Restaurants Tab Content */}
                {activeTab === 'restaurants' && (
                    <div className={styles.restaurantsSection}>
                        <div className={styles.sectionHeader}>
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

                        {loading ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.loadingSpinner}></div>
                                <p>Loading restaurants...</p>
                            </div>
                        ) : restaurants.length === 0 ? (
                            <div className={styles.noResults}>
                                <p>No restaurants found within {searchRadius/10} km radius. Try increasing the search radius.</p>
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
                                                className={styles.viewButton}
                                                onClick={() => handleViewRestaurantDetails(restaurant.id)}
                                            >
                                                View Details
                                            </button>
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
                )}
            </div>
        </div>
    );
};

export default SupportDashboardPage;