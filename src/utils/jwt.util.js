import jwt from 'jsonwebtoken';

export const generateToken = ({player_id, name, role}) => {
    const token = jwt.sign({ player_id ,name, role}, process.env.JWT_SECRET, {
        expiresIn: '1d',
        algorithm: "HS256",
    });
    return token;
}

export const verifyToken = (token) => {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    return payload;
}

export const signResetToken = (player_id) => {
    const payload = jwt.sign({ player_id }, process.env.RESET_SECRET, {
        algorithm: "HS256",
        expiresIn: '1h',
    });
    return payload;
}

export const verifyResettToken = (token) => {
    const payload = jwt.verify(token, process.env.RESET_SECRET, { algorithms: ["HS256"] });
    return payload;
}

export const generatePublicToken = (data) =>{
    const token = jwt.sign({ data }, process.env.JWT_PUBLIC_SECRET, {
        expiresIn: '1d',
        algorithm: "HS256",
    });
    return token;
}

export const verifyPublicToken = (token) =>{
    const payload = jwt.verify(token, process.env.JWT_PUBLIC_SECRET, { algorithms: ["HS256"] });
    return payload;
}