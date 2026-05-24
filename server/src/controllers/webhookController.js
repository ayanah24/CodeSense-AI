import verifySignature from '../utils/verifySignature.js';

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
            };
            console.log('PR Data:',prData);
        }
    }
    res.status(200).json({received:true});
}

export default handleWebhook;