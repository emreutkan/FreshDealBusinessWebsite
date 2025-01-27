import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button} from "@mui/material";
import {AppDispatch} from "../../../../redux/store";
import {
    addListing,
    editListing,
} from "../../../../redux/thunks/listingThunks";
import styles from "./ListingModel.module.css";
import {AddListingPayload, Listing} from "../../../../types/listingRelated.ts";
import {RootState} from "@reduxjs/toolkit/query";


interface ListingModelProps {
    restaurantId: number,
    onClose?: () => void,
    listing?: Listing,
    isEditing?: boolean,
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
    const [invalidFields, setInvalidFields] = useState<string[]>([]);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const restaurant = useSelector((state: RootState) => state.restaurant.ownedRestaurants.find(
        (restaurant: { id: number; }) => restaurant.id === restaurantId
    ));


    useEffect(() => {
        if (isEditing && listing) {
            // Set form data for editing
            setFormData({
                title: listing.title || "",
                description: listing.description || "",
                original_price: listing.original_price ? listing.original_price.toString() : "",
                pick_up_price: listing.pick_up_price ? listing.pick_up_price.toString() : "",
                delivery_price: listing.delivery_price ? listing.delivery_price.toString() : "",
                count: listing.count ? listing.count.toString() : "",
                consume_within: listing.consume_within ? listing.consume_within.toString() : "",
            });
        } 
    }, [isEditing, listing]);
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
        setInvalidFields((prev) => prev.filter((field) => field !== name));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            const file = e.target.files[0];
            const allowedTypes = ["image/png", "image/jpeg"];
            if (!allowedTypes.includes(file.type)) {
                alert("Only PNG and JPEG images are allowed.");
                return;
            }
            setUploadedFile(file);
            setInvalidFields((prev) => prev.filter((f) => f !== "image"));
        }
    };

    const validateForm = () => {
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

        // Only require image upload for new listings
        if (!isEditing && !uploadedFile) {
            invalids.push("image");
        }

        setInvalidFields(invalids);
        return invalids.length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            alert("Please fill in all required fields correctly.");
            return;
        }

        const payload: AddListingPayload = {
            restaurantId,
            title: formData.title,
            description: formData.description,
            originalPrice: parseFloat(formData.original_price),
            pickUpPrice: formData.pick_up_price ? parseFloat(formData.pick_up_price) : undefined,
            deliveryPrice: formData.delivery_price ? parseFloat(formData.delivery_price) : undefined,
            count: parseInt(formData.count),
            consumeWithin: parseInt(formData.consume_within),
            image: uploadedFile as File,
        };

        try {
            if (isEditing && listing) {
                await dispatch(editListing({
                    ...payload,
                    listingId: listing.id,
                    ...(uploadedFile ? { image: uploadedFile } : {})
                })).unwrap();
                alert("Listing updated successfully!");
            } else {
                await dispatch(addListing(payload)).unwrap();
                alert("Listing added successfully!");
            }
            onClose?.();
        } catch (error) {
            alert(`Failed to ${isEditing ? 'update' : 'add'} listing: ${error}`);
        }
    };


    const isInvalid = (fieldName: string): boolean =>
        invalidFields.includes(fieldName);

    return (
        <div className={styles.container}>
            <h2>{isEditing ? 'Edit Listing' : 'Add New Listing'}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <input
                        name="title"
                        className={`${styles.input} ${isInvalid("title") ? styles.invalid : ""}`}
                        placeholder="Listing Title"
                        value={formData.title}
                        onChange={handleChange}
                    />

                    <textarea
                        name="description"
                        className={styles.textarea}
                        placeholder="Description (optional)"
                        value={formData.description}
                        onChange={handleChange}
                    />

                    <div className={styles.priceGroup}>
                        <input
                            name="original_price"  // Changed from originalPrice to match your formData structure
                            type="number"
                            className={`${styles.input} ${isInvalid("originalPrice") ? styles.invalid : ""}`}
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
                                placeholder="Pickup Price (optional)"
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
                                placeholder="Delivery Price (optional)"
                                value={formData.delivery_price}
                                onChange={handleChange}
                            />
                        )}
                    </div>

                    <div className={styles.countGroup}>
                        <input
                            name="count"
                            type="number"
                            className={`${styles.input} ${isInvalid("count") ? styles.invalid : ""}`}
                            placeholder="Available Count"
                            value={formData.count}
                            onChange={handleChange}
                        />
                        <input
                            name="consume_within"
                            type="number"
                            className={`${styles.input} ${isInvalid("consumeWithin") ? styles.invalid : ""}`}
                            placeholder="Consume Within (days)"
                            value={formData.consume_within}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={`${styles.fileUpload} ${isInvalid("image") ? styles.invalid : ""}`}>
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
                                    ? "Change Listing Image (optional)"
                                    : "Upload Listing Image"}
                        </label>
                        {isEditing && listing?.imageUrl && !uploadedFile && (
                            <div className={styles.currentImage}>
                                <img
                                    src={listing.imageUrl}
                                    alt="Current listing"
                                    className={styles.previewImage}
                                />
                            </div>
                        )}
                    </div>

                    <div className={styles.buttonGroup}>
                        <Button
                            type="submit"
                            className={styles.submitButton}
                            style={{
                                backgroundColor: "#b0f484",
                                color: "white",
                                textTransform: "none",
                            }}
                        >
                            {isEditing ? 'Save Changes' : 'Add Listing'}
                        </Button>
                        {onClose && (
                            <Button
                                onClick={onClose}
                                className={styles.cancelButton}
                                style={{
                                    backgroundColor: "#f0f0f0",
                                    color: "#333",
                                    textTransform: "none",
                                }}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ListingModel;