import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { format } from 'date-fns';
import styles from './PunishmentHistory.module.css';
import { revertPunishment } from '../../../redux/slices/punishmentSlice';

interface PunishmentProps {
    restaurantId: number;
}

const PunishmentHistory: React.FC<PunishmentProps> = ({ restaurantId }) => {
    const dispatch = useDispatch<AppDispatch>();
    // Get punishment history from Redux store
    const { history, loading, error } = useSelector((state: RootState) => state.punishment);
    const punishments = history[restaurantId] || [];

    const handleRevertPunishment = (punishmentId: number) => {
        const reason = prompt('Please provide a reason for reverting this punishment:');
        if (reason) {
            dispatch(revertPunishment({ punishmentId, restaurantId, reason }));
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading punishment history...</p>
            </div>
        );
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.punishmentHistory}>
            <h2>Punishment History</h2>

            {punishments.length === 0 ? (
                <div className={styles.noPunishments}>No punishment history found for this restaurant.</div>
            ) : (
                <div className={styles.punishmentList}>
                    {punishments.map(punishment => (
                        <div key={punishment.id} className={styles.punishmentCard}>
                            <div className={styles.punishmentHeader}>
                <span className={`${styles.punishmentType} ${punishment.type === 'PERMANENT' ? styles.permanent : styles.temporary}`}>
                  {punishment.type}
                </span>
                                <span className={`${styles.punishmentStatus} ${punishment.is_active ? styles.active : styles.inactive}`}>
                  {punishment.is_active ? 'ACTIVE' : punishment.is_reverted ? 'REVERTED' : 'EXPIRED'}
                </span>
                            </div>

                            <div className={styles.punishmentDetails}>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Duration:</span>
                                    <span className={styles.detailValue}>
                    {punishment.duration_days ? `${punishment.duration_days} days` : 'Permanent'}
                  </span>
                                </div>

                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Start Date:</span>
                                    <span className={styles.detailValue}>
                    {format(new Date(punishment.start_date), 'yyyy-MM-dd HH:mm')}
                  </span>
                                </div>

                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>End Date:</span>
                                    <span className={styles.detailValue}>
                    {punishment.end_date
                        ? format(new Date(punishment.end_date), 'yyyy-MM-dd HH:mm')
                        : punishment.type === 'PERMANENT' ? 'Never' : 'N/A'}
                  </span>
                                </div>

                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Reason:</span>
                                    <span className={styles.detailValue}>
                    {punishment.reason}
                  </span>
                                </div>

                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Issued By:</span>
                                    <span className={styles.detailValue}>
                    {punishment.created_by?.name || `ID: ${punishment.created_by?.id}` || 'Unknown'}
                  </span>
                                </div>

                                {punishment.is_reverted && punishment.reverted_info && (
                                    <>
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Reverted By:</span>
                                            <span className={styles.detailValue}>
                        {punishment.reverted_info.reverted_by?.name || `ID: ${punishment.reverted_info.reverted_by?.id}` || 'Unknown'}
                      </span>
                                        </div>

                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Reversion Reason:</span>
                                            <span className={styles.detailValue}>
                        {punishment.reverted_info.reason || 'No reason provided'}
                      </span>
                                        </div>

                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Reverted On:</span>
                                            <span className={styles.detailValue}>
                        {format(new Date(punishment.reverted_info.reverted_at), 'yyyy-MM-dd HH:mm')}
                      </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {punishment.is_active && !punishment.is_reverted && (
                                <div className={styles.punishmentActions}>
                                    <button
                                        className={styles.revertButton}
                                        onClick={() => handleRevertPunishment(punishment.id)}
                                    >
                                        Revert Punishment
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PunishmentHistory;