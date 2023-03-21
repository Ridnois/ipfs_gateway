import {Request, Response, NextFunction} from 'express'
export default function logger(req: Request, res: Response, next: NextFunction) {
  const path = req.path.split('/')[req.path.split('/').length - 2]
  console.log(`[${req.method}] /${path}`)
}
