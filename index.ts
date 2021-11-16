import { getSecret } from '#lib/secrets';

const init = async () => {
  const test = await getSecret('test-secret');

  // eslint-disable-next-line no-console
  console.log(test);
};

void init();
