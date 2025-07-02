    import { Request, Response, NextFunction } from 'express';
    import Joi from 'joi';
    export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
  import  Jwt  from 'jsonwebtoken';
  const secret = process.env.JWT_SECRET || "default_secret_key";
  const secretrefresh = process.env.JWT_REFRESH_SECRET || "default_refresh_secret_key";
  export const signToken = async (payload : string) => {
    const data = Jwt.sign({payload} , secret)
    return data;
  };
  export const signrefreshToken = async (payload : string) => {
    const data = Jwt.sign({payload} , secretrefresh)
    return data;
  }
  export const validateentries = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
  })
