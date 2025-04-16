import { createDirectus, realtime, rest, staticToken } from "@directus/sdk";


export function getDirectusSingleton()
{
  const globalStorage = (globalThis as any);
  if (!globalStorage.directus)
  {
    console.log("Directus: Creating directus...");

    const directus = createDirectus("DIRECTUS_URL")
      .with(staticToken("DIRECTUS_TOKEN"))
      .with(
        rest({
          onRequest: (options) => ({ ...options, cache: 'no-store' }),
        })
      )
      .with(realtime({
      }));

    void directus.connect();

    directus
      .subscribe("DIRECTUS_COLLECTION" as any, {
        query: {
          limit: 1 //do not receive all initial data, it's sufifient to get only 1 change for cache reset
        }
      })
      .then(async ({ subscription }) =>
      {
        for await (const item of subscription)
        {
          if (item.event == "init") continue;
          console.log(`Directus: Data changed. ID:`, (item as any).data?.[0].id);
        }
      })
      .catch((err) =>
      {
        console.log(`Error receiving events from collection`, err);
      });

    globalStorage.directus = directus;
  }
  return globalStorage.directus
};
