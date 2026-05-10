import jwt from 'jsonwebtoken'

export const verifyUser = (request) => {
  const token = request.cookies.get('access_token')?.value;
  
  if (!token) {
    return { success: false, message: "Unauthorized - No token provided" };
  }
  
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    return { success: true, user };
  } catch (error) {
    return { success: false, message: "Unauthorized - Invalid token" };
  }
}
