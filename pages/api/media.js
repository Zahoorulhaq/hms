export const config = {
  api: {
    bodyParser: false,
  },
};

import formidable from 'formidable';
import fs from 'fs';

export default async function handler(req, res) {
  const coreUrl = process.env.NEXT_PUBLIC_CORE_API_URL;
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }
  const form = formidable({ multiples: false });
  switch (req.method) {
    case 'POST': {
      let fields;
      let files;
      try {
        [fields, files] = await form.parse(req);
        const formData = new FormData();

        // Add the fields to the FormData
        Object.keys(fields).forEach((key) => {
          formData.append(key, fields[key][0]);
        });

        const fileFieldName = Object.keys(files)[0];
        const file = files[fileFieldName]?.[0];

        if (file && file.filepath) {
          const fileBuffer = fs.readFileSync(file.filepath);
          formData.append('file', new Blob([fileBuffer]), file.originalFilename);
        } else {
          console.log('No file uploaded or file path is missing.');
        }

        // Make the request to the external API
        const externalRes = await fetch(`${coreUrl}/v1/storage/media`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: authorization,
          },
          body: formData,
        });

        const externalData = await externalRes.json();

        if (!externalRes.ok) {
          return res.status(externalRes.status).json({ message: externalData });
        } else {
          return res.status(200).json(externalData);
        }
      } catch (error) {
        console.log({ error });
        return res.status(400).json({ message: 'Something went wrong!', error });
      }
      break;
    }
    case 'DELETE': {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ message: 'Id is required!' });
      }
      try {
        const externalRes = await fetch(`${coreUrl}/v1/storage/media/${id}`, {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: authorization,
          },
        });

        const externalData = await externalRes.json();

        if (!externalRes.ok) {
          return res.status(externalRes.status).json({ message: externalData });
        }
        return res.status(200).json(externalData);
      } catch (error) {
        return res.status(400).json({ message: 'Something went wrong!', error });
      }
      break;
    }
    case 'PUT':
      try {
        let fields;
        [fields] = await form.parse(req);
        const externalRes = await fetch(`${coreUrl}/v1/storage/media`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: authorization,
          },
          body: JSON.stringify(fields),
        });

        const externalData = await externalRes.json();

        if (!externalRes.ok) {
          return res.status(externalRes.status).json({ message: externalData });
        }
        return res.status(200).json(externalData);
      } catch (error) {
        return res.status(500).json({ message: 'Something went wrong!', error });
      }
      break;
    case 'PATCH':
      try {
        let fields;
        let files;
        const formData = {};
        [fields, files] = await form.parse(req);
        Object.keys(fields).forEach((key) => {
          formData[key] = fields[key];
        });
        const externalRes = await fetch(`${coreUrl}/v1/storage/media/reorder`, {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: authorization,
          },
          body: JSON.stringify(fields),
        });

        const externalData = await externalRes.json();

        if (!externalRes.ok) {
          return res.status(externalRes.status).json({ message: externalData });
        }
        return res.status(200).json(externalData);
      } catch (error) {
        return res.status(400).json({ message: 'Something went wrong!', error });
      }
      break;
    default:
      break;
  }
}
