import verifySignature from '../utils/verifySignature.js';
import reviewQueue from '../queues/reviewQueue.js';

async function handleWebhook(req,res){
    //verify signature
    if(!verifySignature(req)){
        console.log('Invalid signature');
        return res.status(401).json({error:'Invalid signature'});
    }
                                                                                
    //github event type
    const event=req.headers['x-github-event'];

    //parse raw body
    const payload=JSON.parse(req.body.toString());

    console.log(`Received event: ${event}`);
    //handle pr event
    if(event==='pull_request'){
        const {action,pull_request,repository}=payload;
        console.log(`Action: ${action}`);
        if(action==='opened'||action==='synchronize'){
            const prData={
                prNumber:pull_request.number,
                prTitle:pull_request.title,
                author:pull_request.user.login,
                diffUrl:pull_request.diff_url,
                repoName:repository.full_name,
                repoFullName:repository.full_name,
                commitSha:pull_request.head.sha, 
                action,
            };
            console.log('PR Data:',prData);
            // Add job to review queue
            const job = await reviewQueue.add(
                'review-pr', // Job name- for filtering..
                prData,
                {
                    jobId:`pr-${repository.full_name}-${pull_request.number}-${action}`, // Unique job ID to prevent duplicates
                }
            );
            console.log(`Added job ${job.id} to review queue for PR #${pull_request.number}`);
        }
    }
    res.status(200).json({received:true});
}

export default handleWebhook;