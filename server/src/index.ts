import express, { Request, Response } from 'express';
import { Innertube } from 'youtubei.js';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

interface SearchBody {
  query: string;
}

interface VideoResult {
  title: string;
  id: string;
  duration?: string;
}

app.post('/api/search', async (req: Request<{}, {}, SearchBody>, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    const youtube = await Innertube.create();

    const results = await youtube.search(query);
    const videos: VideoResult[] = results.videos
      .slice(0, 5)
      .map((v: any) => ({
        title: v.title?.text ?? v.title ?? 'Unknown',
        id: v.id ?? v.videoId ?? '',
        duration: v.duration?.text ?? v.duration ?? undefined,
      }))
      .filter((v: VideoResult) => v.id !== '');

    res.json({ results: videos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(3000, () => console.log('Server on port 3000'));
}

export default app;