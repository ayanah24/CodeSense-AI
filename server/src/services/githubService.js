import axios from 'axios';

async function fetchPRDiff(diffUrl) {
  try {
    const response = await axios.get(diffUrl, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3.diff',
      },
    });

    return response.data; 
  } catch (error) {
    console.error('Error fetching diff:', error.message);
    throw new Error(`Failed to fetch diff: ${error.message}`);
  }
}

export { fetchPRDiff };