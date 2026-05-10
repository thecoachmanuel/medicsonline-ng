import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import User from '@/lib/models/user.model'

// GET /api/users/:userId
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    const { userId } = params
    
    // In a real implementation, you would check authentication/authorization here
    // For now, I'm just showing the structure
    
    const user = await User.findById(userId)
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user._doc
    
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { message: 'Failed to fetch user information' },
      { status: 500 }
    )
  }
}

// PUT /api/users/:userId
export async function PUT(request, { params }) {
  try {
    await connectDB()
    
    const { userId } = params
    const body = await request.json()
    
    // In a real implementation, you would verify the token and check authorization
    // if (req.user.id !== userId) {
    //   return NextResponse.json(
    //     { message: 'You are not authorized to perform this action' },
    //     { status: 403 }
    //   )
    // }
    
    // Password validation would go here
    // if (body.password) {
    //   if (body.password.length < 6) {
    //     return NextResponse.json(
    //       { message: 'Password must be at least 6 characters long' },
    //       { status: 400 }
    //     )
    //   }
    //   body.password = bcryptjs.hashSync(body.password, 10)
    // }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: body },
      { new: true }
    )
    
    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser._doc
    
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { message: 'Failed to update user information' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/:userId
export async function DELETE(request, { params }) {
  try {
    await connectDB()
    
    const { userId } = params
    
    // In a real implementation, you would verify admin authorization here
    // if (!req.user.isAdmin) {
    //   return NextResponse.json(
    //     { message: 'You are not authorized to delete this user' },
    //     { status: 403 }
    //   )
    // }
    
    const deletedUser = await User.findByIdAndDelete(userId)
    
    if (!deletedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'User has been deleted' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { message: 'Failed to delete user' },
      { status: 500 }
    )
  }
}