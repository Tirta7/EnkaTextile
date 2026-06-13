import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import customersRouter from "./customers";
import suppliersRouter from "./suppliers";
import salesRouter from "./sales";
import purchasesRouter from "./purchases";
import mutationsRouter from "./mutations";
import receivablesRouter from "./receivables";
import payablesRouter from "./payables";
import cashbookRouter from "./cashbook";
import reportsRouter from "./reports";
import paymentMethodsRouter from "./payment-methods";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(customersRouter);
router.use(suppliersRouter);
router.use(salesRouter);
router.use(purchasesRouter);
router.use(mutationsRouter);
router.use(receivablesRouter);
router.use(payablesRouter);
router.use(cashbookRouter);
router.use(reportsRouter);
router.use(paymentMethodsRouter);

export default router;
