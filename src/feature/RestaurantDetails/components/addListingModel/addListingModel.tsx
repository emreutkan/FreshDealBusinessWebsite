import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@mui/material";
import { AppDispatch } from "../../../../redux/store";
import { addListing, AddListingPayload } from "../../../../redux/thunks/listingThunks";
import styles from "./addListingModel.module.css";  // You'll need to create this CSS module

interface AddListingModelProps {
    restaurantId: number;
    onClose?: () => void;
}

const AddListingModel: React.FC<AddListingModelProps> = ({ restaurantId, onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [invalidFields, setInvalidFields] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        originalPrice: "",
        pickUpPrice: "",
        deliveryPrice: "",
        count: "",
        consumeWithin: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
            "originalPrice",
            "count",
            "consumeWithin"
        ];

        const invalids: string[] = [];
        requiredFields.forEach((field) => {
            if (!formData[field as keyof typeof formData]) {
                invalids.push(field);
            }
        });

        if (!uploadedFile) {
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
            originalPrice: parseFloat(formData.originalPrice),
            pickUpPrice: formData.pickUpPrice ? parseFloat(formData.pickUpPrice) : undefined,
            deliveryPrice: formData.deliveryPrice ? parseFloat(formData.deliveryPrice) : undefined,
            count: parseInt(formData.count),
            consumeWithin: parseInt(formData.consumeWithin),
            image: uploadedFile as File,
        };

        try {
            await dispatch(addListing(payload)).unwrap();
            alert("Listing added successfully!");
            onClose?.();
        } catch (error) {
            alert(`Failed to add listing: ${error}`);
        }
    };

    const isInvalid = (fieldName: string): boolean =>
        invalidFields.includes(fieldName);

    return (
        <div className={styles.container}>
            <h2>Add New Listing</h2>
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
                            name="originalPrice"
                            type="number"
                            step="0.01"
                            className={`${styles.input} ${isInvalid("originalPrice") ? styles.invalid : ""}`}
                            placeholder="Original Price"
                            value={formData.originalPrice}
                            onChange={handleChange}
                        />
                        <input
                            name="pickUpPrice"
                            type="number"
                            step="0.01"
                            className={styles.input}
                            placeholder="Pickup Price (optional)"
                            value={formData.pickUpPrice}
                            onChange={handleChange}
                        />
                        <input
                            name="deliveryPrice"
                            type="number"
                            step="0.01"
                            className={styles.input}
                            placeholder="Delivery Price (optional)"
                            value={formData.deliveryPrice}
                            onChange={handleChange}
                        />
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
                            name="consumeWithin"
                            type="number"
                            className={`${styles.input} ${isInvalid("consumeWithin") ? styles.invalid : ""}`}
                            placeholder="Consume Within (days)"
                            value={formData.consumeWithin}
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
                            {uploadedFile ? uploadedFile.name : "Upload Listing Image"}
                        </label>
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
                            Add Listing
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

export default AddListingModel;