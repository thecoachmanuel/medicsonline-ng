import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    theme: 'light',
}

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        // Theme toggle removed as per user request to stick to light theme
    }
})

    export const { } = themeSlice.actions

    export default themeSlice.reducer
