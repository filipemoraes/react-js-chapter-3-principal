import  { NextApiRequest, NextApiResponse } from 'next';

export default async (request: NextApiRequest, response: NextApiResponse) => {
  const decoded = Buffer.from(request.query.nextpage, 'base64');
  const URL = `${decoded}&access_token=${process.env.PRISMIC_ACCESS_TOKEN}`;
  const data = await fetch(URL).then(res => res.json());

  return response.status(200).json(data);
};
