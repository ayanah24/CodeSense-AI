import express from 'express';
import cors from 'cors';
import webhookRoutes from './routes/webhook.js';

const app = express();

app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(cors());
app.use(express.json());
app.use('/webhook', webhookRoutes);

app.get('/', (req, res) => {
    res.json({ status: 'codeSense AI server is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});
