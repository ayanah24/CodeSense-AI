import jwt from 'jsonwebtoken';
import {v4 as uuidv4} from 'uuid';

const SECRET = process.env.JWT_SECRET;
export const SESSION_TTL = 60 * 60 * 24 * 7;

export function signToken(payload){
    const jti = uuidv4();

    const token= jwt.sign(
        {...payload,jti},
        SECRET,
        {expiresIn:'7d'} 
    );
    return {token,jti};
}

export function verifyToken(token){
    return jwt.verify(token,SECRET);
}
