import jwt from 'jsonwebtoken'

export const verifyAdmin = (request) => {
  const token = request.cookies.get('access_token')?.value
  
  if (!token) {
    return { success: false, message: "Unauthorized." }
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
    
    if (decoded.role !== "admin") {
      return { success: false, message: "Forbidden - Admins only." }
    }
    
    return { success: true, admin: decoded }
  } catch (error) {
    return { success: false, message: "Unauthorized - Invalid token" }
  }
}