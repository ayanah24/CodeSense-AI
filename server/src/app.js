import express from 'express';
import cors from 'cors';
import webhookRoutes from './routes/webhook.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();

app.use(cors());

// Parse raw body for /webhook so HMAC signature can be verified against exact bytes GitHub sent
app.use('/webhook', express.raw({ type: '*/*' }));

// Parse JSON body for all other routes
app.use((req, res, next) => {
  if (req.path.startsWith('/webhook')) return next();
  express.json()(req, res, next);
});

app.use('/webhook', webhookRoutes);

app.get('/', (req, res) => {
    res.json({ status: 'codeSense AI server is running' });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});
