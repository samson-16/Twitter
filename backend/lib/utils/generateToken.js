import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expiration time
    });
   
    res.cookie('token', token, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production )
        maxAge: 30 * 24 * 60 * 60 * 1000, // Cookie expiration time (30 days)
        sameSite: 'strict', // Helps prevent CSRF attacks
    });
}
