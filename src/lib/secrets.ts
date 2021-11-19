import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import dotenv from 'dotenv';

dotenv.config();

const client = new SecretManagerServiceClient();

export const getSecret = async (name: string) => {
  const [version] = await client.accessSecretVersion({
    name: `${process?.env?.GCP_PROJECT}/secrets/${name}/versions/latest`,
  });

  // Extract the payload as a string.
  const payload = version?.payload?.data?.toString() || 'Not Found';

  if (payload === 'Not Found') {
    // eslint-disable-next-line no-console
    console.warn(`Secret ${name} was not found.`);
  }

  return payload;
};
