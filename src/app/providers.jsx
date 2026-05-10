"use client"

import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"

import { store, persistor } from "./redux/store.js"
import ThemeProvider from "./components/ThemeProvider.jsx"

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      {persistor ? (
        <PersistGate persistor={persistor} loading={null}>
          <ThemeProvider>{children}</ThemeProvider>
        </PersistGate>
      ) : (
        <ThemeProvider>{children}</ThemeProvider>
      )}
    </Provider>
  )
}
