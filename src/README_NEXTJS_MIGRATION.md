# Next.js Project Structure Migration Guide

This document outlines the new Next.js project structure and provides guidance for completing the migration from the custom Express server setup.

## Current Structure

The project has been reorganized to follow Next.js App Router conventions:

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public routes with shared layout
│   │   ├── page.jsx       # Home page
│   │   ├── layout.jsx     # Public layout
│   │   └── services/
│   │       └── page.jsx   # Services page
│   ├── (auth)/            # Authentication routes
│   │   └── login/
│   │       └── page.jsx   # Login page
│   ├── (dashboard)/       # User dashboard routes
│   │   └── dashboard/
│   │       └── page.jsx   # Dashboard page
│   ├── (admin)/           # Admin routes
│   │   └── admin/
│   │       └── page.jsx   # Admin dashboard
│   └── api/               # Next.js API Routes
│       ├── test/
│       │   └── route.js   # Test API endpoint
│       ├── users/
│       │   ├── route.js   # Get all users (admin)
│       │   ├── test/
│       │   │   └── route.js # User test endpoint
│       │   └── [userId]/
│       │       └── route.js # User CRUD operations
│       ├── auth/
│       │   ├── login/
│       │   │   └── route.js # Login endpoint
│       │   └── logout/
│       │       └── route.js # Logout endpoint
│       ├── appointments/
│       ├── doctors/
│       ├── clinics/
│       ├── treatments/
│       └── reviews/
├── components/            # Shared React components
├── pages/                 # Legacy page components (to be migrated)
├── server/                # Legacy server code (to be migrated)
└── ...
```

## Migration Progress

### ✅ Completed
- Updated package.json scripts to use standard Next.js commands
- Fixed Turbopack configuration in next.config.js
- Created proper Next.js app directory structure with route groups
- Created basic pages and layouts
- Started converting API routes to Next.js format
- Updated jsconfig.json with proper path aliases

### 🔄 In Progress
- Converting remaining API routes from src/server/api to src/app/api
- Migrating page components to App Router structure
- Removing unused files and directories

### 🔧 To Do
- Convert all remaining API routes
- Migrate all page components to individual route directories
- Update imports to use new structure
- Remove legacy React Router setup
- Clean up unused directories

## API Route Conversion Guide

### Express Route → Next.js Route

**Before (Express):**
```javascript
// src/server/api/routes/user.route.js
import express from 'express'
import { getUser } from '../controllers/user.controller.js'

const router = express.Router()
router.get('/:userId', getUser)
export default router
```

**After (Next.js):**
```javascript
// src/app/api/users/[userId]/route.js
import { NextResponse } from 'next/server'
import { connectDB } from '@/server/api/config/db'
import User from '@/server/api/models/user.model'

export async function GET(request, { params }) {
  try {
    await connectDB()
    const { userId } = params
    const user = await User.findById(userId)
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }
    
    const { password, ...userWithoutPassword } = user._doc
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch user' }, { status: 500 })
  }
}
```

## Page Migration Guide

### React Router Page → Next.js Page

**Before (React Router):**
```javascript
// src/app/pages/Login.jsx
const Login = () => {
  return <div>Login Component</div>
}
export default Login
```

**After (Next.js):**
```javascript
// src/app/(auth)/login/page.jsx
import Login from '@/pages/Login'

export default function LoginPage() {
  return <Login />
}
```

## Path Aliases

The jsconfig.json has been updated with comprehensive path aliases:

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["components/*"],
      "@/pages/*": ["pages/*"],
      "@/hooks/*": ["hooks/*"],
      "@/utils/*": ["utils/*"],
      "@/lib/*": ["lib/*"],
      "@/app/*": ["app/*"],
      "@/server/*": ["server/*"]
    }
  }
}
```

## Next Steps

1. **Continue API Migration**: Convert remaining routes in src/server/api/routes/ to Next.js API routes
2. **Migrate Pages**: Move page components from src/app/pages/ to appropriate route directories
3. **Remove Legacy Code**: Delete unused React Router setup and custom server files
4. **Update Imports**: Ensure all imports use the new path aliases
5. **Test Thoroughly**: Verify all functionality works with the new structure

## Testing

To test the current migration:

```bash
npm run dev
```

Visit:
- http://localhost:3000/ - Home page
- http://localhost:3000/services - Services page
- http://localhost:3000/login - Login page
- http://localhost:3000/api/test - Test API endpoint
- http://localhost:3000/api/users/test - User test API endpoint

## Common Issues

1. **Import Errors**: Ensure path aliases are used correctly
2. **MongoDB Connection**: Make sure connectDB() is called in API routes
3. **Authentication**: Implement proper auth middleware for protected routes
4. **Static Assets**: Move assets to public/ directory if needed

This migration will result in a cleaner, more maintainable Next.js application that follows official conventions and best practices.