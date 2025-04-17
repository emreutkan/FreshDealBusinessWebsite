import { createSlice } from '@reduxjs/toolkit';
import { addListing, getListings, searchListings, deleteListing } from "./../thunks/listingThunks";

interface Listing {
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

interface ListingState {
    listings: Listing[];
    userListings: Listing[];
    loading: boolean;
    error: string | null;
    searchResults: Listing[];
    pagination: {
        total: number;
        pages: number;
        currentPage: number;
        perPage: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

const initialState: ListingState = {
    listings: [],
    userListings: [],
    loading: false,
    error: null,
    searchResults: [],
    pagination: {
        total: 0,
        pages: 0,
        currentPage: 1,
        perPage: 10,
        hasNext: false,
        hasPrev: false
    }
};

const listingSlice = createSlice({
    name: 'listing',
    initialState,
    reducers: {
        clearListingError: (state) => {
            state.error = null;
        },
        clearSearchResults: (state) => {
            state.searchResults = [];
        },
    },
    extraReducers: (builder) => {
        // Add Listing
        builder
            .addCase(addListing.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addListing.fulfilled, (state, action) => {
                state.loading = false;
                state.userListings.push(action.payload.listing);
            })
            .addCase(addListing.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

        // Get Listings
        builder
            .addCase(getListings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getListings.fulfilled, (state, action) => {
                state.loading = false;
                state.listings = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getListings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

        // Search Listings
        builder
            .addCase(searchListings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchListings.fulfilled, (state, action) => {
                state.loading = false;
                state.searchResults = action.payload.results;
            })
            .addCase(searchListings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

        // Delete Listing
        builder
            .addCase(deleteListing.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteListing.fulfilled, (state, action) => {
                state.loading = false;
                state.userListings = state.userListings.filter(
                    listing => listing.id !== action.payload.listingId
                );
                state.listings = state.listings.filter(
                    listing => listing.id !== action.payload.listingId
                );
            })
            .addCase(deleteListing.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearListingError, clearSearchResults } = listingSlice.actions;
export default listingSlice.reducer;