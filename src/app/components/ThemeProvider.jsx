export default function ThemeProvider({ children }) {
    // Always use light theme as requested by the user
    const theme = 'light';

    return (
        <div className={theme}>
            <div className='bg-white text-gray-700 min-h-screen'>
                {children}
            </div>
        </div>
    )
}
