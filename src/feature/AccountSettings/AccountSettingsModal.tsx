import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    updateEmail,
    updatePassword,
    updateUsername
} from '../../redux/thunks/userThunks';
import { logout } from '../../redux/slices/userSlice';
import { RootState, AppDispatch } from '../../redux/store';
import styles from './AccountSettingsModal.module.css';
import { IoCloseOutline, IoPersonOutline, IoMailOutline, IoKeyOutline, IoLogOutOutline } from 'react-icons/io5';

interface AccountSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { name_surname, email, phoneNumber, loading } = useSelector((state: RootState) => state.user);

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedValues, setEditedValues] = useState({
        name_surname: '',
        email: '',
    });

    // Update local state when user data changes
    useEffect(() => {
        setEditedValues({
            name_surname: name_surname || '',
            email: email || '',
        });
    }, [name_surname, email]);

    // Handle modal close
    const handleClose = () => {
        setIsEditing(false);
        onClose();
    };

    // Handle edit mode toggle
    const handleEditToggle = () => {
        if (isEditing) {
            handleSaveChanges();
        } else {
            setIsEditing(true);
        }
    };

    // Handle saving changes
    const handleSaveChanges = async () => {
        if (window.confirm('Do you want to save these changes?')) {
            const updates = [];

            if (editedValues.name_surname !== name_surname) {
                updates.push(dispatch(updateUsername({ newUsername: editedValues.name_surname })));
            }

            if (editedValues.email !== email) {
                updates.push(dispatch(updateEmail({
                    oldEmail: email || '',
                    newEmail: editedValues.email
                })));
            }

            if (updates.length > 0) {
                try {
                    const results = await Promise.all(updates);
                    const hasErrors = results.some((result) => result.type.endsWith('/rejected'));

                    if (!hasErrors) {
                        alert('Profile updated successfully');
                        setIsEditing(false);
                    } else {
                        alert('Some updates failed. Please try again.');
                    }
                } catch (error) {
                    alert('Failed to update profile');
                }
            } else {
                setIsEditing(false);
            }
        } else {
            // Cancel editing
            setEditedValues({
                name_surname: name_surname || '',
                email: email || '',
            });
            setIsEditing(false);
        }
    };

    // Handle password reset
    const handlePasswordReset = () => {
        const oldPassword = prompt('Enter your current password');
        if (oldPassword) {
            const newPassword = prompt('Enter your new password');
            if (newPassword) {
                dispatch(updatePassword({
                    oldPassword: oldPassword,
                    newPassword: newPassword,
                }))
                    .then((resultAction) => {
                        if (updatePassword.fulfilled.match(resultAction)) {
                            alert('Password updated successfully');
                        } else {
                            alert(resultAction.payload || 'Failed to update password');
                        }
                    })
                    .catch(() => {
                        alert('Failed to update password');
                    });
            }
        }
    };

    // Handle logout
    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            try {
                localStorage.removeItem('userToken');
                dispatch(logout());
                handleClose();
                window.location.href = '/';
            } catch (error) {
                console.error('Logout failed:', error);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Account Settings</h2>
                    <button className={styles.closeButton} onClick={handleClose}>
                        <IoCloseOutline size={24} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {loading ? (
                        <div className={styles.loadingSpinner}>
                            <div className={styles.spinner}></div>
                            <span>Loading...</span>
                        </div>
                    ) : (
                        <>
                            <div className={styles.profileSection}>
                                <div className={styles.avatarContainer}>
                                    <div className={styles.avatarInitials}>
                                        {name_surname?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                                    </div>
                                </div>
                                <div className={styles.profileInfo}>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className={styles.inputField}
                                            value={editedValues.name_surname}
                                            onChange={(e) => setEditedValues({...editedValues, name_surname: e.target.value})}
                                            placeholder="Full Name"
                                        />
                                    ) : (
                                        <h3 className={styles.userName}>{name_surname}</h3>
                                    )}
                                </div>
                            </div>

                            <div className={styles.infoSection}>
                                <div className={styles.infoItem}>
                                    <div className={styles.infoLabel}><IoMailOutline size={16} /> Email</div>
                                    <div className={styles.infoValue}>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                className={styles.inputField}
                                                value={editedValues.email}
                                                onChange={(e) => setEditedValues({...editedValues, email: e.target.value})}
                                                placeholder="Email address"
                                            />
                                        ) : (
                                            <span>{email}</span>
                                        )}
                                    </div>
                                </div>

                                {phoneNumber && (
                                    <div className={styles.infoItem}>
                                        <div className={styles.infoLabel}>Phone</div>
                                        <div className={styles.infoValue}>{phoneNumber}</div>
                                    </div>
                                )}
                            </div>

                            <div className={styles.actionsSection}>
                                <button
                                    className={`${styles.actionButton} ${isEditing ? styles.saveButton : ''}`}
                                    onClick={handleEditToggle}
                                >
                                    <IoPersonOutline size={18} />
                                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                                </button>

                                <button
                                    className={styles.actionButton}
                                    onClick={handlePasswordReset}
                                >
                                    <IoKeyOutline size={18} />
                                    Change Password
                                </button>

                                <button
                                    className={`${styles.actionButton} ${styles.logoutButton}`}
                                    onClick={handleLogout}
                                >
                                    <IoLogOutOutline size={18} />
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountSettingsModal;