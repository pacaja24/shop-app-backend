import { BadRequestError, uploadDir, Uploader, UploaderMiddlewareOptions, requireAuth, CustomError } from "@shopping-app/cammon";
import { Router, Request, Response, NextFunction } from "express";
import { sellerResolver } from "./seller.resolver";

const uploader = new Uploader(uploadDir);
const middlewareOptions: UploaderMiddlewareOptions ={
    types: ['image/png', 'image/jpeg'],
    fieldName: 'image'
}

const multipeFilesMiddleware = uploader.uploadMultipleFiles(middlewareOptions);

const router = Router();

router.post('/product/create', requireAuth, async(req: Request, res: Response, next: NextFunction)=>{
    const {title, price} = req.body;

    if(!req.files) return next(new BadRequestError('images are required'));

    if(req.uploaderError) return next(new BadRequestError(req.uploaderError.message));

    const product = await sellerResolver.addProduct({
        title, price, userId: req.currentUser!.userId, files: req.files
    });

    res.status(201).send(product);
})

router.post('/product/:id/update', requireAuth, async(req: Request, res: Response, next: NextFunction)=>{
    const {id} = req.params;
    const {title, price} = req.body;

    const result = await sellerResolver.updateProduct({ title, price, userId: req.currentUser!.userId, productId: id})

    if(result instanceof CustomError) return next(result)

    res.status(200).send(result);
})

router.delete("/product/:id/delete",requireAuth, async(req: Request, res: Response, next: NextFunction)=>{
    const {id} =req.params;
    const result = await sellerResolver.deleteProduct({productId: id, userId: req.currentUser!.userId })

    if(result instanceof CustomError) return next(result)

    res.status(200).send(true);
})

router.post("/product/:id/add-images", requireAuth, multipeFilesMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    if(!req.files) return next(new BadRequestError('images are required'))
    if(req.uploaderError) return next(new BadRequestError(req.uploaderError.message));
    
    const result = await sellerResolver.addProductImages({ productId: id, userId: req.currentUser!.userId, files: req.files })
   
    if(result instanceof CustomError ) return next(result);

    res.status(200).send(result);
})


router.post('/product/:id/delete-images', requireAuth, async(req: Request, res: Response, next: NextFunction)=>{
    const { id } = req.params;
    const { imagesIds } = req.body;
    const result = await sellerResolver.deleteProductImages({productId: id, userId: req.currentUser!.userId, imagesIds});

    if(result instanceof CustomError ) return next(result);
    
    res.status(200).send(result);
})

export {router as sellerRouters}