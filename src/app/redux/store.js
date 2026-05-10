import { configureStore, combineReducers } from '@reduxjs/toolkit'
import userReducer from './user/userSlice'
import doctorReducer from './doctor/doctorSlice'
import clinicReducer from './clinic/clinicSlice'
import adminReducer from './admin/adminSlice' 
import loginReducer from './shared/loginSlice'
import { 
  persistStore, 
  persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
 } from 'redux-persist'
import createWebStorage from "redux-persist/lib/storage/createWebStorage"
import themeReducer from './theme/themeSlice'
import { visibilitySlice } from './shared/visibilitySlice'



const createNoopStorage = () => ({
  getItem: async () => null,
  setItem: async (_key, value) => value,
  removeItem: async () => {},
})

const storage =
  typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage()

// Combine all reducers
const rootReducer = combineReducers({
    user: userReducer,
    doctor: doctorReducer,
    clinic: clinicReducer,
    admin: adminReducer,
    login: loginReducer,
    theme: themeReducer,
    visibility: visibilitySlice.reducer
  })


// Create a persist configuration
const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['user', 'doctor', 'clinic', 'admin', 'theme', 'visibility'],
    version: 1,
  }

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Create a store
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: {
        // Ignore redux-persist action types
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      }})
})


export const persistor = typeof window !== "undefined" ? persistStore(store) : null
