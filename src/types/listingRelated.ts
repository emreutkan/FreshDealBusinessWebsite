


export interface Listing {
    id: number;
    restaurantId: number;
    title: string;
    description?: string;
    image_url: string;
    original_price: number;
    pick_up_price?: number;
    delivery_price?: number;
    count: number;
    consume_within: number;
    availableForDelivery: boolean;
    availableForPickup: boolean;
}


export interface AddListingPayload {
    restaurantId: string;
    title: string;
    description?: string;
    originalPrice: number;
    pickUpPrice?: number;
    deliveryPrice?: number;
    count: number;
    consumeWithin: number;
    image: File;
}

export interface SearchListingParams {
    type: 'listing';
    query: string;
    restaurantId: number;
}

export interface EditListingPayload {
    listingId: number;
    title?: string;
    description?: string;
    originalPrice?: number;
    pickUpPrice?: number;
    deliveryPrice?: number;
    count?: number;
    consumeWithin?: number;
    image?: File;
}
