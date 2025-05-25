import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@mui/material";
import { AppDispatch } from "../../../../redux/store";
import {
    addListing,
    editListing,
} from "../../../../redux/thunks/listingThunks";
import styles from "./ListingModel.module.css";
import { AddListingPayload, Listing } from "../../../../types/listingRelated.ts";
import { RootState } from "../../../../redux/store";

interface ListingModelProps {
    restaurantId: number;
    onClose?: () => void;
    listing?: Listing;
    isEditing?: boolean;
}

interface FormData {
    title: string;
    description: string;
    original_price: string;
    pick_up_price: string;
    delivery_price: string;
    count: string;
    consume_within: string;
}

const initialFormData: FormData = {
    title: "",
    description: "",
    original_price: "",
    pick_up_price: "",
    delivery_price: "",
    count: "",
    consume_within: "",
};

const ListingModel: React.FC<ListingModelProps> = ({
                                                       restaurantId,
                                                       onClose,
                                                       listing,
                                                       isEditing = false,
                                                   }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [invalidFields, setInvalidFields] = useState<string[]>([]);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [isExiting, setIsExiting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const restaurant = useSelector((state: RootState) =>
        state.restaurant.ownedRestaurants.find(
            (restaurant: { id: string }) => restaurant.id === Number(restaurantId)
        )
    );

    useEffect(() => {
        if (isEditing && listing) {
            setFormData({
                title: listing.title || "",
                description: listing.description || "",
                original_price: listing.original_price
                    ? listing.original_price.toString()
                    : "",
                pick_up_price: listing.pick_up_price
                    ? listing.pick_up_price.toString()
                    : "",
                delivery_price: listing.delivery_price
                    ? listing.delivery_price.toString()
                    : "",
                count: listing.count ? listing.count.toString() : "",
                consume_within: listing.consume_within
                    ? listing.consume_within.toString()
                    : "",
            });
        }
    }, [isEditing, listing]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose?.();
        }, 300);
    };

    const validateNumber = (value: string, fieldName: string): boolean => {
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) {
            setError(`${fieldName} must be a positive number`);
            return false;
        }
        return true;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
        setInvalidFields((prev) => prev.filter((field) => field !== name));
        setError(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            const file = e.target.files[0];
            const allowedTypes = ["image/png", "image/jpeg"];
            if (!allowedTypes.includes(file.type)) {
                setError("Only PNG and JPEG images are allowed");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError("Image size must be less than 5MB");
                return;
            }
            setUploadedFile(file);

            // Create image preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);

            setInvalidFields((prev) => prev.filter((f) => f !== "image"));
            setError(null);
        }
    };

    // Clean up object URL when component unmounts or when file changes
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const validateForm = (): boolean => {
        const requiredFields = [
            "title",
            "original_price",
            "count",
            "consume_within"
        ];

        const invalids: string[] = [];
        requiredFields.forEach((field) => {
            if (!formData[field as keyof typeof formData]) {
                invalids.push(field);
            }
        });

        if (!isEditing && !uploadedFile) {
            invalids.push("image");
        }

        if (invalids.length > 0) {
            setError("Please fill in all required fields");
            setInvalidFields(invalids);
            return false;
        }

        if (!validateNumber(formData.original_price, "Original price")) return false;
        if (formData.pick_up_price && !validateNumber(formData.pick_up_price, "Pickup price")) return false;
        if (formData.delivery_price && !validateNumber(formData.delivery_price, "Delivery price")) return false;
        if (!validateNumber(formData.count, "Count")) return false;
        if (!validateNumber(formData.consume_within, "Consume within")) return false;

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        try {
            const payload: AddListingPayload = {
                restaurantId,
                title: formData.title,
                description: formData.description,
                originalPrice: parseFloat(formData.original_price),
                pickUpPrice: formData.pick_up_price
                    ? parseFloat(formData.pick_up_price)
                    : undefined,
                deliveryPrice: formData.delivery_price
                    ? parseFloat(formData.delivery_price)
                    : undefined,
                count: parseInt(formData.count),
                consumeWithin: parseInt(formData.consume_within),
                image: uploadedFile as File,
            };

            if (isEditing && listing) {
                await dispatch(
                    editListing({
                        ...payload,
                        listingId: listing.id,
                        ...(uploadedFile ? {image: uploadedFile} : {}),
                    })
                ).unwrap();
            } else {
                await dispatch(addListing(payload)).unwrap();
            }
            handleClose();
        } catch (err: any) {
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError(`Failed to ${isEditing ? "update" : "add"} listing`);
            }
        }
    };

    const isInvalid = (fieldName: string): boolean =>
        invalidFields.includes(fieldName);

    if (!restaurant) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorMessage}>Restaurant not found</div>
                {onClose && (
                    <Button onClick={onClose} className={styles.errorButton}>
                        Go Back
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className={`${styles.pageContainer} ${isExiting ? styles.exitAnimation : ""}`}>
            <div className={styles.restaurantHeader}>
                <div className={styles.restaurantInfo}>
                    <img
                        src={restaurant.image_url}
                        alt={restaurant.restaurantName}
                        className={styles.restaurantImage}
                    />
                    <div className={styles.restaurantDetails}>
                        <h1>{restaurant.restaurantName}</h1>
                        <p>{restaurant.category}</p>
                        <p className={styles.timestamp}>
                            {new Date().toLocaleString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                    </div>
                </div>
                {onClose && (
                    <Button
                        onClick={handleClose}
                        className={styles.backButton}
                    >
                        Back to Restaurant
                    </Button>
                )}
            </div>

            <div className={styles.container}>
                <div className={styles.formWrapper}>
                    <h2>{isEditing ? "Edit Listing" : "Add New Listing"}</h2>
                    {error && <div className={styles.errorMessage}>{error}</div>}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <div className={styles.section}>
                                <input
                                    name="title"
                                    className={`${styles.input} ${
                                        isInvalid("title") ? styles.invalid : ""
                                    }`}
                                    placeholder="Listing Title"
                                    value={formData.title}
                                    onChange={handleChange}
                                />

                                <textarea
                                    name="description"
                                    className={styles.textarea}
                                    placeholder="Description"
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className={styles.section}>
                                <div className={styles.priceGroup}>
                                    <input
                                        name="original_price"
                                        type="number"
                                        className={`${styles.input} ${
                                            isInvalid("original_price") ? styles.invalid : ""
                                        }`}
                                        placeholder="Original Price"
                                        value={formData.original_price}
                                        onChange={handleChange}
                                    />
                                    {restaurant.pickup && (
                                        <input
                                            name="pick_up_price"
                                            type="number"
                                            step="0.01"
                                            className={styles.input}
                                            placeholder="Pickup Price"
                                            value={formData.pick_up_price}
                                            onChange={handleChange}
                                        />
                                    )}
                                    {restaurant.delivery && (
                                        <input
                                            name="delivery_price"
                                            type="number"
                                            step="0.01"
                                            className={styles.input}
                                            placeholder="Delivery Price"
                                            value={formData.delivery_price}
                                            onChange={handleChange}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className={styles.section}>
                                <div className={styles.countGroup}>
                                    <input
                                        name="count"
                                        type="number"
                                        className={`${styles.input} ${
                                            isInvalid("count") ? styles.invalid : ""
                                        }`}
                                        placeholder="Available Count"
                                        value={formData.count}
                                        onChange={handleChange}
                                    />
                                    <input
                                        name="consume_within"
                                        type="number"
                                        className={`${styles.input} ${
                                            isInvalid("consume_within") ? styles.invalid : ""
                                        }`}
                                        placeholder="Consume Within (hours)"
                                        value={formData.consume_within}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className={`${styles.section} ${styles.fileUploadSection}`}>
                                <div
                                    className={`${styles.fileUpload} ${
                                        isInvalid("image") ? styles.invalid : ""
                                    }`}
                                >
                                    <div className={styles.uploadContainer}>
                                        <input
                                            type="file"
                                            id="listingImage"
                                            className={styles.fileInput}
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        <label htmlFor="listingImage" className={styles.fileLabel}>
                                            {uploadedFile
                                                ? uploadedFile.name
                                                : isEditing
                                                    ? "Change Listing Image"
                                                    : "Upload Listing Image"}
                                        </label>

                                        <div className={styles.imagePreviewContainer}>
                                            {/* Show new image preview if available */}
                                            {imagePreview && (
                                                <div className={styles.imagePreview}>
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className={styles.thumbnailPreview}
                                                    />
                                                </div>
                                            )}

                                            {/* Show current image if editing and no new image uploaded */}
                                            {isEditing && listing?.image_url && !uploadedFile && (
                                                <div className={styles.currentImage}>
                                                    <img
                                                        src={listing.image_url}
                                                        alt="Current listing"
                                                        className={styles.thumbnailPreview}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.buttonGroup}>
                                <Button type="submit" className={styles.submitButton}>
                                    {isEditing ? "Save Changes" : "Add Listing"}
                                </Button>
                                {onClose && (
                                    <Button
                                        onClick={handleClose}
                                        className={styles.cancelButton}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ListingModel;