import { NextResponse } from 'next/server'
import { connectDB } from '@/app/api/config/db'
import jwt from 'jsonwebtoken'

// DELETE /api/doctor/form/photo/:filePath
export async function DELETE(request, { params }) {
  try {
    await connectDB()
    
    const { filePath } = params
    
    // Get token from cookies to verify user
    const token = request.cookies.get('access_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { message: 'You are not authorized to perform this action' },
        { status: 403 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
    
    // Check if user is authorized (doctor or admin)
    if (decoded.role !== 'doctor' && decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'You are not authorized to perform this action' },
        { status: 403 }
      )
    }

    // Extract public ID from file path
    const extractPublicId = (input) => {
      if (!input) return null
      const decoded = decodeURIComponent(String(input))
      if (!decoded.startsWith('http')) return decoded
      try {
        const u = new URL(decoded)
        const parts = u.pathname.split('/').filter(Boolean)
        const uploadIdx = parts.findIndex((p) => p === 'upload')
        if (uploadIdx === -1) return null
        const afterUpload = parts.slice(uploadIdx + 1).join('/')
        const withoutVersion = afterUpload.replace(/^v\d+\//, '')
        return withoutVersion.replace(/\.[^/.]+$/, '')
      } catch {
        return null
      }
    }

    // Function to delete from Cloudinary
    const destroyBestEffort = async (publicId) => {
      // This is a placeholder implementation
      // In a real implementation, you would use the Cloudinary SDK
      console.log(`Deleting file with public ID: ${publicId}`)
      // Actual implementation would be:
      // const result = await cloudinary.uploader.destroy(publicId)
      // return result
      return { result: 'ok' }
    }

    const publicId = extractPublicId(filePath)
    if (!publicId) {
      return NextResponse.json(
        { message: 'Invalid file path' },
        { status: 400 }
      )
    }

    // Delete the file from Cloudinary
    const result = await destroyBestEffort(publicId)
    
    if (result?.result && result.result !== 'not found') {
      return NextResponse.json({ 
        message: 'Photo deleted successfully',
        result
      })
    } else {
      return NextResponse.json(
        { message: 'Photo not found or already deleted' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Failed to delete doctor photo:', error)
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { message: 'Token expired' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { message: 'Failed to delete doctor photo' },
      { status: 500 }
    )
  }
}