import {getCodeReview} from '../services/llmService.js';
import Review from '../models/Review.js';

async function handleManualReview(req,res) {
    const {code,language} = req.body;

    if(!code || code.trim().length===0){
        return res.status(400).json({
            success:false,
            error:'code is required',
        });
    }

    try{
          // We reuse getCodeReview — just format input differently
    const formattedCode = `File: manual-review.${getExtension(language)}
${code.split('\n').map((line, i) => `Line ${i + 1} [added]: ${line}`).join('\n')}`;
      
   //call llm
   const review = await getCodeReview(
    `Manual Review - ${language} code`,
    'manual',
    formattedCode
   );
  
   //save to mongodb
     const saved = await Review.create({
      prNumber:  0,
      // 0 means manual review — not a real PR
      prTitle:   `Manual Review — ${language}`,
      author:    'manual',
      repoName:  'manual',
      commitSha: 'manual-' + Date.now(),
      summary:   review.summary,
      score:     review.score,
      issues:    review.issues,
      positives: review.positives,
      status:    'reviewed',
      passed:    review.score.overall >= 70,
    });

    res.json({
        success:true,
        data:{
            _id:saved._id,
            summary:review.summary,
            score:review.score,
            issues:review.issues,
            positives:review.positives,
            passed:review.score.overall>=70,

        },
    });
}catch(error){
 console.error('Manual review error:',error.message);
 res.status(500).json({
    success:false,
    error:'Review failed-'+error.message,
});
}
}
function getExtension(language){
    const map={
        javascript:'js',
        typescript:'ts',
        python:'py',
        java:'java',
        cpp:'cpp',
        go:'go',
        rust:'rust',
        php:'php',
    };
    return map[language?.toLowerCase()] || 'js';
}

export { handleManualReview };
