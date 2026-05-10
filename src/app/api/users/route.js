import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import User from '@/lib/models/user.model'

// GET /api/users - Get all users (admin only)
export async function GET(request) {
  try {
    await connectDB()
    
    // In a real implementation, you would check if user is admin
    // if (!req.user.isAdmin) {
    //   return NextResponse.json(
    //     { message: 'You are not authorized to perform this action' },
    //     { status: 403 }
    //   )
    // }
    
    const { searchParams } = new URL(request.url)
    const startIndex = parseInt(searchParams.get('startIndex')) || 0
    const limit = parseInt(searchParams.get('limit')) || 9
    const sortDirection = searchParams.get('sort') === 'desc' ? -1 : 1
    
    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit)
    
    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc
      return rest
    })
    
    const totalUsers = await User.countDocuments()
    
    const now = new Date()
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    )
    
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo, $lt: now }
    })
    
    return NextResponse.json({
      totalUsers,
      lastMonthUsers,
      users: usersWithoutPassword
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { message: 'Failed to get user information' },
      { status: 500 }
    )
  }
}