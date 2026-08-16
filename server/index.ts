import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './routers';

const app = express();
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for ToyyibPay webhook payload

app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }) => {
      // Very basic mock context for testing
      // Hardcode a user ID for ctx.user
      return {
        req,
        res,
        user: { id: 1, email: "user@bestlink.com", role: "user" }
      };
    },
  })
);

// ToyyibPay Webhook Endpoint
// ToyyibPay sends POST data as urlencoded form data usually
app.post('/api/webhook/toyyibpay', async (req, res) => {
  try {
    const caller = appRouter.createCaller({ req, res, user: { id: 1, email: 'system', role: 'system' } });
    const result = await caller.payment.webhook(req.body);
    if (result.success) {
      res.status(200).send('OK');
    } else {
      res.status(400).send(result.message || 'Failed');
    }
  } catch (err: any) {
    console.error("Webhook Error:", err);
    res.status(500).send('Server Error');
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`tRPC backend running on http://localhost:${PORT}`);
});
