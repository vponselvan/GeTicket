import { PasswordManager } from './../services/password-manager';
import { BadRequestError } from './../errors/bad-request-error';
import { User } from './../models/user';
import { validateRequest } from './../middlewares/validate-request';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/api/users/signin', [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password must be supplied')
],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            throw new BadRequestError('Invalid credentials');
        }

        const isAuthentic = await PasswordManager.compare(user.password, password);

        if (!isAuthentic) {
            throw new BadRequestError('Invalid credentials');
        }

        //Generate JWT
        const userJwt = jwt.sign({
            id: user.id,
            email: user.email
        }, process.env.JWT_KEY!);

        //Store it in cookies
        req.session = {
            jwt: userJwt
        };

        res.status(200).send(user);
    });

export { router as signinRouter };