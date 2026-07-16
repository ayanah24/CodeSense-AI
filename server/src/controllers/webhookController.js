import verifySignature from '../utils/verifySignature.js';
import reviewQueue from '../queues/reviewQueue.js';

async function handleWebhook(req, res) {
  try {
    // Verify HMAC signature from GitHub
    if (!verifySignature(req)) {
      console.warn(' Webhook: Invalid signature — rejecting');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // GitHub event type
    const event = req.headers['x-github-event'];
    console.log(` Webhook received: ${event}`);

    // Parse raw body (it's a Buffer from express.raw())
    let payload;
    try {
      payload = JSON.parse(req.body.toString());
    } catch (parseErr) {
      console.error(' Webhook: Failed to parse JSON body:', parseErr.message);
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    // Handle pull_request events
    if (event === 'pull_request') {
      const { action, pull_request, repository } = payload;
      console.log(`  Action: ${action}`);

      if (action === 'opened' || action === 'synchronize') {
        const prData = {
          prNumber: pull_request.number,
          prTitle: pull_request.title,
          author: pull_request.user.login,
          diffUrl: pull_request.diff_url,
          repoName: repository.full_name,
          repoFullName: repository.full_name,
          commitSha: pull_request.head.sha,
          action,
        };
        console.log('  PR Data:', JSON.stringify(prData, null, 2));

        const job = await reviewQueue.add(
          'review-pr',
          prData,
          {
            jobId: `pr-${repository.full_name}-${pull_request.number}-${action}`,
          }
        );
        console.log(`Queued job ${job.id} for PR #${pull_request.number}`);
      } else {
        console.log(`Ignoring action: ${action}`);
      }
    } else {
      console.log(`Ignoring event: ${event}`);
    }

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error('Webhook handler crashed:', err.message);
    console.error(err.stack);
    return res.status(500).json({ error: 'Webhook processing failed', detail: err.message });
  }
}

export default handleWebhook;